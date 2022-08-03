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

         
             // log.debug('values', res.values)

            

              if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Client")
              {
                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data)
                
                log.debug('data', data)
                log.debug('cdataatty', data[0])

                CreateCustomers(data, res.values.custrecord_everhourprocessingqueue_rcrid, res.id)

              }

           else  if(res.values.custrecord_everhourprocessingqueue_rcd.text=="Team")
             {
                 
                log.debug('custrecord_everhourprocessingqueue_rcrid', res.values.custrecord_everhourprocessingqueue_rcrid)
                log.debug('custrecord_everhourprocessingqueue_rcd', res.values.custrecord_everhourprocessingqueue_rcd)
                log.debug('data', res.values.custrecord_everhourprocessingqueue_data) 

                log.debug('data', res.values.custrecord_everhourprocessingqueue_data) 

                var data= JSON.parse(res.values.custrecord_everhourprocessingqueue_data) 

                createEmployees(data, res.values.custrecord_everhourprocessingqueue_rcrid,res.id)

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
                         projectId  = createProjects(data, res.values.custrecord_everhourprocessingqueue_rcrid, res.id, customerName[0].id, customerName[0].values.entityid)
                         // var netsuiteProjectInternlID = getproject( res.values.custrecord_everhourprocessingqueue_rcrid)
                             
                        
                         for(var j=0; j<projectUsers.length; j++)
                         {
                            log.debug('projectUser',projectUsers[j]) 
                            var employeeInternalId  =  getEmployeesInternalId(projectUsers[j])
                            log.debug('employeeInternalId+Array'+j,employeeInternalId)
                            log.debug('employeeInternalId+'+j,employeeInternalId[0])
                            employeeInternalId = employeeInternalId[0].id

                              createResourseAllocation(projectId, employeeInternalId)
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
            
                                      var taskInternalId =  CreateProjectTask(taskData, projectTasks[i].values.custrecord_everhourprocessingqueue_rcrid, projectId, projectTasks[i].id)


                                      createTimeTracking(taskData, projectId, taskInternalId)


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
                    log.debug('task', "task") 
                    internalId = netsuiteProject[0].id
                    taskData = JSON.parse(res.values.custrecord_everhourprocessingqueue_data)


                    
                    if(isTaskInPending(res.id))
                    {
                        var taskInternalId =  CreateProjectTask(taskData, res.values.custrecord_everhourprocessingqueue_rcrid, internalId, res.id)
                        createTimeTracking(taskData, projectId, taskInternalId)
                    }

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
                     createExpenseReport(data,res.id)
              }



         } 

         catch (e) 
         {
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }

     

     function CreateCustomers(data,Id,internalId)
     {


        log.debug("crusrsssinfunction",Id)
        log.debug("internalId",internalId)

        log.debug("data.name",data.name)
      //  log.debug("data.name",data.email[0])


        var everHour = record.create({
            type: 'customer', 
            isDynamic: false
        });

        everHour.setValue({   
            fieldId: 'companyname',
            value: data.name
        });

        everHour.setValue({   
            fieldId: 'subsidiary',
            value: 1
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

     function createEmployees(data,customEverHourId,internalId)
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
            value: 1
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

     function createProjects(data,customEverHourId,internalId,customerId,customerName)
     {

        log.debug("checkcustomerinsidefunction", customerId)
        var everHourProjects = record.create({
            type: 'job', 
            isDynamic: false
        });

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

     function CreateProjectTask(data,customEverHourId,ProjectInternalId,everHourIntenlaiId)
     {

       //    log.debug("taskAssignees[i].userId",data.estimate.total)

        var everHourProjects = record.create({
            type: 'projecttask', 
            isDynamic: true
        });


        var taskAssignees = data.assignees

      
        if(taskAssignees.length>0)
        {

            for(var i=0; i <taskAssignees.length; i++)
            {
             //   log.debug("taskAssignees[i].userId",taskAssignees[i].userId)
                assigneeInternalId =  getEmployeesInternalId(taskAssignees[i].userId)
                assigneeInternalId =  assigneeInternalId[i].id

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

                everHourProjects.commitLine({  
                    sublistId: 'assignee'
                });

            }


        }

        
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

             log.debug("checkprojectsTaskId",saveId)

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
            value:  saveId
          });

          saveId =  createUpdateprocess.save({                   
            ignoreMandatoryFields: true    
        });

        return  projectSaveId

     }
     function createTimeTracking(data, projectInternalId, taskInternalId)
     {
        
          var taskAssignees = data.assignees
         assigneeInternalId =  getEmployeesInternalId(taskAssignees[i].userId)
         assigneeInternalId =  assigneeInternalId[i].id

        var everHourProjects = record.create({
            type: 'timeentry', 
            isDynamic: true
        });

        everHourProjects.setValue({   
            fieldId: 'employee',
            value  :  assigneeInternalId
        });

        everHourProjects.setValue({   
            fieldId: 'hours',
            value  :  (parseInt(data.time.total) / 3600)
        });

        everHourProjects.setValue({   
            fieldId: 'customer',
            value  :  projectInternalId
        });

        everHourProjects.setValue({   
            fieldId: 'casetaskevent',
            value  :  taskInternalId
        });

        
        projectSaveId =  everHourProjects.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("timetrackingId",projectSaveId)
        


     }

     function createResourseAllocation(projectId, employeeInternalId)
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
            fieldId: 'allocationamount',
            value: 1
        });

        resourcesAllocationId =  resourcesAllocation.save({                   
            ignoreMandatoryFields: true    
        });

        log.debug("checkresourcesAllocation",resourcesAllocationId)


     }

     function createExpenseCategory(data,internalId)
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

     function createExpenseReport(data,internalId)
     {

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

         var isData = customrecord_everhourprocessingqueueSearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));

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
               ["custrecord_everprocessingstatus","anyof","1"]
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

         var isData = employeeSearchObj.run();
         var isFinalResult = isData.getRange(0, 999);
         var  parseData = JSON.parse(JSON.stringify(isFinalResult));

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

     



     return {
         getInputData: getInputData,
         map: map
     };

 });
