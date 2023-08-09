import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { addListener } from 'process';
import { AutoScalingAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';

export class EC2ASG_Stack extends cdk.Stack {

    public asg: autoscaling.AutoScalingGroup;

    public constructor(scope: Construct, localVpc: ec2.IVpc) {
        super();
    //** create autoscalling group of ec2 boxes that have a sinple website on it */
     //this is def of website
       const userData = ec2.UserData.forLinux();
        userData.addCommands(
             '#!/bin/bash',
             'sudo su',
             'yum install -y httpd',
             'systemctl start httpd',
             'systemctl enable httpd',
             'echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html',
         );

//Assing role to SSH into box
const role = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::929556976395:role/MyVpcStack-publicserverrole8FFFECE1-1DGGBRY2CWWSR', {mutable: false});

//Create a SG for the EC2 instances to take inboud http requests
const ec2InstanceSG = new ec2.SecurityGroup(this, 'ec2-LB-SG',{
  vpc: localVpc
});

ec2InstanceSG.addIngressRule(
  ec2.Peer.ipv4('3.0.0.0/8'),
  ec2.Port.tcp(80),
  'Allow http traffic from Sparx'
);



//this is the asg
this.asg = new autoscaling.AutoScalingGroup(this, 'asg', {
  vpc: localVpc,
  instanceType: ec2.InstanceType.of(
    ec2.InstanceClass.BURSTABLE2,
    ec2.InstanceSize.MICRO,
  ),
  machineImage: new ec2.AmazonLinuxImage({
    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
  }),
  userData: userData,
  minCapacity: 2,
  maxCapacity: 3,
  vpcSubnets:{subnetType: ec2.SubnetType.PUBLIC},
  role: role,
  securityGroup: ec2InstanceSG
});
    }

}

