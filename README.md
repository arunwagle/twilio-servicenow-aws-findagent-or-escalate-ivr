# Table of Contents
- [Find Agent or Escalate IVR Demo - Using Twilio, ServiceNow & AWS](#find-agent-or-escalate-ivr-demo---using-twilio--servicenow---aws)
  * [Use Case](#use-case)
  * [High Level Architecture](#high-level-architecture)
  * [Find Agent Or Escalate Flow](#find-agent-or-escalate-flow)
  * [Repository Contents](#repository-contents)
  * [Setup - Follow these steps for deploying the demo](#setup---follow-these-steps-for-deploying-the-demo)
    + [Get the code from github](#get-the-code-from-github)
    + [Setup AWS Components](#setup-aws-components)
    + [Setup Twilio](#setup-twilio)
    + [Setup ServiceNow developer instance](#setup-servicenow-developer-instance)

# Find Agent or Escalate IVR Demo - Using Twilio, ServiceNow & AWS
More and more companies are on a journey to manage their digital and IT operations efficiently. Some of the key metrics on which the companies measure the success of their programs are **Mean Time to Acknowledge (MTTA)**, **Mean Time to Resolution (MTTR)**, **Average Incident Response Time**, **Escalation Rate and Cost per incident**. One common goal in all the key metrics defined here is how we can act/resolve the incidents and this problem can be easily solved by building an extensible customer engagement platform leveraging various channels like voice, messaging, email, videos etc. 
**ServiceNow** has been a de facto standard for building digital workflows for IT operations and **Twilio** is that next generation fully programmable customer engagement platform. Leveraging **Twilio Event Streams** and **AWS Kinesis** we can build a fully event driven incident management platform to meet the demands of the customer.
In this post, I plan to showcase an example of how we can build a fully programmable IVR for managing incidents as they are created in ServiceNow. 

## Use Case 
When a new incident is recorded in ServiceNow, an automated IVR workflow will be triggered based on the high priority incident business rules created in ServiceNow. The IVR flow will try to find and call an agent who can accept the incident, reject it so that the next available agent can be called and so on. The agent has the ability to escalate it to the appropriate resources until either someone acknowledges the incident by accepting the call or exits the flow. At the end of the flow, the incident ticket is updated with the appropriate comments. 

The application is targeted to improve the incident management workflows for internal IT operations employees and the line of businesses within the company. 

## High Level Architecture
![High Level Architecture](/assets/Agent-Escalation.png?raw=true)

## Find Agent Or Escalate Flow
![Find Agent Or Escalate Flow](/assets/Agent-Escalation-Sequence.png?raw=true)

## Repository Contents

This includes the following folders required to run the demo
1. demo-ivr-aws-lambda-fns - This folder contains AWS Lambda Function to trigger Twilio Serverless Functions.This finction will be triggered when a Twilio Studio Flow End Event is sent to the AWS Kinesis. 
2. demo-ivr-servicenow-fns - This function is trigerred as a business rule in ServiceNow when a new incident is created. This function calls the Twilio Serverless Function. 
3. demo-ivr-twilio-fns - This folder contains functions required to integrate with Twilio Studio. 
  a. The execute.js function is the main function which is triggered when a new incidednt is created in ServiceNow or from AWS Lambda as a part of Twilio Flow End Event generated in AWS Kinesis 
  b. update_incident.js - This function updates the ServiceNow incident once the agent has accepted the call, or an escalation agent accepted the call or no one accepted the call. 
  c. Other functions are not used currently.
4. demo-twilio-aws-kinesis - This folder contains files required to configure AWS Kinesis with Twilio Event Streams
5. demo-twilio-studio-flows - Twilio Studio Flow has logic to find an agent, escalate and eventually update the ServiceNow incident with status.
6. assets - This folder has the agent list data. This has to be changed as per your data. 


## Setup - Follow these steps for deploying the demo 

### Get the code from github

Clone the repository
```
  git clone https://github.com/arunwagle/twilio-servicenow-aws-findagent-or-escalate-ivr.git

  cd twilio-servicenow-aws-findagent-or-escalate-ivr

```
### Setup AWS Components

```Step 1:``` **Signup** for a [AWS account](https://aws.amazon.com/). <br/><br/>

```Step 2:``` **Setup** [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) locally.<br/><br/>

```Step 3:``` **Create IAM Policies** <br/><br/>
  1.  Create **User**
      - Go to AWS Console > IAM > Users > Create User        
      - Select "Security Credentials" tab and create an access key and secret. Note this down as it will required for local aws configuration.
  2.  Create **group** - This group will have access to create and manage Kinesis and Lambda
      - Go to AWS Console > IAM > User Groups > Create Group
        - Provide name = TwilioGroup
        - Add the above created user to this group
        - Add following permisisons to the group
          - IAMFullAccess
          - AmazonKinesisFullAccess
          - AWSLambda_FullAccess
  3.  **Setup Credentials** [AWS Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-methods) locally. <br/><br/>
  
  4. Create Lambda execution **role**
      - Go to AWS Console > IAM > Roles > Create Role
        - Provide name = TwilioLambdaRole
        - Select AWS Service > radio button Use Case "Lambda" 
        - Add AWSLambdaKinesisExecutionRole   
        - Create Role
  <br/><br/>      

```Step 4:``` **Deploy AWS Lambda Function** 
  1.  Create Deployment
      - zip -r demo-ivr-aws-lambda-fns.zip .
      - Create function. Copy the ARN of TwilioLambdaRole created in above step
      aws lambda create-function \
      --function-name "findagent-or-escalate-ivr-fn" \
      --runtime "nodejs16.x" \
      --role "arn:aws:iam::776262733296:role/TwilioLambdaRole" \
      --zip-file fileb://demo-ivr-aws-lambda-fns.zip \
      --handler "index.handler" \
      --environment "Variables={TWILIO_SID=AC8db354e50808dd1a53f83a3822abcf52,TWILIO_AUTH_TOKEN=21752e74ae91a835845a1d1b7202b234,TWILIO_FUNCTION_URL=https://findagent-or-escalate-ivr-service-5180.twil.io/execute}"

  2. 


<br/><br/>

### Setup Twilio 

```Step 1:``` **Signup** for a [Twilio account](https://www.twilio.com/try-twilio). <br/><br/>

```Step 2:``` **Provision** a [Phone Number](https://www.twilio.com/console/phone-numbers/incoming).The Twilio phone number to initiate calls from during the Flow's Execution. Available as variable `{{flow.channel.address}}`.  <br/><br/>

```Step 3:``` Deploy the **Twilio Serverless functions**. The functions are scoped public for demo purposes but in real world needs to be secured with proper auth. <br/>
  1.  Click Functions and Assets > Services > Create Service.
  2.  Provide a service name - findagent-or-escalate-ivr-service
  3.  Click Add > Add Asset
      - Provide name - agent_list.json. Change scope to **public**
      - Copy the contents of twilio-servicenow-aws-findagent-or-escalate-ivr/assets/agent_list.json to the editor.
      - Modify the phone numbers to use for agent and escalation list to match the test phone numbers to be used for the demo.
      - Save.
  3.  Click Add > Add Function
      - Provide function name - /execute. Change function scope to **public**
      - Copy the contents of twilio-servicenow-aws-findagent-or-escalate-ivr/demo-ivr-twilio-fns/execute.js to the editor.
      - Modify AGENT_LIST_URL in execute.js to to point to the url of the asset deployed above. 
      - Save.
  4.  Click Add > Add Function
      - Provide function name - /update_incident. Change function scope to **public**
      - Copy the contents of twilio-servicenow-aws-findagent-or-escalate-ivr/demo-ivr-twilio-fns/update_incident.js to the editor.
      - Modify AGENT_LIST_URL in execute.js to to point to the url of the asset deployed above. 
      - Save.
  5.  Click Settings > Dependencies
      - Add axios dependencies
  6.  Click Settings > Environment variables    
      - SN_API_TABLE_ROOT - Your ServiceNow developer instance "Table" url https://dev86397.service-now.com/api/now/table/    
      - SN_USER - ServiceNow username(twilio_demo_user)
      - SN_PASSWORD - Password of the above user.
      - FROM - Phone number provisioned in Step2 above
      - FLOW_SID - Flow Sid. This is available from the Studio > Flows 
  7.  Deploy All <br/><br/>

```Step 4:``` Create **Studio Flow**.  <br/>
  1.  Click Studio > + to create a new flow.
  2.  Provide a flow name - Find Agent or Escalate IVR
  3.  Select "Import from JSON" template > Next > Copy the json from twilio-servicenow-aws-findagent-or-escalate-ivr/demo-twilio-studio-flows/findagent-or-escalate-ivr.json
  4.  Studio Flow is created. <br/><br/>
    ![Flow Diagram](/assets/TwilioStudioFlow.png?raw=true)

```Step 5:``` Setup **Twilio Event Streams**.  <br/>  
  1.  All the code required for setting up is available at twilio-servicenow-aws-findagent-or-escalate-ivr/demo-twilio-aws-kinesis/*
  2.  Make sure the AWS credentials and AWS CLI are setup correctly as mentioned in steps above.
  3.  Make sure the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and [create profile](https://www.twilio.com/docs/twilio-cli/general-usage) is setup and created sucessfully.
  4.  Follow the steps in [Setup Twilio Streams](https://www.twilio.com/docs/events/eventstreams-quickstart) or run below steps.
      ```
        <!-- use active Twilio account to create the stream -->
        twilio profiles:use Twilio-AW-Profile
        <!-- 
        Create the AWS Kinesis Stream
        stream name = twilio-events
        twilio-sink.json = File where the stream creation output is written
        Note: After this step you can validate in AWS Console to see if the twilio-events is created under Kinesis > DataStreams
         -->
        ./create_kinesis_stream.sh twilio-events 1 | jq . > twilio-sink.json 

        <!-- 
        Create the sink
        arn = Get the arn value from twilio-sink.json
        role_arn = Get the role_arn value from twilio-sink.json
        external_id = Get the external_id value from twilio-sink.json
         -->
        twilio api:events:v1:sinks:create --description "For FindAgent Or Escalate IVR POC with Twilio Studio" \
          --sink-configuration '{"arn":"arn:aws:kinesis:us-east-1:XXXXXXX:stream/twilio-events","role_arn":"arn:aws:iam::XXXXXXXXX:role/twilio-events-kinesis-write","external_id":"XXXXXXXXXXXXXXXXXXXXXX"}' \
          --sink-type kinesis

        <!-- 
        Validate the sink. This step is required before you can start using the sink. 
        Sid = Sid of the sink from above . You can also get the Sid from the Twilio Console > Event Streams > Manage > Select Sink > Properties
         -->
        twilio api:events:v1:sinks:test:create --sid ${sid from above}

        <!-- 
        Test the sink
        Run twilio-servicenow-aws-findagent-or-escalate-ivr/cat_kinesis.sh
        Note: You can test the sink from the console as well.
         -->
        ./cat_kinesis.sh twilio-events
      ```
  

### Setup ServiceNow developer instance

```Step 1:``` Signup for a ServiceNow [developer instance](https://developer.servicenow.com/dev.do). <br/><br/>

```Step 2:``` Sign in with your ServiceNow ID.<br/><br/>

```Step 3:``` Once signed-in, create a ServiceNow instance in any location of your choice. Note: This demo was tested on the SanDiego instance. <br/><br/>

```Step 4:``` Click on Start Building. You will land on the ServiceNow developer instance home screen. <br/><br/>

```Step 5:``` Setup the demo. <br/>
  1.  Create demo user - This user will be able to create the incident.    
      - Click All > System Security > Users and Groups > Users 
      - Click on New 
      - Fill details as per the image below. The used should have access to call the ServiceNow APIs'. 
      - Set the password. 
      - Copy the username(twilio_demo_user) and password. This will be required while setting up Twilio Serverless Functions.  
  2.  Create business rules - This business rule will be triggered when a high priority incident is creatd in ServiceNow.    
      - Click All > System Definition > Business Rules 
      - Click on New . 
      - Fill details as per the image below  
      - Click on Advanced tab.  
        - Open twilio-servicenow-aws-findagent-or-escalate-ivr/twilio_studio_new_incident.js  
        - Modify TWILIO_FUNCTION_URL value to point to the Twilio Serverless function execute.js deployed as per the steps above. 
        - Copy the contents of execute.js into the "Advanced Script" tab in ServiceNow. 
        - Submit to create the business rule. 


# DISCLAIMER

Notice: This code and the information contained herein is not meant to be used in a production deployment. Rather, this code is intended to serve as a means to springboard your Twilio + ServiceNow development, such that you have a model/framework/samples to start from when considering your own custom development of a ServiceNow + Twilio integration. Twilio and its employees do not provide any SLA for this code - it is meant to be used "as-is" to help customers with a reference point for their own use cases and development. Twilio recommends that you consult with your legal counsel to make sure that you are complying with all applicable laws in connection with communications you transmit and receive using Twilio. Ultimately, you are responsible for ensuring that your use of Twilio complies with all applicable laws and regulations. Please also refer to our [**Terms of Service**](https://www.twilio.com/legal/tos) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information.
