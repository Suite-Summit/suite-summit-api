from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRY_HOURS = int(os.environ.get('JWT_EXPIRY_HOURS', 24))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# API Key for spam protection
PLATFORM_API_KEY = os.environ.get('PLATFORM_API_KEY', 'default-api-key')

# Create the main app
app = FastAPI(title="Suite Summit API", version="1.0.0")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
company_router = APIRouter(prefix="/company", tags=["Company"])
executive_router = APIRouter(prefix="/executive", tags=["Executive"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])
match_router = APIRouter(prefix="/match", tags=["Matching"])

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Literal["company", "executive", "admin"]

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    email_verified: bool = False

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    email_verified: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CompanyProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    company_stage: str
    revenue_range: str
    primary_challenge: str
    desired_role: str = "Fractional CFO"
    budget_range: str
    desired_hours: str
    open_to_remote: bool = True
    additional_info: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanyIntake(BaseModel):
    company_name: str
    company_stage: str
    revenue_range: str
    primary_challenge: str
    desired_role: str = "Fractional CFO"
    budget_range: str
    desired_hours: str
    open_to_remote: bool = True
    additional_info: Optional[str] = None

class ExecutiveProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str = "Fractional CFO"
    years_experience: int
    industries: List[str]
    engagement_size: str
    linkedin_url: str
    case_example: str
    measurable_outcomes: List[str]
    availability: str
    willing_to_travel: bool = False
    open_to_remote: bool = True
    hourly_rate_range: Optional[str] = None
    reference_name: Optional[str] = None
    reference_email: Optional[EmailStr] = None
    attestation_confirmed: bool = False
    status: Literal["pending", "approved", "rejected"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExecutiveApplication(BaseModel):
    title: str = "Fractional CFO"
    years_experience: int
    industries: List[str]
    engagement_size: str
    linkedin_url: str
    case_example: str
    measurable_outcomes: List[str]
    availability: str
    willing_to_travel: bool = False
    open_to_remote: bool = True
    hourly_rate_range: Optional[str] = None
    reference_name: Optional[str] = None
    reference_email: Optional[EmailStr] = None
    attestation_confirmed: bool

class ExecutiveCard(BaseModel):
    id: str
    user_id: str
    name: str
    title: str
    industries: List[str]
    measurable_outcomes: List[str]
    engagement_size: str
    availability: str
    willing_to_travel: bool = False
    open_to_remote: bool = True

class IntroRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    executive_id: str
    company_user_id: str
    executive_user_id: str
    message: Optional[str] = None
    status: Literal["pending", "accepted", "declined"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IntroRequestCreate(BaseModel):
    executive_id: str
    message: Optional[str] = None

class AIInsight(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    user_id: str
    recommended_role: str
    engagement_scope: str
    expected_outcomes: List[str]
    explanation: str
    raw_response: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AILog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prompt: str
    response: str
    model_used: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_role(required_roles: List[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != PLATFORM_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return True

def validate_linkedin_url(url: str) -> bool:
    pattern = r'^https?://(www\.)?linkedin\.com/in/[\w-]+/?$'
    return bool(re.match(pattern, url))

# ============== AUTH ROUTES ==============

@auth_router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token(user.id, user.email, user.role)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            email_verified=user.email_verified
        )
    )

@auth_router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["id"], user["email"], user["role"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            email_verified=user.get("email_verified", False)
        )
    )

@auth_router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        email_verified=user.get("email_verified", False)
    )

# ============== COMPANY ROUTES ==============

@company_router.post("/intake", response_model=dict)
async def submit_intake(intake: CompanyIntake, user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can submit intake")
    
    existing = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    
    profile = CompanyProfile(
        user_id=user["id"],
        **intake.model_dump()
    )
    
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = profile_dict["created_at"].isoformat()
    profile_dict["updated_at"] = profile_dict["updated_at"].isoformat()
    
    if existing:
        profile_dict["id"] = existing["id"]
        profile_dict["created_at"] = existing["created_at"]
        await db.company_profiles.update_one(
            {"id": existing["id"]},
            {"$set": profile_dict}
        )
    else:
        await db.company_profiles.insert_one(profile_dict)
    
    return {"message": "Intake submitted successfully", "company_id": profile_dict["id"]}

@company_router.get("/profile", response_model=dict)
async def get_company_profile(user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can access this")
    
    profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="No company profile found")
    
    return profile

@company_router.get("/intro-requests", response_model=List[dict])
async def get_company_intro_requests(user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can access this")
    
    requests = await db.intro_requests.find(
        {"company_user_id": user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    for req in requests:
        exec_profile = await db.executive_profiles.find_one(
            {"id": req["executive_id"]},
            {"_id": 0}
        )
        exec_user = await db.users.find_one(
            {"id": req["executive_user_id"]},
            {"_id": 0, "password_hash": 0}
        )
        if exec_profile and exec_user:
            req["executive_name"] = exec_user["name"]
            req["executive_title"] = exec_profile["title"]
    
    return requests

# ============== EXECUTIVE ROUTES ==============

@executive_router.post("/apply", response_model=dict)
async def apply_as_executive(application: ExecutiveApplication, user: dict = Depends(get_current_user)):
    if user["role"] != "executive":
        raise HTTPException(status_code=403, detail="Only executives can apply")
    
    if not application.attestation_confirmed:
        raise HTTPException(status_code=400, detail="Attestation must be confirmed")
    
    if not validate_linkedin_url(application.linkedin_url):
        raise HTTPException(status_code=400, detail="Invalid LinkedIn URL format")
    
    existing = await db.executive_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Application already submitted")
    
    profile = ExecutiveProfile(
        user_id=user["id"],
        **application.model_dump()
    )
    
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = profile_dict["created_at"].isoformat()
    profile_dict["updated_at"] = profile_dict["updated_at"].isoformat()
    
    await db.executive_profiles.insert_one(profile_dict)
    
    return {"message": "Application submitted successfully", "status": "pending"}

@executive_router.get("/profile", response_model=dict)
async def get_executive_profile(user: dict = Depends(get_current_user)):
    if user["role"] != "executive":
        raise HTTPException(status_code=403, detail="Only executives can access this")
    
    profile = await db.executive_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="No executive profile found")
    
    return profile

@executive_router.put("/availability", response_model=dict)
async def update_availability(availability: str, user: dict = Depends(get_current_user)):
    if user["role"] != "executive":
        raise HTTPException(status_code=403, detail="Only executives can access this")
    
    result = await db.executive_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {"availability": availability, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Availability updated"}

@executive_router.get("/intro-requests", response_model=List[dict])
async def get_executive_intro_requests(user: dict = Depends(get_current_user)):
    if user["role"] != "executive":
        raise HTTPException(status_code=403, detail="Only executives can access this")
    
    requests = await db.intro_requests.find(
        {"executive_user_id": user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    for req in requests:
        company_profile = await db.company_profiles.find_one(
            {"id": req["company_id"]},
            {"_id": 0}
        )
        company_user = await db.users.find_one(
            {"id": req["company_user_id"]},
            {"_id": 0, "password_hash": 0}
        )
        if company_profile:
            req["company_name"] = company_profile["company_name"]
            req["company_stage"] = company_profile["company_stage"]
            req["primary_challenge"] = company_profile["primary_challenge"]
        if company_user:
            req["contact_name"] = company_user["name"]
    
    return requests

@executive_router.put("/intro-requests/{request_id}/respond", response_model=dict)
async def respond_to_intro_request(
    request_id: str,
    response: Literal["accepted", "declined"],
    user: dict = Depends(get_current_user)
):
    if user["role"] != "executive":
        raise HTTPException(status_code=403, detail="Only executives can respond")
    
    intro_req = await db.intro_requests.find_one(
        {"id": request_id, "executive_user_id": user["id"]},
        {"_id": 0}
    )
    
    if not intro_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.intro_requests.update_one(
        {"id": request_id},
        {"$set": {"status": response, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Request {response}"}

# ============== MATCHING ROUTES ==============

@match_router.get("/executives", response_model=List[ExecutiveCard])
async def get_matched_executives(user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can view matches")
    
    company_profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not company_profile:
        raise HTTPException(status_code=404, detail="Complete intake first")
    
    executives = await db.executive_profiles.find(
        {"status": "approved"},
        {"_id": 0}
    ).to_list(50)
    
    result = []
    for exec in executives:
        exec_user = await db.users.find_one({"id": exec["user_id"]}, {"_id": 0, "password_hash": 0})
        if exec_user:
            result.append(ExecutiveCard(
                id=exec["id"],
                user_id=exec["user_id"],
                name=exec_user["name"],
                title=exec["title"],
                industries=exec["industries"],
                measurable_outcomes=exec["measurable_outcomes"],
                engagement_size=exec["engagement_size"],
                availability=exec["availability"]
            ))
    
    return result

@match_router.post("/intro-request", response_model=dict)
async def create_intro_request(request: IntroRequestCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can request intros")
    
    company_profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not company_profile:
        raise HTTPException(status_code=404, detail="Complete intake first")
    
    executive = await db.executive_profiles.find_one(
        {"id": request.executive_id, "status": "approved"},
        {"_id": 0}
    )
    if not executive:
        raise HTTPException(status_code=404, detail="Executive not found or not approved")
    
    existing = await db.intro_requests.find_one({
        "company_id": company_profile["id"],
        "executive_id": request.executive_id
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Intro request already sent")
    
    intro_req = IntroRequest(
        company_id=company_profile["id"],
        executive_id=request.executive_id,
        company_user_id=user["id"],
        executive_user_id=executive["user_id"],
        message=request.message
    )
    
    intro_dict = intro_req.model_dump()
    intro_dict["created_at"] = intro_dict["created_at"].isoformat()
    intro_dict["updated_at"] = intro_dict["updated_at"].isoformat()
    
    await db.intro_requests.insert_one(intro_dict)
    
    return {"message": "Intro request sent", "request_id": intro_req.id}

# ============== AI ROUTES ==============

@match_router.post("/ai-insights", response_model=dict)
async def generate_ai_insights(user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can get insights")
    
    company_profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not company_profile:
        raise HTTPException(status_code=404, detail="Complete intake first")
    
    existing_insight = await db.ai_insights.find_one(
        {"company_id": company_profile["id"]},
        {"_id": 0}
    )
    if existing_insight:
        return existing_insight
    
    from services.ai_service import generate_company_insights
    
    insight = await generate_company_insights(company_profile, user["id"])
    
    return insight

# ============== ADMIN ROUTES ==============

@admin_router.get("/executives", response_model=List[dict])
async def get_all_executives(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    executives = await db.executive_profiles.find({}, {"_id": 0}).to_list(100)
    
    for exec in executives:
        exec_user = await db.users.find_one({"id": exec["user_id"]}, {"_id": 0, "password_hash": 0})
        if exec_user:
            exec["user_name"] = exec_user["name"]
            exec["user_email"] = exec_user["email"]
    
    return executives

@admin_router.put("/executives/{executive_id}/status", response_model=dict)
async def update_executive_status(
    executive_id: str,
    status: Literal["approved", "rejected"] = Query(...),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.executive_profiles.update_one(
        {"id": executive_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Executive not found")
    
    return {"message": f"Executive {status}"}

@admin_router.get("/companies", response_model=List[dict])
async def get_all_companies(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    companies = await db.company_profiles.find({}, {"_id": 0}).to_list(100)
    
    for company in companies:
        company_user = await db.users.find_one({"id": company["user_id"]}, {"_id": 0, "password_hash": 0})
        if company_user:
            company["contact_name"] = company_user["name"]
            company["contact_email"] = company_user["email"]
    
    return companies

@admin_router.get("/intro-requests", response_model=List[dict])
async def get_all_intro_requests(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    return await db.intro_requests.find({}, {"_id": 0}).to_list(100)

@admin_router.get("/ai-logs", response_model=List[dict])
async def get_ai_logs(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    return await db.ai_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@admin_router.get("/stats", response_model=dict)
async def get_platform_stats(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_companies = await db.company_profiles.count_documents({})
    total_executives = await db.executive_profiles.count_documents({})
    pending_executives = await db.executive_profiles.count_documents({"status": "pending"})
    approved_executives = await db.executive_profiles.count_documents({"status": "approved"})
    total_intros = await db.intro_requests.count_documents({})
    pending_intros = await db.intro_requests.count_documents({"status": "pending"})
    accepted_intros = await db.intro_requests.count_documents({"status": "accepted"})
    
    return {
        "total_companies": total_companies,
        "total_executives": total_executives,
        "pending_executives": pending_executives,
        "approved_executives": approved_executives,
        "total_intros": total_intros,
        "pending_intros": pending_intros,
        "accepted_intros": accepted_intros
    }

# ============== PUBLIC ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Suite Summit API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.get("/roles")
async def get_available_roles():
    return {
        "available": ["Fractional CFO"],
        "coming_soon": ["Fractional COO", "Fractional CMO", "Fractional CTO", "Fractional CHRO"]
    }

# Include routers
api_router.include_router(auth_router)
api_router.include_router(company_router)
api_router.include_router(executive_router)
api_router.include_router(admin_router)
api_router.include_router(match_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== STARTUP ==============

@app.on_event("startup")
async def startup_event():
    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if admin_email and admin_password:
        existing_admin = await db.users.find_one({"email": admin_email})
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                name="Platform Admin",
                role="admin",
                email_verified=True
            )
            admin_dict = admin_user.model_dump()
            admin_dict["password_hash"] = hash_password(admin_password)
            admin_dict["created_at"] = admin_dict["created_at"].isoformat()
            await db.users.insert_one(admin_dict)
            logger.info(f"Admin user created: {admin_email}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
