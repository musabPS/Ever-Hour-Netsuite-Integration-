/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

 define([ 'N/record','N/search','N/ui/serverWidget'],
    function(nsRecord,search, serverWidget){
        return {
        
        

        beforeLoad : function(context){

            


             if (context.type === context.UserEventType.VIEW) 
             {

                var loadId = context.newRecord;
                var everHourtype

                log.debug("context.newRecord.type",context.newRecord.type)
    
                 var everHourId = loadId.getValue({ fieldId: 'custentity_everhourid'});
    
                 log.debug("everHourId",everHourId)

			 

                if(everHourId)
                {
                    if(context.newRecord.type=="employee")
                    {
                        everHourtype="team"
                    }
                    if(context.newRecord.type=="customer")
                    {
                        everHourtype="clients"
                    }

                    context.form.addButton({
                        id: "custpage_release_retention",
                        label: 'Re Sync from Ever Hour',
                        functionName: 'onclick_syncEverHour("' + everHourId+ '","'+everHourtype+'","'+context.newRecord.id+'")'

                    })

    
                      
    
    
                //    var html =  context.form.addField(
                //           {
                //               id : 'custpage_inlinehtml', 
                //               type : serverWidget.FieldType.INLINEHTML, 
                //               label : 'line Field' 
                //            }
                //           );
    
                //           html.defaultValue = '<style>'
                //           +'.loader {'
                //           +'position: absolute;'
                //           +'left: 50%;'
                //           +'top: 30%;'
                //           +'z-index: 1;'
                //           +'border: 16px solid #f3f3f3;'
                //           +'border-radius: 50%;'
                //           +'border-top: 16px solid #3498db;'
                //           +'width: 120px;'
                //           +'height: 120px;'
                //           +'-webkit-animation: spin 2s linear infinite; /* Safari */'
                //           +'animation: spin 2s linear infinite;'
                //           +'}'
                          
                //           /* Safari */
                //           +' @-webkit-keyframes spin {'
                //             +'0% { -webkit-transform: rotate(0deg); }'
                //             +'100% { -webkit-transform: rotate(360deg); }'
                //             +' }'
                          
                //             +' @keyframes spin {'
                //                 +' 0% { transform: rotate(0deg); }'
                //                 +'100% { transform: rotate(360deg); }'
                //                 +' }'
                //                 +' </style>'
                //                //+'<script>var element = document.getElementById("pageContainer"); \n element.classList.add("loader"); </script>'
    
    
                //   html.defaultValue += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script> <script> var urldate="";   function check(testdate){ $("#modelfram").attr( "src", function ( i, val ) { return val; }); document.getElementById("modelfram").src = "  https://f76c-2400-adc1-18f-5d00-d048-97c-4568-1c60.ngrok.io"+testdate; $.ajax({url: "  https://f76c-2400-adc1-18f-5d00-d048-97c-4568-1c60.ngrok.io"+testdate });    } $("#modelfram").attr( "src", function ( i, val ) { return val; }); \n function fire(){ \n alert("Please Enter Date")  \n }  </script>  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">   <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script> <style type = "text/css"> td, th { font-size: 10pt; border: 3px; } th { font-weight: bold; } .modal-lg { max-width: 100% !important; max- } </style> <button type="button" id="btn_modalopen" class="btn btn-success btn-sm" data-toggle="modal" data-target="#exampleModalCenter" hidden> Ticket Detail </button> <!-- Modal --> <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true"> <div class="modal-dialog modal-dialog-centered modal-lg" role="document" style="width:100%; height:80%"> <div   class="modal-content" style="height:90%;"> <div class="modal-header">'
                //   +'<h5 class="modal-title"></h5>'
                //   +'<h1>Creating Invoice</h1>'
                //   +'<span aria-hidden="true">&times;</span>'
                //   +'</button>'
                //   +'</div>  <div class="modal-body">'
                //   +'<span id="spinner"></span> '
                //   + '</div>   </div> </div> </div> '
    
    
    
                        context.form.clientScriptModulePath= 'SuiteScripts/EverHour/CS_everHourResyncButton.js'
                }
      
            
   
                
            }


      

            

        }
        
        }
    }
);


