app.factory(
	"_",
	function( $window ) {

		"use strict";

		// Get a reference to the core lbirary.
		var lodash = $window._;
		

		// I find the first item with the given name-value pair.
		lodash.findWithProperty = function( collection, name, value ) {

			var foundItem = lodash.find(
				collection,
				function comparisonOperator( item ) {

					return( item[ name ] === value );

				}
			);

			// Clear closed-over variables.
			collection = name = value = null;

			return( foundItem );

		};
		
		
		return( lodash );

	}
);