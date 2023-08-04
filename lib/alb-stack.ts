/*
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as cdk from 'aws-cdk-lib/core';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { AutoScalingAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as avpc from './vpc-stack';



export class AlbStack extends cdk.Stack {

  private vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new avpc.VpcFindA(this, 'vpc-0c7031dc1166c9526').vpc;


    new cdk.CfnOutput(this, 'vpc', {
      value: this.vpc.vpcArn,
    });  
*/
/*  Setting up the alb  ***/
/* switc this to a nlb
    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc: this.vpc,
      internetFacing: true,
    });

    const nlb = new elbv2.NetworkLoadBalancer(this, 'nlb', {
      vpc: this.vpc,
      internetFacing: true,
    });

    const listener = nlb.addListener('Listener', {
      port: 80,
      //open: true,
    });

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'sudo su',
      'yum install -y httpd',
      'systemctl start httpd',
      'systemctl enable httpd',
      'echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html',
    );

    const asg = new autoscaling.AutoScalingGroup(this, 'asg', {
      vpc: this.vpc,
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
    });

    listener.addTargets('default-targer', {
      port: 80,
      targets: [asg],
      healthCheck: {
        path: '/',
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
      },
    });

    /*listener.addAction('/static', {
      priority: 5,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/static'])],
      action: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/html',
        messageBody: '<h1>Static ALB Response</h1>',
      }),
    });

    asg.scaleOnRequestCount('request-per-minute', {
      targetRequestsPerMinute: 60,
    });

    asg.scaleOnCpuUtilization('cpu-util-scaling', {
      targetUtilizationPercent: 75,
    });

    new cdk.CfnOutput(this, 'albDNS', {
      value: nlb.loadBalancerDnsName,
    });  
    */
  }
}
