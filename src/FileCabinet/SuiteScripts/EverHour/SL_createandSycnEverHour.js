/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */


define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/format', 'N/task','N/https'],
    function (nsUi, record, redirect, search, nsFormat, nstask,https) {

        function onRequest(context) {
  
            try {
                var request = context.request;
                var response = context.response;
                var params = request.parameters;

                log.debug("request.headers.referer",request.headers.referer)

                if (request.method === 'GET') {
                    log.debug('GET params', params);
                    getHandler(request, response, params);
                } else {
                    postHandler(request, response, params);
                }
            } catch (e) {
                log.error('Error::onRequest', e);
                response.writeLine({ output: 'Error: ' + e.name + ' , Details: ' + e.message });
            }


        }


        function getHandler(request, response, params) 
        { 

            var hasDateParams = (!!params.fromdate && !!params.todate)
            var setDefaultDate = params.setdefaultdate || 'T'
            let url = request.url;
            let param = request.parameters;
            let recordStatus = []
            
            log.debug("script id : ",param.script)
 
            var form = nsUi.createForm({
                title: 'Ever Hour Sync',
                hideNavBar: false
            })

            form.addSubmitButton({
                label: 'Sync Ever Hour Data'
            });

                //     form.clientScriptModulePath = './cs_construction_bundle_for_suitelets.js';

                //    form.addSubtab({ id: 'custpage_tab', label: 'Sales Orders' });
                    
    
            //adding sublist
            var sublist = form.addSublist({
                id : 'sublist',
                type : nsUi.SublistType.LIST,
                label : 'List Type Sublist'
               });
               
               var check = sublist.addField({
                id : 'custpage_check',
                label : 'Check',
                type : nsUi.FieldType.CHECKBOX
               });
               check.updateDisplayType({displayType: nsUi.FieldDisplayType.ENTRY});
               
               var itm_id = sublist.addField({
                id : 'custpage_item',
                label : 'Record',
                type : nsUi.FieldType.TEXT
               });
               
               var itm_id = sublist.addField({
                id : 'custpage_tobesync',
                label : 'Record to be sync',
                type : nsUi.FieldType.TEXT
               });

               var itm_id = sublist.addField({
                id : 'custpage_error',
                label : 'Error',
                type : nsUi.FieldType.TEXT
               });
               
               
               // Set Sublist data
               
               var sublist = form.getSublist({
                id : 'sublist'
               });
               

               if(param.phase==1)
               {
                sublist.setSublistValue({
                    id : 'custpage_item',
                    line : 0,
                    value : "Client"
                    });
                    
                    sublist.setSublistValue({
                    id : 'custpage_item',
                    line : 1,
                    value : "Team"
                    });
                    
                    
                    sublist.setSublistValue({
                    id : 'custpage_item',
                    line : 2,
                    value : "Project"
                    });

                    sublist.setSublistValue({
                        id : 'custpage_item',
                        line : 3,
                        value : "Task"
                        });
               }

               else
               {
                   
               sublist.setSublistValue({
                id : 'custpage_item',
                line : 0,
                value : "Expense Category"
                });

               sublist.setSublistValue({
                id : 'custpage_item',
                line : 1,
                value : "Expense"
                });


               }

                selectedRecord=[]
                var everHourToken = search.lookupFields({type: 'customrecord_everhourtokenset', id: 1, columns: "custrecord_everhour_tokenid"});
                log.debug("everHourToken",everHourToken)

       var headers = {};


       headers["X-Api-Key"] = everHourToken.custrecord_everhour_tokenid
            
          var netsuiteSummary = netsuiteSyncfromProcessingQueue()

            recordStatus.push({
                'record' : 'Client',
                'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/clients"),
                'netsuiteCount'    : netsuiteSummary.filter(clientFilter)
            })
            function clientFilter(record) {return record == "Client"}

            recordStatus.push({
                'record' : 'Team',
                'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/team/users"),
                'netsuiteCount'    : netsuiteSummary.filter(teamFilter)
            })
            function teamFilter(record) {return record == "Team"}

            recordStatus.push({
                'record' : 'Project',
                'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/projects"),
                'netsuiteCount'    : netsuiteSummary.filter(projectFilter)
            })
            function projectFilter(record) {return record == "Project"}


            log.debug("checkAllJSON",recordStatus)


            sublist.addMarkAllButtons(); 


            response.writePage(form);

        }

  
        function postHandler(request, response, params)
         {
           // var selectedLines = genlib.getSelectedLines(request,posting_period,subsidiary,project);
           ///// log.debug('selectedLines Post', selectedLines);

            var totalLines = request.getLineCount({ group: 'sublist' });
            var totalRecordSync =[]

            checExist =  checkDataExsit(12)

            selectedLines = 0
            selectedRecord=[]
                     var everHourToken = search.lookupFields({type: 'customrecord_everhourtokenset', id: 1, columns: "custrecord_everhour_tokenid"});
                     log.debug("everHourToken",everHourToken)


            var headers = {};

            headers["X-Api-Key"] = everHourToken.custrecord_everhour_tokenid


            log.debug("sointernalid",totalLines)

            for (var i = 0; i < totalLines; i++)
             {
                    var isSelected = request.getSublistValue({
                        group: 'sublist',
                        name: 'custpage_check',
                        line: i
                    });

                    log.debug("sointernalid",isSelected)
                    if (isSelected == true || isSelected == 'T') 
                    {


                      var recordName =  request.getSublistValue({
                                 group: 'sublist',
                                   name: 'custpage_item',
                                    line: i
                                 })
    


                          if(recordName=="Client")
                          {
                            var clientResponse = https.get({
                                url:"https://api.everhour.com/clients",
                                headers: headers,
                                body: {}
                               });
                               log.debug("recordName",recordName)
                               var bodyData = JSON.parse(clientResponse.body) 
                               log.debug("clientResponse.body", JSON.parse(clientResponse.body) )
                               createRecord(bodyData,"Client",headers)

                  
                          }

                          if(recordName=="Team")
                          {
                            var teamResponse = https.get({
                                url:"https://api.everhour.com/team/users",
                                headers: headers,
                                body: {}
                            });
                               log.debug("recordName",recordName)
                               var bodyData = JSON.parse(teamResponse.body) 
                               log.debug("teamResponse.body", JSON.parse(teamResponse.body) )
                               createRecord(bodyData,"Team",headers)

                  
                          }

                          if(recordName=="Project")
                          {
                           // 
                            
                                var projectResponse = https.get({
                                    url:"https://api.everhour.com/projects",
                                    headers: headers,
                                    body: {}
                                });

                               log.debug("recordName",recordName)
                               var bodyData = JSON.parse(projectResponse.body) 
                               log.debug("teamResponse.body", JSON.parse(projectResponse.body) )
                               log.debug("teamResponse.body", JSON.parse(projectResponse.body) )

                               createRecord(bodyData,"Project",headers)
                  
                          }

                          if(recordName=="Expense Category")
                          {
                           
                                var projectResponse = https.get({
                                    url:"https://api.everhour.com/expenses/categories",
                                    headers: headers,
                                    body: {}
                                });

                               log.debug("recordName",recordName)
                               var bodyData = JSON.parse(projectResponse.body) 
                               log.debug("teamResponse.body", JSON.parse(projectResponse.body) )
                               createRecord(bodyData,"Expense Category",headers)
                  
                          }

                          if(recordName=="Expense")
                          {
                           
                                var projectResponse = https.get({
                                    url:"https://api.everhour.com/expenses",
                                    headers: headers,
                                    body: {}
                                });

                               log.debug("recordName",recordName)
                               var bodyData = JSON.parse(projectResponse.body) 
                               log.debug("teamResponse.body", JSON.parse(projectResponse.body) )
                               createRecord(bodyData,"Expense",headers)
                  
                          }
                        

                        // selectedRecord.push(

                        //     request.getSublistValue({
                        //     group: 'sublist',
                        //         name: 'custpage_item',
                        //         line: i
                        //     }))

                        var sointernalid = request.getSublistValue({
                            group: 'sublist',
                            name: 'custpage_item',
                            line: i
                        });

                       // log.debug("sointernalid",sointernalid)
                        selectedLines++
                    }
                   
                }
           

            if (selectedLines>0) 
            {





                
                



                // for (var i = 0; i < selectedLines; i++) {
                //     var queueId = genlib.createQueueRecord(selectedLines[i]);
                //     log.debug("queueId", queueId);
                // }

                var taskId = triggerDownload(selectedRecord);

                log.debug("taskID(triggerDownload)",taskId)

                    var form = nsUi.createForm({
                        title: 'Syncing Data From Ever Hour'
                    });
                 //   genlib.showPostForm(form, queueId, taskId, selectedLines.length);
                    form.clientScriptModulePath = 'SuiteScripts/EverHour/CS_ForSuiteletsyncEverHour.js';


                  var messageFld = form.addField({
                    id: 'custpage_message',
                    type: nsUi.FieldType.INLINEHTML,
                    label: 'Message'
                });
    
                messageFld.defaultValue = '<span style="font-size:13px">Your records are being processed. Please do not refresh this window.</span>';
    
    
              
    
    
                var htmlField = form.addField({
                    "id": "custpage_field_html",
                    "label": "HTML",
                    "type": nsUi.FieldType.INLINEHTML
                });
    
                // var queueIdFld = form.addField({
                //     id: 'custpage_queueid',
                //     type: nsUi.FieldType.TEXT,
                //     label: 'Queue ID'
                // });
                var taskIdFld = form.addField({
                    id: 'custpage_taskid',
                    type: nsUi.FieldType.TEXT,
                    label: 'Task ID'
                });
                var totalLinesFld = form.addField({
                    id: 'custpage_totalline',
                    type: nsUi.FieldType.TEXT,
                    label: 'Total Records To Process',
    
                });
    
    
                // queueIdFld.defaultValue = selectedLines;
                // queueIdFld.updateDisplayType({ displayType: nsUi.FieldDisplayType.NODISPLAY });
                log.debug("createTask","sss")
                taskIdFld.defaultValue = taskId;
                taskIdFld.updateDisplayType({ displayType: nsUi.FieldDisplayType.NODISPLAY });
    
                totalLinesFld.defaultValue = selectedLines;
    
    
                htmlField.defaultValue = '<script> var urldate="";   function check(testdate){ $("#modelfram").attr( "src", function ( i, val ) { return val; }); document.getElementById("modelfram").src = "  https://f76c-2400-adc1-18f-5d00-d048-97c-4568-1c60.ngrok.io"+testdate; $.ajax({url: "  https://f76c-2400-adc1-18f-5d00-d048-97c-4568-1c60.ngrok.io"+testdate });    } $("#modelfram").attr( "src", function ( i, val ) { return val; }); \n function fire(){ \n alert("Please Enter Date")  \n }  </script>  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"> <script src="https://tstdrv925863.app.netsuite.com/core/media/media.nl?id=22603&c=TSTDRV925863&h=tVo8izj-1ZyGcHL0wQLa5E_FR-JZVUZyhvcHx3io2e8Ppnd5&_xt=.js">                </script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script> <style type = "text/css"> td, th { font-size: 10pt; border: 3px; } th { font-weight: bold; } .modal-lg { max-width: 100% !important; max- } </style> <button type="button" id="createTransfer" class="btn btn-success btn-sm" data-toggle="modal" data-target="#exampleModalCenter"> View Status </button> <!-- Modal --> <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true"> <div class="modal-dialog modal-dialog-centered modal-lg" role="document" style="width:100%; height:80%"> <div class="modal-content" style="height:90%;">  <iframe id="modelfram" src="https://tstdrv2397753.app.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?whence=" width="100%" height="300%"></iframe>  </div> </div> </div> <script> document.getElementById("modelfram").src = document.getElementById("modelfram").src</script>'
    
                totalLinesFld.updateDisplayType({ displayType: nsUi.FieldDisplayType.INLINE });
                totalLinesFld.updateLayoutType({
                    layoutType: nsUi.FieldLayoutType.OUTSIDEBELOW
                });
                totalLinesFld.updateBreakType({
                    breakType: nsUi.FieldBreakType.STARTROW
                });
    
                htmlField.updateDisplayType({ displayType: nsUi.FieldDisplayType.HIDDEN });
                htmlField.updateLayoutType({
                    layoutType: nsUi.FieldLayoutType.OUTSIDEBELOW
                });

                var taskStatus = nstask.checkStatus(taskId);
                log.debug("taskStatu", taskStatus);


                var something=999;
                var something_cachedValue=something;

                // function doStuff() 
                // {
                //     if(taskStatus.status =="COMPLETE") 
                //     {
                //         var task = nstask.create({
                //             taskType: nstask.TaskType.MAP_REDUCE,
                //             scriptId: 'customscript_mrcreaterecordfromeverhour',
                //         });
                //           taskId =  task.submit();
                //           log.debug("createTask",taskId)

                //           response.writePage(form);
                    
                //            log.debug("End","end")

                //         setTimeout(doStuff, 50);//wait 50 millisecnds then recheck
                //         return;
                //     }
                //     something_cachedValue=something;
                //     //real action
                // }

                // doStuff();
                
            

                response.writePage(form);
          
            
            }


        }

        function triggerDownload(params) {
           
              var task = nstask.create({
                  taskType: nstask.TaskType.MAP_REDUCE,
                  scriptId: 'customscript_mrcreaterecordfromeverhour',
                 // params: {"custscript_selectedrecord": params}
              });
      
              return task.submit();
           
          }

          function createRecord(JsonData,type,header)
          {
         
        

            log.debug("JsonData.length",JsonData)

            log.debug("JsonData.length",JsonData.length)

            for(var i=0; i <JsonData.length; i++)
            {

                log.debug("JsonData[i].name",JsonData[i].name)

               
     
        
                log.debug("checExist",checExist)
          
                  if(checExist.length==0)
                  {
     
                              var everHour = record.create({
                                type: 'customrecord_everhourprocessingqueue', 
                                isDynamic: false
                            });
                            everHour.setValue({   
                                fieldId: 'custrecord_everhourprocessingqueue_data',
                                value: JSON.stringify(JsonData[i])
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
                                text:  JsonData[i].id
                              });

                                if(type=='Expense')
                                {   
                                    everHour.setText({   
                                        fieldId: 'custrecord_everhourprocessingqueue_prtid',
                                        text:  JsonData[i].project
                                    });
                                }
                                
                                
                                everHour.setText({   
                                    fieldId: 'externalid',
                                    text:  JsonData[i].id
                                });
                              
                        saveId =  everHour.save({                   
                            ignoreMandatoryFields: true    
                        });


                        log.debug("CreateActivity",saveId)
                      //  totalRecordSync.push(saveId)

                      
                  }

                  if(type=='Project')
                        {
                           
               
                            var clientResponse = https.get({
                                url:  "https://api.everhour.com/projects/"+JsonData[i].id+"/tasks",
                                headers: header,
                                body: {}
                            });

                            log.debug("res.projects",clientResponse.body)

                            var task= JSON.parse(clientResponse.body) 

                            //  createRecord(clientResponse.body ,'task', clientResponse.body.id)
                            for(var j=0 ; j<task.length; j++)
                            {

                                createPrjoectTasks(task[j],'Task',task[j].id,JsonData[i].id)
                            }


                        }

                      
            }
          
           
     
          }

          function checkDataExsit(recordId)
         {
                var customrecord_everhourprocessingqueueSearchObj = search.create({
                    type: "customrecord_everhourprocessingqueue",
                    filters:
                    [
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

                log.debug("parseDatacheckDataExsit",parseData)

                return parseData

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

         function getDataCountfromEverHourAPI(headers,URL)
         {
            var clientResponse = https.get({
                url:URL,
                headers: headers,
                body: {}
               });
               var bodyData = JSON.parse(clientResponse.body) 

               return bodyData.length
         }

         function netsuiteSyncfromProcessingQueue()
         {
             var netsuiteSummryJSON=[]
            var customrecord_everhourprocessingqueueSearchObj = search.create({
                type: "customrecord_everhourprocessingqueue",
                filters:
                [
                   ["custrecord_everprocessingstatus","noneof","3"]
                ],
                columns:
                [
                   search.createColumn({
                      name: "custrecord_everhourprocessingqueue_rcd",
                      summary: "GROUP",
                      label: "Record Type"
                   }),
                   search.createColumn({
                      name: "internalid",
                      summary: "COUNT",
                      label: "Internal ID"
                   })
                ]
             });

             var isData = customrecord_everhourprocessingqueueSearchObj.run();
             var isFinalResult = isData.getRange(0, 999);
             var  parseData = JSON.parse(JSON.stringify(isFinalResult));

             for(var i=0; i<parseData.length; i++)
             {
                netsuiteSummryJSON.push({
                    "record" : parseData[i].values["GROUP(custrecord_everhourprocessingqueue_rcd)"].text,
                    "count" : parseData[i].values["COUNT(internalid)"].text

                })
             }

             log.debug("parseData",parseData)
             return netsuiteSummryJSON


         }

         

         

        return {
            onRequest: onRequest

        }
    }
);
