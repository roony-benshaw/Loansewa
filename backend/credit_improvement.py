import os
from typing import Dict, List

def get_default_suggestions(credit_score: int, user_data: Dict, all_applications: List = None) -> List[Dict[str, str]]:
    """
    Get default credit improvement suggestions based on credit score, current data, and historical trends
    """
    suggestions = []
    
    # Analyze historical trends if available
    if all_applications and len(all_applications) > 1:
        latest = all_applications[0]
        previous = all_applications[1]
        
        score_change = latest.credit_score - previous.credit_score
        util_change = latest.credit_utilization_ratio - previous.credit_utilization_ratio
        delinq_change = latest.delinquency_ratio - previous.delinquency_ratio
        
        # Score trend analysis
        if score_change > 0:
            suggestions.append({
                "title": "Great Progress! Score Improved",
                "description": f"Your credit score increased by {score_change} points from your last application. Keep up the excellent work with your current financial habits!",
                "priority": "Low",
                "icon": "🎉"
            })
        elif score_change < -20:
            suggestions.append({
                "title": "Score Declined - Immediate Action Needed",
                "description": f"Your credit score dropped by {abs(score_change)} points. Review your recent payment history and credit utilization to identify the cause.",
                "priority": "High",
                "icon": "🚨"
            })
        
        # Credit utilization trend
        if util_change > 10:
            suggestions.append({
                "title": "Credit Utilization Increasing",
                "description": f"Your credit utilization rose by {util_change}%. This upward trend can hurt your score. Consider paying down balances.",
                "priority": "High",
                "icon": "📈"
            })
        elif util_change < -10:
            suggestions.append({
                "title": "Excellent! Utilization Decreasing",
                "description": f"You've reduced credit utilization by {abs(util_change)}%. This positive trend will boost your score over time.",
                "priority": "Low",
                "icon": "✅"
            })
        
        # Delinquency trend
        if delinq_change > 5:
            suggestions.append({
                "title": "Payment Delays Increasing",
                "description": f"Your delinquency rate increased by {delinq_change}%. Set up automatic payments to avoid missing due dates.",
                "priority": "High",
                "icon": "⚠️"
            })
    
    # Based on credit score
    if credit_score < 500:
        suggestions.append({
            "title": "Critical: Improve Payment History",
            "description": "Your credit score is in the critical range. Focus on making all payments on time for the next 6-12 months.",
            "priority": "High",
            "icon": "🚨"
        })
    elif credit_score < 650:
        suggestions.append({
            "title": "Work on Payment Consistency",
            "description": "Your credit score is fair. Maintain consistent on-time payments to improve your score.",
            "priority": "Medium",
            "icon": "⚠️"
        })
    else:
        suggestions.append({
            "title": "Maintain Good Habits",
            "description": "Your credit score is good! Keep up your current payment habits.",
            "priority": "Low",
            "icon": "✅"
        })
    
    # Credit utilization suggestions
    credit_util = user_data.get('credit_utilization_ratio', 0)
    if credit_util > 50:
        suggestions.append({
            "title": "Reduce Credit Utilization",
            "description": f"Your credit utilization is {credit_util}%. Try to keep it below 30% by paying down balances or requesting credit limit increases.",
            "priority": "High",
            "icon": "💳"
        })
    elif credit_util > 30:
        suggestions.append({
            "title": "Lower Credit Utilization",
            "description": f"Your credit utilization is {credit_util}%. Aim to keep it below 30% for better credit health.",
            "priority": "Medium",
            "icon": "💳"
        })
    
    # Delinquency suggestions
    delinquency_ratio = user_data.get('delinquency_ratio', 0)
    avg_dpd = user_data.get('avg_dpd_per_delinquency', 0)
    
    if delinquency_ratio > 20 or avg_dpd > 15:
        suggestions.append({
            "title": "Address Past Delinquencies",
            "description": "You have past payment delays. Set up automatic payments and payment reminders to avoid future delays.",
            "priority": "High",
            "icon": "⏰"
        })
    
    # Number of open accounts
    num_accounts = user_data.get('num_open_accounts', 0)
    if num_accounts == 0:
        suggestions.append({
            "title": "Build Credit History",
            "description": "Consider opening a secured credit card or becoming an authorized user to start building credit.",
            "priority": "Medium",
            "icon": "🏦"
        })
    elif num_accounts > 5:
        suggestions.append({
            "title": "Manage Multiple Accounts",
            "description": "You have multiple open accounts. Ensure all payments are made on time and consider consolidating if needed.",
            "priority": "Medium",
            "icon": "📊"
        })
    
    # Loan-to-income ratio
    loan_amount = user_data.get('loan_amount', 0)
    income = user_data.get('income', 1)
    lti_ratio = loan_amount / income if income > 0 else 0
    
    if lti_ratio > 3:
        suggestions.append({
            "title": "High Debt-to-Income Ratio",
            "description": "Your loan amount is high relative to your income. Focus on increasing income or reducing debt.",
            "priority": "High",
            "icon": "📉"
        })
    
    # General suggestions
    suggestions.append({
        "title": "Monitor Your Credit Report",
        "description": "Check your credit report regularly for errors and dispute any inaccuracies you find.",
        "priority": "Low",
        "icon": "🔍"
    })
    
    suggestions.append({
        "title": "Diversify Your Credit Mix",
        "description": "Having different types of credit (credit cards, loans, etc.) can positively impact your score.",
        "priority": "Low",
        "icon": "🎯"
    })
    
    suggestions.append({
        "title": "Keep Old Accounts Open",
        "description": "Length of credit history matters. Keep your oldest credit accounts open even if you don't use them often.",
        "priority": "Low",
        "icon": "📅"
    })
    
    return suggestions

