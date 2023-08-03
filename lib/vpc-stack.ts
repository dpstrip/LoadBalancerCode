import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';



export class VpcFindA extends cdk.Stack {

     public vpc: ec2.IVpc;

    public constructor(scope: Construct,vid: string) {        
        super();

        new cdk.CfnOutput(this, 'vpc', {
            value: vid
        }); 

        this.vpc = ec2.Vpc.fromLookup(scope, 'vid', {
            vpcId: vid
        });
    }
}

