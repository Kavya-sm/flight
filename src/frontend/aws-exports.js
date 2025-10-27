

const awsmobile = {
  "aws_project_region": "ap-south-1",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "ap-south-1_XXXXXXXXX",
  "aws_user_pools_web_client_id": "5fvl67m37p5h4uqv5okbvfnkfb",
  "oauth": {
    "domain": "ap-south-1cjkdud4wo.auth.ap-south-1.amazoncognito.com",
    "scope": ["email", "openid", "profile", "phone"],
    "redirectSignIn": "https://main.d1r4zkv0u7sfsi.amplifyapp.com",
    "redirectSignOut": "https://main.d1r4zkv0u7sfsi.amplifyapp.com", 
    "responseType": "code"
  },
  // FIX THESE LINES:
  "aws_cognito_username_attributes": [],  // ← CHANGE THIS
  "aws_cognito_signup_attributes": ["EMAIL", "PREFERRED_USERNAME", "PHONE_NUMBER", "GIVEN_NAME", "FAMILY_NAME"],  // ← ADD ALL REQUIRED ATTRIBUTES
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_verification_mechanisms": ["EMAIL"]
};

export default awsmobile;
