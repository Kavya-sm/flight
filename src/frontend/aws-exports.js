

const awsmobile = {
  "aws_project_region": "ap-south-1",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "ap-south-1_DVZRHRyE0",
  "aws_user_pools_web_client_id": "5ufohk0mlb44r20mbhs9tl0e2p",
  "oauth": {
    "domain": "https://ap-south-1dvzrhrye0.auth.ap-south-1.amazoncognito.com", // ← Use your Cognito domain
    "scope": ["email", "openid", "profile", "phone"],
    "redirectSignIn": "https://main.d1r4zkv0u7sfsi.amplifyapp.com", // ← Your Amplify URL
    "redirectSignOut": "https://main.d1r4zkv0u7sfsi.amplifyapp.com", // ← Your Amplify URL
    "responseType": "code"
  },
  "aws_cognito_username_attributes": ["EMAIL"],
  "aws_cognito_signup_attributes": ["EMAIL", "GIVEN_NAME", "FAMILY_NAME", "PHONE_NUMBER"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_verification_mechanisms": ["EMAIL"]
};

export default awsmobile;
