import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Infrastructure from '../lib/infrastructure-stack';

test('S3 Static Site Bucket Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Infrastructure.InfrastructureStack(app, 'DemoSite');
  // THEN

  const template = Template.fromStack(stack);

  // Assert it creates the function with the correct properties...
  // template.hasResourceProperties("AWS::Lambda::Function", {
  //   Handler: "handler",
  //   Runtime: "nodejs14.x",
  // });

  // template.hasResourceProperties('AWS::S3::Bucket', {
  //   DeletionPolicy: 'Delete'
  // });

  template.resourceCountIs('AWS::S3::Bucket', 1);

  // template.hasResourceProperties('AWS::CloudFront::Distribution', {
  //   DefaultRootObject: "index.html",
  // });
});
