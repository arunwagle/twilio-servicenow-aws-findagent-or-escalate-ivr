console.log('Loading adobe-ivr-twilio-studio-fn');

exports.handler = function(event, context) {
    const axios = require("axios");
    
    event.Records.forEach(function(record) {
        
        // Kinesis data is base64 encoded so decode here
        var payload = Buffer.from(record.kinesis.data, 'base64');
        var jsonParsed = JSON.parse(payload);
        
        var flow_id = jsonParsed.data.flow_sid;
        var flow_execution_id = jsonParsed.data.execution_sid;
        
        console.log('flow_id:', flow_id);
        console.log('flow_execution_id:', flow_execution_id);
        
        const twilio_function_url = "https://adobe-ivr-service-8284.twil.io/execute";

        var twilio_sid = 'AC8db354e50808dd1a53f83a3822abcf52';
        var twilio_auth_token = '453192fa355e1645483d3a28e1cf2fab';
    
        const token = `${twilio_sid}:${twilio_auth_token}`;
        const encodedToken = Buffer.from(token).toString('base64');
        

        var config = {
          headers: { 'Authorization': 'Basic '+ encodedToken }
        };
        
        var post_param = {
            'flow_execution_id': flow_execution_id
        };

        axios
          .post(twilio_function_url, post_param, config)
          .then(res => {
            console.log(`response: ${res.data}`);            
          })
          .catch(error => {
              console.error(error);
          });
        
        
    });
};