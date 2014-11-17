app.controller(
	"SectionTwoController",	
	function( $scope, $rootScope, $q, imageService, _ ) {

		// I hold the name of the section - this allows us to tie the current module to
		// the file-uploaded events.
		$scope.sectionName = "two";

		// I hold the list of images to render.
		$scope.images = [];

		// After a file has been uploaded, this "success" event will be triggered. We 
		// need to see if that file relates back to this context.
		$scope.$on( "fileUploaded", handleFileUploadedEvent );

		loadRemoteData();


		// ---
		// PUBLIC METHODS.
		// ---


		// I delete the given image.
		$scope.deleteImage = function( image ) {

			$scope.images = _.without( $scope.images, image );

			// NOTE: Assuming no errors for this demo.
			imageService.deleteImage( image.id );

		};


		// I process the given files. These are expected to file mOxie file objects. I 
		// return a promise that will be done when all the files have been processed.
		$scope.saveFiles = function( files ) {

			var promises = _.map( files, saveFile );

			return( $q.all( promises ) );

		};


		// ---
		// PRIVATE METHODS.
		// ---


		// I apply the remote data to the view model.
		function applyRemoteData( images ) {

			$scope.images = augmentImages( images );

		}


		// I augment the image for use in the local view-model.
		function augmentImage( image ) {

			// The placeholder flag determines if the image should be rendered with the
			// thumbnail URL; or, if "pending" verbiage should be used.
			image.isPlaceHolder = false;

			return( image );

		}


		// I aument the images for use in the local view-model.
		function augmentImages( images ) {

			return( _.each( images, augmentImage ) );

		}


		// I handle file uploaded events and see if the file relates back to this context.
		function handleFileUploadedEvent( event, context ) {

			if ( context.sectionName !== $scope.sectionName ) {

				return;

			}

			var image = _.findWithProperty( $scope.images, "id", context.imageID );

			if ( image ) {

				image.isPlaceHolder = false;

			}

		}


		// I load the images from the remote resource.
		function loadRemoteData() {

			imageService.getImages( $scope.sectionName )
				.then(
					function handleGetImagesResolve( response ) {

						applyRemoteData( response );

					},
					function handleGetImagesReject( error ) {

						console.warn( "Error loading remote data" );

					}
				)
			;

		}


		// I save a file-record with the same name as the given file, then pass the file 
		// on to the application to be uploaded asynchronously.
		function saveFile( file ) {

			var promise = imageService.saveImage( $scope.sectionName, file.name )
				.then(
					function handleSaveResolve( response ) {

						var image = augmentImage( response.image );

						// Since we haven't upload the file yet, flag the image, locally,
						// as being a placeholder so we don't try to render the thumbnail.
						image.isPlaceHolder = true;

						$scope.images.push( image );

						// Announce the file to the global uploader.
						// --
						// NOTE: The "context" object is what will be announced as the 
						// event data with the file-upload success event. This can be used
						// to tie the upload back to the current controller.
						$rootScope.$broadcast(
							"fileReadyForUpload",
							{
								uploadFile: file,
								uploadUrl: response.formUrl,
								uploadParams: response.formData,
								context: {
									sectionName: $scope.sectionName,
									imageID: image.id
								}
							}
						);

					},
					function handleSaveReject( error ) {

						alert( "For some reason we couldn't save the file, %s", file.name );

					}
				)
				.finally(
					function handleFinally() {

						// Clear closed-over variables.
						file = promise = null;

					}
				)
			;

			return( promise );

		}

	}
);