# Suite Summit - Product Requirements Document

## Overview
Suite Summit is a B2B platform that connects companies with vetted fractional C-suite executives, starting with Fractional CFOs.

## Original Problem Statement
Build a high-trust B2B platform that helps companies identify, match with, and engage the right fractional C-suite executive. Features include AI-guided matching, executive vetting, and request-based introductions (no open messaging or job board behavior).

## Architecture

### Tech Stack
- **Frontend**: React with Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Emergent LLM integration (OpenAI GPT-5.2 via universal key)

### Key Design Decisions
- JWT-based authentication with role field (company|executive|admin)
- LLM provider abstraction with config switch (`LLM_PROVIDER`)
- CFO-only launch (other roles "Coming Soon")
- Request Intro only (no open messaging)
- Manual admin approval for executives

## User Personas

### Companies (Buyers)
- Founders, CEOs, operators
- SMBs, startups, PE-backed companies
- Need senior leadership without full-time commitment

### Executives (Supply)
- Fractional CFOs (launch role)
- Senior, independent operators
- Join via application + vetting

### Admin (Platform Owner)
- Approves executives
- Oversees matches
- Maintains platform quality

## Core Requirements

### Authentication
- [x] JWT-based auth for all roles
- [x] Role-based access control
- [x] Admin seeded from environment variables

### Company Flow
- [x] Registration with role selection
- [x] 5-step intake wizard
- [x] AI-powered insights generation
- [x] Browse matched executives
- [x] Request introductions

### Executive Flow
- [x] Application with LinkedIn, case examples, outcomes
- [x] Attestation checkbox for fractional availability
- [x] Pending → Approved → Live status flow
- [x] View and respond to intro requests
- [x] Update availability

### Admin Flow
- [x] View all executives and companies
- [x] Approve/reject executive applications
- [x] View all intro requests
- [x] Access AI output logs

## What's Been Implemented (January 2026)

### Backend
- Complete FastAPI server with all routes
- User authentication (register, login, me)
- Company intake and profile management
- Executive application and profile management
- Matching and intro request system
- Admin dashboard APIs
- AI insights generation with Emergent LLM integration
- AI output logging for admin review

### Frontend
- Landing page with abstract mountain theme
- Login and registration with role selection
- Company intake wizard (5 steps)
- AI Insights "Summit View" page
- Matched executives card display
- Executive application form
- Executive dashboard with request management
- Admin dashboard with tabs for executives, companies, requests, AI logs

## Prioritized Backlog

### P0 - Critical (Next)
- Email verification for executives
- Password reset flow

### P1 - High Priority
- Search/filter executives by industry, availability
- Executive profile detail view
- Notification system for new requests

### P2 - Future
- Stripe integration for subscriptions
- Success fee tracking
- Additional C-suite roles (COO, CMO, CTO)
- Rating/review system

## Environment Variables

### Backend (.env)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- `LLM_PROVIDER` - AI provider (emergent|openai|anthropic|gemini)
- `EMERGENT_LLM_KEY` - Universal LLM key

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL

## Testing Credentials

- **Admin**: admin@suitesummit.com / Summit@Admin2024
- **Company Test**: company@test.com / test123
- **Executive Test**: exec@test.com / test123
