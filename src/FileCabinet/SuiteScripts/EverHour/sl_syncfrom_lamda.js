/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */


 define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/format', 'N/task','N/https','N/runtime',
 'SuiteScripts/EverHour/lib/data_search_lib','SuiteScripts/EverHour/lib/helper_lib'],
 function (nsUi, record, redirect, search, nsFormat, nstask,https,runtime,searchlib,helperlib) {

     function onRequest(context) {

         try {
             var request = context.request;
             var response = context.response;
             var params = request.parameters;

            // log.debug("request.headers.referer",request.headers.referer)

             if (request.method === 'GET') {
                 log.debug('GET params', params);
               

                 getHandler(request, response, params);
             }
           else {
                
                 postHandler(request, response, params);
             }
         } catch (e) {
             log.error('Error::onRequest', e);
             response.writeLine({ output: 'Error: ' + e.name + ' , Details: ' + e.message });
         }


     }


     function getHandler(request, response, params) 
     { 

    //      var hasDateParams = (!!params.fromdate && !!params.todate)
    //      var setDefaultDate = params.setdefaultdate || 'T'
    //      let url = request.url;
    //      let param = request.parameters;
    //      let recordStatus = []
         
    //      log.debug("script id : ",param.script)

    //      var form = nsUi.createForm({
    //          title: 'Ever Hour Sync',
    //          hideNavBar: false
    //      })


    //      var subsidiary = form.addField({
    //          id: "custfield_subsidiary",
    //           label: "subsidiary",
    //           type: nsUi.FieldType.SELECT,
    //           source: "subsidiary",
             
    //       });
    //       subsidiary.isMandatory = true 

    //      form.addSubmitButton({
    //          label: 'Sync Ever Hour Data'
    //      });

    //          //     form.clientScriptModulePath = './cs_construction_bundle_for_suitelets.js';

    //          //    form.addSubtab({ id: 'custpage_tab', label: 'Sales Orders' });
                 
 
    //      //adding sublist
    //      var sublist = form.addSublist({
    //          id : 'sublist',
    //          type : nsUi.SublistType.LIST,
    //          label : 'List Type Sublist'
    //         });
            
    //         var check = sublist.addField({
    //          id : 'custpage_check',
    //          label : 'Check',
    //          type : nsUi.FieldType.CHECKBOX
    //         });
    //         check.updateDisplayType({displayType: nsUi.FieldDisplayType.ENTRY});
            
    //         var itm_id = sublist.addField({
    //          id : 'custpage_item',
    //          label : 'Record',
    //          type : nsUi.FieldType.TEXT
    //         });
            
    //         var itm_id = sublist.addField({
    //          id : 'custpage_tobesync',
    //          label : 'Record to be sync',
    //          type : nsUi.FieldType.TEXT
    //         });

    //      //    var itm_id = sublist.addField({
    //      //     id : 'custpage_error',
    //      //     label : 'Error',
    //      //     type : nsUi.FieldType.TEXT
    //      //    });
            
            
    //         // Set Sublist data
            
    //         var sublist = form.getSublist({
    //          id : 'sublist'
    //         });
            

    //         if(param.phase==1)
    //         {
    //          sublist.setSublistValue({
    //              id : 'custpage_item',
    //              line : 0,
    //              value : "Client"
    //              });
                 
    //              sublist.setSublistValue({
    //              id : 'custpage_item',
    //              line : 1,
    //              value : "Team"
    //              });
                 
                 
    //              sublist.setSublistValue({
    //              id : 'custpage_item',
    //              line : 2,
    //              value : "Project"
    //              });

    //              sublist.setSublistValue({
    //                  id : 'custpage_item',
    //                  line : 3,
    //                  value : "Task"
    //                  });

    //                  // var checkSublist = form.getSublistField({ sublistId: 'sublist',
    //                  //     fieldId: 'custpage_check',
    //                  //     line: 3 });

    //                  //     checkSublist.isDisabled = true;
    //          }

    //         else
    //         {
                
    //          sublist.setSublistValue({
    //              id : 'custpage_item',
    //              line : 0,
    //              value : "Expense Category"
    //              });

    //          sublist.setSublistValue({
    //              id : 'custpage_item',
    //              line : 1,
    //              value : "Expense"
    //              });


    //         }

    //          selectedRecord=[]
    //          var everHourToken = search.lookupFields({type: 'customrecord_everhourtokenset', id: 1, columns: "custrecord_everhour_tokenid"});

    // var headers = {};


    // headers["X-Api-Key"] = everHourToken.custrecord_everhour_tokenid
         
    //    var netsuiteSummary = netsuiteSyncfromProcessingQueue()
    //    log.debug("checksummary",netsuiteSummary)

    //      recordStatus.push({
    //          'record' : 'Client',
    //          'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/clients"),
    //          'netsuiteCount'    :  netsuiteSummary.filter(function (el) {return el.record == "Client"}).length>0 ? netsuiteSummary.filter(function (el) {return el.record == "Client"})[0].count : 0
    //      })
        

    //      recordStatus.push({
    //          'record' : 'Team',
    //          'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/team/users"),
    //          'netsuiteCount'    : netsuiteSummary.filter(function (el) {return el.record == "Team"}).length>0 ? netsuiteSummary.filter(function (el) {return el.record == "Team"})[0].count : 0
    //      })
         

    //      recordStatus.push({
    //          'record' : 'Project',
    //          'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/projects"),
    //          'netsuiteCount'    : netsuiteSummary.filter(function (el) {return el.record == "Project"}).length>0 ? netsuiteSummary.filter(function (el) {return el.record == "Project"})[0].count : 0
    //      })

    //      if(netsuiteSummary.length>0)
    //      {
    //          sublist.setSublistValue({
    //              id : 'custpage_tobesync',
    //              line : 0,
    //              value : recordStatus[0].everHourCount -  recordStatus[0].netsuiteCount
    //              });  

    //           sublist.setSublistValue({
    //              id : 'custpage_tobesync',
    //              line : 1,
    //              value : recordStatus[1].everHourCount -  recordStatus[1].netsuiteCount
    //              });  

    //          sublist.setSublistValue({
    //              id : 'custpage_tobesync',
    //              line : 2,
    //               value : recordStatus[2].everHourCount -  recordStatus[2].netsuiteCount
    //              });  
    //      }
         


    //      log.debug("checkAllJSON",recordStatus)


    //      sublist.addMarkAllButtons(); 


    //      response.writePage(form);

     }


     function postHandler(request, response, params)
      {
        // var selectedLines = genlib.getSelectedLines(request,posting_period,subsidiary,project);
        ///// log.debug('selectedLines Post', selectedLines);
        log.debug("contextrequestbody","hit")
        log.debug("request.body",request.body)

        let eventJson = 
         {

            'api:client:created': {"status":"Pending"         ,"recordType" : "Client"},
            'api:client:updated': {"status":"Pending Update"  ,"recordType" : "Client"},
            
            'api:project:created': {"status":"Pending"             ,"recordType" : "Project"},
            'api:project:updated': {"status":"Pending Update"      ,"recordType" : "Project"},
            'api:project:removed': {"status":"Pending Inactive"    ,"recordType" : "Project"},

            'api:task:created': {"status":"Pending"                   ,"recordType" : "Task"},
            'api:task:updated': {"status":"Pending Update"            ,"recordType" : "Task"},
            'api:task:removed': {"status":"Pending Inactive"          ,"recordType" : "Task"},

            'api:time:updated' :  {"status":"Pending"          ,"recordType" : "Time Sheet"},
            
             }

        let responseBody =  JSON.parse( JSON.parse( request.body) )

        if(responseBody.event=="api:estimate:updated")
        {
          helperlib.updateTaskEstimate(responseBody)

          return 
        }

        // if(responseBody.event=="api:time:updated")
        // {
        //   helperlib.updateTaskTime(responseBody)
        // }

        log.debug("responseBody",responseBody)
     
        let  responseEvent        = responseBody.event
        let  responsePayLoad      =  responseBody.payload
        let  eventType            = eventJson[responseEvent]
        log.debug("responseBody.event",eventType)

        let  everHourRecordId     = responsePayLoad.id
        let  recordType           = eventType.recordType
        let  status               = eventType.status

        let  externalId           = recordType+"_"+everHourRecordId
        let  internalId,netsuiteInternalId
       //let status = EvenType.status

       if(responseEvent=="api:time:updated")
       {
        externalId = recordType+"_"+responseBody.payload.data.id
       }
         let ProcessQueueInternalId = checkDataExsitArry(externalId)
         
         log.debug("ProcessQueueInternalId",ProcessQueueInternalId)
         log.debug("externalId",externalId)


         if(ProcessQueueInternalId.length>0)
         {
            internalId = ProcessQueueInternalId[0].id
            netsuiteInternalId  = ProcessQueueInternalId[0].values.custrecord_everhourprocessingqueue_inid
            status="Pending Update"
         }

         switch (status) 
         {
            case 'Pending':
                createProcessQueue(recordType, status,responsePayLoad.data)
              break;
            case 'Pending Update':
                updateProcessQueue(recordType,status,responsePayLoad,internalId,netsuiteInternalId)
              break;
            case 'Pending Inactive':
            break
          }

        
      }

      function checkDataExsitArry(externalId)
      {
          var customrecord_everhourprocessingqueueSearchObj = search.create({
              type: "customrecord_everhourprocessingqueue",
              filters:
                      [
                        ["externalid","anyof",externalId]
                      ],
              columns:
              [
              search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
              search.createColumn({name: "custrecord_everhourprocessingqueue_prtid", label: "ProjectId"}),
              search.createColumn({name: "custrecord_everhourprocessingqueue_inid", label: "Netsuite InternalId"}),
              search.createColumn({name: "internalid", label: "internal ID"}),
              ]
          });
          var Data = customrecord_everhourprocessingqueueSearchObj.run();
          var FinalResult = Data.getRange(0, 999);
          var  parseData = JSON.parse(JSON.stringify(FinalResult));

       
          return parseData

      }

      function createProcessQueue(recordType, status,everHourPayLoadData)
      {

        var everHourCreate = record.create({
            type: 'customrecord_everhourprocessingqueue', 
            isDynamic: false
        });
        everHourCreate.setValue({   
            fieldId: 'custrecord_everhourprocessingqueue_data',
            value: JSON.stringify(everHourPayLoadData)
        });

        log.debug("everHourPayLoadData function",everHourPayLoadData)

        everHourCreate.setValue({   
            fieldId: 'custrecord_everhourprocessingqueue_recor',
            value: everHourPayLoadData.name
        });

        everHourCreate.setValue({  fieldId: 'custrecord_everhourprocessingqueue_subsd',  
         value:  1 
        });


        everHourCreate.setText({   
            fieldId: 'custrecord_everhourprocessingqueue_rcd',
            text:  recordType
          });

          everHourCreate.setText({   
            fieldId: 'custrecord_everprocessingstatus',
            text:  status
          });
          everHourCreate.setText({   
            fieldId: 'custrecord_everhourprocessingqueue_rcrid',
            text:  everHourPayLoadData.id
          });

           
          everHourCreate.setText({   
            fieldId: 'externalid',
            text:  recordType+"_"+everHourPayLoadData.id
          });

          if(recordType == "Task")
          {
            everHourCreate.setText({   
                fieldId: 'custrecord_everhourprocessingqueue_prtid',
                text:  everHourPayLoadData.projects[0]
              });
          }

                  
          saveId =  everHourCreate.save({                   
            ignoreMandatoryFields: true    
        });

        /////////////////////////////  Create Record in netsuite Start ////////////////////////////

        log.debug("check saveId", saveId)
        if(recordType=="Client")
        {
          helperlib.createCustomers(everHourPayLoadData, everHourPayLoadData.id ,saveId, 1 , "Pending", 1)
        }

       else if(recordType=="Project")
       {
        var customerName =  searchlib.getCustomerNameForCreateProjects(everHourPayLoadData.client)

         var projectId = helperlib.createProjects(everHourPayLoadData,everHourPayLoadData.id,saveId,customerName[0].id,customerName[0].values.entityid ,1, "Pending", 1)
         var projectUsers  = everHourPayLoadData.users

         log.debug("projectUsers", projectUsers)
         log.debug("projectId", projectId)


         for(var j=0; j<projectUsers.length; j++)
         {
            var employeeInternalId  =  searchlib.getEmployeesInternalId(projectUsers[j])
           
            employeeInternalId = employeeInternalId[0].id
           
            helperlib.createResourseAllocation(projectId, employeeInternalId ,1)
         }

       }

       else if(recordType=="Time Sheet")
       {
        log.debug("recordType", recordType)

       // createTimeTracking(responseBody, internalID,processQueueInternalId) 

        helperlib.createTimeTracking(everHourPayLoadData,saveId,0) 
       }

      //  else if(recordType=="Task")
      //  {
      //    if(everHourPayLoadData.assignees)
      //    {
      //     var ProjectInternalId = searchlib.getProjectInternalId(everHourPayLoadData.projects[0])
      //     log.debug("ProjectInternalId", ProjectInternalId)
      //     if(ProjectInternalId.length>0)
      //     {
      //       //helperlib.CreateProjectTask(everHourPayLoadData, everHourPayLoadData.id, ProjectInternalId[0].id, saveId ,"Pending", 0)
      //     }
      //     else
      //     {
      //       helperlib.updateErrorProcessQueue(saveId,"Project not found in Netsuite")
      //     }
      //    }
           
      //  }

        


      }

      function updateProcessQueue(recordType,status,everHourPayLoadData,internalId,isnetsuiteInternalId)
      {

        var projectTaskId=0
        var everHourLoad = record.load({
            id: internalId,
            type: 'customrecord_everhourprocessingqueue', 
            isDynamic: true
         });

         everHourLoad.setValue({   
            fieldId: 'custrecord_everhourprocessingqueue_data',
            value: JSON.stringify(everHourPayLoadData.data)
        });

        log.debug("everHourPayLoadData function",everHourPayLoadData)

        everHourLoad.setValue({   
            fieldId: 'custrecord_everhourprocessingqueue_recor',
            value: everHourPayLoadData.data.name
        });

        everHourLoad.setValue({  fieldId: 'custrecord_everhourprocessingqueue_subsd',  
         value:  1 
        });

        if(isnetsuiteInternalId)
        {

            everHourLoad.setText({   
                fieldId: 'custrecord_everprocessingstatus',
                text:  status
              });
              projectTaskId=isnetsuiteInternalId
        }

          everHourLoad.setText({   
            fieldId: 'custrecord_everhourprocessingqueue_rcrid',
            text:  everHourPayLoadData.id
          });

       
          saveId =  everHourLoad.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("check saveId", saveId)

        if(recordType=="Client")
        {
          helperlib.createCustomers(everHourPayLoadData.data, everHourPayLoadData.id ,saveId, 1 , "Pending Update", isnetsuiteInternalId)
        }

      else  if(recordType=="Project")
        {
          log.debug("getCustomerNameForCreateProjects", everHourPayLoadData.data.client)
          var customerName =  searchlib.getCustomerNameForCreateProjects(everHourPayLoadData.data.client)
          log.debug("projectTaskId", projectTaskId)

         var projectId =  helperlib.createProjects(everHourPayLoadData.data,everHourPayLoadData.id,saveId,customerName[0].id,customerName[0].values.entityid ,1, "Pending Update", projectTaskId)
      
          var projectUsers  = everHourPayLoadData.data.users

          log.debug("projectUsers", projectUsers)
          log.debug("projectId sl_sync", projectId)
 
          for(var j=0; j<projectUsers.length; j++)
          {
             var employeeInternalId  =  searchlib.getEmployeesInternalId(projectUsers[j])
            
             employeeInternalId = employeeInternalId[0].id
             log.debug("employeeInternalId", employeeInternalId)
             helperlib.createResourseAllocation(projectId, employeeInternalId ,1)
          }
      
      
        }

        else if(recordType=="Task")
        {
          if(everHourPayLoadData.data.assignees)
          {
           var ProjectInternalId = searchlib.getProjectInternalId(everHourPayLoadData.data.projects[0])
           log.debug("projectTaskId", projectTaskId)
           if(ProjectInternalId.length>0)
           {
             helperlib.CreateProjectTask(everHourPayLoadData.data, everHourPayLoadData.id, ProjectInternalId[0].id, saveId ,1,"Task Update", projectTaskId)
           }
           else
           {
             helperlib.updateErrorProcessQueue(saveId,"Project not found in Netsuite")
           }
          }
            
        }
        else if(recordType=="Time Sheet")
        {
         log.debug("recordType", recordType)
 
        // createTimeTracking(responseBody, internalID,processQueueInternalId) 
 
         helperlib.updateTimeTracking(everHourPayLoadData,internalId,projectTaskId) 
        }

       


      }

      
    

    
   


     return {
         onRequest: onRequest

     }
 }
);
