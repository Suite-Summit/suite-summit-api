import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Configuration
LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'emergent')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

async def generate_company_insights(company_profile: dict, user_id: str) -> dict:
    """Generate AI insights for a company based on their intake data."""
    
    prompt = f"""You are an expert business advisor helping companies find the right fractional executive leadership.

Based on the following company profile, provide strategic recommendations:

Company Name: {company_profile.get('company_name', 'N/A')}
Company Stage: {company_profile.get('company_stage', 'N/A')}
Revenue Range: {company_profile.get('revenue_range', 'N/A')}
Primary Challenge: {company_profile.get('primary_challenge', 'N/A')}
Desired Role: {company_profile.get('desired_role', 'Fractional CFO')}
Budget Range: {company_profile.get('budget_range', 'N/A')}
Desired Hours: {company_profile.get('desired_hours', 'N/A')}
Additional Info: {company_profile.get('additional_info', 'None provided')}

Please provide:
1. Recommended fractional role (confirm or suggest alternative)
2. Suggested engagement scope (hours per month, duration)
3. Three specific outcomes to expect in the next 90 days
4. A brief explanation of why this recommendation fits their situation

Format your response as JSON with these exact keys:
- recommended_role: string
- engagement_scope: string  
- expected_outcomes: array of 3 strings
- explanation: string (2-3 sentences)"""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"insights-{company_profile['id']}",
            system_message="You are a strategic business advisor. Always respond with valid JSON only, no markdown."
        )
        
        if LLM_PROVIDER == 'emergent' or LLM_PROVIDER == 'openai':
            chat.with_model("openai", "gpt-5.2")
        elif LLM_PROVIDER == 'anthropic':
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        elif LLM_PROVIDER == 'gemini':
            chat.with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Log the AI interaction
        ai_log = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "prompt": prompt,
            "response": response,
            "model_used": LLM_PROVIDER,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.ai_logs.insert_one(ai_log)
        
        # Parse the JSON response
        import json
        try:
            # Clean the response - remove markdown code blocks if present
            cleaned_response = response.strip()
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response.split("```")[1]
                if cleaned_response.startswith("json"):
                    cleaned_response = cleaned_response[4:]
            cleaned_response = cleaned_response.strip()
            
            parsed = json.loads(cleaned_response)
        except json.JSONDecodeError:
            # Fallback response if parsing fails
            parsed = {
                "recommended_role": "Fractional CFO",
                "engagement_scope": "15-20 hours per month for 6 months initial engagement",
                "expected_outcomes": [
                    "Establish financial reporting and forecasting framework",
                    "Identify cost optimization opportunities of 10-15%",
                    "Create cash flow management strategy"
                ],
                "explanation": "Based on your company stage and primary challenges, a Fractional CFO can provide the strategic financial leadership needed without full-time overhead."
            }
        
        # Save the insight
        insight = {
            "id": str(uuid.uuid4()),
            "company_id": company_profile["id"],
            "user_id": user_id,
            "recommended_role": parsed.get("recommended_role", "Fractional CFO"),
            "engagement_scope": parsed.get("engagement_scope", "15-20 hours per month"),
            "expected_outcomes": parsed.get("expected_outcomes", []),
            "explanation": parsed.get("explanation", ""),
            "raw_response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ai_insights.insert_one(insight)
        
        # Remove raw_response and _id from returned data
        insight_copy = insight.copy()
        if "raw_response" in insight_copy:
            del insight_copy["raw_response"]
        if "_id" in insight_copy:
            del insight_copy["_id"]
        
        return insight_copy
        
    except Exception as e:
        # Fallback response on error
        fallback_insight = {
            "id": str(uuid.uuid4()),
            "company_id": company_profile["id"],
            "user_id": user_id,
            "recommended_role": "Fractional CFO",
            "engagement_scope": "15-20 hours per month for an initial 6-month engagement",
            "expected_outcomes": [
                "Establish robust financial reporting and forecasting systems",
                "Identify and implement cost optimization strategies",
                "Develop strategic financial roadmap aligned with growth goals"
            ],
            "explanation": f"Based on your profile as a {company_profile.get('company_stage', '')} company with {company_profile.get('primary_challenge', '')} challenges, a Fractional CFO can provide the strategic financial leadership you need.",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ai_insights.insert_one({**fallback_insight, "raw_response": str(e)})
        
        # Remove _id if present
        fallback_copy = fallback_insight.copy()
        if "_id" in fallback_copy:
            del fallback_copy["_id"]
        
        return fallback_copy
