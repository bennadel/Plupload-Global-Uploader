app.factory(
	"plupload",
	function( $window ) {

		"use strict";

		// Return the global Plupload reference so that it can be injected, proper-like,
		// into our directives.
		return( $window.plupload );

	}
);

app.factory(
	"mOxie",
	function( $window ) {

		"use strict";

		// Return the global mOxie reference so that it can be injected, proper-like,
		// into our directives.
		return( $window.mOxie );

	}
);