
let url = "https://adobe-ivr-service-8284.twil.io/agent_list.json";
let options = {json: true};

exports.handler = (context, event, callback) => {
    const axios = require("axios");
    const response = new Twilio.Response();
    response.setStatusCode(200);
    response.appendHeader('Content-Type', 'application/json'); 

    axios
        .get(url)
        .then(res => {
            console.log(`statusCode: ${res.status}`);            
            response.setBody(res.data); 
            callback(null, response);

        })
        .catch(error => {
            console.error(error);
            response.setBody(error); 
            callback(null, response);
        });
    
};