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


           var filters = runtime.getCurrentScript().getParameter({name: "custscript_selectedrecord"});
           var jsonData = JSON.parse(filters);

           log.debug("aparamData",jsonData)

           log.debug("findclientIndex",jsonData.indexOf("Client"))

             allRecords=[]

             
            var headers = {
               
            };

            headers["X-Api-Key"]="5e9e-295b-2afc4f-01718d-87732dfe"



            if(jsonData.indexOf("Client")!=-1)
            {
              var clientResponse = https.get({
                url:"https://api.everhour.com/clients",
                headers: headers,
                body: {}
               });
  
                allRecords.push({
                  type: "clients",
                  data: clientResponse.body
              })
            }

          


 
            if(jsonData.indexOf("Team")!=-1)
            {
              
                var teamResponse = https.get({
                  url:"https://api.everhour.com/team/users",
                  headers: headers,
                  body: {}
              });

              allRecords.push({
                  type: "team",
                  data: teamResponse.body
              })

            }

            log.debug("allRecords",jsonData.indexOf("Project"));
            if(jsonData.indexOf("Project")!=-1)
            {

              log.debug("allRecords",allRecords);
              var teamResponse = https.get({
                url:"https://api.everhour.com/projects",
                headers: headers,
                body: {}
            });
    
            allRecords.push({
                type: "projects",
                data: teamResponse.body
             })

             log.debug("allRecordsafter psuh",allRecords);

            }
        


      
            return allRecords

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
            var res = JSON.parse( context.value)
                log.debug("check",res)


                var recordData= JSON.parse( res.data)

                log.debug("res.type", res)
                 log.debug("res.data", recordData)

                var headers = {};

                headers["X-Api-Key"]="5e9e-295b-2afc4f-01718d-87732dfe"

                log.debug("recordData.length", recordData.length)


            for(var i=0 ; i<recordData.length; i++)
            {
              log.debug("recordData[i]xxxx-"+i, recordData)
                log.debug("recordData[i]-"+i, recordData[i])

                createRecord(recordData[i] ,res.type, recordData[i].id)
 
                if(res.type=='projects')
                {
                    var clientResponse = https.get({
                        url:"https://api.everhour.com/projects/"+recordData[i].id+"/tasks",
                        headers: headers,
                        body: {}
                    });

                    log.debug("res.projects",clientResponse.body)

                     var task= JSON.parse(clientResponse.body) 

                  //  createRecord(clientResponse.body ,'task', clientResponse.body.id)
                  for(var j=0 ; j<task.length; j++)
                  {

                    createPrjoectTasks(task[j],'task',task[j].id,recordData[i].id)
                  }


                }

            }



            
              //   var task = task.create({
              //     taskType: task.TaskType.MAP_REDUCE,
              //     scriptId: 'customscript_mrcreaterecordfromeverhour',
              // });
      
              // task.submit();
             
           
           } 

         catch (e) 
         {
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }
     
   
     function summarize(context)
     {
   
     }


     function createRecord(JsonData,type,recordId)
     {
      //  var checExist

      // if(type=="clients") {

      //   log.debug("recordId+00", recordId+".0")
         checExist =  checkDataExsit(recordId)

      // }
      //   log.debug("JsonData", checExist)
      log.debug("isExist",checExist)

        if(checExist.length==0)
        {
                    var everHour = record.create({
                      type: 'customrecord_everhourprocessingqueue', 
                      isDynamic: false
                  });
                  everHour.setValue({   
                      fieldId: 'custrecord_everhourprocessingqueue_data',
                      value: JSON.stringify(JsonData)
                  });


                      everHour.setText({   
                      fieldId: 'custrecord_everhourprocessingqueue_rcd',
                      text:  type
                    });

                    everHour.setText({   
                      fieldId: 'custrecord_everprocessingstatus',
                      text:  'Pending'
                    });
                    everHour.setText({   
                      fieldId: 'custrecord_everhourprocessingqueue_rcrid',
                      text:  recordId
                    });
                  
                    everHour.setText({   
                      fieldId: 'externalid',
                      text:  type+"_"+recordId
                    });
                    
              saveId =  everHour.save({                   
                  ignoreMandatoryFields: true    
              });

              log.debug("CreateActivity",saveId)
        }

                

     }

     
     function createPrjoectTasks(JsonData,type,recordId,projectId)
     {

      var isExist= checkDataExsit(recordId)

      log.debug("isExist",isExist)

      if(isExist.length==0)
      {
                var everHour = record.create({
                  type: 'customrecord_everhourprocessingqueue', 
                  isDynamic: false
              });
              everHour.setValue({   
                  fieldId: 'custrecord_everhourprocessingqueue_data',
                  value: JSON.stringify(JsonData)
              });


                  everHour.setText({   
                  fieldId: 'custrecord_everhourprocessingqueue_rcd',
                  text:  type
                });

                everHour.setText({   
                  fieldId: 'custrecord_everprocessingstatus',
                  text:  'Pending'
                });
                everHour.setText({   
                  fieldId: 'custrecord_everhourprocessingqueue_rcrid',
                  text:  recordId
                });
                everHour.setText({   
                  fieldId: 'custrecord_everhourprocessingqueue_prtid',
                  text:  projectId
                });
                everHour.setText({   
                  fieldId: 'externalid',
                  text:  recordId
                });
              
                saveId =  everHour.save({                   
                    ignoreMandatoryFields: true    
                });

                log.debug("CreateActivity",saveId)
      }
             
             
               




     }


     function checkDataExsit(recordId)
     {
      var customrecord_everhourprocessingqueueSearchObj = search.create({
        type: "customrecord_everhourprocessingqueue",
        filters:
        [
          ["custrecord_everhourprocessingqueue_rcrid","startswith",recordId]
        ],
        columns:
        [
           search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
           search.createColumn({name: "custrecord_everhourprocessingqueue_prtid", label: "ProjectId"}),
           search.createColumn({name: "externalid", label: "External ID"}),
        ]
     });
     var isData = customrecord_everhourprocessingqueueSearchObj.run();
     var isFinalResult = isData.getRange(0, 999);
     var  parseData = JSON.parse(JSON.stringify(isFinalResult));

     return parseData

     }


     



     return {
         getInputData: getInputData,
         map: map,
         summarize : summarize
     };

 });