def get_gemini_suggestions(credit_score: int, user_data: Dict, api_key: str, all_applications: List = None) -> List[Dict[str, str]]:
    """
    Get AI-powered credit improvement suggestions using Google Gemini with historical data
    """
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        # Build historical context
        historical_context = ""
        if all_applications and len(all_applications) > 1:
            historical_context = f"\n\nHistorical Data (Last {min(len(all_applications), 5)} Applications):\n"
            for i, app in enumerate(all_applications[:5]):
                historical_context += f"Application {i+1}: Credit Score: {app.credit_score}, "
                historical_context += f"Credit Utilization: {app.credit_utilization_ratio}%, "
                historical_context += f"Delinquency: {app.delinquency_ratio}%\n"
        
        prompt = f"""
You are a financial advisor helping someone improve their credit score.

Current Credit Profile:
- Credit Score: {credit_score}
- Income: ₹{user_data.get('income', 0):,}
- Loan Amount: ₹{user_data.get('loan_amount', 0):,}
- Credit Utilization: {user_data.get('credit_utilization_ratio', 0)}%
- Delinquency Ratio: {user_data.get('delinquency_ratio', 0)}%
- Average DPD per Delinquency: {user_data.get('avg_dpd_per_delinquency', 0)} days
- Number of Open Accounts: {user_data.get('num_open_accounts', 0)}
- Loan Tenure: {user_data.get('loan_tenure_months', 0)} months
{historical_context}

Analyze the historical trend and current profile. Provide 5-7 specific, actionable suggestions to improve this person's credit score. 

IMPORTANT: Return ONLY a valid JSON array, nothing else. No markdown, no code blocks, no explanations.

Format: [
  {{
    "title": "Clear title here",
    "description": "2-3 sentence description",
    "priority": "High/Medium/Low",
    "icon": "emoji"
  }}
]
"""
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        import json
        import re
        
        # Clean the response to extract JSON
        text = response.text.strip()
        # Remove markdown code blocks if present
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()
        
        suggestions = json.loads(text)
        return suggestions
        
    except Exception as e:
        print(f"Gemini error: {str(e)}")
        # Fallback to default suggestions
        return get_default_suggestions(credit_score, user_data, all_applications)

def get_credit_improvement_suggestions(credit_score: int, user_data: Dict, all_applications: List = None) -> List[Dict[str, str]]:
    """
    Get credit improvement suggestions - uses Gemini if API key is available, 
    otherwise returns default suggestions with historical analysis
    """
    api_key = os.getenv('GEMINI_API_KEY')
    
    if api_key and api_key != 'your_gemini_api_key_here':
        return get_gemini_suggestions(credit_score, user_data, api_key, all_applications)
    else:
        return get_default_suggestions(credit_score, user_data, all_applications)
