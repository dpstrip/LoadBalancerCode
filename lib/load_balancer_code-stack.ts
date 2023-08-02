import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class LoadBalancerCodeStack extends cdk.Stack {

  private readonly vpcId = 'vpc-0e6be85a4258eb935';

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "VPC", {vpcId: this.vpcId});
    
  }
}
