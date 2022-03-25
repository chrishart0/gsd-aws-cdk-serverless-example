import json
import os
from botocore.exceptions import ClientError
import pytest
import boto3
from moto import mock_dynamodb


@pytest.fixture()
def apigw_event():
    """ Generates API GW Event"""

    return {
        "body": '{ "test": "body"}',
        "resource": "/{proxy+}",
        "requestContext": {
            "resourceId": "123456",
            "apiId": "1234567890",
            "resourcePath": "/{proxy+}",
            "httpMethod": "POST",
            "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
            "accountId": "123456789012",
            "identity": {
                "apiKey": "",
                "userArn": "",
                "cognitoAuthenticationType": "",
                "caller": "",
                "userAgent": "Custom User Agent String",
                "user": "",
                "cognitoIdentityPoolId": "",
                "cognitoIdentityId": "",
                "cognitoAuthenticationProvider": "",
                "sourceIp": "127.0.0.1",
                "accountId": "",
            },
            "stage": "prod",
        },
        "queryStringParameters": {"foo": "bar"},
        "headers": {
            "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
            "Accept-Language": "en-US,en;q=0.8",
            "CloudFront-Is-Desktop-Viewer": "true",
            "CloudFront-Is-SmartTV-Viewer": "false",
            "CloudFront-Is-Mobile-Viewer": "false",
            "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
            "CloudFront-Viewer-Country": "US",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Upgrade-Insecure-Requests": "1",
            "X-Forwarded-Port": "443",
            "Host": "1234567890.execute-api.us-east-1.amazonaws.com",
            "X-Forwarded-Proto": "https",
            "X-Amz-Cf-Id": "aaaaaaaaaae3VYQb9jd-nvCd-de396Uhbp027Y2JvkCPNLmGJHqlaA==",
            "CloudFront-Is-Tablet-Viewer": "false",
            "Cache-Control": "max-age=0",
            "User-Agent": "Custom User Agent String",
            "CloudFront-Forwarded-Proto": "https",
            "Accept-Encoding": "gzip, deflate, sdch",
        },
        "pathParameters": {"proxy": "/examplepath"},
        "httpMethod": "POST",
        "stageVariables": {"baz": "qux"},
        "path": "/examplepath",
    }

def test_log_level_env():
    assert os.environ["LOG_LEVEL"] == "INFO"

@mock_dynamodb
def test_first_user_give_1_user(apigw_event):

    from hello_world import app
    
    dynamodb = boto3.resource('dynamodb')
    dynamodb.create_table(
        TableName='visitorCount',
        KeySchema=[
            {
                'AttributeName': 'Count',
                'KeyType': 'HASH'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'Count',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    )

    response = app.lambda_handler(apigw_event, "")
    data = json.loads(response["body"])
    print("data:",data)


    assert response["statusCode"] == 200
    assert data["User count"] == "1"

@mock_dynamodb
def test_second_user_give_2_users(apigw_event):

    from hello_world import app
    
    dynamodb = boto3.resource('dynamodb')
    dynamodb.create_table(
        TableName='visitorCount',
        KeySchema=[
            {
                'AttributeName': 'Count',
                'KeyType': 'HASH'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'Count',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    )

    app.lambda_handler(apigw_event, "")
    response = app.lambda_handler(apigw_event, "")
    data = json.loads(response["body"])
    print("data:",data)


    assert response["statusCode"] == 200
    assert data["User count"] == "2"

def test_bad_ddb(apigw_event):

    from hello_world import app

    app.lambda_handler(apigw_event, "")
    response = app.lambda_handler(apigw_event, "")

    assert response["statusCode"] == 500

# @mock_dynamodb
# def test_github_start_returned(apigw_event):

#     from hello_world import app
    
#     dynamodb = boto3.resource('dynamodb')
#     dynamodb.create_table(
#         TableName='visitorCount',
#         KeySchema=[
#             {
#                 'AttributeName': 'Count',
#                 'KeyType': 'HASH'
#             }
#         ],
#         AttributeDefinitions=[
#             {
#                 'AttributeName': 'Count',
#                 'AttributeType': 'S'
#             }
#         ],
#         ProvisionedThroughput={
#             'ReadCapacityUnits': 1,
#             'WriteCapacityUnits': 1
#         }
#     )

#     app.lambda_handler(apigw_event, "")
#     response = app.lambda_handler(apigw_event, "")
#     data = json.loads(response["body"])
#     print("data:",data)


#     print()
#     assert response["statusCode"] == 200
#     assert data["GitHub stars"] == "5"


    

    
