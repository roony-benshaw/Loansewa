from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import re
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import engine, get_db, Base
from models import User, LoanApplication
from schemas import (SignupRequest, LoginRequest, UserResponse, LoginResponse,
                     LoanApplicationRequest, LoanApplicationResponse, PredictionResponse)
from prediction_helper import predict
from credit_improvement import get_credit_improvement_suggestions

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Credit Risk API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_email(identifier: str) -> bool:
    """Check if identifier is an email"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, identifier))

def is_mobile(identifier: str) -> bool:
    """Check if identifier is a mobile number"""
    return identifier.isdigit() and len(identifier) == 10

def is_aadhar(identifier: str) -> bool:
    """Check if identifier is an aadhar number"""
    return identifier.isdigit() and len(identifier) == 12

@app.get("/")
def read_root():
    return {"message": "Credit Risk API is running"}

@app.post("/api/auth/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if mobile number already exists
    existing_user = db.query(User).filter(User.mobile_number == request.mobile_number).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered"
        )
    
    # Check if aadhar already exists
    existing_user = db.query(User).filter(User.aadhar == request.aadhar).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aadhar already registered"
        )
    
    # Create new user - store password as plain text
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        mobile_number=request.mobile_number,
        aadhar=request.aadhar,
        hashed_password=request.password  # Store plain password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return LoginResponse(
        success=True,
        message="User registered successfully",
        user=UserResponse.from_orm(new_user)
    )

@app.post("/api/auth/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email, mobile number, or aadhar
    """
    user = None
    
    # Try to find user by email first
    user = db.query(User).filter(User.email == request.identifier).first()
    
    # If not found by email, try mobile
    if not user:
        user = db.query(User).filter(User.mobile_number == request.identifier).first()
    
    # If not found by mobile, try aadhar
    if not user:
        user = db.query(User).filter(User.aadhar == request.identifier).first()
    
    # Check if user exists and password is correct (plain text comparison)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if user.hashed_password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    return LoginResponse(
        success=True,
        message="Login successful",
        user=UserResponse.from_orm(user)
    )

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user details by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.from_orm(user)

@app.post("/api/loan/apply", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def apply_for_loan(request: LoanApplicationRequest, user_id: int, db: Session = Depends(get_db)):
    """
    Submit loan application and get credit risk prediction
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if identical application already exists
    existing_app = db.query(LoanApplication).filter(
        LoanApplication.user_id == user_id,
        LoanApplication.age == request.age,
        LoanApplication.income == request.income,
        LoanApplication.loan_amount == request.loan_amount,
        LoanApplication.loan_tenure_months == request.loan_tenure_months,
        LoanApplication.avg_dpd_per_delinquency == request.avg_dpd_per_delinquency,
        LoanApplication.delinquency_ratio == request.delinquency_ratio,
        LoanApplication.credit_utilization_ratio == request.credit_utilization_ratio,
        LoanApplication.num_open_accounts == request.num_open_accounts,
        LoanApplication.residence_type == request.residence_type,
        LoanApplication.loan_purpose == request.loan_purpose,
        LoanApplication.loan_type == request.loan_type
    ).first()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identical application already exists"
        )
    
    # Get prediction
    try:
        default_probability, credit_score, rating = predict(
            request.age,
            request.income,
            request.loan_amount,
            request.loan_tenure_months,
            request.avg_dpd_per_delinquency,
            request.delinquency_ratio,
            request.credit_utilization_ratio,
            request.num_open_accounts,
            request.residence_type,
            request.loan_purpose,
            request.loan_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Determine status based on credit score
    if credit_score >= 650:
        application_status = "Approved"
    elif credit_score >= 500:
        application_status = "Under Review"
    else:
        application_status = "Rejected"
    
    # Create loan application record
    loan_application = LoanApplication(
        user_id=user_id,
        age=request.age,
        income=request.income,
        loan_amount=request.loan_amount,
        loan_tenure_months=request.loan_tenure_months,
        avg_dpd_per_delinquency=request.avg_dpd_per_delinquency,
        delinquency_ratio=request.delinquency_ratio,
        credit_utilization_ratio=request.credit_utilization_ratio,
        num_open_accounts=request.num_open_accounts,
        residence_type=request.residence_type,
        loan_purpose=request.loan_purpose,
        loan_type=request.loan_type,
        default_probability=float(default_probability),
        credit_score=int(credit_score),
        rating=rating,
        status=application_status
    )
    
    db.add(loan_application)
    db.commit()
    db.refresh(loan_application)
    
    # Calculate loan to income ratio
    loan_to_income_ratio = request.loan_amount / request.income if request.income > 0 else 0
    
    return PredictionResponse(
        success=True,
        message=f"Application {application_status.lower()}",
        application=LoanApplicationResponse.from_orm(loan_application),
        loan_to_income_ratio=loan_to_income_ratio
    )

@app.get("/api/loan/applications/{user_id}", response_model=list[LoanApplicationResponse])
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    """
    Get all loan applications for a user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    applications = db.query(LoanApplication).filter(
        LoanApplication.user_id == user_id
    ).order_by(LoanApplication.created_at.desc()).all()
    
    return [LoanApplicationResponse.from_orm(app) for app in applications]

@app.get("/api/credit/improvement/{user_id}")
def get_improvement_suggestions(user_id: int, db: Session = Depends(get_db)):
    """
    Get credit improvement suggestions for a user based on all historical data
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get all applications ordered by date (latest first)
    all_applications = db.query(LoanApplication).filter(
        LoanApplication.user_id == user_id
    ).order_by(LoanApplication.created_at.desc()).all()
    
    if not all_applications:
        return {
            "success": False,
            "message": "No loan application found. Please apply for a loan first.",
            "suggestions": []
        }
    
    latest_app = all_applications[0]
    
    # Prepare user data
    user_data = {
        "credit_score": latest_app.credit_score,
        "income": latest_app.income,
        "loan_amount": latest_app.loan_amount,
        "credit_utilization_ratio": latest_app.credit_utilization_ratio,
        "delinquency_ratio": latest_app.delinquency_ratio,
        "avg_dpd_per_delinquency": latest_app.avg_dpd_per_delinquency,
        "num_open_accounts": latest_app.num_open_accounts,
        "loan_tenure_months": latest_app.loan_tenure_months
    }
    
    # Get suggestions with historical analysis
    suggestions = get_credit_improvement_suggestions(
        latest_app.credit_score, 
        user_data,
        all_applications  # Pass all applications for trend analysis
    )
    
    return {
        "success": True,
        "message": "Credit improvement suggestions generated successfully",
        "credit_score": latest_app.credit_score,
        "total_applications": len(all_applications),
        "suggestions": suggestions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
