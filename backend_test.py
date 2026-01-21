#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class SuiteSummitAPITester:
    def __init__(self, base_url="https://exec-summit.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.company_token = None
        self.executive_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.company_id = None
        self.executive_id = None
        self.intro_request_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            return success, response.json() if response.content else {}, response.status_code
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_health_check(self):
        """Test basic API health"""
        success, data, status = self.make_request('GET', '')
        self.log_test("API Health Check", success and data.get('message') == 'Suite Summit API')

    def test_roles_endpoint(self):
        """Test available roles endpoint"""
        success, data, status = self.make_request('GET', 'roles')
        has_cfo = 'Fractional CFO' in data.get('available', [])
        self.log_test("Available Roles Endpoint", success and has_cfo)

    def test_company_registration(self):
        """Test company user registration"""
        timestamp = int(time.time())
        company_data = {
            "name": f"Test Company {timestamp}",
            "email": f"company{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "company"
        }
        
        success, data, status = self.make_request('POST', 'auth/register', company_data, expected_status=200)
        if success and data.get('access_token'):
            self.company_token = data['access_token']
            self.log_test("Company Registration", True)
        else:
            self.log_test("Company Registration", False, f"Status: {status}, Data: {data}")

    def test_executive_registration(self):
        """Test executive user registration"""
        timestamp = int(time.time())
        executive_data = {
            "name": f"Test Executive {timestamp}",
            "email": f"executive{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "executive"
        }
        
        success, data, status = self.make_request('POST', 'auth/register', executive_data, expected_status=200)
        if success and data.get('access_token'):
            self.executive_token = data['access_token']
            self.log_test("Executive Registration", True)
        else:
            self.log_test("Executive Registration", False, f"Status: {status}, Data: {data}")

    def test_admin_login(self):
        """Test admin login with seeded credentials"""
        admin_data = {
            "email": "admin@suitesummit.com",
            "password": "Summit@Admin2024"
        }
        
        success, data, status = self.make_request('POST', 'auth/login', admin_data, expected_status=200)
        if success and data.get('access_token'):
            self.admin_token = data['access_token']
            self.log_test("Admin Login", True)
        else:
            self.log_test("Admin Login", False, f"Status: {status}, Data: {data}")

    def test_company_intake(self):
        """Test company intake submission"""
        if not self.company_token:
            self.log_test("Company Intake", False, "No company token")
            return

        intake_data = {
            "company_name": "Test Corp",
            "company_stage": "series-a",
            "revenue_range": "2m-10m",
            "primary_challenge": "cash-flow",
            "desired_role": "Fractional CFO",
            "budget_range": "10k-15k",
            "desired_hours": "20-40",
            "additional_info": "Looking for strategic financial leadership"
        }
        
        success, data, status = self.make_request('POST', 'company/intake', intake_data, self.company_token)
        if success and data.get('company_id'):
            self.company_id = data['company_id']
            self.log_test("Company Intake Submission", True)
        else:
            self.log_test("Company Intake Submission", False, f"Status: {status}, Data: {data}")

    def test_ai_insights_generation(self):
        """Test AI insights generation"""
        if not self.company_token:
            self.log_test("AI Insights Generation", False, "No company token")
            return

        print("🔄 Generating AI insights (this may take a few seconds)...")
        success, data, status = self.make_request('POST', 'match/ai-insights', {}, self.company_token)
        
        has_required_fields = (
            data.get('recommended_role') and 
            data.get('engagement_scope') and 
            data.get('expected_outcomes') and 
            data.get('explanation')
        )
        
        self.log_test("AI Insights Generation", success and has_required_fields)

    def test_executive_application(self):
        """Test executive application submission"""
        if not self.executive_token:
            self.log_test("Executive Application", False, "No executive token")
            return

        application_data = {
            "title": "Fractional CFO",
            "years_experience": 15,
            "industries": ["SaaS / Software", "Fintech"],
            "engagement_size": "20-40 hrs/month",
            "linkedin_url": "https://linkedin.com/in/testexec",
            "case_example": "Led financial transformation for Series B SaaS company, implementing robust forecasting and cash management systems.",
            "measurable_outcomes": [
                "Reduced burn rate by 25%",
                "Closed $10M Series B funding",
                "Implemented financial controls saving $500K annually"
            ],
            "availability": "Immediately Available",
            "hourly_rate_range": "$200-300/hr",
            "reference_name": "John Smith",
            "reference_email": "john@company.com",
            "attestation_confirmed": True
        }
        
        success, data, status = self.make_request('POST', 'executive/apply', application_data, self.executive_token)
        self.log_test("Executive Application Submission", success and data.get('status') == 'pending')

    def test_admin_get_executives(self):
        """Test admin viewing executive applications"""
        if not self.admin_token:
            self.log_test("Admin Get Executives", False, "No admin token")
            return

        success, data, status = self.make_request('GET', 'admin/executives', token=self.admin_token)
        self.log_test("Admin Get Executives", success and isinstance(data, list))
        
        # Store executive ID for approval test
        if success and data:
            for exec_data in data:
                if exec_data.get('status') == 'pending':
                    self.executive_id = exec_data.get('id')
                    break

    def test_admin_approve_executive(self):
        """Test admin approving executive"""
        if not self.admin_token or not self.executive_id:
            self.log_test("Admin Approve Executive", False, "Missing admin token or executive ID")
            return

        success, data, status = self.make_request('PUT', f'admin/executives/{self.executive_id}/status', 
                                                {"status": "approved"}, self.admin_token)
        self.log_test("Admin Approve Executive", success and data.get('message'))

    def test_company_view_matches(self):
        """Test company viewing matched executives"""
        if not self.company_token:
            self.log_test("Company View Matches", False, "No company token")
            return

        success, data, status = self.make_request('GET', 'match/executives', token=self.company_token)
        self.log_test("Company View Matched Executives", success and isinstance(data, list))

    def test_intro_request_flow(self):
        """Test intro request creation"""
        if not self.company_token or not self.executive_id:
            self.log_test("Create Intro Request", False, "Missing tokens or executive ID")
            return

        intro_data = {
            "executive_id": self.executive_id,
            "message": "We're interested in discussing a fractional CFO engagement."
        }
        
        success, data, status = self.make_request('POST', 'match/intro-request', intro_data, self.company_token)
        if success and data.get('request_id'):
            self.intro_request_id = data['request_id']
            self.log_test("Create Intro Request", True)
        else:
            self.log_test("Create Intro Request", False, f"Status: {status}, Data: {data}")

    def test_executive_view_requests(self):
        """Test executive viewing intro requests"""
        if not self.executive_token:
            self.log_test("Executive View Requests", False, "No executive token")
            return

        success, data, status = self.make_request('GET', 'executive/intro-requests', token=self.executive_token)
        self.log_test("Executive View Intro Requests", success and isinstance(data, list))

    def test_admin_platform_stats(self):
        """Test admin platform statistics"""
        if not self.admin_token:
            self.log_test("Admin Platform Stats", False, "No admin token")
            return

        success, data, status = self.make_request('GET', 'admin/stats', token=self.admin_token)
        has_stats = (
            'total_companies' in data and 
            'total_executives' in data and 
            'total_intros' in data
        )
        self.log_test("Admin Platform Stats", success and has_stats)

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Suite Summit API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_health_check()
        self.test_roles_endpoint()
        
        # Authentication tests
        self.test_company_registration()
        self.test_executive_registration()
        self.test_admin_login()
        
        # Company workflow tests
        self.test_company_intake()
        self.test_ai_insights_generation()
        
        # Executive workflow tests
        self.test_executive_application()
        
        # Admin workflow tests
        self.test_admin_get_executives()
        self.test_admin_approve_executive()
        
        # Matching and intro flow tests
        self.test_company_view_matches()
        self.test_intro_request_flow()
        self.test_executive_view_requests()
        
        # Admin analytics
        self.test_admin_platform_stats()
        
        # Results
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Backend API tests mostly successful!")
            return 0
        else:
            print("⚠️  Multiple API issues detected")
            return 1

def main():
    tester = SuiteSummitAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())