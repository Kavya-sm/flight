

const awsmobile = {
  "aws_project_region": "ap-south-1",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "ap-south-1_DVZRHRyE0",
  "aws_user_pools_web_client_id": "5ufohk0mlb44r20mbhs9tl0e2p",
  "aws_cognito_identity_pool_id": "ap-south-1:00000000-0000-0000-0000-000000000000",
  "oauth": {},
  "aws_appsync_graphqlEndpoint": "https://example.com/graphql",
  "aws_appsync_region": "ap-south-1",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  // Add this for confidential clients
  "aws_cognito_username_attributes": ["EMAIL"],
  "aws_cognito_signup_attributes": ["EMAIL", "GIVEN_NAME", "FAMILY_NAME", "PHONE_NUMBER"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": ["SMS"],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": ["EMAIL"]
};

export default awsmobile;
