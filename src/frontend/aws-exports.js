

const awsmobile = {
  "aws_project_region": "ap-south-1",  // ← CHANGE to ap-south-1
  "aws_cognito_identity_pool_id": "ap-south-1:00000000-0000-0000-0000-000000000000", // ← CHANGE region
  "aws_cognito_region": "ap-south-1",  // ← CHANGE to ap-south-1
  "aws_user_pools_id": "ap-south-1_DVZRHRyE0",  // ← This is correct
  "aws_user_pools_web_client_id": "5ufohk0mlb44r20mbhs9tl0e2p",  // ← NEED NEW CLIENT ID
  "oauth": {},
  "aws_appsync_graphqlEndpoint": "https://example.com/graphql",
  "aws_appsync_region": "ap-south-1",  // ← CHANGE to ap-south-1
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS"
};

export default awsmobile;
