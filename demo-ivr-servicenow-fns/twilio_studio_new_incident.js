(function executeRule(current, previous /*null when async*/) {
  //sys_id record for whatever object (eg. specific Incident record) is triggered by this Business Rule
  var id = current.getValue('sys_id');
  var assignedTo = current.getValue('assigned_to');

  gs.info('assigned to: ' + assignedTo);
  gs.info('My sys_id is: ' + id);


  //Spin up a REST Message using ServiceNow's Native WebServices API and point to your Twilio Studio Flow REST API Execution URL
  var request = new sn_ws.RESTMessageV2();
  request.setEndpoint(
    'https://adobe-ivr-service-8284.twil.io/execute'
  );
  request.setHttpMethod('POST');

  //Your Twilio Account SID and Auth Token to Authenticate this request
  // var user = 'AC8db354e50808dd1a53f83a3822abcf52';
  // var password = '453192fa355e1645483d3a28e1cf2fab';

  // request.setBasicAuth(user, password);

  //Request Headers for the most basic type of request for POC. Note that Twilio cannot accept a JSON blob, so Content-Type must be what is defined here
  request.setRequestHeader('Accept', '*/*');
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //You can modify the Body here to pass any parameters you need to pass from ServiceNow to Twilio
  request.setRequestBody(  
    'short_description=' +
      current.short_description +
      '&ticket_no=' +
      current.number +
      '&sys_id=' +
      id 
  );

  var response = request.execute();

  //Optionally update the Work Notes on the original object (eg. Incident). This is just an example of updating the ServiceNow object record. Use ServiceNow's REST API explorer to further investigate how you might update the record from Twilio during or after Studio Flow execution
  current.work_notes = response.getBody();
  current.update();
  //gs.log(response.getBody());
})(current, previous);
