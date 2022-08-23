# Find Agent or Escalate IVR Demo - Using Twilio, ServiceNow & AWS

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
```Step 2:``` **Setup** [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) locally. <br/
```Step 3:``` **Setup Credentials** [AWS Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-methods) locally. 
<br/><br/>

### Setup Twilio 

```Step 1:``` **Signup** for a [Twilio account](https://www.twilio.com/try-twilio). <br/><br/>

```Step 2:``` **Provision** a [Phone Number](https://www.twilio.com/console/phone-numbers/incoming).The Twilio phone number to initiate calls from during the Flow's Execution. Available as variable `{{flow.channel.address}}`.  <br/><br/>

```Step 3:``` Deploy the **Twilio Serverless functions**. The functions are scoped public for demo purposes but in real world needs to be secured with proper auth. <br/>
  1. Click Functions and Assets > Services > Create Service.
  2. Provide a service name - findagent-or-escalate-ivr-service
  3. Click Add > Add Asset
    a. Provide name - agent_list.json. Change scope to **public**
    b. Copy the contents of twilio-servicenow-aws-findagent-or-escalate-ivr/assets/agent_list.json to the editor.
    c. Modify the phone numbers to use for agent and escalation list to match the test phone numbers to be used for the demo.
    d. Save.
  3. Click Add > Add Function
    a. Provide function name - /execute. Change function scope to **public**
    b. Copy the contents of twilio-servicenow-aws-findagent-or-escalate-ivr/demo-ivr-twilio-fns/execute.js to the editor.
    c. Modify AGENT_LIST_URL in execute.js to to point to the url of the asset deployed above. 
    d. Save.
  4. Click Add > Add Function
    a. Provide function name - /update_incident. Change function scope to **public**
    b. Copy the contents of twilio-servicenow-aws-findagent-or-escalate-ivr/demo-ivr-twilio-fns/update_incident.js to the editor.
    c. Modify AGENT_LIST_URL in execute.js to to point to the url of the asset deployed above. 
    d. Save.
  5. Click Settings > Dependencies
    a. Add axios dependencies
  6. Click Settings > Environment variables    
    a. SN_API_TABLE_ROOT - Your ServiceNow developer instance "Table" url https://dev86397.service-now.com/api/now/table/    
    b. SN_USER - ServiceNow username(twilio_demo_user)
    c. SN_PASSWORD - Password of the above user.
    d. FROM - Phone number provisioned in Step2 above
    e. FLOW_SID - Flow Sid. This is available from the Studio > Flows 
  7. Deploy All <br/><br/>

```Step 4:``` Create **Studio Flow**.  <br/>
  1. Click Studio > + to create a new flow.
  2. Provide a flow name - Find Agent or Escalate IVR
  3. Select "Import from JSON" template > Next > Copy the json from twilio-servicenow-aws-findagent-or-escalate-ivr/demo-twilio-studio-flows/findagent-or-escalate-ivr.json
  4. Studio Flow is created. <br/><br/>
    ![Flow Diagram](/assets/TwilioStudioFlow.png?raw=true)

```Step 5:``` Setup **Twilio Event Streams**.  <br/>  
  1. All the code required for setting up is available at twilio-servicenow-aws-findagent-or-escalate-ivr/demo-twilio-aws-kinesis/*
  2. Make sure the AWS credentials and AWS CLI are setup correctly as mentioned in steps above.
  3. Make sure the [Twilio CLI]((https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and [create profile](https://www.twilio.com/docs/twilio-cli/general-usage) is setup and created sucessfully.
  4. [Setup Twilio Streams](https://www.twilio.com/docs/events/eventstreams-quickstart)
  

### Setup ServiceNow developer instance

```Step 1:``` Signup for a ServiceNow [developer instance](https://developer.servicenow.com/dev.do). <br/><br/>

```Step 2:``` Sign in with your ServiceNow ID.<br/><br/>

```Step 3:``` Once signed-in, create a ServiceNow instance in any location of your choice. Note: This demo was tested on the SanDiego instance. <br/><br/>

```Step 4:``` Click on Start Building. You will land on the ServiceNow developer instance home screen. <br/><br/>

```Step 5:``` Setup the demo. <br/>
  1. Create demo user - This user will be able to create the incident.
    a. Click All > System Security > Users and Groups > Users
    b. Click on New
    c. Fill details as per the image below. The used should have access to call the ServiceNow APIs'. 
    d. Set the password. 
    e. Copy the username(twilio_demo_user) and password. This will be required while setting up Twilio Serverless Functions.  
  2. Create business rules - This business rule will be triggered when a high priority incident is creatd in ServiceNow.
    a. Click All > System Definition > Business Rules
    b. Click on New
    c. Fill details as per the image below
    d. Click on Advanced tab. 
      Open twilio-servicenow-aws-findagent-or-escalate-ivr/twilio_studio_new_incident.js
      Modify TWILIO_FUNCTION_URL value to point to the Twilio Serverless function execute.js deployed as per the steps above.
      Copy the contents of execute.js into the "Advanced Script" tab in ServiceNow.
      Submit to create the business rule.


# DISCLAIMER

Notice: This code and the information contained herein is not meant to be used in a production deployment. Rather, this code is intended to serve as a means to springboard your Twilio + ServiceNow development, such that you have a model/framework/samples to start from when considering your own custom development of a ServiceNow + Twilio integration. Twilio and its employees do not provide any SLA for this code - it is meant to be used "as-is" to help customers with a reference point for their own use cases and development. Twilio recommends that you consult with your legal counsel to make sure that you are complying with all applicable laws in connection with communications you transmit and receive using Twilio. Ultimately, you are responsible for ensuring that your use of Twilio complies with all applicable laws and regulations. Please also refer to our [**Terms of Service**](https://www.twilio.com/legal/tos>) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information.
