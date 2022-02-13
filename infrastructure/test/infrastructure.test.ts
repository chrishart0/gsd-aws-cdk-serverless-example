import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Infrastructure from '../lib/infrastructure-stack';

test('SQS Queue and SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Infrastructure.InfrastructureStack(app, 'DemoSite');
  // THEN

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::S3::Bucket', {
    VisibilityTimeout: 300
  });

  template.resourceCountIs('AWS::SNS::Topic', 1);
});
