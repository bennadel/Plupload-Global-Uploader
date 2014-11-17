<cfscript>
	
	// ------------------------------------------------------------------------------- --
	// NOTE: For this demo we're not going to worry about deleting the files from Amazon 
	// S3. That's a bit beyond the scope of the demo.
	// ------------------------------------------------------------------------------- --

	// I am the ID of the image being deleted.
	param name="form.id" type="numeric";

	image = application.images.getImage( form.id );

	// Delete the image "record".
	application.images.deleteImage( image.id );

	// Prepare API response.
	response.data = true;

</cfscript>