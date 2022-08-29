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

         try
         {
          
            var filters = runtime.getCurrentScript().getParameter({name: "custscript_subsidaryform"});

            log.debug('custscript_subsidaryform', filters)
            log.debug("checck","checkhit")

            return {type: 'search', id:'customsearch1296'}

         }
      catch (e) {

            log.error({
               title:"Error getInput Stage:",details:JSON.stringify(e)
            });

      }

     }

     
     function map(context) {

         try {

             var res = JSON.parse(context.value);
              log.debug("check",res);

              var filters = runtime.getCurrentScript().getParameter({name: "custscript_subsidaryform"});

              log.debug('custscript_subsidaryformfilters', filters)

              var subsidiary   =  res.values.custrecord_everhourprocessingqueue_subsd.value
              var status       =   res.values.custrecord_everprocessingstatus.text
              var netsuiteInternalId =   res.values.custrecord_everhourprocessingqueue_inid
              var everHourTaskId   = res.values.custrecord_everhourprocessigqueue_taskid

              if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Client")
              {
                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data)
                
                log.debug('data', data)
                log.debug('cdataatty', data[0])

                CreateCustomers(data, res.values.custrecord_everhourprocessingqueue_rcrid, res.id ,subsidiary, status, netsuiteInternalId)

              }

             else  if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Team")
             {
                 
                log.debug('custrecord_everhourprocessingqueue_rcrid', res.values.custrecord_everhourprocessingqueue_rcrid)
                log.debug('custrecord_everhourprocessingqueue_rcd', res.values.custrecord_everhourprocessingqueue_rcd)
                log.debug('data', res.values.custrecord_everhourprocessingqueue_data) 

                log.debug('data', res.values.custrecord_everhourprocessingqueue_data) 

                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data) 

                createEmployees(data, res.values.custrecord_everhourprocessingqueue_rcrid,res.id ,subsidiary)

                log.debug('name', data.name) 
             }

           else  if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Project")
             {
                   
              //  log.debug('custrecord_everhourprocessingqueue_rcrid', res.values.custrecord_everhourprocessingqueue_rcrid)
             //   log.debug('custrecord_everhourprocessingqueue_rcd', res.values.custrecord_everhourprocessingqueue_rcd)
               // log.debug('data', res.values.custrecord_everhourprocessingqueue_data) 


                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data) 
                var projectUsers = data.users

                log.debug('data.client',data[0]) 
                log.debug('data.client',data) 

                 if(data.client)
                {
                    var customerName =  getCustomerNameForCreateProjects(data.client)

             
                  //  log.debug("customerName",customerName)
                      if(customerName.length>0)
                      {
                          log.debug("res.values.custrecord_everhourprocessingqueue_prtid", res.values.custrecord_everhourprocessingqueue_rcrid)
                         projectId  = createProjects(data, res.values.custrecord_everhourprocessingqueue_rcrid, res.id, customerName[0].id, customerName[0].values.entityid ,subsidiary,  status, netsuiteInternalId)
                         // var netsuiteProjectInternlID = getproject( res.values.custrecord_everhourprocessingqueue_rcrid)
                             
                        
                         for(var j=0; j<projectUsers.length; j++)
                         {
                            log.debug('projectUser',projectUsers[j]) 
                            var employeeInternalId  =  getEmployeesInternalId(projectUsers[j])
                            log.debug('employeeInternalId+Array'+j,employeeInternalId)
                            log.debug('employeeInternalId+'+j,employeeInternalId[0])
                            employeeInternalId = employeeInternalId[0].id

                              createResourseAllocation(projectId, employeeInternalId ,subsidiary)
                         }
                         

      
                         var projectTasks =  getProjectTasks(res.values.custrecord_everhourprocessingqueue_rcrid)
                        
                             var projecTask
        
                             log.debug("projectTasks.length", projectTasks.length)
                               for(var i=0; i <projectTasks.length; i++)
                               {
                                     log.debug("projectTasks"+i, projectTasks[i].values)
 
                                     projecTask = projectTasks[i].values
                                     taskData = JSON.parse( projecTask.custrecord_everhourprocessingqueue_data)
                                     log.debug("taskData",taskData)
                                     log.debug("projecTask.custrecord_everhourprocessingqueue_rcrid",projecTask.custrecord_everhourprocessingqueue_rcrid)
            
                                      var taskInternalId =  CreateProjectTask(taskData, projectTasks[i].values.custrecord_everhourprocessingqueue_rcrid, projectId, projectTasks[i].id ,subsidiary)

                                    var employeePlannedWork = getProjectTaskSUMPlannedWork(projectId)
                                    log.debug("employeePlannedWork",employeePlannedWork)
                                   // [{"values":{"SUM(plannedwork)":"6","GROUP(projectTaskAssignment.resource)":[{"value":"2358","text":"Jenny"}]}}]
                                    var resourcesAllocation = getResourceAllocation(projectId)
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
                                   //log.debug("netsuiteProjectInternlID",netsuiteProjectInternlID)
            
                               }

                      }
      
                      else
                      {
                          updateErrorProcessQueue(res.id,"Customer not found on Netsuite")
                      }
                }

                else
                {
                    updateErrorProcessQueue(res.id,"Customer not found on ever hour")
                }


                log.debug('name', data.name) 

             }

             
             else  if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Task")
             {

                var netsuiteProject =  getproject(res.values.custrecord_everhourprocessingqueue_prtid)
                if(netsuiteProject.length>0)
                {
                   
                    internalId = netsuiteProject[0].id
                    taskData = JSON.parse(res.values.custrecord_everhourprocessingqueue_data)
                    log.debug('task internalId', internalId) 

                    
                    if(isTaskInPending(res.id))
                    {
                        var taskInternalId =  CreateProjectTask(taskData, res.values.custrecord_everhourprocessingqueue_rcrid, internalId, res.id ,status, netsuiteInternalId)

                        var employeePlannedWork = getProjectTaskSUMPlannedWork(internalId)
                        log.debug("employeePlannedWork",employeePlannedWork)
                       // [{"values":{"SUM(plannedwork)":"6","GROUP(projectTaskAssignment.resource)":[{"value":"2358","text":"Jenny"}]}}]
                        var resourcesAllocation = getResourceAllocation(internalId)
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

                     //   createTimeTracking(taskData, 13072, taskInternalId)
                    }

                }
                else
                {
                    updateErrorProcessQueue(res.id,"Project not found in netsuite")

                }


                 
              }  
              
              else  if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Expense Category")
              {

                 var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data) 
                 log.debug('name', data.name) 

                 createExpenseCategory(data,res.id)
              }
              else if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Expense")
              {
                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data) 
                log.debug('name', data.name) 
                     createExpenseReport(data,res.id,subsidiary)
              }

              else if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Time Sheet")
              {
                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data) 
                log.debug('name', data.name) 
                
                createTimeTracking(data,everHourTaskId, res.id)
              }




         } 

         catch (e) 
         {
            var res = JSON.parse(context.value);
             updateErrorProcessQueue(res.id, JSON.stringify(e))
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }

     

     function CreateCustomers(data,Id,internalId,subsidiary , status, netsuiteInternalId)
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

      }

      else if(status=="Pending")
      {
         everHour = record.create({
            type: 'customer', 
            isDynamic: false
        });
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

     function createEmployees(data,customEverHourId,internalId ,subsidiary)
     {
        var everHour = record.create({
            type: 'employee', 
            isDynamic: false
        });

        everHour.setValue({   
            fieldId: 'entityid',
            value: data.name
        });

        everHour.setValue({   
            fieldId: 'subsidiary',
            value: subsidiary
        });
        everHour.setValue({   
            fieldId: 'custentity_everhourid',
            value: customEverHourId
        });
        everHour.setText({   
            fieldId : 'job',
            text    : data.headline
        });

        //
        saveId =  everHour.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("employeeId",saveId)

        var createUpdateSupportCase = record.load({
            id: internalId,
            type: 'customrecord_everhourprocessingqueue', 
            isDynamic: true
        });

        createUpdateSupportCase.setText({   
            fieldId: 'custrecord_everprocessingstatus',
            text:  'Done'
          });

          saveId =  createUpdateSupportCase.save({                   
            ignoreMandatoryFields: true    
        });

     }

     function createProjects(data,customEverHourId,internalId,customerId,customerName ,subsidiary, status, netsuiteInternalId)
     {
        var everHourProjects
        if(status=="Pending Update")
        {

              var resourcesAllocation = getResourceAllocation(netsuiteInternalId)
               var projectTask  = getnetsuiteProjectTask(netsuiteInternalId)
              log.debug("projecttask", projectTask)


            for(var jx=0; jx<resourcesAllocation.length; jx++)
            {
                log.debug("resourcesAllocation", resourcesAllocation[jx].id)
                record.delete({ type: 'resourceallocation', id: resourcesAllocation[jx].id });
            }
            for(var jx=0; jx<projectTask.length; jx++)
            {
                log.debug("projectTask[jx].id", projectTask[jx].id)
                record.delete({ type: 'projecttask', id: projectTask[jx].id });
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

     function CreateProjectTask(everHourData,customEverHourId,ProjectInternalId,everHourIntenlaiId ,subsidiary ,status, netsuiteInternalId)
     {

       //    log.debug("taskAssignees[i].userId",data.estimate.total)

       var everHourProjects 
       var projectSaveId
       var totalAllocateHours=0 ,assigneeInternalId,parentTaskInternalId=0

       if(status=="Pending Update")
       {

      //  record.delete({ type: 'projecttask', id: netsuiteInternalId });

       }
       
       if(everHourData.parentId)
       {
        parentTaskInternalId =  convertTask_TO_Milestone(everHourData.parentId,everHourIntenlaiId)
       }

        everHourProjects = record.create({
            type: 'projecttask', 
            isDynamic: true
        });

 
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
                    assigneeInternalId =  getEmployeesInternalId(taskAssignees[i].userId)
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
                    everHourProjects.setText({   
                        fieldId: 'lateend',
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
                    if(parentTaskInternalId>0)
                    {
                        everHourProjects.setValue({   
                            fieldId: 'parent',
                            value: parentTaskInternalId
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
     function createTimeTracking(data,everHourTaskId, internalID)
     {
        
       

          var taskAssignees = data.task.assignees[0].userId
          assigneeInternalId =  getEmployeesInternalId(taskAssignees)
          //TODO condition
          assigneeInternalId =  assigneeInternalId[0].id


          taskData   = getTaskInternalID(everHourTaskId)
          //TODO Condition
          projectInternalId  = taskData[0].values.company[0].value
          taskInternalID     = taskData[0].id


         var everHourProjects = record.create({
            type: 'timebill', 
            isDynamic: true
        });

        log.debug("assigneeInternalId",assigneeInternalId)
        everHourProjects.setValue({   
            fieldId: 'employee',
            value  :  assigneeInternalId
        });

        log.debug("(parseInt(data.time) / 3600)",(data.time/ 3600))
        everHourProjects.setValue({   
            fieldId: 'hours',
            value  :  ((data.time) / 3600)
        });
        

        log.debug("projectInternalId",projectInternalId)
        everHourProjects.setValue({   
            fieldId: 'customer',
            value  :  projectInternalId
        });

        log.debug("taskInternalID",taskInternalID)
        everHourProjects.setValue({   
            fieldId: 'casetaskevent',
            value  :  taskInternalID
        });

        everHourProjects.setText({   
            fieldId: 'trandate',
            text  :  "1/10/2022"
        });

        
        projectSaveId =  everHourProjects.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("timetrackingId",projectSaveId)
        

        var createUpdateprocess = record.load({
            id: internalID,
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

     function createExpenseCategory(data,internalId ,subsidiary)
     {


        var createCat = record.create({
            type: 'expensecategory', 
            isDynamic: false
        });

        createCat.setValue({   
            fieldId: 'name',
            value:data.name
        });

        log.debug("checksubs", getAllActiveSubsidiary()) 

        createCat.setValue({   
            fieldId: 'subsidiary',
            value:  getAllActiveSubsidiary()
        });

        
        createCat.setValue({   
            fieldId: 'custrecord_everhour_catid',
            value:data.id
        });

        createExpenseCategpry =  createCat.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("createExpenseCategpry",createExpenseCategpry)

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
            value:  createExpenseCategpry
          });

          saveId =  everHourLoad.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("everHourLoad",saveId)


     }

     function createExpenseReport(data,internalId ,subsidiary)
     {
             if(!data.user)
            {
             updateErrorProcessQueue(internalId,"team not found on ever hour") 
             return
            }

        var employee    =  getEmployeesInternalId(data.user)

        var expenseCat  =  getExpenseCategories(data.category)
        var getProject  =  getproject(data.project)

        log.debug("getEmployeesInternalId",employee)  
        log.debug("getExpenseCategories",expenseCat)   
        log.debug("getproject", getProject )

        if(employee.length==0)
        {
            updateErrorProcessQueue(internalId,"Emplyee not found")
            return
        }
        if(expenseCat.length==0)
        {
            updateErrorProcessQueue(internalId,"Expense Category not found")
            return
        }
        if(getProject.length==0)
        {
            updateErrorProcessQueue(internalId,"Project not found")
            return
        }


        var createCat = record.create({
            type: 'expensereport', 
            isDynamic: true
        });

        createCat.setValue({   
            fieldId: 'entity',
            value: employee[0].id
        });


        log.debug("data.date",data.date)

        var everHourDate = moment(data.date).format("MM/DD/YYYY")
        everHourDate = everHourDate.toString()

        log.debug("everHourDate",everHourDate)

        createCat.setText({   
            fieldId: 'trandate',
            text : everHourDate 
        });


        createCat.setValue({   
            fieldId: 'memo',
            value:data.details
        });

        createCat.selectNewLine({ 
            sublistId: 'expense',
        });
        
        // createCat.setCurrentSublistValue({   
        //     sublistId: 'expense',
        //     fieldId: 'expensedate',
        //     value: 1
        // });

            createCat.setCurrentSublistValue({   
                sublistId: 'expense',
                fieldId: 'category',
                value: expenseCat[0].values.custrecord_everhourprocessingqueue_inid
            });

            createCat.setCurrentSublistValue({   
                sublistId: 'expense',
                fieldId: 'amount',
                value: data.amount
            });

            createCat.setCurrentSublistValue({   
                sublistId: 'expense',
                fieldId: 'customer',
                value: getProject[0].id
            });

            // createCat.setCurrentSublistValue({   
            //     sublistId: 'expense',
            //     fieldId: 'customer',
            //     value: getproject(data.project)[0].id
            // });

            createCat.setCurrentSublistValue({   
                sublistId: 'expense',
                fieldId: 'currency',
                value: 1
            });

            createCat.commitLine({  
                sublistId: 'expense'
            });


        createExpenseCategpry =  createCat.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("createExpenseCategpry",createExpenseCategpry)

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
            value:  createExpenseCategpry
          });

          saveId =  everHourLoad.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("everHourLoad",saveId)


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

     function getCustomerNameForCreateProjects(everhourid)
     {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
               ["stage","anyof","CUSTOMER"], 
               "AND", 
               ["custentity_everhourid","contains",everhourid]
            ],
            columns:
            [
               search.createColumn({
                  name: "entityid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "internalid", label: "internalId"}),
               
            ]
         });

         var isData = customerSearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));

         return parseData
       
     }

     

     function getproject(everHourProjectId)
     {
        var jobSearchObj = search.create({
            type: "job",
            filters:
            [
               ["custentity_everhourid","is",everHourProjectId]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
         });

         var isData = jobSearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));

         return parseData


     }

     function getProjectTasks(everHourProjectID)
     {

        var customrecord_everhourprocessingqueueSearchObj = search.create({
            type: "customrecord_everhourprocessingqueue",
            filters:
            [
               ["custrecord_everhourprocessingqueue_prtid","is",everHourProjectID]
            ],
            columns:
            [
               search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
               search.createColumn({name: "custrecord_everhourprocessingqueue_prtid", label: "ProjectId"}),
               search.createColumn({name: "externalid", label: "External ID"}),
               search.createColumn({name: "custrecord_everhourprocessingqueue_rcd", label: "Record Type"}),
               search.createColumn({name: "custrecord_everhourprocessingqueue_data", label: "Data"}),
               search.createColumn({name: "custrecord_everprocessingstatus", label: "Status"}),
               search.createColumn({name: "custrecord_everhourprocessingqueue_error", label: "Last Error"})
            ]
         });

         var Data = customrecord_everhourprocessingqueueSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData
     }

     function isTaskInPending(taskInternalId)
     {

        var customrecord_everhourprocessingqueueSearchObj = search.create({
            type: "customrecord_everhourprocessingqueue",
            filters:
            [
               ["internalid","anyof",taskInternalId], 
               "AND", 
               ["custrecord_everprocessingstatus","noneof","@NONE@","2","3"]
            ],
            columns:
            [
               search.createColumn({name: "externalid", label: "External ID"}),
            ]
         });
         var isData = customrecord_everhourprocessingqueueSearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));


         if(parseData.length>0)
         {
            return true

         }

         else
         {
             false
         }

         
     }

     function getEmployeesInternalId(everHourId)
     {
        var employeeSearchObj = search.create({
            type: "employee",
            filters:
            [
               ["custentity_everhourid","is",everHourId]
            ],
            columns:
            [
               search.createColumn({name: "entityid", label: "Name"})
            ]
         });

         var Data = employeeSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData
     }

     function getAllActiveSubsidiary()
     {
        var subsidiarySearchObj = search.create({
            type: "subsidiary",
            filters:
            [
               ["isinactive","is","F"],
               "AND", 
               ["iselimination","is","F"]
            ],
            columns:
            [
               search.createColumn({
                  name: "name",
                  sort: search.Sort.ASC,
                  label: "Name"
               })
            ]
         });

         var isData = subsidiarySearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));

         var subsidiaryArray=[]
         for(var i=0; i<parseData.length; i++)
         {
            subsidiaryArray.push(parseData[i].id)
         }

         return subsidiaryArray
     }
     function getExpenseCategories(recordId)
     {
        var customrecord_everhourprocessingqueueSearchObj = search.create({
            type: "customrecord_everhourprocessingqueue",
            filters:
            [
               ["custrecord_everhourprocessingqueue_rcrid","is",recordId], 
               "AND", 
               ["custrecord_everhourprocessingqueue_rcd","anyof","7"]
            ],
            columns:
            [
               search.createColumn({name: "custrecord_everhourprocessingqueue_inid", label: "Netsuite InternalId"})
            ]
         });

         var isData = customrecord_everhourprocessingqueueSearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));

         return parseData

     }

     function getProjectTaskSUMPlannedWork(internalId)
     {

        var projecttaskSearchObj = search.create({
            type: "projecttask",
            filters:
            [
               ["job.internalid","anyof",internalId]
            ],
            columns:
            [
               search.createColumn({
                  name: "plannedwork",
                  summary: "SUM",
                  sort: search.Sort.ASC,
                  label: "Planned Work"
               }),
               search.createColumn({
                  name: "resource",
                  join: "projectTaskAssignment",
                  summary: "GROUP",
                  label: "Resource"
               })
            ]
         });
         var Data = projecttaskSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData


     }
     function getResourceAllocation(projectInternalId)
     {
        var resourceallocationSearchObj = search.create({
            type: "resourceallocation",
            filters:
            [
               ["job.internalid","anyof",projectInternalId]
            ],
            columns:
            [
               search.createColumn({name: "resource", label: "Resource"}),
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
         });

         var Data = resourceallocationSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData

     }

     function getnetsuiteProjectTask(projectId)
     {
        var projecttaskSearchObj = search.create({
            type: "projecttask",
            filters:
            [
               ["job.internalid","anyof",projectId]
            ],
            columns:
            [
               search.createColumn({name: "id", label: "ID"}),
               search.createColumn({name: "title", label: "Name"}),
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
         });

         var Data = projecttaskSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData



     }

     function getTaskInternalID(everHourTaskId)
     {

        var projecttaskSearchObj = search.create({
            type: "projecttask",
            filters:
            [
               ["custevent_everhourid","is",everHourTaskId]
            ],
            columns:
            [
               search.createColumn({name: "company", label: "Project"}),
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
         });

         var Data = projecttaskSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData



     }
     function convertTask_TO_Milestone(everHourId,processQueueInternalId)
     {

         var taskData =  getMileStone(everHourId)
         if(taskData.length==0){return}

         var taskInternalId = taskData[0].id

         var everHourProjects = record.load({
            id: taskInternalId,
            type: 'projecttask', 
            isDynamic: true
           });

        totalLine = everHourProjects.getLineCount({"sublistId": "assignee"})
        for(var i=0; i<totalLine; i++)
        {
          everHourProjects.removeLine({"sublistId": "assignee", "line": 0});
        }

        everHourProjects.setValue({   
            fieldId: 'plannedwork',
            value: 0
        });

            mileStoneSaveId =   everHourProjects.save({                   
                ignoreMandatoryFields: true    
            });

            log.debug("checkmilestone",mileStoneSaveId)

               var createUpdateSupportCase = record.load({
                id: processQueueInternalId,
                type: 'customrecord_everhourprocessingqueue', 
                isDynamic: true
            });

              createUpdateSupportCase.setValue({   
                fieldId: 'custrecord_everhour_parent_task_check',
                value:  true
              });
    
              saveId =  createUpdateSupportCase.save({                   
                ignoreMandatoryFields: true    
            });
        

            return mileStoneSaveId
        


     }
     function getMileStone(everHourId)
     {
        var projecttaskSearchObj = search.create({
            type: "projecttask",
            filters:
            [
               ["ismilestone","is","F"], 
               "AND", 
               ["custevent_everhourid","is",everHourId]
            ],
            columns:
            [
               search.createColumn({name: "title", label: "Name"}),
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({name: "ismilestone", label: "Milestone"})
            ]
         });

         var Data = projecttaskSearchObj.run();
         var FinalResult = Data.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(FinalResult));

         return parseData
     }

     



     return {
         getInputData: getInputData,
         map: map
     };

 });
