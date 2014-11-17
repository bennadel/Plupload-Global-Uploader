app.controller(
	"HomeController",	
	function( $scope ) {

		// I determine which section to render.
		$scope.section = "one";


		// ---
		// PUBLIC METHODS.
		// ---


		// I switch to section one.
		$scope.showSectionOne = function() {

			$scope.section = "one";

		};


		// I switch to section two.
		$scope.showSectionTwo = function() {

			$scope.section = "two";

		};

	}
);
