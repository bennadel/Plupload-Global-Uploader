app.directive(
	"bnSectionUploader",
	function( mOxie, naturalSort, $q ) {

		"use strict";


		// I bind the JavaScript events to the local scope.
		function link( scope, element, attributes ) {

			// Wiki: https://github.com/moxiecode/moxie/wiki/FileDrop
			var dropzone = new mOxie.FileDrop({
				drop_zone: element[ 0 ]
			});

			// Initialize the dropzone events.
			dropzone.bind( "drop", handleFileDrop );
			dropzone.init();

			// When the scope is destroyed, clean up all bindings.
			scope.$on( "$destroy", handleDestroyEvent );


			// ---
			// PRIVATE METHODS.
			// ---


			// I teardown the dropzone.
			function handleDestroyEvent() {

				// CAUTION: We need these here to prevent memory leaks in Plupload.
				dropzone.removeAllEventListeners();
				dropzone.destroy();
				
				// Clear closed-over variables.
				scope = element = attributes = dropzone = null;

				// Clear closed-over functions.
				handleDestroyEvent = handleFileDrop = null;

			}


			// I handle the file-drop event, passing it to the linked handler.
			function handleFileDrop( event ) {

				// If the user dropped multiple files, try to order the files using a 
				// natural sort that treats embedded numbers like actual numbers. This 
				// will allow the sort of the overall list to make more sense to the user.
				naturalSort( dropzone.files, "name" );

				// While the calling context is processing the files, we need to indicate
				// that the system is busy.
				element.addClass( "busy" );
				
				// Update the view-model.
				var promise = scope.$apply(
					function() {

						return( scope.processFiles({ files: dropzone.files }) );

					}
				);

				// When request is finished, reset the state.
				$q.when( promise ).finally(
					function handleFinally() {

						element.removeClass( "busy" );

						// Clear closed-over variables.
						event = promise = null;

					}
				);

			}

		}


		// Return the directive configuration.
		return({
			link: link,
			resitrct: "A",
			scope: {
				processFiles: "&bnSectionUploader"
			}
		});

	}
);