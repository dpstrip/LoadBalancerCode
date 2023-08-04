import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { addListener } from 'process';


export class LoadBalancerCodeStack extends cdk.Stack {

  private readonly vpcId = 'vpc-0e6be85a4258eb935';
  public readonly ALBSecurityGroup: ec2.SecurityGroup;
  public localVpc: ec2.IVpc;
  public LoadBalancer: elb.ApplicationLoadBalancer;
  public listener: elb.ApplicationListener;



  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //lookup vpc object
    this.localVpc = ec2.Vpc.fromLookup(this, "VPC1", {vpcId: this.vpcId});
    
    //validation that I have it
    new cdk.CfnOutput(this, 'VPC', {value: this.localVpc.vpcArn});
/*
    //create SG for ALB
    this.ALBSecurityGroup = this.CreateALBSecurityGroup();
    //create alb
    this.LoadBalancer = this.addLoadBalancer();
    //create listener rule
    this.listener = this.createListener();
    this.addTargets(this.listener, "targets")

  }

  //this adds the targets to the LB.  The target/arg1 needs to be an object not a string.
  addTargets(listener: elb.ApplicationListener, arg1: string) {
    listener.addTargets('AppTargets', {
      port: 80,
     // targets:

      healthCheck:{
        path: '/',
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
      },
    })
  }
  
  
  createListener(): elb.ApplicationListener{
    return this.LoadBalancer.addListener('Listener',{
      port: 80,
      open: true
    })
  }


  addLoadBalancer(): cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer {
    const alb = new elb.ApplicationLoadBalancer(this, 'alb', {
      vpc: this.localVpc,
      internetFacing: true
    });

    return alb;
    
  }

 
  
  
  //Create ALB secuirty group
  private CreateALBSecurityGroup(): cdk.aws_ec2.SecurityGroup {
    var securityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: this.localVpc,
      allowAllOutbound: false
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    //securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443);
    this.localVpc.privateSubnets.forEach(element => {
      securityGroup.addEgressRule(ec2.Peer.ipv4(element.ipv4CidrBlock),  ec2.Port.tcp(80))
    });
    //securityGroup.addEgressRule(ec2.Peer.anyIpv4(), new ec2.Port.tcp(443));
    return securityGroup;
    */
  }
}
