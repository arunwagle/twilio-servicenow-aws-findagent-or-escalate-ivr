
// This is your new function. To start, set the name and path on the left.

exports.handler = function (context, event, callback) {
    // Here's an example of setting up some TWiML to respond to with this function
      // let twiml = new Twilio.twiml.VoiceResponse();
    
    const client = context.getTwilioClient();
    return client.calls
      .create({      
          url: 'https://adobe-ivr-service-8284.twil.io/voice.xml',
          to: '+12016588268',
          from: '+12012317851'
      })
      .then(call => {
        console.log(call.sid)
        return client.calls(call.sid)
        .fetch()
        .then(call => {
          console.log(call.status)
          return callback(null, call);
        });
        
      });
  
    // return callback(null, twiml);
  }