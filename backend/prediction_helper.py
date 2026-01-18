import numpy as np
import pandas as pd

# Simplified prediction without requiring the actual model file
# In production, you would load the actual joblib model

def prepare_input(age, income, loan_amount, loan_tenure_months, avg_dpd_per_delinquency,
                    delinquency_ratio, credit_utilization_ratio, num_open_accounts, residence_type,
                    loan_purpose, loan_type):
    """Prepare input data for prediction"""
    input_data = {
        'age': age,
        'income': income,
        'loan_amount': loan_amount,
        'loan_tenure_months': loan_tenure_months,
        'avg_dpd_per_delinquency': avg_dpd_per_delinquency,
        'delinquency_ratio': delinquency_ratio,
        'credit_utilization_ratio': credit_utilization_ratio,
        'num_open_accounts': num_open_accounts,
        'loan_to_income': loan_amount / income if income > 0 else 0,
        'residence_type': residence_type,
        'loan_purpose': loan_purpose,
        'loan_type': loan_type
    }
    return input_data


def calculate_credit_score(input_data, base_score=300, scale_length=600):
    """Calculate credit score based on input parameters"""
    
    # Risk factors calculation (simplified heuristic)
    risk_score = 0
    
    # Age factor (younger = higher risk)
    if input_data['age'] < 25:
        risk_score += 15
    elif input_data['age'] < 35:
        risk_score += 10
    elif input_data['age'] < 50:
        risk_score += 5
    
    # Loan to income ratio (higher = higher risk)
    loan_to_income = input_data['loan_to_income']
    if loan_to_income > 5:
        risk_score += 25
    elif loan_to_income > 3:
        risk_score += 15
    elif loan_to_income > 2:
        risk_score += 10
    
    # Delinquency ratio (higher = higher risk)
    if input_data['delinquency_ratio'] > 50:
        risk_score += 30
    elif input_data['delinquency_ratio'] > 30:
        risk_score += 20
    elif input_data['delinquency_ratio'] > 10:
        risk_score += 10
    
    # Credit utilization (higher = higher risk)
    if input_data['credit_utilization_ratio'] > 80:
        risk_score += 20
    elif input_data['credit_utilization_ratio'] > 50:
        risk_score += 10
    elif input_data['credit_utilization_ratio'] > 30:
        risk_score += 5
    
    # Average DPD (higher = higher risk)
    if input_data['avg_dpd_per_delinquency'] > 30:
        risk_score += 25
    elif input_data['avg_dpd_per_delinquency'] > 15:
        risk_score += 15
    elif input_data['avg_dpd_per_delinquency'] > 5:
        risk_score += 8
    
    # Number of open accounts
    if input_data['num_open_accounts'] > 3:
        risk_score += 10
    elif input_data['num_open_accounts'] < 2:
        risk_score += 5
    
    # Residence type (Owned = lower risk)
    if input_data['residence_type'] == 'Rented':
        risk_score += 10
    elif input_data['residence_type'] == 'Mortgage':
        risk_score += 5
    
    # Loan type (Unsecured = higher risk)
    if input_data['loan_type'] == 'Unsecured':
        risk_score += 15
    
    # Calculate default probability (0-100 risk score maps to 0-1 probability)
    default_probability = min(risk_score / 100, 0.99)
    
    # Calculate credit score (inverse of risk)
    non_default_probability = 1 - default_probability
    credit_score = int(base_score + non_default_probability * scale_length)
    
    # Determine rating
    def get_rating(score):
        if 300 <= score < 500:
            return 'Poor'
        elif 500 <= score < 650:
            return 'Average'
        elif 650 <= score < 750:
            return 'Good'
        elif 750 <= score <= 900:
            return 'Excellent'
        else:
            return 'Undefined'
    
    rating = get_rating(credit_score)
    
    return default_probability, credit_score, rating


def predict(age, income, loan_amount, loan_tenure_months, avg_dpd_per_delinquency,
            delinquency_ratio, credit_utilization_ratio, num_open_accounts,
            residence_type, loan_purpose, loan_type):
    """Main prediction function"""
    
    # Prepare input
    input_data = prepare_input(
        age, income, loan_amount, loan_tenure_months, avg_dpd_per_delinquency,
        delinquency_ratio, credit_utilization_ratio, num_open_accounts,
        residence_type, loan_purpose, loan_type
    )
    
    # Calculate credit score and rating
    probability, credit_score, rating = calculate_credit_score(input_data)
    
    return probability, credit_score, rating
