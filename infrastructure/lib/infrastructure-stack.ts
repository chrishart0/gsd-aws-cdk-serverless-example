import { Duration, Stack, StackProps, RemovalPolicy, CfnOutput, aws_apigateway } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_route53 as route53 } from 'aws-cdk-lib';
import { aws_route53_targets as targets } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_certificatemanager as acm } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_logs as logs } from 'aws-cdk-lib';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
// import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as serverless from 'aws-cdk-lib/aws-sam';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const hostedZoneId:string = process.env.THREE_M_HOSTED_ZONE_ID!
    const hostedZoneName:string = process.env.THREE_M_HOSTED_ZONE_NAME!
    const siteDomain:string = process.env.THREE_M_DOMAIN!
    const apiDomain = 'api.' + siteDomain

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'zone', {
      zoneName: hostedZoneName,
      hostedZoneId: hostedZoneId,
    });
    
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for ${siteDomain}`
    });

    const siteBucket = new s3.Bucket(this, 'staticSiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Grant access to cloudfront
    siteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [siteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));
    new CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

    const certificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      subjectAlternativeNames: [apiDomain],
      hostedZone: zone,
      region: 'us-east-1', // Cloudfront only checks this region for certificates.
    });
    const certificateArn = certificate.certificateArn;
    new CfnOutput(this, 'Certificate', { value: certificateArn });

    // CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
      viewerCertificate: {
          aliases: [siteDomain],
          props: {
            acmCertificateArn: certificateArn,
            sslSupportMethod: "sni-only",
          },
        },
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: siteBucket,
            originAccessIdentity: cloudfrontOAI
          },
          behaviors: [{
            isDefaultBehavior: true,
            compress: true,
            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
          }],
        }
      ]
    });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone
    });

    new s3_deployment.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3_deployment.Source.asset('../frontend/build')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512
    });
    
    //---------------//
    // Backend Infra //
    //---------------//

    //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb-readme.html
    const ddb = new dynamodb.Table(this, 'Table', {
      partitionKey: { 
        name: 'Count', 
        type: dynamodb.AttributeType.STRING 
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    new CfnOutput(this, 'DDB', { value: ddb.tableName });

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_sam-readme.html
    // const backendFunction = new serverless.CfnFunction(this, 'BackendFunction',{
    //   // packageType: 'Image',
    //   handler: 'app.lambda_handler',
    //   runtime: 'python3.8',
    //   codeUri: '../backend/hello_world/',
    //   architectures: ['x86_64'],
    //   // imageUri: 'helloworldfunction:python3.9-v1',
    //   events: {
    //     HelloWorld: {
    //       properties: {
    //         path: '/users',
    //         method: 'get',
    //         variables: {
    //           variablesKey: 'variables',
    //         },
    //       },
    //       type: 'Api',
    //     },
    //   }
    // })
    // backendFunction.addMetadata('Dockerfile', 'Dockerfile');
    // backendFunction.addMetadata('DockerContext', './hello_world');
    // backendFunction.addMetadata('DockerTag', 'python3.9-v1');

    //ToDo: Figure out if sam can be used, having an issue with uploads
    //https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html

    //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Function.html
    const backendFunction = new lambda.Function(this, 'BackendFunction', {
      code: lambda.Code.fromAsset( '../backend/hello_world/' ),
      runtime: lambda.Runtime.PYTHON_3_8,
      logRetention: logs.RetentionDays.ONE_MONTH,
      handler: 'app.lambda_handler',
      timeout: Duration.seconds(3),
      environment: {
        'TABLE_NAME': ddb.tableName,
        'CORS_URL': 'https://' + siteDomain,
        'AWSENV': "AWS",
        'LOG_LEVEL': 'INFO',
      }
    });

    ddb.grantReadWriteData(backendFunction)

    //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.LambdaRestApi.html
    const api = new apigateway.LambdaRestApi(this, 'backendAPG', {
      handler: backendFunction,
      proxy: false,
      domainName: {
        domainName: apiDomain,
        certificate: certificate,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2
      },
    });
    new CfnOutput(this, 'ApiGatewayUrl', { value: apiDomain });

    const items = api.root.addResource('users');
    items.addMethod('GET');  // GET /users

    new route53.ARecord(this, 'apiDomainR53Record', {
      recordName: apiDomain,
      zone: zone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api))
    });

  }
}
