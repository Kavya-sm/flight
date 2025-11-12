const awsmobile = {
  "aws_project_region": "ap-south-1",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "ap-south-1_LI0TUZRlh",
  "aws_user_pools_web_client_id": "5ns149ruhcaf2n9bm7kj0dql8c",
  "oauth": {
    "domain": "ap-south-1li0tuzrlh.auth.ap-south-1.amazoncognito.com",
    "scope": ["email", "openid", "profile", "phone"],
    "redirectSignIn": "https://main.d1r4zkv0u7sfsi.amplifyapp.com",
    "redirectSignOut": "https://main.d1r4zkv0u7sfsi.amplifyapp.com", 
    "responseType": "code"
  },
  "aws_cognito_username_attributes": [],
  "aws_cognito_signup_attributes": ["EMAIL", "PHONE_NUMBER", "GIVEN_NAME", "FAMILY_NAME"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_verification_mechanisms": ["EMAIL"],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": ["REQUIRES_LOWERCASE", "REQUIRES_UPPERCASE", "REQUIRES_NUMBERS", "REQUIRES_SYMBOLS"]
  },
  
  // ADD THIS API CONFIGURATION:
  "aws_cloud_logic_custom": [
    {
      "name": "loyaltyAPI",
      "endpoint": "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/dev",
      "region": "ap-south-1"
    }
  ]
};

export default awsmobile;
