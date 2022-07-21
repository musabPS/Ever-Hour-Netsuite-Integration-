/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/email', 'N/error', 'N/record', 'N/runtime', 'N/search', 'N/task','N/encode','N/https','N/format'],
 /**
  * @param{email} email
  * @param{error} error
  * @param{record} record
  * @param{runtime} runtime
  * @param{search} search
  * @param{task} task
  */
 function(email, error, record, runtime, search, task,encode,https,format)
 {


     function getInputData() {

         try
         {

             
            var headers = {
               
            };

            headers["X-Api-Key"]="6cd4-891e-b826b6-5c3f33-7eebf1f7"

           var response = https.get({
              url:"https://api.everhour.com/clients",
              headers: headers,
          });
            return response

        }
      catch (e) {

            log.error({
               title:"Error getInput Stage:",details:JSON.stringify(e)
            });

      }
     }

     
     function map(context) {

         try 
           {
            var res = JSON.parse(context.value);
            log.debug("check",res.values);
           
           } 

         catch (e) 
         {
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }

     



     return {
         getInputData: getInputData,
         map: map
     };

 });
