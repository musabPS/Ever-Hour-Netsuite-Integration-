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

             var res = JSON.parse(context.value);
              log.debug("check",res);

             // log.debug('values', res.values)


             var everHour = record.create({
                type: 'wbs', 
                isDynamic: true
            });
    
            everHour.setValue({   
                fieldId: 'project',
                value: 12672
            });
            everHour.selectNewLine({ 
                sublistId: 'lines',
            });
            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'key',
                value: 1
            });
            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'name',
                value: "Labour"
            });
            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'eac',
                value: 200
            });
            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'eacentered',
                value: 300
            });
            everHour.commitLine({  
                sublistId: 'lines'
            });



            everHour.selectNewLine({ 
                sublistId: 'lines',
            });
            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'parentkey',
                value: 1
            });

            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'serializedamounts',
                value: '[{"key":291,"lineKey":146,"type":"Cost","eac":500,"date":null},{"key":292,"lineKey":146,"type":"Revenue","eac":1000,"date":null}]'
            });

            everHour.setCurrentSublistValue({   
                sublistId: 'lines',
                fieldId: 'name',
                value: "Consultant"
            });
            // var hasSubrecord = everHour.hasCurrentSublistSubrecord({
            //     sublistId: 'lines',
            //     fieldId: 'serializedamounts'
            // });
           // log.debug("checkhasSubRecord",hasSubrecord)

            everHour.commitLine({  
                sublistId: 'lines'
            });


          

        






            saveId =  everHour.save({                   
                ignoreMandatoryFields: true    
            });

            log.debug("everHourLoad",saveId)
    
            





         } 

         catch (e) 
         {
             log.error({title:"MAP Error",details:JSON.stringify(e)});
         }
     }

     

     



     return {
         getInputData: getInputData,
         map: map
     };

 });
