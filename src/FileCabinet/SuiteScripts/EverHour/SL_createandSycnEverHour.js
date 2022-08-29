/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */


 define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/format', 'N/task','N/https','N/runtime'],
 function (nsUi, record, redirect, search, nsFormat, nstask,https,runtime) {

     var totalRecordSync =["externalid","anyof"]

     var everHourRecordIdArray= []


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


         var subsidiary = form.addField({
             id: "custfield_subsidiary",
              label: "subsidiary",
              type: nsUi.FieldType.SELECT,
              source: "subsidiary",
             
          });
          subsidiary.isMandatory = true 

         form.addSubmitButton({
             label: 'Sync Ever Hour Data'
         });

                  //form.clientScriptModulePath = 'SuiteScripts/EverHour/CS_ForSuiteletsyncEverHour.js';

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
            
            // var itm_id = sublist.addField({
            //  id : 'custpage_tobesync',
            //  label : 'Record to be sync',
            //  type : nsUi.FieldType.TEXT
            // });

         //    var itm_id = sublist.addField({
         //     id : 'custpage_error',
         //     label : 'Error',
         //     type : nsUi.FieldType.TEXT
         //    });
            
            
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

                     // var checkSublist = form.getSublistField({ sublistId: 'sublist',
                     //     fieldId: 'custpage_check',
                     //     line: 3 });

                     //     checkSublist.isDisabled = true;
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

                 sublist.setSublistValue({
                     id : 'custpage_item',
                     line : 2,
                     value : "Single Time Entry"
                     });

            }

             selectedRecord=[]
             var everHourToken = search.lookupFields({type: 'customrecord_everhourtokenset', id: 1, columns: "custrecord_everhour_tokenid"});

    var headers = {};


    headers["X-Api-Key"] = everHourToken.custrecord_everhour_tokenid
         
       var netsuiteSummary = 0

       if(param.phase==1)
       {
         netsuiteSummary = netsuiteSyncfromProcessingQueue()
         log.debug("checksummary",netsuiteSummary)

         recordStatus.push({
             'record' : 'Client',
             'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/clients"),
             'netsuiteCount'    :  netsuiteSummary.filter(function (el) {return el.record == "Client"}).length>0 ? netsuiteSummary.filter(function (el) {return el.record == "Client"})[0].count : 0
         })
        

         recordStatus.push({
             'record' : 'Team',
             'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/team/users"),
             'netsuiteCount'    : netsuiteSummary.filter(function (el) {return el.record == "Team"}).length>0 ? netsuiteSummary.filter(function (el) {return el.record == "Team"})[0].count : 0
         })
         

         recordStatus.push({
             'record' : 'Project',
             'everHourCount'    : getDataCountfromEverHourAPI(headers,"https://api.everhour.com/projects"),
             'netsuiteCount'    : netsuiteSummary.filter(function (el) {return el.record == "Project"}).length>0 ? netsuiteSummary.filter(function (el) {return el.record == "Project"})[0].count : 0
         })

       }



       
         if(netsuiteSummary.length>0)
         {
            //  sublist.setSublistValue({
            //      id : 'custpage_tobesync',
            //      line : 0,
            //      value : recordStatus[0].everHourCount -  recordStatus[0].netsuiteCount
            //      });  

            //   sublist.setSublistValue({
            //      id : 'custpage_tobesync',
            //      line : 1,
            //      value : recordStatus[1].everHourCount -  recordStatus[1].netsuiteCount
            //      });  

            //  sublist.setSublistValue({
            //      id : 'custpage_tobesync',
            //      line : 2,
            //       value : recordStatus[2].everHourCount -  recordStatus[2].netsuiteCount
            //      });  
         }
         


         log.debug("checkAllJSON",recordStatus)


         sublist.addMarkAllButtons(); 
         

         response.writePage(form);

     }


     function postHandler(request, response, params)
      {
        // var selectedLines = genlib.getSelectedLines(request,posting_period,subsidiary,project);
        ///// log.debug('selectedLines Post', selectedLines);

        log.debug("contextrequestbody",request.body)
        log.debug("contextrequestbody",params)


         var totalLines = request.getLineCount({ group: 'sublist' });
        

         everHourRecordIdArray = checkDataExsitArry()
         log.debug('everHourRecordIdArray', everHourRecordIdArray);


         selectedLines = 0
         selectedRecord=[]
                  var everHourToken = search.lookupFields({type: 'customrecord_everhourtokenset', id: 1, columns: "custrecord_everhour_tokenid"});
                  log.debug("params.custfield_subsidiary",params.custfield_subsidiary)


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
                            createRecord(bodyData,"Client",headers,params.custfield_subsidiary)
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
                            createRecord(bodyData,"Team",headers,params.custfield_subsidiary)

               
                       }

                       if(recordName=="Project")
                       {


                         // var clientResponse = https.get({
                         //     url:"https://api.everhour.com/clients",
                         //     headers: headers,
                         //     body: {}
                         //    });
                         //    log.debug("recordName",recordName)
                         //    var bodyData = JSON.parse(clientResponse.body) 
                         //    log.debug("clientResponse.body", JSON.parse(clientResponse.body) )
                         //    createRecord(bodyData,"Client",headers)
                  
                         
                             var projectResponse = https.get({
                                 url:"https://api.everhour.com/projects",
                                 headers: headers,
                                 body: {}
                             });

                            log.debug("recordName",recordName)
                            var bodyData = JSON.parse(projectResponse.body) 
                            log.debug("teamResponse.body", JSON.parse(projectResponse.body) )

                            createRecord(bodyData,"Project",headers,params.custfield_subsidiary)
               
                       }

                       if(recordName=="Task")
                       {
                                 //    var projects = getAllProjectsForTasks()

                                 //    log.debug("getAllProjectsForTasks",projects[0].values.custrecord_everhourprocessingqueue_rcrid)

                                 //    for(var i=0; i<projects.length; i++)
                                 //    {
                                        
                                 //         var clientResponse = https.get({
                                 //             url:  "https://api.everhour.com/projects/"+projects[i].values.custrecord_everhourprocessingqueue_rcrid+"/tasks",
                                 //             headers: headers,
                                 //             body: {}
                                 //         });

                                 //         log.debug("res.projectsclientResponse.body",clientResponse.body)

                                 //         var task= JSON.parse(clientResponse.body) 

                                 //         //  createRecord(clientResponse.body ,'task', clientResponse.body.id)
                                 //         for(var j=0 ; j<task.length; j++)
                                 //         {

                                 //             createPrjoectTasks(task[j],'Task',task[j].id,projects[0].values.custrecord_everhourprocessingqueue_rcrid ,params.custfield_subsidiary)
                                 //         }

                                 //    }
                         
               
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

                       if(recordName=="Single Time Entry")
                       {

                         var projectResponse = https.get({
                             url:"https://private-anon-49f6c906e2-everhour.apiary-proxy.com/team/time",
                             headers: headers,
                             body: {}
                         });

                        log.debug("recordName",recordName)
                        var bodyData = JSON.parse(projectResponse.body) 
                        log.debug("teamResponse.body", JSON.parse(projectResponse.body) )
                        createRecord(bodyData,"Time Sheet",headers)

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
             log.debug("params.custfield_subsidiary",params.custfield_subsidiary)

             var taskId = triggerDownload(selectedRecord,params.custfield_subsidiary);

             log.debug("taskID(triggerDownload)",taskId)

                 var form = nsUi.createForm({
                     title: 'Syncing Data From Ever Hour'
                 });
              //   genlib.showPostForm(form, queueId, taskId, selectedLines.length);
                 form.clientScriptModulePath = 'SuiteScripts/EverHour/CS_ForSuiteletsyncEverHour.js';

                 var sublist = form.addSublist({
                     id : 'sublist',
                     type : nsUi.SublistType.LIST,
                     label : 'Ever Hour Data Sync'
                    });


                    
                 //    var check = sublist.addField({
                 //     id : 'custpage_check',
                 //     label : 'Check',
                 //     type : nsUi.FieldType.CHECKBOX
                 //    });
                 //    check.updateDisplayType({displayType: nsUi.FieldDisplayType.ENTRY});
                    
                   

                    var itm_id = sublist.addField({
                     id : 'custpage_record_id',
                     label : 'Ever Hour Id',
                     type : nsUi.FieldType.TEXT
                    });


                    var itm_id = sublist.addField({
                     id : 'custpage_name',
                     label : 'Name',
                     type : nsUi.FieldType.TEXT
                    });
                    var itm_id = sublist.addField({
                     id : 'custpage_record_name',
                     label : 'Record Type',
                     type : nsUi.FieldType.TEXT
                    });

                    var itm_id = sublist.addField({
                     id : 'custpage_status',
                     label : 'Status',
                     type : nsUi.FieldType.TEXT
                    });

                    var itm_id = sublist.addField({
                     id : 'custpage_error',
                     label : 'Netsuite Link',
                     type : nsUi.FieldType.TEXT
                    });

                   
                    if(totalRecordSync.length>2)
                    {
                     log.debug("totalRecordSync",totalRecordSync)
                     var getDataSync = getProcessessQueue(totalRecordSync)
                     for(var i=0; i<getDataSync.length; i++)
                     {
                        sublist.setSublistValue({
                            id : 'custpage_record_id',
                            line : i,
                            value : getDataSync[i].values.custrecord_everhourprocessingqueue_rcrid
                            });

                            var name 
                            if(!getDataSync[i].values.custrecord_everhourprocessingqueue_recor)
                            {
                                name="-"
                            }
                            else
                            {
                                name = getDataSync[i].values.custrecord_everhourprocessingqueue_recor
                            }

                            sublist.setSublistValue({
                             id : 'custpage_name',
                             line : i,
                             value : name
                             });


                            sublist.setSublistValue({
                                id : 'custpage_record_name',
                                line : i,
                                value : getDataSync[i].values.custrecord_everhourprocessingqueue_rcd[0].text
                            });
                            sublist.setSublistValue({
                             id : 'custpage_status',
                             line : i,
                             value : getDataSync[i].values.custrecord_everprocessingstatus[0].text
                         });
                         sublist.setSublistValue({
                             id : 'custpage_error',
                             line : i,
                             value : "-"
                         });


                     }
                    }
                   

                //  log.debug("checkClients",getDataSync)


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
         else
         {
             triggerDownload(params,1)
             response.writePage("No data found to be sync but script start executing to crete a pending record Please check the log");
         }


     }

     function triggerDownload(params,custfield_subsidiary) {
        
           var task = nstask.create({
               taskType: nstask.TaskType.MAP_REDUCE,
               scriptId: 'customscript_mrcreaterecordfromeverhour',
               params: {"custscript_subsidaryform": custfield_subsidiary}
           });
         
   
           return task.submit();
        
       }

       function createRecord(JsonData,type,header,subsidiary)
       {
      
          // log.debug("everHourRecordIdArray",everHourRecordIdArray)

         for(var i=0; i <JsonData.length; i++)
         {

          //   log.debug("JsonData[i]"+i,JsonData[i])

             if(JsonData[i].status=="archived")
             {
                 log.debug("JsonData[i].namearchived",JsonData[i])
                 continue
             }
          //   checExist = checkDataExsit(JsonData[i].id)
     
     
           //  log.debug("JsonData[i]"+JsonData[i].id,everHourRecordIdArray.indexOf(JsonData[i].id+""))
             // if(everHourRecordIdArray.indexOf(JsonData[i].id) !== -1)
               if(everHourRecordIdArray.indexOf(type+"_"+JsonData[i].id)== -1)
               {
                 log.debug("JsonData[i]-1111"+JsonData[i].id,everHourRecordIdArray.indexOf(JsonData[i].id+""))

                           var everHour = record.create({
                             type: 'customrecord_everhourprocessingqueue', 
                             isDynamic: false
                         });
                         everHour.setValue({   
                             fieldId: 'custrecord_everhourprocessingqueue_data',
                             value: JSON.stringify(JsonData[i])
                         });
       
                         if(type=='Expense')
                         {   
                             everHour.setText({   
                                 fieldId: 'custrecord_everhourprocessingqueue_prtid',
                                 text:  JsonData[i].project
                             });
                             everHour.setValue({   
                                 fieldId: 'custrecord_everhourprocessingqueue_recor',
                                 value: JsonData[i].details
                             });
                         }

                         else if(type=="Time Sheet")
                         {

                             everHour.setText({   
                                 fieldId: 'custrecord_everhourprocessigqueue_taskid',
                                 text:  JsonData[i].task.id
                             });
                             
                             everHour.setValue({   
                                 fieldId: 'custrecord_everhourprocessingqueue_recor',
                                 value: JsonData[i].task.name
                             });


                         }
                         else
                         {
                             everHour.setValue({   
                                 fieldId: 'custrecord_everhourprocessingqueue_recor',
                                 value: JsonData[i].name
                             });


                         }
                        

                         everHour.setValue({  fieldId: 'custrecord_everhourprocessingqueue_subsd',  
                          value:  subsidiary 
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


                             everHour.setText({   
                                 fieldId: 'externalid',
                                 text:  type+"_"+JsonData[i].id
                             });


                           
                     saveId =  everHour.save({                   
                         ignoreMandatoryFields: true    
                     });

                     everHourRecordIdArray.push( type+"_"+JsonData[i].id)

                     totalRecordSync.push( type+"_"+JsonData[i].id)


                     log.debug("CreateActivity"+"--"+type+"_"+saveId)
                   //  totalRecordSync.push(saveId)

                   if(type == 'Project')
                   {
                      
                       log.debug("res.projectsJsonData[i]","https://api.everhour.com/projects/"+JsonData[i].id+"/tasks")
                       var clientResponse = https.get({
                           url:  "https://api.everhour.com/projects/"+JsonData[i].id+"/tasks",
                           headers: header,
                           body: {}
                       });

                       

                       var task= JSON.parse(clientResponse.body) 

                       //  createRecord(clientResponse.body ,'task', clientResponse.body.id)
                       for(var j=0 ; j<task.length; j++)
                       {
                           log.debug("res.projects in Project for task",task)

                           createPrjoectTasks(task[j],'Task',task[j].id,JsonData[i].id,subsidiary)
                       }


                   }

                   
               }

              

                   
         }
       
         var scriptObj = runtime.getCurrentScript();
         log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());
  
       }

       function checkDataExsit(recordId)
      {
             var customrecord_everhourprocessingqueueSearchObj = search.create({
                 type: "customrecord_everhourprocessingqueue",
                 filters:
                         [
                             ["custrecord_everhourprocessingqueue_rcrid","is",recordId]
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

      function checkDataExsitArry()
         {
             var dataAarry=[]
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

             for(var i=0; i<parseData.length; i++)
             {
                 // parseData = 
                 dataAarry.push(parseData[i].values.externalid[0].text)
             }
             return dataAarry

         }

      function createPrjoectTasks(JsonData,type,recordId,projectId,subsidiary)
      {
 
      // var isExist= checkDataExsit(recordId)
 
       log.debug("isExist in task function",projectId)
 
       if(everHourRecordIdArray.indexOf(type+"_"+recordId.toString())== -1)
       {
                 var everHour = record.create({
                   type: 'customrecord_everhourprocessingqueue', 
                   isDynamic: false
               });
               everHour.setValue({   
                   fieldId: 'custrecord_everhourprocessingqueue_data',
                   value: JSON.stringify(JsonData)
               });

               everHour.setValue({   
                 fieldId: 'custrecord_everhourprocessingqueue_recor',
                 value: JsonData.name
             });

                
 
 
               everHour.setValue({  fieldId: 'custrecord_everhourprocessingqueue_subsd',  
               value: subsidiary
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

                 log.debug("isExist task before set in externalid",recordId)
                 everHour.setText({   
                   fieldId: 'externalid',
                   text:  type+"_"+recordId
                 });

                 if(JsonData.parentId)
                {
                    everHour.setValue({   
                        fieldId: 'custrecord_everhour_parent_task_id',
                        value: JsonData.parentId
                    });

                }


               
                 saveId =  everHour.save({                   
                     ignoreMandatoryFields: true    
                 });
 
                 log.debug("CreateActivity--"+'Task',type+"_"+recordId)
                 everHourRecordIdArray.push(type+"_"+recordId)

                 totalRecordSync.push(type+"_"+recordId)
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

            log.debug("bodyData",clientResponse)
            if(clientResponse.code==200)

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

          var Data = customrecord_everhourprocessingqueueSearchObj.run();
          var FinalResult = Data.getRange(0, 999);
          var  parseData = JSON.parse(JSON.stringify(FinalResult));


          for(var i=0; i<parseData.length; i++)
          {
             netsuiteSummryJSON.push({
                 "record" : parseData[i].values["GROUP(custrecord_everhourprocessingqueue_rcd)"][0].text,
                 "count" : parseData[i].values["COUNT(internalid)"]

             })
          }

          log.debug("parseData",parseData)
          return netsuiteSummryJSON


      }
      function getAllProjectsForTasks()
      {
         var customrecord_everhourprocessingqueueSearchObj = search.create({
             type: "customrecord_everhourprocessingqueue",
             filters:
             [
                ["custrecord_everhourprocessingqueue_rcd","anyof","3"]
             ],
             columns:
             [
                search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"})
             ]
          });

          var Data = customrecord_everhourprocessingqueueSearchObj.run();
          var FinalResult = Data.getRange(0, 999);
          var  parseData = JSON.parse(JSON.stringify(FinalResult));

          return parseData

      }
      function getProcessessQueue(filter)
      {
          var filters =[]
          filters.push(filter)
         var customrecord_everhourprocessingqueueSearchObj = search.create({
             type: "customrecord_everhourprocessingqueue",
             filters:filters,
             columns:
             [
                search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_rcd", label: "Record Type"}),
                search.createColumn({name: "custrecord_everprocessingstatus", label: "Status"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_error", label: "Last Error"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_inid", label: "Netsuite InternalId"}),
                search.createColumn({name: "custrecord_everhourprocessingqueue_recor", label: "Record Name"})


             ]
          });

          var Data = customrecord_everhourprocessingqueueSearchObj.run();
          var FinalResult = Data.getRange(0, 999);
          var  parseData = JSON.parse(JSON.stringify(FinalResult));

          return parseData

      }
      


     return {
         onRequest: onRequest

     }
 }
);
