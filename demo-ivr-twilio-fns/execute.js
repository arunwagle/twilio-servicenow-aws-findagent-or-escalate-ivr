let agent_list_url = "https://adobe-ivr-service-8284.twil.io/agent_list.json";

exports.handler = function(context, event, callback) {
  const axios = require("axios");
  const twilioClient = context.getTwilioClient();
  
  const flow_sid = context.FLOW_SID;
  console.log('flow_sid', flow_sid);
  const from = context.FROM;
  console.log('from', from);
  // This number is picked up from the agent list
  var to = '';

  const flow_execution_id = event.flow_execution_id || '';
  console.log('flow_execution_id', flow_execution_id);
  
  var flow_input = '';
  
  axios
    .get(agent_list_url)
    .then(res => {
      console.log(`List: ${res.data}`);  
      agent_list = res.data.agent_list;       
      escalation_list = res.data.escalation_list;

      // First time the flow is executed
      if(flow_execution_id === ''){       
        let sys_id = event.sys_id ;
        let ticket_no = event.ticket_no ;
        to = agent_list[0].phone_no;
        let agent = agent_list[0];
        let parameters = {'selected_agent': agent, 'action': 'call_support', 'index' : 0, 'escalation_index' : -1, 'sys_id': sys_id, 'ticket_no': ticket_no};
        flow_input = {to: to, from: from, parameters: parameters};

        twilioClient
          .studio
          .flows(flow_sid)
          .executions
          .create(flow_input)
          .then(execution => {
            console.log(execution);
            callback(null, execution);
        });

      }
      // This will be executed from Event Streams when the flow ends
      else{
          twilioClient
          .studio
          .flows(flow_sid)
          .executions(flow_execution_id)
          .executionContext()
          .fetch()
          .then(execution_context => {
            // Check if support accepted the call 
            let call_acceptance_status = execution_context.context.widgets.support_options.Digits || "-1";
            let index = execution_context.context.flow.data.index;
            let escalation_index = execution_context.context.flow.data.escalation_index;
            let sys_id = execution_context.context.flow.data.sys_id ;
            let ticket_no = execution_context.context.flow.data.ticket_no ;

            // The call was accepted
            if (call_acceptance_status == "1"){
              callback(null, "The agent accepted the call");
            }
            else if (call_acceptance_status == "2"){
              index = index + 1;
              to = agent_list[index].phone_no;
              let agent = agent_list[index];
              let parameters = {'selected_agent': agent, 'action': 'call_support', 'index' : index, 'escalation_index':escalation_index, 'sys_id': sys_id, 'ticket_no': ticket_no};

              flow_input = {to: to, from: from, parameters: parameters};
            }
            else if (call_acceptance_status == "3"){
              to = escalation_list[index].phone_no;
              escalation_index = escalation_index + 1;
              let agent = escalation_list[escalation_index];
              let parameters = {'selected_agent': agent, 'action': 'call_support', 'index' : index, 'escalation_index':escalation_index, 'sys_id': sys_id, 'ticket_no': ticket_no};
              
              flow_input = {to: to, from: from, parameters: parameters};              
            }
            
            // Trigget the flow again
            if ( (call_acceptance_status == "2" && index < agent_list.length) || 
                (call_acceptance_status == "3" && escalation_index < escalation_list.length) ){
              twilioClient
                .studio
                .flows(flow_sid)
                .executions
                .create(flow_input)
                .then(execution => {
                  console.log(execution);
                  callback(null, execution);
                });      
            }
            else{
              callback(null, "No available agents to accept the ticket");
            }

          });
          
      }
        
    })
    .catch(error => {
        console.error(error);
        // response.setBody(error); 
        callback(null, error);
    });

};