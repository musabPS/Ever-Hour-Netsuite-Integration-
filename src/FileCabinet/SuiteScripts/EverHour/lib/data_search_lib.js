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
   'SuiteScripts/EverHour/lib/moment.min.js'
 ], function (render, file, search, redirect, url, https,moment){

 
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
    function getProjectInternalId(everHourProjectId)
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
    function getProjectTaskSUMPlannedWork(projectInternalId)
    {

       var projecttaskSearchObj = search.create({
           type: "projecttask",
           filters:
           [
              ["job.internalid","anyof",projectInternalId]
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
    function getProcessessQueueStatus(externalID)
    {
      var customrecord_everhourprocessingqueueSearchObj = search.create({
         type: "customrecord_everhourprocessingqueue",
         filters:
         [
            ["externalid","anyof",externalID]
         ],
         columns:
         [
            search.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
            search.createColumn({name: "custrecord_everprocessingstatus", label: "Status"})
         ]
      });

      var Data = customrecord_everhourprocessingqueueSearchObj.run();
      var FinalResult = Data.getRange(0, 999);
      var  parseData = JSON.parse(JSON.stringify(FinalResult));


      return parseData
    }
    function getPendingProcessQueue()
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
        getCustomerNameForCreateProjects : getCustomerNameForCreateProjects,
        getResourceAllocation : getResourceAllocation,
        getnetsuiteProjectTask : getnetsuiteProjectTask,
        getEmployeesInternalId : getEmployeesInternalId,
        getProjectInternalId : getProjectInternalId,
        getProjectTaskSUMPlannedWork : getProjectTaskSUMPlannedWork,
        getTaskInternalID : getTaskInternalID,
        getProcessessQueueStatus : getProcessessQueueStatus,
        getPendingProcessQueue    : getPendingProcessQueue
    }
});