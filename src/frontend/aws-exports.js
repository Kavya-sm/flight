
const awsmobile = {
  "aws_project_region": "ap-south-1",  // ← CHANGE to us-east-1
  "aws_cognito_region": "ap-south-1",  // ← CHANGE to us-east-1
  "aws_user_pools_id": "ap-south-1_XXXXXXXXX",  // ← NEW User Pool ID from us-east-1
  "aws_user_pools_web_client_id": "5fvl67m37p5h4uqv5okbvfnkfb",  // ← NEW App Client ID (no secret)
  "oauth": {
    "domain": "ap-south-1cjkdud4wo.auth.ap-south-1.amazoncognito.com",  // ← Remove https://
    "scope": ["email", "openid", "profile", "phone"],
    "redirectSignIn": "https://main.d1r4zkv0u7sfsi.amplifyapp.com",
    "redirectSignOut": "https://main.d1r4zkv0u7sfsi.amplifyapp.com", 
    "responseType": "code"
  },
  "aws_cognito_username_attributes": ["EMAIL"],
  "aws_cognito_signup_attributes": ["EMAIL"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_verification_mechanisms": ["EMAIL"]
};

export default awsmobile;
