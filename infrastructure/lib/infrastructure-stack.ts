import { Duration, Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_route53 as route53 } from 'aws-cdk-lib';
import { aws_route53_targets as targets } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_certificatemanager as acm } from 'aws-cdk-lib';
import * as serverless from 'aws-cdk-lib/aws-sam';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const hostedZoneId:string = process.env.hostedZoneId!
    const hostedZoneName:string = process.env.hostedZoneName!
    const subDomain = process.env.subDomain
    const domain = process.env.domain
    const siteDomain = subDomain + '.' + domain

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

    const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1', // Cloudfront only checks this region for certificates.
    }).certificateArn;
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
    
    //-----------------------//
    // Backend Infra via SAM //
    //-----------------------//
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_sam-readme.html
    const backendFunction = new serverless.CfnFunction(this, 'BackendFunction',{
      // packageType: 'Image',
      handler: 'app.lambda_handler',
      runtime: 'python3.9',
      codeUri: '../backend/hello_world/',
      architectures: ['x86_64'],
      // imageUri: 'helloworldfunction:python3.9-v1',
      events: {
        HelloWorld: {
          properties: {
            path: '/hello',
            method: 'get',
            variables: {
              variablesKey: 'variables',
            },
          },
          type: 'Api',
        },
      }
    })
    // backendFunction.addMetadata('Dockerfile', 'Dockerfile');
    // backendFunction.addMetadata('DockerContext', './hello_world');
    // backendFunction.addMetadata('DockerTag', 'python3.9-v1');

  }
}
