#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';

let siteDomain:string = process.env.THREE_M_DOMAIN!
siteDomain = siteDomain.replace(/\./g,'-')

const app = new cdk.App();
new InfrastructureStack(app, 'serverless-thee-tier-'+siteDomain);
