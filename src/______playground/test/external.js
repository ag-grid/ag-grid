(function () {
    "use strict";

  
    var app = angular.module('test.external', []);
    bootstrapApplication();
    function bootstrapApplication() {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["test.external"]);
        });
    }

    app.controller('external', function ($scope, $window) {
        var $ctrl = this;
        $ctrl.something = "i like tacos";


        var tacoObject = {
            name: "doritos locos",
            protein: "ground beef?",
            price: "$1.49",
            restaurant: "taco bell",
            tortilla: "corn",
            guac: false,
            queso: false,
            sauce: "fire",
            quanity: 2
        };
        $ctrl.addData = function ()
        {
            //console.log($window.opener);
            $window.opener.$gridService.addGridData("main", tacoObject);
        }
        

    });


})();