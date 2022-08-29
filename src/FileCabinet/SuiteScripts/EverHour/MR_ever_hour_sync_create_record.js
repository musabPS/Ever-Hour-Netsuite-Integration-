/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/email', 'N/error', 'N/record', 'N/runtime', 'N/search', 'N/task','N/encode','N/https','N/format',
 'SuiteScripts/EverHour/lib/moment.min.js','SuiteScripts/EverHour/lib/data_search_lib','SuiteScripts/EverHour/lib/helper_lib'],
 /**
  * @param{email} email
  * @param{error} error
  * @param{record} record
  * @param{runtime} runtime
  * @param{search} search
  * @param{task} task
  */
 function(email, error, record, runtime, search, task,encode,https,format,moment,searchlib,helperlib)
 {


     function getInputData() 
     {

        try
        {
           var allRecords=[]
            var headers = {};
            headers["X-Api-Key"]="5e9e-295b-2afc4f-01718d-87732dfe"

            var clientResponse = https.get({
                url:"https://api.everhour.com/clients",
                headers: headers,
                body: {}
            });
                allRecords.push({
                type: "Client",
                data: clientResponse.body
            })

            var projectResponse = https.get({
                url:"https://api.everhour.com/projects",
                headers: headers,
                body: {}
            });
            allRecords.push({
                type: "project",
                data: projectResponse.body
             })

             

    
                return allRecords

        }
        catch (e) 
        {
                log.error({
                title:"Error getInput Stage:",details:JSON.stringify(e)
                });

        }

     }

     
     function map(context) 
     {

         try
         {
            log.debug("map","map")
            var res = JSON.parse( context.value)
                log.debug("check",res)


                var recordPayLoadData= JSON.parse( res.data)

                log.debug("res.type", res.type)
                 log.debug("res.data", recordPayLoadData)
         
                    switch (res.type) 
                    {
                       case 'Client':
                             var externalID 
                            for(var i=0; i<recordPayLoadData.length; i++)
                            {
                                externalID = res.type+"_"+recordPayLoadData[i].id
                               // log.debug("check Client Status",externalID)
                               // log.debug("check Client Status",recordData[i])

                                var clientSatus = searchlib.getProcessessQueueStatus(externalID)
                                if(clientSatus.length==0){  //clientSatus?.length==0
                                  var processQueueInternalId  = helperlib.createProcessQueue(res.type, "Pending",recordPayLoadData[i])
                                  log.debug("processQueueInternalId",processQueueInternalId)
                                }
                              else if(clientSatus[0].values.custrecord_everprocessingstatus[0].text["Done"]){continue}
                                
                              //  log.debug("check Client Status",clientSatus)
                            }

                         break;
                       case 'Project':
                                var externalID 
                                for(var i=0; i<recordPayLoadData.length; i++)
                                {
                                        externalID = res.type+"_"+recordPayLoadData[i].id
                                    // log.debug("check Client Status",externalID)
                                    // log.debug("check Client Status",recordData[i])

                                        var clientSatus = searchlib.getProcessessQueueStatus(externalID)
                                        log.debug("Project",clientSatus)


                                        if(clientSatus.length==0){
                                        var processQueueInternalId  = helperlib.createProcessQueue(res.type, "Pending",recordPayLoadData[i])
                                        log.debug("processQueueInternalId",processQueueInternalId)
                                        }
                                    else if(clientSatus[0].values.custrecord_everprocessingstatus[0].text["Done"]){continue}
                                    else if(clientSatus[0].values.custrecord_everprocessingstatus[0].text["Error"]){continue}

                                    
                                
                                } 
                        break;
                       case 'Task':
                       break
                     }

                     log.debug("check map end","map end")

            context.write({
                key: "key",
                value: "value"
            });

               
         }

         catch (e) 
         {
            // var res = JSON.parse(context.value);
            //  updateErrorProcessQueue(res.id, JSON.stringify(e))
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }


 function reduce(context) {

         try
         {

          var pendingQueueData = searchlib.getPendingProcessQueue()
          var netsuiteInternalId=0
            log.debug("pendingQueue",pendingQueueData)
           // data = context.values;
           log.debug("pendingQueue length",pendingQueueData.length)

           for(var i=0; i<=pendingQueueData.length; i++)
            {
                log.debug("pendingQueue inloop",pendingQueueData[i])

              var  everHourPayLoad         =  JSON.parse(pendingQueueData[i].values.custrecord_everhourprocessingqueue_data)
              var  everHourId              =  pendingQueueData[i].values.custrecord_everhourprocessingqueue_rcrid
              var processQueueInternalId   =  pendingQueueData[i].id
              var status                   = pendingQueueData[i].values.custrecord_everprocessingstatus[0].text
              var subsidiary               =  1
              log.debug("pendingQueue inloop type",pendingQueueData[i].values.custrecord_everhourprocessingqueue_rcd)

              if(pendingQueueData[i].values.custrecord_everhourprocessingqueue_inid)
              {
                netsuiteInternalId = pendingQueueData[i].values.custrecord_everhourprocessingqueue_inid
              }

                switch (pendingQueueData[i].values.custrecord_everhourprocessingqueue_rcd[0].text) 
                {
                   case 'Client':
                         helperlib.createCustomers(everHourPayLoad,everHourId,processQueueInternalId,subsidiary , status, netsuiteInternalId)
                     break;
                   case 'Project':
                     //  updateProcessQueue(recordType,status,responsePayLoad,internalId,netsuiteInternalId)
                     break;
                   case 'Task':
                   break
                 }

            }
            log.debug("check reduced data","Data reduced")
  

         }

         catch (e) 
         {
           // var res = JSON.parse(context.value);
           log.error({title:"MAP Error",details:JSON.stringify(e)});
            
         }
     }

     


function summarize(context) {

    try
    {


    }

    catch (e) 
    {
       //var res = JSON.parse(context.value);
        // updateErrorProcessQueue(res.id, JSON.stringify(e))
         log.error({title:"MAP Error",details:JSON.stringify(e)});
    }
}
     


     



     return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
     };

 });
