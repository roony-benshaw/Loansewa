# LoanSewa Frontend

React frontend for the LoanSewa digital lending platform.

## Features

- 🏠 Landing page with hero section
- 🔐 Login with Mobile/Aadhar/Email
- 📝 User registration
- 📊 User dashboard
- 🎨 Modern, responsive UI design
- 🔗 Full API integration with FastAPI backend

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- FastAPI backend running on http://localhost:8000

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── LandingPage.js
│   │   ├── LandingPage.css
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Signup.js
│   │   ├── Signup.css
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Features Overview

### Landing Page
- Modern hero section
- "How It Works" section
- Navigation to login/signup

### Login Page
- Three login methods: Mobile, Aadhar, Email
- Tab-based interface
- Password visibility toggle
- Remember me functionality
- Error handling

### Signup Page
- Complete registration form
- Real-time validation
- Password confirmation
- Unique email/mobile/aadhar validation

### Dashboard
- User profile display
- Quick action cards
- Logout functionality

## API Integration

The app connects to the FastAPI backend at `http://localhost:8000/api`

Endpoints used:
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- GET `/api/users/{id}` - Get user details

## Environment Variables

Create a `.env` file in the frontend directory to customize:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Technologies Used

- React 18
- React Router DOM v6
- Axios for API calls
- CSS3 for styling
- LocalStorage for session management
