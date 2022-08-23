exports.handler = function (context, event, callback) {
  const axios = require('axios');  
  console.log(event.From);

  const agent_name = event.agent_name;
  const case_status = event.case_status || '';

  let sn_url = context.SN_API_TABLE_ROOT + 'incident/' + event.sys_id;
  console.log ("sn_url:", sn_url);
  let notes = '';
  if (case_status == "1" || case_status == "2" || case_status == "3"){
    notes = "The case was accepted by " + agent_name;
  }  
  else{
    notes = "No agent was available to accept the call at the moment ";
  }
  
    const token = `${context.SN_USER}:${context.SN_PASSWORD}`;
    const encodedToken = Buffer.from(token).toString('base64');
    
    // headers: { 'Authorization': 'Basic '+ encodedToken }
    var config = {      
      headers: { 'Authorization': 'Basic '+ encodedToken }
    };
  // var config = {
  //   auth: {
  //     username: context.SN_USER,
  //     password: context.SN_PASSWORD,
  //   }
  // };
  
  const incident_state = '2'  //In Progress
  let post_param = {      
      'comments': notes
  };
  axios
    .put(sn_url, post_param, config)
    .then(res => {
      console.log(`response: ${res}`);  
      callback(null, res);          
    })
    .catch(error => {
        console.error(error);
        callback(null, error);
    });

};
