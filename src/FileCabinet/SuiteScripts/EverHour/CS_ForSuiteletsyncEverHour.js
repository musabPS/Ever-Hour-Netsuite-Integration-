/** 
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope public 
 */


define(['N/currentRecord', 'N/record', 'N/url', 'N/format', 'N/ui/message', 'N/ui/dialog', 'N/search',],
	function (nsCurrentRec, nsRecord, nsUrl, nsFormat, nsMessage, nsDialog, nsSearch) {

		var Processing_Text = 'Processing';
		var suiteletName = '';

		function pageInit(context) {

			try {

				window.onbeforeunload = null;

				suiteletName = document.getElementsByClassName('uir-record-type')[0].textContent;

				console.log("suiteletName: ", suiteletName);


					var currentRec = context.currentRecord;
					//var queueId = currentRec.getValue({ fieldId: 'custpage_queueid' });
					var taskIdFld = currentRec.getField({ fieldId: 'custpage_taskid' });
					var taskId = currentRec.getValue({ fieldId: 'custpage_taskid' });
					var totalLine = currentRec.getValue({ fieldId: 'custpage_totalline' });

					addCustomListeners();


					if (!!taskId) 
                    {
						var message = showMessage()
						checkStatus(message);
					}
			      	else
                    {
						var message = showErrorMessage();
						nsRecord.delete({ type: 'customrecord_construct_processing_queue', id: queueId })
					}

				
			}
			catch (e) 
            {

				console.log('Error::pageInit', e);
				log.error('Error::pageInit', e);

			}
		}


		function saveRecord(context) {
			try {
				suiteletName = document.getElementsByClassName('uir-record-type')[0].textContent;

				console.log("suiteletName: ", suiteletName);

				if (suiteletName != 'Profit Loss Report') {
					var currentRec = context.currentRecord;
					var selectedLines = hasSelectedLines(currentRec);

					if (selectedLines.length == 0) {
						alert('Please select at least one record to process');
						//set custpage_delete to false whenever returning false.
						setFieldValue(currentRec, 'custpage_delete', false);
						return false;
					}
				}

			}
			catch (e) {
				console.error('Error::saveRecord', e);
				log.error('Error::saveRecord', e);
			}

			return true;
		}

		function fieldChanged(context) {
			var currentRec = context.currentRecord;
			var sublistId = context.sublistId;
			var fieldId = context.fieldId;
			var line = context.line;



			try {
				if (!!sublistId) {
					log.audit("sublist");
					if (fieldId == 'custpage_select') {
						currentRec.selectLine({
							sublistId: sublistId,
							line: line
						});
						var isLineSelected = currentRec.getCurrentSublistValue({
							sublistId: sublistId,
							fieldId: 'custpage_select'
						});

						log.audit("isLineSelected", isLineSelected);

						(isLineSelected == true || isLineSelected == 'T') ?
							updateSelectedCount(currentRec, 1) : updateSelectedCount(currentRec, -1)
					}
				}

				else if (!sublistId) {
					var url = getSuiteletURL();

					var urlArray = [url];

					if (fieldId == 'custpage_fromdate' || fieldId == 'custpage_todate') {
						// var asofdate = currentRec.getValue({fieldId: 'custpage_asofdate'});
						var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
						var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });
						var subsidiary = currentRec.getValue({ fieldId: 'custpage_subsidiary' });
						var project = currentRec.getValue({ fieldId: 'custpage_project' });

						var shouldRedirect = false;
						//  if (!!asofdate) {
						// 	 urlArray.push('asofdate=' + asofdate)
						// 	 urlArray.push('setdefaultdate=' + 'F')
						// 	 hasToRedirect = true
						//  } 

						if (!!fromDate && !!toDate) {
							urlArray.push('subsidiary=' + subsidiary)
							urlArray.push('project=' + project)
							urlArray.push('setdefaultdate=' + 'F')
							passDateFilters(currentRec, urlArray);
							redirect(urlArray);
						}

						if (!fromDate && !toDate && hasToRedirect) {
							redirect(urlArray)
						}

					}
					else if (fieldId == 'custpage_subsidiary') {

						var subsidiary = currentRec.getValue({ fieldId: fieldId });
						var project = currentRec.getValue({ fieldId: 'custpage_project' });
						var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
						var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });

						var hasDates = !!fromDate && !!toDate
						var hasToRedirect = true

						if (!!subsidiary) {
							urlArray.push('subsidiary=' + subsidiary)
							urlArray.push('project=' + project)
							urlArray.push('setdefaultdate=' + 'F')
						}
						else {
							urlArray.push('project=' + project) //testing
						}

						passDateFilters(currentRec, urlArray);
						if (!!urlArray && hasToRedirect) {
							redirect(urlArray);
						}

					}
					else if (fieldId == 'custpage_project') {

						var project = currentRec.getValue({ fieldId: fieldId });
						var subsidiary = currentRec.getValue({ fieldId: 'custpage_subsidiary' });
						var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
						var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });

						var hasDates = !!fromDate && !!toDate
						var hasToRedirect = true

						if (!!project) {
							urlArray.push('project=' + project)
							urlArray.push('subsidiary=' + subsidiary)
							urlArray.push('setdefaultdate=' + 'F')
						}
						else {
							urlArray.push('subsidiary=' + subsidiary) //testing
						}

						passDateFilters(currentRec, urlArray);
						if (!!urlArray && hasToRedirect) {
							redirect(urlArray);
						}

					}
					else if (fieldId == 'custpage_page') {
						var page = currentRec.getText({ fieldId: fieldId });
						var startindex = currentRec.getValue({ fieldId: fieldId });
						urlArray.push('page=' + page);
						urlArray.push('startindex=' + startindex);

						var project = currentRec.getValue({ fieldId: 'custpage_project' });
						var subsidiary = currentRec.getValue({ fieldId: 'custpage_subsidiary' });
						var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
						var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });


						!!subsidiary ? urlArray.push('subsidiary=' + subsidiary) : ''
						!!project ? urlArray.push('project=' + project) : ''

						urlArray.push('setdefaultdate=' + 'F')
						passDateFilters(currentRec, urlArray);
						hasToRedirect = true

						if (!!urlArray && hasToRedirect) {
							redirect(urlArray);
						}

					}
					else if (fieldId == 'custpage_asofdate_report') {

						var asofdate = currentRec.getValue({ fieldId: fieldId });
						var project = currentRec.getValue({ fieldId: 'custpage_project' });
						var subsidiary = currentRec.getValue({ fieldId: 'custpage_subsidiary' });
						var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
						var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });

						var hasDates = !!fromDate && !!toDate
						var hasToRedirect = true

						if (!!asofdate) {
							urlArray.push('asofdate=' + asofdate)
							urlArray.push('project=' + project)
							urlArray.push('subsidiary=' + subsidiary)
							urlArray.push('setdefaultdate=' + 'F')
						}
						else {
							urlArray.push('subsidiary=' + subsidiary) //testing
						}

						passDateFilters(currentRec, urlArray);
						if (!!urlArray && hasToRedirect) {
							redirect(urlArray);
						}


					}


				}

			}
			catch (e) {
				console.error('Error::fieldChanged::' + fieldId, e);
				log.error('Error::fieldChanged::' + fieldId, e);
			}
		}

		function passDateFilters(currentRec, urlArray) {
			var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
			var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });
			if (!!toDate && !!fromDate) {
				toDate = nsFormat.format({ value: toDate, type: nsFormat.Type.DATE });
				fromDate = nsFormat.format({ value: fromDate, type: nsFormat.Type.DATE })
				!!fromDate ? urlArray.push('fromdate=' + fromDate) : ''
				!!toDate ? urlArray.push('todate=' + toDate) : ''
			}

			return urlArray;
		}

		function redirect(urlArray) {
			console.log('url', urlArray.join('&'));
			window.location = window.location.origin + urlArray.join('&');
		}

		function resetFilters() {
			window.location = window.location.origin + getSuiteletURL();
		}

		function showMessage() {
			var message = nsMessage.create({
				type: nsMessage.Type.INFORMATION,
				title: 'Processing',
				message: 'The records are being processed. Please do not refresh the window.'
			});

			message.show();

			return message;
		}


		function showMessageEmail() {
			var message = nsMessage.create({
				type: nsMessage.Type.INFORMATION,
				title: 'Processing',
				message: 'Your report is generated and sent via email. Check your email inbox!'
			});

			message.show();

			return message;
		}

		function showErrorMessage() {
			var message = nsMessage.create({
				type: nsMessage.Type.ERROR,
				title: 'Error',
				message: 'Script processing queues are not available. Please try again later.'
			});

			message.show();

			return message;
		}

		function showErrorMessage() {
			var message = nsMessage.create({
				type: nsMessage.Type.ERROR,
				title: 'Error',
				message: 'Script processing queues are not available. Please try again later.'
			});

			message.show();

			return message;
		}

		function isValidDateRange(fromDate, toDate) {
			return fromDate <= toDate
		}


		function setFieldValue(currRec, fieldId, value) {
			currRec.setValue({
				fieldId: fieldId,
				value: value,
				ignoreFieldChange: true
			});
		}


		function checkStatus(msg) {

			var currentRec = nsCurrentRec.get();

			var totalLine = currentRec.getValue({ fieldId: 'custpage_totalline' });
			var taskId = currentRec.getValue({ fieldId: 'custpage_taskid' });
			var queueId = currentRec.getValue({ fieldId: 'custpage_queueid' });
			var scriptId = currentRec.getValue({ fieldId: 'custpage_script' });

			var suitelet_script_id = currentRec.getValue({ fieldId: 'custpage_suitelet_scriptid' });

			console.log("suitelet_scriptid 0", suitelet_script_id)

			console.log("check script no 0:", scriptId)

			var a = setInterval(function () {
				Processing_Text = Processing_Text.lastIndexOf('.') > 15 ? 'Processing' : Processing_Text + '.';
				//1.0 is used because 2.0 is not able to update this field value
				nlapiSetFieldValue('custpage_message', '<span style="font-size:13px">' + Processing_Text + '</span>');
			}, 1000)


			var b = setInterval(function (msg) {
		

				// nsSearch.lookupFields.promise({
				// 	type: 'customrecord_construct_processing_queue',
				// 	id: queueId,
				// 	columns: ['custrecord_queue_status', 'custrecord_data', 'custrecord_result',]
				// }).then(function (result) {
				// 	console.log('result', result);
                //console.log("checkstatus",taskId)
                // var taskStatus = task.checkStatus(taskId);
                //    console.log("checkstatus",taskStatus)
                              var customRecord =   saveSearch()

                              if(customRecord.length==0)
                              console.log("customRecord",customRecord)
				 	var queueStatus = ""
					if (customRecord.length==0) 
                    {
						clearInterval(a);
						clearInterval(b);
						msg.hide();
						updateMessage();
					}
				// 	else if (queueStatus == 'Error') {
				// 		clearInterval(a);
				// 		clearInterval(b);
				// 		msg.hide();
				// 		updateFailedMessage(result);
				// 	}
				// }).catch(function onRejected(reason) {
				// 	console.log('Error', reason)
				// });

			}, 5000, msg);
		}



		function updateMessage(result)
         {
			// var processingFields = constant.PROCESSING_QUEUE.FIELDS
			// var currentRec = nsCurrentRec.get();

			//1.0 is used because due to unknown reasons 2.0 is not able to update this field value
			nlapiSetFieldValue('custpage_message', '<span style="font-size:13px">You can now close this window.</span>');

			// var msg = result[processingFields.STATUS];

			var newMessage = nsMessage.create({
				type: nsMessage.Type.CONFIRMATION,
				title: 'Processing Completed',
				message: "Created All Record "
			});

			newMessage.show();
			//showPopup(result);
		}



		function showPopup(processingResult, script)
         {
			//	var c = processingResult['custrecord_data'];

			var c = processingResult

			var downloadResBtn = {
				label: 'Download Result',
				value: 'download-csv'
			};

			var okButton = {
				label: 'Done',
				value: 'refresh-page'
			};

			const options = {
				title: 'Processing Complete !',
				message: 'Click Done to close OR Download Result to download the CSV file',
				buttons: [okButton, downloadResBtn]
			};

			function failure(err) {
				console.log('error', err);
			}

			nsDialog.create(options).then(function (result) {
				console.log('Button clicked result', result);
				if (result == 'refresh-page') {
					console.log("check script no 3:", script)
					var suitelet = getSuiteletURL(script);
					window.location = window.location.origin + suitelet;
				}
				else {
					convertToCSVAndGenerateDownloadLink(c);
				}
			}).catch(failure);
		}




		function getSuiteletURL() {


			var suiteletTitle = document.getElementsByClassName("uir-record-type")[0].innerText;
			console.log("suiteletTitle::", suiteletTitle)


			var scriptId;
			var deploymentId;


			var scriptdeploymentSearchObj = nsSearch.create({
				type: "scriptdeployment",
				filters:
					[
						["title", "is", suiteletTitle]
					],
				columns:
					[
						nsSearch.createColumn({ name: "scriptid", label: "Custom ID" }),
						nsSearch.createColumn({
							name: "scriptid",
							join: "script",
							label: "Script ID"
						})
					]
			});
			scriptdeploymentSearchObj.run().each(function (result) {
				// .run().each has a limit of 4,000 results
				deploymentId = result.getValue({
					name: "scriptid"
				}).toLowerCase();
				scriptId = result.getValue({
					name: "scriptid",
					join: 'script'
				}).toLowerCase();
				return true;
			});

			console.log("Script Id :", scriptId)
			console.log("Deployment Id :", deploymentId)


			return nsUrl.resolveScript({
				scriptId: scriptId,
				deploymentId: deploymentId
			});

		}


		function hasSelectedLines(currentRec) {
			var totalLines = currentRec.getLineCount({ sublistId: 'custpage_results' });
			var selectedLines = 0;
			var selectedLinesIndex = [];
			for (var i = 0; i < totalLines; i++) {
				var isSelected = currentRec.getSublistValue({
					sublistId: 'custpage_results',
					fieldId: 'custpage_select',
					line: i
				});
				if (isSelected == true || isSelected == 'T') {
					selectedLines++;
					selectedLinesIndex.push(currentRec.getSublistValue({
						sublistId: 'custpage_results',
						fieldId: 'fieldid',
						line: i
					}));
				}
			}

			return selectedLinesIndex;
		}

		function validateField(context) {
			try {
				var currentRec = context.currentRecord;
				var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
				var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });
				switch (context.fieldId) {
					case 'custpage_fromdate':
					case 'custpage_todate':
						if (!!toDate && !!fromDate && !isValidDateRange(new Date(fromDate), new Date(toDate))) {
							alert('Date Range Is Not Valid')
							currentRec.setValue({
								fieldId: context.fieldId,
								value: '',
								ignoreFieldChange: true
							});
							return false;
						}
						return true

				}
			}
			catch (e) {
				console.error('validateField', e);
			}

			return true;
		}


		function addCustomListeners() {
			var markAllButton = document.getElementById("custpage_resultsmarkall")
			!!markAllButton ? markAllButton.addEventListener("click", sublistMarkAllListener) : ''
			var unMarkAllButton = document.getElementById("custpage_resultsunmarkall");
			!!unMarkAllButton ? unMarkAllButton.addEventListener("click", sublistUnMarkAllListener) : '';
		}

		function sublistMarkAllListener() {
			var currentRec = nsCurrentRec.get()
			var totalLines = currentRec.getLineCount({
				sublistId: 'custpage_results'
			});
			currentRec.setValue({ fieldId: 'custpage_selected_count', value: totalLines, ignoreFieldChange: true });
		}

		function sublistUnMarkAllListener() {

			var currentRec = nsCurrentRec.get();
			currentRec.setValue({
				fieldId: 'custpage_selected_count',
				value: 0,
				ignoreFieldChange: true
			});
		}


		function updateSelectedCount(currRec, byValue) {

			var currentCount = currRec.getValue('custpage_selected_count');
			currentCount = Number(currentCount) + parseInt(byValue);
			currRec.setValue({ fieldId: 'custpage_selected_count', value: currentCount, ignoreFieldChange: true });

		}


        function saveSearch()
        {
            var customrecord_everhourprocessingqueueSearchObj = nsSearch.create({
                type: "customrecord_everhourprocessingqueue",
                filters:
                [
                   ["custrecord_everprocessingstatus","anyof","1"]
                ],
                columns:
                [
                    nsSearch.createColumn({name: "custrecord_everhourprocessingqueue_rcrid", label: "Record Id"}),
                    nsSearch.createColumn({name: "custrecord_everhourprocessingqueue_prtid", label: "ProjectId"}),
                   nsSearch.createColumn({name: "custrecord_everhourprocessingqueue_rcd", label: "Record Type"}),
                   nsSearch.createColumn({name: "custrecord_everhourprocessingqueue_data", label: "Data"}),
                   nsSearch.createColumn({name: "custrecord_everprocessingstatus", label: "Status"}),
                   nsSearch.createColumn({name: "custrecord_everhourprocessingqueue_error", label: "Last Error"})
                ]
             });

             var isData = customrecord_everhourprocessingqueueSearchObj.run();
             var isFinalResult = isData.getRange(0, 999);
             var  parseData = JSON.parse(JSON.stringify(isFinalResult));
    
             return parseData


        }

		function wait(ms) {
			var start = +(new Date());
			while (new Date() - start < ms);
		}

		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			saveRecord: saveRecord,
			resetFilters: resetFilters,
			validateField: validateField

		};

	}
);
