/**
 * Created by edvinas on 2015-10-06.
 */
define(['puzzleDirectives'], function(puzzleDirectives) {
    puzzleDirectives.directive('rangeSlider', function () {
        return {
            templateUrl: "templates/directives/range-slider.html",
            scope:{
                model: '=ngModel',
                name: '@name'
            },
            controller: function($scope, $element, $attrs){
                if (!$attrs.max)
                    $scope.max = 100;
                else
                    $scope.max = $attrs.max;
            }
        }
    });
});