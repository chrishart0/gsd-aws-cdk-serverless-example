import json
import os
import logging
import boto3
from botocore.exceptions import ClientError
# import requests

# Handle logger
logger = logging.getLogger()
logger.setLevel(logging.os.environ['LOG_LEVEL'])

dynamodb = boto3.resource('dynamodb')
aws_environment = os.environ['AWSENV']

logger.info("Finished handling variables, imports, and clients")

# Check if executing locally or on AWS, and configure DynamoDB connection accordingly.
# https://github.com/ganshan/sam-dynamodb-local/blob/master/src/Person.py
if aws_environment == "AWS_SAM_LOCAL":
    table = boto3.resource('dynamodb', endpoint_url="http://dynamodb-local:8000").Table('visitorCount') #Local table name hard coded in entrypoint.sh for local dev
    logger.info("Using local Dynamo container for testing")
else: # Running in AWS
    table = dynamodb.Table(os.environ['TABLE_NAME'])

logger.info("Finished conditional dynamodb logic")

def returnError():
    logger.error('Returning 500 status code')
    return {
            "statusCode": 500,
            'headers': {
                'Access-Control-Allow-Origin': os.environ['CORS_URL'],
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Authorization',
                'Content-Type': 'application/json'
            }
        }

def getUserCount():
    try:
        logger.info("Querying DDB")
        user_count_from_table = table.get_item(
            Key={'Count': 'Users'}
        )

        #Handle first use case where count doesn't exist yet
        if 'Item' in user_count_from_table:
            user_count = user_count_from_table['Item']['Number'] +1
        else: 
            user_count = 1
        logger.info(user_count)

        return user_count

    #Catch known errors
    #ToDo: Add more handling here
    except ClientError as e:
        if e.response['Error']['Code'] == 'RequestLimitExceeded':
            logger.error('ERROR: ', e)
            returnError()
        else:
            logger.error("UNEXPECTED ERROR from DDB: %s" % e)
            returnError()

def updateUserCount(count):
    try:
        logger.info("Updating DDB with new user count")
        table.put_item(
            Item={
                'Count': 'Users',
                'Number': count
            }
        )

    #Catch known errors
    #ToDo: Add more handling here
    except ClientError as e:
        if e.response['Error']['Code'] == 'RequestLimitExceeded':
            logger.error('ERROR: ', e)
        else:
            logger.error("UNEXPECTED ERROR from DDB: %s" % e)

# def get_github_start():
#     # response = requests.get('https://api.github.com/repos/chrishart0/gsd-aws-cdk-serverless-example')
#     # stared_count = response.content['stargazers_count']
#     # print("resp:")
#     # print(stared_count)
#     return 5

def lambda_handler(event, context):

    logger.info("Lambda handler invocation initiated")

    user_count = getUserCount()
    updateUserCount(user_count)

    # gitHub_stars = get_github_start()

    if not (user_count):
        logger.error('Something went wrong, returning 500')
        return {
        "statusCode": 500,
        'headers': {
            'Access-Control-Allow-Origin': os.environ['CORS_URL'],
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Authorization',
            'Content-Type': 'application/json'
        }
    }

    logger.info('Function completed successfully, returning 200')
    return {
        "statusCode": 200,
        'headers': {
            'Access-Control-Allow-Origin': os.environ['CORS_URL'],
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Authorization',
            'Content-Type': 'application/json'
        },
        "body": json.dumps({
            "User count": str(user_count),
            # "GitHub stars": str(gitHub_stars)
        }),
    }
