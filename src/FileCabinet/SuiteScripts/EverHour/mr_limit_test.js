/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/email', 'N/error', 'N/record', 'N/runtime', 'N/search', 'N/task','N/encode','N/https','N/format','SuiteScripts/EverHour/lib/moment.min.js'],
 /**
  * @param{email} email
  * @param{error} error
  * @param{record} record
  * @param{runtime} runtime
  * @param{search} search
  * @param{task} task
  */
 function(email, error, record, runtime, search, task,encode,https,format,moment)
 {


     function getInputData() 
     {

         try{

            log.debug("checck","checkhit")

            return {type: 'search', id:'customsearch1316'}

      }
      catch (e) {

            log.error({
               title:"Error getInput Stage:",details:JSON.stringify(e)
            });

      }

     }

     
     function map(context) {

         try {

          for(var i=0; i<105; i++)
          {
            callSavedSearch()
            

            var scriptObj = runtime.getCurrentScript();

            if(scriptObj.getRemainingUsage()<100)
            {
                log.debug({
                    title: "Remaining usage units inside if: ",
                    details: scriptObj.getRemainingUsage()
                }); 

                var task = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscriptmr_limit_test',
                });
              
        
              task.submit();

               
            }
            log.debug("times",i)
            log.debug({
                title: "Remaining usage units: ",
                details: scriptObj.getRemainingUsage()
            }); 

          }

                


              } 

         catch (e) 
         {
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }

     
     function callSavedSearch()
     {
        
          var customrecord_everhourprocessingqueueSearchObj = search.create({
             type: "customrecord_everhourprocessingqueue",
             filters:
             [
                ["custrecord_everprocessingstatus","anyof","6","1"]
             ],
             columns:
             [
                search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_prtid", label: "ProjectId"}),
                search.createColumn({name: "externalid", label: "External ID"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_rcd", label: "Record Type"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_data", label: "Data"}),
                search.createColumn({name: "custrecord_everprocessingstatus", label: "Status"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_error", label: "Last Error"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_subsd", label: "Subsidiary "}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_inid", label: "Netsuite InternalId"}),
                search.createColumn({name: "custrecord_everhourprocessigqueue_taskid", label: "Task Id"}),
                search.createColumn({name: "custrecord_everhour_parent_task_id", label: "Parent Task Id"})
             ]
          });
    
          var Data = customrecord_everhourprocessingqueueSearchObj.run();
          var FinalResult = Data.getRange(0, 999);
          var  parseData = JSON.parse(JSON.stringify(FinalResult));
    
    
          return parseData
    
        
     }

     



     return {
         getInputData: getInputData,
         map: map
     };

 });
