
const awsmobile = {
  "aws_project_region": "ap-south-1",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "ap-south-1_LI0TUZRlh", // ← Replace with your new User Pool ID
  "aws_user_pools_web_client_id": "5ns149ruhcaf2n9bm7kj0dql8c", // ← Replace with your new App Client ID
  "oauth": {
    "domain": "ap-south-1li0tuzrlh.auth.ap-south-1.amazoncognito.com", // ← Update with your new domain
    "scope": ["email", "openid", "profile", "phone"],
    "redirectSignIn": "https://main.d1r4zkv0u7sfsi.amplifyapp.com",
    "redirectSignOut": "https://main.d1r4zkv0u7sfsi.amplifyapp.com", 
    "responseType": "code"
  },
  // CRITICAL CONFIG FOR USERNAME-ONLY SETUP:
  "aws_cognito_username_attributes": [], // ← Empty array for custom usernames
  "aws_cognito_signup_attributes": ["EMAIL", "PHONE_NUMBER", "GIVEN_NAME", "FAMILY_NAME"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_verification_mechanisms": ["EMAIL"],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": ["REQUIRES_LOWERCASE", "REQUIRES_UPPERCASE", "REQUIRES_NUMBERS", "REQUIRES_SYMBOLS"]
  }
};

export default awsmobile;
