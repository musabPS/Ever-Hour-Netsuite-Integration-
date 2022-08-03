/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */

 define(['N/ui/dialog','N/record','N/https'],
    function(dialog,record,https){
        return {

            validateLine : function(context){
                // var currentRecord = context.currentRecord;
                // var sublistName = context.sublistId;
                // if (sublistName === 'item')
                //     if (currentRecord.getCurrentSublistValue({
                //             sublistId: sublistName,
                //             fieldId: 'rate'
                //         })){
                //             currentRecord.setCurrentSublistValue({
                //                 sublistId: sublistName,
                //                 fieldId: 'custcol_line_type',
                //                 value: 'revenue'
                //             });
                //         }
                //         else{
                //             currentRecord.setCurrentSublistValue({
                //                 sublistId: sublistName,
                //                 fieldId: 'custcol_line_type',
                //                 value: 'cost'
                //             });
                //         }
                       
                // return true;
            },

            onclick_syncEverHour : function(context,type,internalId){



                console.log("chesds",context+"-"+type,"="+internalId)

   
                var headers = {
               
                };
    
                headers["X-Api-Key"]="6cd4-891e-b826b6-5c3f33-7eebf1f7"
    
               var clientResponse = https.get({
                  url:"https://api.everhour.com/clients/"+parseInt(context),
                  headers: headers,
                  body: {}
              });

              

              clientResponse = JSON.parse(clientResponse.body) 
              console.log("clientResponse",clientResponse)


              var createUpdateSupportCase = record.load({
                id: internalId,
                type: 'customer', 
                isDynamic: true
             });

             createUpdateSupportCase.setValue({   
                fieldId: 'companyname',
                value:  clientResponse.name
              });

              createUpdateSupportCase.setValue({   
                fieldId: 'email',
                value:  clientResponse.email
              });

              saveId =  createUpdateSupportCase.save({                   
                ignoreMandatoryFields: true    
            });

            console.log("clientResponse",clientResponse)
            location.reload();
  
            //     function load()
            //     {
            //         var element = document.getElementById("spinner")
            //         element.classList.add("loader")
            //         // start loader//
            //         var modalButton = document.getElementById("btn_modalopen");
            //         modalButton.click();

            //         return true
            //     }

            


            //  if(load())
            //  {
            //     setTimeout(function() { createInvoice(); }, 1000)
            
            //  }



          

         
            


            }







        }
    }

   
);

