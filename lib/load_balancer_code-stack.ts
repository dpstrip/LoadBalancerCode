import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { addListener } from 'process';
import { AutoScalingAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as asg from './EC2_ASG_Stack'; 



export class LoadBalancerCodeStack extends cdk.Stack {

  private readonly vpcId = 'vpc-0e6be85a4258eb935';

  public localVpc: ec2.IVpc;
  public LoadBalancer: elb.ApplicationLoadBalancer;
  public asg: autoscaling.AutoScalingGroup;
 



  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //lookup vpc object
    this.localVpc = ec2.Vpc.fromLookup(this, "VPC1", {vpcId: this.vpcId});
    
    //validation that I have it
    new cdk.CfnOutput(this, 'VPC', {value: this.localVpc.vpcArn});

    //Create 2 EC2 servers, give them a website, and put them in a Auto scaling group 
    const ec2ASG = new asg.EC2ASG_Stack(this,this.localVpc);
    this.asg = ec2ASG.asg;


//I need to create a NLB
const nlb = new elb.NetworkLoadBalancer(this, 'nlb', {
  vpc: this.localVpc,
  vpcSubnets:{subnetType: ec2.SubnetType.PUBLIC},
  loadBalancerName: 'NLB',
  internetFacing: true,
});
    
    //this creates the listener
    const listener = nlb.addListener('Listener',{
      port: 80,

    })
    //This creates the target for the listener
    listener.addTargets('default-targer', {
      port: 80,
      protocol:elb.Protocol.TCP_UDP,
      targets: [this.asg]
    });

  }
}