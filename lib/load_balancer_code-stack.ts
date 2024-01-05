import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbtargets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { addListener } from 'process';
import * as S3Assets from 'aws-cdk-lib/aws-s3-assets';
import * as iam from 'aws-cdk-lib/aws-iam';


export class LoadBalancerCodeStack extends cdk.Stack {

  private readonly vpcId = 'vpc-0e7a7fc9ede3b6bbb';
  public readonly ALBSecurityGroup: ec2.SecurityGroup;
  public localVpc: ec2.IVpc;
  public LoadBalancer: elb.ApplicationLoadBalancer;
  public listener: elb.ApplicationListener;
  public anEC2: ec2.Instance;



  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //lookup vpc object
    this.localVpc = ec2.Vpc.fromLookup(this, "VPC", {vpcId: this.vpcId});
    
    //validation that I have it
    // new cdk.CfnOutput(this, 'VPC', {value: this.localVpc.vpcArn});

    //create SG for ALB
    this.ALBSecurityGroup = this.CreateALBSecurityGroup();

    this.anEC2 = this.createEC2s();
    //create alb
    this.LoadBalancer = this.addLoadBalancer();
    //create listener rule
    this.listener = this.createListener();
    this.addTargets(this.listener, "targets")

  }

  //create a ec2 server to put in target
  createEC2s(): ec2.Instance {
      const sg = new ec2.SecurityGroup(this, 'SG', {
        vpc: this.localVpc,
        allowAllOutbound: true
      });
      sg.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(22),'SSH');
      sg.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80),'HTTP');
      sg.addIngressRule(ec2.Peer.ipv4('10.0.0.0/16'),ec2.Port.tcp(80),'HTTP');
      sg.addIngressRule(ec2.Peer.ipv4('10.0.0.0/16'),ec2.Port.tcp(22),'SSH');
      sg.addIngressRule(ec2.Peer.ipv4('3.80.16.0/29'),ec2.Port.tcp(22),'SSH');
      sg.addIngressRule(ec2.Peer.ipv4('199.169.204.178/16'),ec2.Port.tcp(22),'SSH');
      sg.addIngressRule(ec2.Peer.ipv4('199.169.204.178/16'),ec2.Port.tcp(80),'HTTP');
      sg.addIngressRule(ec2.Peer.ipv4('10.0.0.0/16'),ec2.Port.tcp(3080),'http');
      sg.addIngressRule(ec2.Peer.ipv4('199.169.204.178/16'),ec2.Port.tcp(3080), 'http');

      const asset = new S3Assets.Asset(this, 'S3Asset', {
        path: 'assets/index.js'
      });

      const userData = ec2.UserData.forLinux();
      userData.addS3DownloadCommand({
      region:'us-east-1',
      bucket: asset.bucket,
      bucketKey: asset.s3ObjectKey,
      localFile:'/tmp/index.js'
    });

    userData.addCommands(
      'sudo node /tmp/index.js'
    );

    const webserverRole = new iam.Role(this, 'webserver-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
                        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
                        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });


      return new ec2.Instance(this, 'MyInstance', 
      {
        vpc: this.localVpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        instanceType: new ec2.InstanceType('t2.micro'),
        machineImage: new ec2.AmazonLinuxImage(),
        securityGroup: sg,
        userData,
        role: webserverRole,
        allowAllOutbound:true,
        keyName:'dps-ec2-1'
      });
  }

  createTargetGroup():elb.ApplicationTargetGroup{
    return new elb.ApplicationTargetGroup(this, 'myTargetGroup',{
      vpc: this.localVpc,
      port:80,
      targets:[new elbtargets.InstanceIdTarget(this.anEC2.instanceId)]
    });

  }
  //this adds the targets to the LB.  The target/arg1 needs to be an object not a string.
  addTargets(listener: elb.ApplicationListener, arg1: string) {

    let myTargets = this.createTargetGroup();
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
    listener.addAction('DefaultAction', {
      action: elb.ListenerAction.forward([myTargets])
    });
  }

  
  
  createListener(): elb.ApplicationListener{
    return this.LoadBalancer.addListener('Listener',{
      port: 80,
      open: true
    })
  }

 

  addLoadBalancer(): elb.ApplicationLoadBalancer {
    const alb = new elb.ApplicationLoadBalancer(this, 'alb', {
      vpc: this.localVpc,
      internetFacing: true
    });

    return alb;
    
  }

 
  
  
  //Create ALB secuirty group
  private CreateALBSecurityGroup(): ec2.SecurityGroup {
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
  }
}
