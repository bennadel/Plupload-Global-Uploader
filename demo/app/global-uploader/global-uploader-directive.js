app.directive(
	"bnGlobalUploader",
	function( plupload, $rootScope ) {

		"use strict";


		// I provide the controller for the scope of the global uploader.
		function Controller( $scope, _ ) {

			// I keep the list of files in the rendered queue.
			$scope.queue = [];


			// ---
			// PUBLIC METHODS.
			// ---


			// I add a file to the rendered queue.
			$scope.addFile = function( file ) {

				$scope.queue.push( file );

			};


			// I remove the given file from the rendered queue.
			$scope.removeFile = function( file ) {

				$scope.queue = _.without( $scope.queue, file );

			};

		}


		// I bind the JavaScript events to the local scope.
		function link( scope, element, attributes ) {

			// These are not actually used by the UI - we just need the container and 
			// button to be able to fully initialize the runtime. All interaction will
			// actually be done through the dropzones distributed throughout the 
			/// application (which announce file-events).
			element.append(
				"<div id='m-global-uploader-container'>\
					<div id='m-global-uploader-button'>\
						<br />\
					</div>\
				</div>"
			);
			
			// Instantiate the Plupload uploader.
			var uploader = new plupload.Uploader({

				// For this demo, we're only going to use the html5 runtime. I don't 
				// want to have to deal with people who require flash - not this time, 
				// I'm tired of it; plus, much of the point of this demo is to work with
				// the drag-n-drop, which isn't available in Flash.
				runtimes: "html5",

				// Upload the image to the remote end-point - this will be defined on a 
				// per-file basis as other parts of the application emit file-ready 
				// events. But, we have to provide something now or the uploader won't
				// initialize properly.
				// --
				// NOTE: The uploader needs to be defined with a non-empty string.
				url: "about:blank",

				// Set the name of file field (that contains the upload).
				file_data_name: "file",

				// The container, into which to inject the Input shim.
				// --
				// NOTE: For this demo, these are throw-away items just needed to get the
				// uploader to initialize. All interaction will be performed programmtically.
				container: "m-global-uploader-container",

				// The ID of the drop-zone element.
				// --
				// NOTE: For this demo, these are throw-away items just needed to get the
				// uploader to initialize. All interaction will be performed programmtically.
				drop_element: "m-global-uploader-button",

				// To enable click-to-select-files, you can provide a browse button. We
				// don't actually use the button in this demo; but, the uploader won't 
				// initialize properly unless there is a button. For us, we're delegating
				// it to a 1x1 pixel offscreen.
				browse_button: "m-global-uploader-button",

				// We don't have any parameters yet; they will be provided on a per-file
				// basis, in the BeforeUpload event.
				multipart_params: {}

			});

			// Set up the higher-precedence event handlers and initialize the plupload 
			// runtime. By binding these prior to .init(), it means that our event handlers
			// will execute before the internal event handlers. This is critical for 
			// BeforeUpload as we need a chance to update settings and [possibly] cancel 
			// the upload.
			uploader.bind( "PostInit", handleInitEvent );
			uploader.bind( "BeforeUpload", handleBeforeUploadEvent );
			uploader.init();
			
			// Bind the lower-precedence event handlers - for these, we want the internal 
			// event handlers to fire first.
			uploader.bind( "FilesAdded", handleFilesAddedEvent );
			uploader.bind( "FilesRemoved", handleFilesRemovedEvent );
			uploader.bind( "UploadProgress", handleUploadProgressEvent );
			uploader.bind( "FileUploaded", handleFileUploadedEvent );

			// CAUTION: We have to bind our error handler AFTER the .init() method so that
			// Plupload has a chance to bind its own error handler. If we bind ours first, 
			// and then we remove the file from the queue within our own error handler, it
			// causes the internal error handler to inappropriately cancel the upload of 
			// the last file. The race condition is that when we explicitly remove the file
			// from the queue, it synchronously makes a call to upload the NEXT file before 
			// the internal error handler has had a chance to execute. As such, when the 
			// internal error handler does execute (after ours), and triggers a 
			// "CancelUpload" event, the XHR object actually points to the "next" file 
			// upload, not the error file upload.
			uploader.bind( "Error", handleErrorEvent );

			// As files are added to various dropzones, these events will be triggered 
			// when the calling context is ready to have the file uploaded.
			scope.$on( "fileReadyForUpload", handleFileReadyForUploadEventEvent );
				

			// ---
			// PRIVATE METHODS.
			// ---


			// I update the uploader settings for each file before the file is uploaded.
			function handleBeforeUploadEvent( uploader, file ) {

				// Get the settings from the underlying, source file object.
				var source = file.getSource();
				var settings = source.uploadSettings;

				// Prepare the uploader configuration for this specific file.
				uploader.settings.url = settings.url;
				uploader.settings.multipart_params = settings.multipart_params;
				
			}


			// I handle any errors during the initialization or uploading process.
			function handleErrorEvent( uploader, event ) {

				// If the "file" property exists, the error is related to a file. Since
				// we don't have any file filters, we'll just assume the error is do to
				// and upload issue - and we'll remove the file from the uploader.
				if ( event.file ) {

					uploader.removeFile( event.file );

				}

			}


			// I handle the application-wide events for files that need to be added to 
			// the global uploader. 
			function handleFileReadyForUploadEventEvent( event, configuration ) {

				var file = configuration.uploadFile;

				// To make the settings easier to reference during the upload livecycle,
				// tack them onto the actual file. This will make them available via the
				// .getSource() method after they've been added to the uploader.
				file.uploadSettings = {
					url: configuration.uploadUrl,
					multipart_params: configuration.uploadParams,
					context: configuration.context
				};
				
				// Add them to the uploader.
				// --
				// NOTE: We are not adding them to the rendered-queue at this point since 
				// the current file represents the "source file". Once it's added to the
				// Plupload queue, it will represent the uploader file object, which is 
				// what we want to track. We can access this wrapped version of the file 
				// in the subsequent events.
				uploader.addFile( file );

			}


			// I handle files that have been added to the uploader.
			function handleFilesAddedEvent( uploader, files ) {

				// Update the view-model.
				scope.$evalAsync(
					function handleEvalAsync() {

						for ( var i = 0, length = files.length ; i < length ; i++ ) {

							scope.addFile( files[ i ] );

						}

						// Clear the closed-over variables.
						uploader = files = null;
						
					}
				);

				// Start the uploader to process the new files.
				// --
				// NOTE: We can call this multiple times without a problem. Internally,
				// the uploader will ignore this request if the uploader is already 
				// in an uploading state.
				uploader.start();

			}


			// I handle files thave been removed from the uploader.
			function handleFilesRemovedEvent( uploader, files ) {

				// Update the view-model.
				scope.$evalAsync(
					function handleEvalAsync() {

						for ( var i = 0, length = files.length ; i < length ; i++ ) {

							scope.removeFile( files[ i ] );

						}

						// Clear the closed-over variables.
						uploader = files = null;
						
					}
				);

			}


			// I handle a file that has been successfully uploaded to the remote end-point.
			function handleFileUploadedEvent( uploader, file, response ) {

				// We have to access this context data before the file is removed from the 
				// queue. Once it is removed, it is destroyed and we no longer have access 
				// to the source object.
				var context = file.getSource().uploadSettings.context;

				// Update the view-model.
				scope.$evalAsync(
					function handleEvalAsync() {

						scope.removeFile( file );
						
						// Now that the file has been uploaded, we need to let the 
						// application know so that interfaces can be properly updated.
						// With this event, we're going to re-broadcast the "success"
						// context that was defined by the original calling context.
						$rootScope.$broadcast( "fileUploaded", context );

						// Clear the closed-over variables.
						uploader = file = response = context = null;

					}
				);

				// Once the file has been uploaded, we have to explicitly remove it from 
				// the uploader queue, otherwise it will be "re-queued" after the entire
				// queue has been processed.
				uploader.removeFile( file );

			}


			// I handle the uploader after it has been initialized.
			function handleInitEvent( uploader ) {

				console.info( "Global uploader initialized." );

			}


			// I handle the file progress events during the upload process.
			function handleUploadProgressEvent( uploader, file ) {

				// NOTE: Since the file has been added to the rendered queue, all we have
				// to do is trigger a digest and the view-model changes will take effect.
				scope.$evalAsync();

			}

		}


		// I return the directive configuration.
		return({
			controller: Controller,
			link: link,
			resitrct: "A"
		});

	}
);