import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { addListener } from 'process';
import { AutoScalingAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';


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
// I need to find the subnets to I want the NLB and ec2 to load balance on.
   // const subnetsPublic = this.localVpc.selectSubnets({subnetType: SubnetType.Public}).subnets;

//I need to create a NLB
const nlb = new elb.NetworkLoadBalancer(this, 'nlb', {
  vpc: this.localVpc,
  vpcSubnets:{subnetType: ec2.SubnetType.PUBLIC},
  loadBalancerName: 'NLB',
  internetFacing: true,
});


//** create autoscalling group of ec2 boxes that have a sinple website on it */
  //this is def of website
const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'sudo su',
      'yum install -y httpd',
      'systemctl start httpd',
      'systemctl enable httpd',
      'echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html',
    );
    //this is the asg
    const asg = new autoscaling.AutoScalingGroup(this, 'asg', {
      vpc: this.localVpc,
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
    });

    //this creates the listener
    const listener = nlb.addListener('Listener',{
      port: 80,

    })
    //This creates the target for the listener
    listener.addTargets('default-targer', {
      port: 80,
      protocol:elb.Protocol.TCP_UDP,
      targets: [asg]
    });

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
