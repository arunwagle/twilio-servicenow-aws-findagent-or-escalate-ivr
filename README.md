# Find Agent or Escalate IVR Demo - Using Twilio, ServiceNow & AWS

## Repository Contents

This includes the following folders required to run the demo
1. demo-ivr-aws-lambda-fns - This folder contains AWS Lambda Function to trigger Twilio Serverless Functions.This finction will be triggered when a Twilio Studio Flow End Event is sent to the AWS Kinesis. 
2. demo-ivr-servicenow-fns - This function is trigerred as a business rule in ServiceNow when a new incident is created. This function calls the Twilio Serverless Function. 
3. demo-ivr-twilio-fns - This folder contains functions required to integrate with Twilio Studio. 
  a. The execute.js function is the main function which is triggered when a new incidednt is created in ServiceNow or from AWS Lambda as a part of Twilio Flow End Event generated in AWS Kinesis 
  b. get_agent_list.js is a helper function that is called from execute to get the next available agent or the escalation point of contact. This can be changed ot integrate with the backend system of chioce. 
  c. update_incident.js - This function updates the ServiceNow incident once the agent has accepted the call, or an escalation agent accepted the call or no one accepted the call. 
  d. Other functions are not used currently.
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

### Setup Twilio 

```Step 1:``` Signup for a [Twilio account](https://www.twilio.com/try-twilio). <br/>
```Step 2:``` Provision a [Phone Number](https://www.twilio.com/console/phone-numbers/incoming).The Twilio phone number to initiate calls from during the Flow's Execution. Available as variable `{{flow.channel.address}}`.  <br/>
```Step 3:``` Deploy the Twilio Serverless functions. The functions are scoped public for demo purposes but in real world needs to be secured with proper auth. <br/>
  1. Deploy execute.js and note the URL. This url will be used in the ServiceNow deploymemnt below.
  2. Deploy get_agent_list.js
```Step 4:``` Create Studio Flow.  <br/>
  1. Click Studio > + to create a new flow.
  2. Provide a flow name - Find Agent or Escalate IVR
  3. Select "Import from JSON" template > Next > Copy the json from twilio-servicenow-aws-findagent-or-escalate-ivr/findagent-or-escalate-ivr.json
  4. Studio Flow is created.
    ![alt text](https://github.com/arunwagle/twilio-servicenow-aws-findagent-or-escalate-ivr/tree/main/assets/TwilioStudioFlow.png?raw=true)


### Setup ServiceNow developer instance

```Step 1:``` Signup for a ServiceNow [developer instance](https://developer.servicenow.com/dev.do). <br/>
```Step 2:``` Sign in with your ServiceNow ID.<br/>
```Step 3:``` Once signed-in, create a ServiceNow instance in any location of your choice. Note: This demo was tested on the SanDiego instance. <br/>
```Step 4:``` Click on Start Building. You will land on the ServiceNow developer instnace home screen. <br/>
```Step 5:``` Setup the demo. <br/>
  1. Create demo user - This user will be able to create the incident.
  2. Create business rules - This business rule will be triggered when a high priority incident is creatd in ServiceNow.
      a. Click All > System Definition > Business Rules
      b. Click on New
      c. Fill details as per the image below
      d. Click on Advanced tab. 
        - Open twilio-servicenow-aws-findagent-or-escalate-ivr/twilio_studio_new_incident.js
        - Modify TWILIO_FUNCTION_URL value to point to the Twilio Serverless function execute.js deployed as per the steps above.
        - Copy the contents of execute.js into the "Advanced Script" tab in ServiceNow.
        - Submit to create the business rule.

### Setup AWS Components

### Setup Twilio 

If you don't want to do local development, then please follow the [Blog Post](www.twilio.com/blog) above. If you're ambitious and want to do local development, then read on...

The function code in this repository uses Node.JS. Make sure you it installed [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). Twilio currently supports Node >= 10.12 (and we recommend the _even_ versions of Node).

Here are the steps to get your local environment ready to build and deploy the Twilio Functions in this repository:

```Step 1:``` Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) and [Twilio Serverless CLI Plugin](https://www.twilio.com/docs/labs/serverless-toolkit). You will want to read through these steps thorougly and make sure you understand how to use the CLI, including setting up Twilio Profile(s), before proceeding to next steps.<br/>
```Step 2:``` Download a ZIP file of this repository locally on your computer (Alternatively, you can Fork the repository and manage your own version through Github).<br/>
```Step 3:``` Extract the contents and move them to your desired working directory.<br/>
```Step 4:``` Open your favorite IDE (eg. Visual Studio Code) and open the working directory associated with this repository to get started.<br/>
```Step 5:``` Open a terminal in your IDE (or another terminal program of your choice) to get started.<br/>
```Step 6:``` From the root of your working directory, install the dependencies as follows (see the package.json file for details on what will be installed)<br/>

```
npm install
```

```Step 7:``` Initialize your Twilio Serverless Project with the following (requires the Serverless Toolkit from Step #1)<br/>

```
twilio serverless:init
```
Now you are all setup with a Twilio Serverless project that you can debug/deploy/iterate against!

# Deploying Locally from the Twilio CLI

<i>NOTE: You can reference my previous [Flex Plugins and Functions debugging/deploying](https://www.twilio.com/blog/flex-plugins-vs-code-functions-cli) blog post for guidance on the sections below</i><br/>

After running the "init" step above, you can simply run ```twilio serverless:deploy``` from the root directory to deploy your Twilio Functions to your Twilio Account. For subsequent deployments, use ```twilio serverless:deploy -override-existing-project```

# Debugging Locally with your Twilio Functions in VSCode

<i>NOTE: You'll need [NGROK](https://ngrok.com/) installed to run locally debugging successfully, whether you choose to run using a REST Client like Postman, or directly from a running Twilio process (eg. using an HTTP widget from Twilio Studio to point to your NGROK domain and local function)</i><br/>
    
If you want to debug your Twilio Functions locally, you have the option to setup your local debugging environment to attach to your functions for debugging (setup will vary based on IDE you use, but this instruction will be specifically for VSCode). In VSCode, you go to the debugger and create a launch.json file. The most basic setup is as follows, and should work for the default debugger settings:<br/>
```
{
    "version": "0.2.0",
    "configurations": [
          {
            "type": "node",
            "request": "attach",
            "name": "Attach",
            "port": 9229
          }
    ]
 }
```
There's a few steps you'll need to take to start debugging locally:<br/>

```Step 1:```From the root directory of your project (1 level up from your Functions folder), run the following command to start the debugger (make sure no existing NGROK processing are running)

```
twilio serverless:start --ngrok=cfeehan --inspect="" 
```

This will start a debugger process running on the default port 9229, which matches the launch.json file above.

```Step 2:``` In VSCode, go to your Debugger and press the play button to attach to the existing debugger. This will then prep your functions to be hit when setting breakpoints (so go set your breakpoints now!)

```Step 3 (optional):``` This step you can either choose to use Postman if you want to run one-off, ad-hoc queries that hit your Twilio Functions on your NGROK domain, or you can point Twilio Studio to your functions using the [Make HTTP Request](https://www.twilio.com/docs/studio/widget-library/http-request) widget and point to one of your functions (eg. https://[YOUR DOMAIN].ngrok.io/accept_incident), passing in any appropriate parameters as desired.

# DISCLAIMER

Notice: This code and the information contained herein is not meant to be used in a production deployment. Rather, this code is intended to serve as a means to springboard your Twilio + ServiceNow development, such that you have a model/framework/samples to start from when considering your own custom development of a ServiceNow + Twilio integration. Twilio and its employees do not provide any SLA for this code - it is meant to be used "as-is" to help customers with a reference point for their own use cases and development. Twilio recommends that you consult with your legal counsel to make sure that you are complying with all applicable laws in connection with communications you transmit and receive using Twilio. Ultimately, you are responsible for ensuring that your use of Twilio complies with all applicable laws and regulations. Please also refer to our [**Terms of Service**](https://www.twilio.com/legal/tos>) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information.
