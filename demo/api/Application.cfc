component
	output = false
	hint = "I define the application settings and event handler."
	{

	// Define the application settings.
	this.name = hash( getCurrentTemplatePath() );
	this.applicationTimeout = createTimeSpan( 0, 1, 0, 0 );
	this.sessionManagement = false;


	/**
	* I initialize the application and set up the shared data structures. 
	* 
	* @output false
	*/
	public boolean function onApplicationStart() {

		// Get the root directory for the application so we can calcualte relative paths.
		var root = getDirectoryFromPath( getCurrentTemplatePath() );

		// Load the Amazon AWS credentials - we'll need these to generate our Amazon S3
		// pre-signed urls and upload policies.
		// --------------------------------------------------------------------------- --
		// CAUTION: This file is NOT part of the GitHub repository (for obivous reasons).
		// You will need to create it locally in order to get this demo application to 
		// run. It is a JSON object that contains your AWS credentials:
		// { "aws": { "bucket": "xxx", "accessID": "xxx", "secretKey": "xxx" } }
		// --------------------------------------------------------------------------- --
		application.aws = deserializeJson( fileRead( "#root#config.json" ) ).aws;

		// I provide easy access to some of S3 APIs for this demo.
		application.s3 = new models.S3Lite( 
			application.aws.bucket, 
			application.aws.accessID, 
			application.aws.secretKey
		);

		// I hold the image that were uploaded to the application.
		application.images = new models.ImageCollection();

		// Return true so that the request can continue loading.
		return( true );

	}


	/**
	* I initialize the request.
	* 
	* @scriptName I am the script name requested for execution.
	* @output false
	*/
	public boolean function onRequestStart( required string scriptName ) {

		// Check to see if the re-initialization flag has been passed.
		if ( structKeyExists( url, "init" ) ) {

			onApplicationStart();

			// Abort the request so it's easier to see what's going on with the request.
			writeDump( "Application initialized." );
			abort;

		}

		// Return true so that the request can continue loading.
		return( true );

	}

}