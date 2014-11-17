<cfscript>

	// I am the section for which we are gathering images.
	param name="url.section" type="string";

	// Set up the response structure.
	response.data = [];

	// Add each image to the response.
	for ( image in application.images.getImagesBySection( url.section ) ) {

		arrayAppend(
			response.data,
			{
				"id" = image.id,
				"section" = image.section,
				"clientFile" = image.clientFile,
				"imageUrl" = image.imageUrl
			}
		);

	}

</cfscript>