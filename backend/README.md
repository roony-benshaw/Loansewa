# Credit Risk API Backend

FastAPI backend with authentication for Credit Risk modeling project.

## Features

- User signup with full name, email, mobile number, and Aadhar
- Login via email, mobile number, or Aadhar with password
- JWT token-based authentication
- SQLite database
- Password hashing with bcrypt

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or using uvicorn:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Signup
**POST** `/api/auth/signup`

Request body:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "mobile_number": "9876543210",
  "aadhar": "123456789012",
  "password": "password123",
  "confirm_password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "mobile_number": "9876543210",
    "aadhar": "123456789012",
    "created_at": "2026-01-17T10:00:00"
  }
}
```

### 2. Login
**POST** `/api/auth/login`

Request body (can use email, mobile, or aadhar):
```json
{
  "identifier": "john@example.com",
  "password": "password123"
}
```

Or with mobile:
```json
{
  "identifier": "9876543210",
  "password": "password123"
}
```

Or with Aadhar:
```json
{
  "identifier": "123456789012",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "mobile_number": "9876543210",
    "aadhar": "123456789012",
    "created_at": "2026-01-17T10:00:00"
  }
}
```

### 3. Get Current User
**GET** `/api/auth/me?token=<access_token>`

Response:
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "mobile_number": "9876543210",
  "aadhar": "123456789012",
  "created_at": "2026-01-17T10:00:00"
}
```

## API Documentation

FastAPI provides automatic interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database

The application uses SQLite database (`credit_risk.db`) which will be created automatically when you run the application for the first time.

## Security Notes

- Change the `SECRET_KEY` in `auth.py` for production use
- Update CORS settings in `main.py` for production
- Consider using environment variables for sensitive configuration
