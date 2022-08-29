/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @description This file contains all the saved searches for the project.
 */
 
 define([
   'N/render',
   'N/file',
   'N/search', 
   'N/redirect', 
   'N/url', 
   'N/https',
   'N/record',
   'N/runtime',
   'SuiteScripts/EverHour/lib/moment.min.js',
   'SuiteScripts/EverHour/lib/data_search_lib'
 ], function (render, file, search, redirect, url, https,record,runtime,moment,searchlib){

 
    function updateErrorProcessQueue(internalId,errorMsg)
    {

       var createUpdateSupportCase = record.load({
           id: internalId,
           type: 'customrecord_everhourprocessingqueue', 
           isDynamic: true
       });

       createUpdateSupportCase.setText({   
           fieldId: 'custrecord_everprocessingstatus',
           text:  'Error'
         });

         createUpdateSupportCase.setValue({   
           fieldId: 'custrecord_everhourprocessingqueue_error',
           value:  errorMsg
         });

         saveId =  createUpdateSupportCase.save({                   
           ignoreMandatoryFields: true    
       });

    }

    function createProjects(data,customEverHourId,internalId,customerId,customerName ,subsidiary, status, netsuiteInternalId)
    {

     try
     {
       var everHourProjects
       if(status=="Pending Update")
       {
         log.debug("projecttask", netsuiteInternalId)
             var resourcesAllocation = searchlib.getResourceAllocation(netsuiteInternalId)
              var projectTask  = searchlib.getnetsuiteProjectTask(netsuiteInternalId)
             log.debug("projecttask", projectTask)


           for(var jx=0; jx<resourcesAllocation.length; jx++)
           {
               log.debug("resourcesAllocation", resourcesAllocation[jx].id)
               record.delete({ type: 'resourceallocation', id: resourcesAllocation[jx].id });
           }

           for(var jx=0; jx<projectTask.length; jx++)
           {
               log.debug("projectTask[jx].id", projectTask[jx].id)
              // record.delete({ type: 'projecttask', id: projectTask[jx].id });
           }

           everHourProjects = record.load({
               id: netsuiteInternalId,
               type: 'job', 
               isDynamic: true
            });
       }
      
       else
       {
           everHourProjects   = record.create({
               type: 'job', 
               isDynamic: false
           });
       }
      

       everHourProjects.setValue({   
           fieldId: 'companyname',
           value: data.name
       });

        everHourProjects.setValue({   
           fieldId: 'custentity_customername',
           value: customerName
       });
       
       everHourProjects.setValue({   
           fieldId: 'customer',
           value: customerId
       });

       everHourProjects.setValue({   
           fieldId: 'custentity_everhourid',
           value: customEverHourId
       });
       everHourProjects.setValue({   
           fieldId: 'subsidiary',
           value: subsidiary
       });

       projectSaveId =  everHourProjects.save({                   
           ignoreMandatoryFields: true    
       });

       log.debug("checkprojectssaveid",projectSaveId)

       
       var createUpdateprocess = record.load({
           id: internalId,
           type: 'customrecord_everhourprocessingqueue', 
           isDynamic: true
       });

       createUpdateprocess.setText({   
           fieldId: 'custrecord_everprocessingstatus',
           text:  'Done'
         });

         createUpdateprocess.setValue({   
           fieldId: 'custrecord_everhourprocessingqueue_inid',
           value:  projectSaveId
         });

         saveId =  createUpdateprocess.save({                   
           ignoreMandatoryFields: true    
       });

       log.debug("checkprojects",saveId)

       return projectSaveId
     }

     catch(e)
     {
       updateErrorProcessQueue(internalId, JSON.stringify(e))

     }
      
    }
    function createCustomers(data,Id,internalId,subsidiary , status, netsuiteInternalId)
    {


       log.debug("crusrsssinfunction",Id)
       log.debug("netsuiteInternalId",netsuiteInternalId)

       log.debug("data.name",data.name)
     //  log.debug("data.name",data.email[0])
     var everHour
     if(status=="Pending Update")
     {
       everHour = record.load({
           id: netsuiteInternalId,
           type: 'customer', 
           isDynamic: true
        });
        log.debug("update",status)

     }

     else if(status=="Pending")
     {
        everHour = record.create({
           type: 'customer', 
           isDynamic: false
           
       });

       log.debug("update",status)

     }


     

       everHour.setValue({   
           fieldId: 'companyname',
           value: data.name
       });

       everHour.setValue({   
           fieldId: 'subsidiary',
           value: subsidiary
       });

       everHour.setValue({   
           fieldId: 'entityid',
           value: data.name
       });

           everHour.setValue({  
           fieldId:  'comments',
           value: data.businessDetails
          });


          if( data.defaultTax)
          {
           everHour.setValue({  
               fieldId:  'taxable',
               value: true
              });
   
          }
          if(data.email)
          {
           everHour.setValue({   
               fieldId: 'email',
               value: data.email[0]
           });
          }
         
       

       everHour.setValue({   
           fieldId: 'custentity_everhourid',
           value: Id
       });

       projectSaveId =  everHour.save({                   
               ignoreMandatoryFields: true    
            });

            log.debug("CustomerId",projectSaveId)



            var everHourLoad = record.load({
               id: internalId,
               type: 'customrecord_everhourprocessingqueue', 
               isDynamic: true
            });

            everHourLoad.setText({   
               fieldId: 'custrecord_everprocessingstatus',
               text:  'Done'
             });
             everHourLoad.setValue({   
               fieldId: 'custrecord_everhourprocessingqueue_inid',
               value:  projectSaveId
             });

             saveId =  everHourLoad.save({                   
               ignoreMandatoryFields: true    
           });

           log.debug("everHourLoad",saveId)


    }
    function createResourseAllocation(projectId, employeeInternalId ,subsidiary)
    {

      // log.debug("projectId",projectId)

      // log.debug("employeeInternalId",employeeInternalId)

       var resourcesAllocation = record.create({
           type: 'resourceallocation', 
           isDynamic: false
       });

       
       resourcesAllocation.setValue({   
           fieldId: 'allocationresource',
           value:employeeInternalId
       });

       resourcesAllocation.setValue({   
           fieldId: 'project',
           value: projectId
       });

       resourcesAllocation.setValue({   
           fieldId: 'project',
           value: projectId
       });

       resourcesAllocation.setValue({   
           fieldId: 'allocationtype',
           value: 2
       });

       resourcesAllocation.setValue({   
           fieldId: 'allocationamount',
           value: 1
       });

       resourcesAllocationId =  resourcesAllocation.save({                   
           ignoreMandatoryFields: true    
       });

       log.debug("checkresourcesAllocation",resourcesAllocationId)


    }
    function CreateProjectTask(everHourData,customEverHourId,ProjectInternalId,everHourIntenlaiId ,subsidiary ,status, netsuiteInternalId)
    {

      //    log.debug("taskAssignees[i].userId",data.estimate.total)

      var everHourProjects 
      var projectSaveId
      var totalAllocateHours=0 ,assigneeInternalId

      if(netsuiteInternalId>0)
      {

            var everHourProjects = record.load({
            id: netsuiteInternalId,
            type: 'projecttask', 
            isDynamic: true
           });

        totalLine = everHourProjects.getLineCount({"sublistId": "assignee"})
        for(var i=0; i<totalLine; i++)
        {
          everHourProjects.removeLine({"sublistId": "assignee", "line": 0});
        }
          

      }

      if(netsuiteInternalId==0)
      {
          everHourProjects = record.create({
            type: 'projecttask', 
            isDynamic: true
        });
      }
      

       
      log.debug("netsuiteInternalId",netsuiteInternalId)


        data = everHourData
       
       log.debug("taskAssignees[i].userId",data)
       
       clientInternalId = ""


       if(data.assignees)
       {
           var taskAssignees = data.assignees
           log.debug("taskAssignees[i].userId assignees",data.assignees)
           if(taskAssignees.length>0)
           {
   
               for(var i=0; i <taskAssignees.length; i++)
               {
                //   log.debug("taskAssignees[i].userId",taskAssignees[i].userId)
                   assigneeInternalId =  searchlib.getEmployeesInternalId(taskAssignees[i].userId)
                   log.debug("assigneeInternalId",assigneeInternalId)
                   if(assigneeInternalId.length>0)
                   {

                       assigneeInternalId =  assigneeInternalId[0].id
   
                       everHourProjects.selectNewLine({ 
                           sublistId: 'assignee',
                       });
                       everHourProjects.setCurrentSublistValue({   
                           sublistId: 'assignee',
                           fieldId: 'resource',
                           value: assigneeInternalId
                       });
                       everHourProjects.setCurrentSublistValue({   
                           sublistId: 'assignee',
                           fieldId: 'estimatedwork',
                           value: 1
                       });
       
                       everHourProjects.setCurrentSublistValue({   
                           sublistId: 'assignee',
                           fieldId: 'unitcost',
                           value: 1
                       });
                       
                       everHourProjects.setCurrentSublistValue({   
                           sublistId: 'assignee',
                           fieldId: 'plannedwork',
                           value: 1
                       });
                       
                       everHourProjects.setCurrentSublistValue({   
                           sublistId: 'assignee',
                           fieldId: 'plannedwork',
                           value: 1
                       });
       
                       everHourProjects.commitLine({  
                           sublistId: 'assignee'
                       });
                   }

                   else
                   {
                       updateErrorProcessQueue(everHourIntenlaiId,"Customer not found in netsuite")
                   }
                 

   
               }
   
                       
                  var userObj = runtime.getCurrentUser();
                  var dateFormat = userObj.getPreference({
                                      name: 'DATEFORMAT'
                                   });

                                   

                   var createdAt = moment(data.createdAt).format(dateFormat)
                   createdAt = createdAt.toString()

                   var dueOn = moment(data.dueOn).format(dateFormat)
                   dueOn = dueOn.toString()

                   log.debug("createdAt",createdAt)
                   everHourProjects.setText({   
                       fieldId: 'latestart',
                       text: createdAt
                   });
                   log.debug("dueOn",dueOn)

                   everHourProjects.setText({   
                       fieldId: 'finishbydate',
                       text: dueOn
                   });

                   everHourProjects.setValue({   
                       fieldId: 'title',
                       value:data.name
                   });

                   everHourProjects.setValue({   
                       fieldId: 'company',
                       value:ProjectInternalId
                   });

                   // everHourProjects.setValue({   
                   //     fieldId: 'customer',
                   //     value: customerId
                   // });
                   everHourProjects.setValue({   
                       fieldId: 'custevent_everhourid',
                       value: customEverHourId
                   });

                   if(data.time)
                   {
                       everHourProjects.setValue({   
                           fieldId: 'actualwork',
                           value: (parseInt(data.time.total) / 3600)
                       });
                   }

                   if(data.estimate)
                   {
                       log.debug("data.estimate.total",data.estimate.total)
                       everHourProjects.setValue({   
                           fieldId: 'plannedwork',
                           value: (parseInt(data.estimate.total) / 3600)
                       });

                   }

                   // if(data.dueOn)
                   // {
                   //     log.debug("data.estimate.total",data.estimate.total)
                   //     everHourProjects.setValue({   
                   //         fieldId: 'enddate',
                   //         value: new Date (data.dueOn)
                   //     });

                   // }



                   projectSaveId =  everHourProjects.save({                   
                       ignoreMandatoryFields: true    
                   });

                   var employeePlannedWork = searchlib.getProjectTaskSUMPlannedWork(ProjectInternalId)
                   log.debug("employeePlannedWork",employeePlannedWork)
                   // [{"values":{"SUM(plannedwork)":"6","GROUP(projectTaskAssignment.resource)":[{"value":"2358","text":"Jenny"}]}}]
                    var resourcesAllocation = searchlib.getResourceAllocation(ProjectInternalId)
                    log.debug("resourcesAllocation",resourcesAllocation)
                 //   [{"recordType":"resourceallocation","id":"9298","values":{"resource":[{"value":"2358","text":"Jenny"}],"internalid":[{"value":"9298","text":"9298"}]}}]
                   //   createTimeTracking(taskData, projectId, taskInternalId)



                   for(var ix=0; ix<employeePlannedWork.length; ix++)
                   {

                    for(var jx=0; jx<resourcesAllocation.length; jx++)
                    {

                        if(employeePlannedWork[ix].values["GROUP(projectTaskAssignment.resource)"][0].value == resourcesAllocation[jx].values.resource[0].value)
                        {
                            updateResourceAllocation( resourcesAllocation[jx].id, employeePlannedWork[ix].values['SUM(plannedwork)'])
                            break
                        }

                    }

                    
                   }


                       log.debug("checkprojectsTaskId",projectSaveId)

                   var createUpdateprocess = record.load({
                       id: everHourIntenlaiId,
                       type: 'customrecord_everhourprocessingqueue', 
                       isDynamic: true
                   });

                   createUpdateprocess.setText({   
                       fieldId: 'custrecord_everprocessingstatus',
                       text:  'Done'
                   });

                   createUpdateprocess.setValue({   
                       fieldId: 'custrecord_everhourprocessingqueue_inid',
                       value:  projectSaveId
                   });

                   saveId =  createUpdateprocess.save({                   
                       ignoreMandatoryFields: true    
                   });

                  
           }

           else
           {
               updateErrorProcessQueue(everHourIntenlaiId,"Assignees not found")
           }


       }

       else
       {
           updateErrorProcessQueue(everHourIntenlaiId,"Assignees not found")
       }

       
       return  projectSaveId


    }

    function updateTaskEstimate(responseBody)
    {
      var taskData =  searchlib.getTaskInternalID(responseBody.payload.id)

      if(taskData.length==0)
      {
        return
      }

      log.debug("taskinternalID",taskData)
             projectInternalId = taskData[0].values.company[0].value
             taskinternalId = taskData[0].id

             log.debug("projectInternalID",taskData[0])
            



             var netsuiteProjectTask = record.load({
              id: taskinternalId,
              type: 'projecttask', 
              isDynamic: true
             });

  
             netsuiteProjectTask.setValue({   
              fieldId: 'plannedwork',
              value: responseBody.payload.data.total / 3600
             });


             projectSaveId =  netsuiteProjectTask.save({                   
              ignoreMandatoryFields: true    
          });

          var employeePlannedWork = searchlib.getProjectTaskSUMPlannedWork(projectInternalId)
          log.debug("employeePlannedWork",employeePlannedWork)
          // [{"values":{"SUM(plannedwork)":"6","GROUP(projectTaskAssignment.resource)":[{"value":"2358","text":"Jenny"}]}}]
           var resourcesAllocation = searchlib.getResourceAllocation(projectInternalId)
           log.debug("resourcesAllocation",resourcesAllocation)
        //   [{"recordType":"resourceallocation","id":"9298","values":{"resource":[{"value":"2358","text":"Jenny"}],"internalid":[{"value":"9298","text":"9298"}]}}]
          //   createTimeTracking(taskData, projectId, taskInternalId)



          for(var ix=0; ix<employeePlannedWork.length; ix++)
          {

           for(var jx=0; jx<resourcesAllocation.length; jx++)
           {

               if(employeePlannedWork[ix].values["GROUP(projectTaskAssignment.resource)"][0].value == resourcesAllocation[jx].values.resource[0].value)
               {
                   updateResourceAllocation( resourcesAllocation[jx].id, employeePlannedWork[ix].values['SUM(plannedwork)'])
                   break
               }

           }

           
          }

          log.debug("projectSaveId",projectSaveId)

    }
    function updateTaskTime(responseBody)
    {
      var taskData =  searchlib.getTaskInternalID(responseBody.payload.id)
      log.debug("taskData.length",taskData.length)

      if(taskData.length==0)
      {
        return
      }
      log.debug("responseBody.payload.data.time",responseBody.payload.data.time / 3600)

      taskinternalId = taskData[0].id
      
        var netsuiteProjectTask = record.load({
          id: taskinternalId,
          type: 'projecttask', 
          isDynamic: true
        });


        netsuiteProjectTask.setValue({   
          fieldId: 'actualwork',
          value: responseBody.payload.data.time / 3600
      });


        projectSaveId =  netsuiteProjectTask.save({                   
          ignoreMandatoryFields: true    
      });


    }
    function createTimeTracking(responseBody,processQueueInternalId,timtrackInternalId) 
    {

      log.debug("createTimeTracking",responseBody)

      data = responseBody
      log.debug("createTimeTracking",data)

         var taskAssignees = data.task.assignees[0].userId
         var timeTrack 
         assigneeInternalId =  searchlib.getEmployeesInternalId(taskAssignees)
         if(assigneeInternalId==0)
         {
           return
         }
         log.debug("assigneeInternalId",assigneeInternalId)
         assigneeInternalId =  assigneeInternalId[0].id

         log.debug("assigneeInternalId responseBody.task",data)
         taskData   = searchlib.getTaskInternalID(data.task.id)
         //TODO Condition
         if(taskData.length==0)
         {
           return
         }

         log.debug("responseBody.task",data)
         projectInternalId  = taskData[0].values.company[0].value
         taskInternalID     = taskData[0].id


         if(timtrackInternalId>0)
         {

            timeTrack = record.load({
              id: everHourIntenlaiId,
              type: 'timebill', 
              isDynamic: true
          });

         }
          else if(timtrackInternalId==0)
          {
          timeTrack = record.create({
            type: 'timebill', 
            isDynamic: true
           });
          }
         

       

       log.debug("assigneeInternalId create time",timtrackInternalId)
       timeTrack.setValue({   
           fieldId: 'employee',
           value  :  assigneeInternalId
       });

       log.debug("(parseInt(data.time) / 3600)",(data.time/ 3600))
       timeTrack.setValue({   
           fieldId: 'hours',
           value  :  ((data.time) / 3600)
       });
       

       log.debug("projectInternalId",projectInternalId)
       timeTrack.setValue({   
           fieldId: 'customer',
           value  :  projectInternalId
       });

       log.debug("taskInternalID",taskInternalID)
       timeTrack.setValue({   
           fieldId: 'casetaskevent',
           value  :  taskInternalID
       });

       timeTrack.setText({   
           fieldId: 'trandate',
           text  :  "1/10/2022"
       });

       
       projectSaveId =  timeTrack.save({                   
           ignoreMandatoryFields: true    
       });

       log.debug("timetrackingId",projectSaveId)
       

       var createUpdateprocess = record.load({
           id: processQueueInternalId,
           type: 'customrecord_everhourprocessingqueue', 
           isDynamic: true
       });

       createUpdateprocess.setText({   
           fieldId: 'custrecord_everprocessingstatus',
           text:  'Done'
       });

       createUpdateprocess.setValue({   
           fieldId: 'custrecord_everhourprocessingqueue_inid',
           value:  projectSaveId
       });

       saveId =  createUpdateprocess.save({                   
           ignoreMandatoryFields: true    
       });
       


    }

    function updateTimeTracking(responseBody,processQueueInternalId,timtrackInternalId) 
    {

      log.debug("createTimeTracking",responseBody)

      data = responseBody.data
      log.debug("createTimeTracking",data)

         var taskAssignees = data.task.assignees[0].userId
         var timeTrack 
         assigneeInternalId =  searchlib.getEmployeesInternalId(taskAssignees)
         if(assigneeInternalId==0)
         {
           return
         }
         log.debug("assigneeInternalId updateTimeTracking",assigneeInternalId)
         assigneeInternalId =  assigneeInternalId[0].id

         log.debug("assigneeInternalId responseBody.task updateTimeTracking",data)
         taskData   = searchlib.getTaskInternalID(data.task.id)
         //TODO Condition
         if(taskData.length==0)
         {
           return
         }

         log.debug("responseBody.task updateTimeTracking",data)
         projectInternalId  = taskData[0].values.company[0].value
         taskInternalID     = taskData[0].id


         if(timtrackInternalId>0)
         {

            timeTrack = record.load({
              id: timtrackInternalId,
              type: 'timebill', 
              isDynamic: true
          });

         }
          else if(timtrackInternalId==0)
          {

          timeTrack = record.create({
            type: 'timebill', 
            isDynamic: true
           });

          }
         

       

       log.debug("timtrackInternalId update time trC",timtrackInternalId)
       timeTrack.setValue({   
           fieldId: 'employee',
           value  :  assigneeInternalId
       });

       log.debug("(parseInt(data.time) / 3600)",(data.time/ 3600))
       timeTrack.setValue({   
           fieldId: 'hours',
           value  :  ((data.time) / 3600)
       });
       

       log.debug("projectInternalId",projectInternalId)
       timeTrack.setValue({   
           fieldId: 'customer',
           value  :  projectInternalId
       });

       log.debug("taskInternalID",taskInternalID)
       timeTrack.setValue({   
           fieldId: 'casetaskevent',
           value  :  taskInternalID
       });

       timeTrack.setText({   
           fieldId: 'trandate',
           text  :  "1/10/2022"
       });

       
       projectSaveId =  timeTrack.save({                   
           ignoreMandatoryFields: true    
       });

       log.debug("timetrackingId",projectSaveId)
       

       var createUpdateprocess = record.load({
           id: processQueueInternalId,
           type: 'customrecord_everhourprocessingqueue', 
           isDynamic: true
       });

       createUpdateprocess.setText({   
           fieldId: 'custrecord_everprocessingstatus',
           text:  'Done'
       });

       createUpdateprocess.setValue({   
           fieldId: 'custrecord_everhourprocessingqueue_inid',
           value:  projectSaveId
       });

       saveId =  createUpdateprocess.save({                   
           ignoreMandatoryFields: true    
       });
       


    }

    function updateResourceAllocation(resourcesAllocationId, totalPlannedWork )
     {
       
        var resourceAllocationLoad= record.load({
            id: resourcesAllocationId,
            type: 'resourceallocation', 
            isDynamic: true
        });

        resourceAllocationLoad.setValue({   
            fieldId: 'allocationamount',
            value: totalPlannedWork
        });

        resourcesAllocationId =  resourceAllocationLoad.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("updateAllocateWork",resourcesAllocationId)

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

        return saveId

        /////////////////////////////  Create Record in netsuite Start ////////////////////////////

    //     log.debug("check saveId", saveId)
    //     if(recordType=="Client")
    //     {
    //       helperlib.createCustomers(everHourPayLoadData, everHourPayLoadData.id ,saveId, 1 , "Pending", 1)
    //     }

    //    else if(recordType=="Project")
    //    {
    //     var customerName =  searchlib.getCustomerNameForCreateProjects(everHourPayLoadData.client)

    //      var projectId = helperlib.createProjects(everHourPayLoadData,everHourPayLoadData.id,saveId,customerName[0].id,customerName[0].values.entityid ,1, "Pending", 1)
    //      var projectUsers  = everHourPayLoadData.users

    //      log.debug("projectUsers", projectUsers)
    //      log.debug("projectId", projectId)


    //      for(var j=0; j<projectUsers.length; j++)
    //      {
    //         var employeeInternalId  =  searchlib.getEmployeesInternalId(projectUsers[j])
           
    //         employeeInternalId = employeeInternalId[0].id
           
    //         helperlib.createResourseAllocation(projectId, employeeInternalId ,1)
    //      }

    //    }

    //    else if(recordType=="Time Sheet")
    //    {
    //     log.debug("recordType", recordType)

    //    // createTimeTracking(responseBody, internalID,processQueueInternalId) 

    //     helperlib.createTimeTracking(everHourPayLoadData,saveId,0) 
    //    }

    //   //  else if(recordType=="Task")
    //   //  {
    //   //    if(everHourPayLoadData.assignees)
    //   //    {
    //   //     var ProjectInternalId = searchlib.getProjectInternalId(everHourPayLoadData.projects[0])
    //   //     log.debug("ProjectInternalId", ProjectInternalId)
    //   //     if(ProjectInternalId.length>0)
    //   //     {
    //   //       //helperlib.CreateProjectTask(everHourPayLoadData, everHourPayLoadData.id, ProjectInternalId[0].id, saveId ,"Pending", 0)
    //   //     }
    //   //     else
    //   //     {
    //   //       helperlib.updateErrorProcessQueue(saveId,"Project not found in Netsuite")
    //   //     }
    //   //    }
           
    //   //  }

        


      }



    return {
        updateErrorProcessQueue  : updateErrorProcessQueue,
        createProjects           : createProjects,
        createCustomers          : createCustomers,
        createResourseAllocation : createResourseAllocation,
        CreateProjectTask        : CreateProjectTask,
        updateTaskEstimate       : updateTaskEstimate,
        updateTaskTime           : updateTaskTime,
        createTimeTracking       : createTimeTracking,
        updateTimeTracking       : updateTimeTracking,
        createProcessQueue       : createProcessQueue
      
    }
});