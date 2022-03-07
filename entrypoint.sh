aws dynamodb --region us-east-1 --endpoint-url http://dynamodb-local:8000 create-table --table-name visitorCount \
    --attribute-definitions AttributeName=Count,AttributeType=S --key-schema AttributeName=Count,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

make _run-backend