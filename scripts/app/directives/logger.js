/**
 * Created by OniQ on 10/10/15.
 */
define(['puzzleDirectives'], function(puzzleDirectives) {
    puzzleDirectives.directive('logger', function (logService) {
        return {
            templateUrl: "templates/directives/logger.html",
            controller: function($scope, $element, $attrs){
                $scope.messages = logService.messages;
                $scope.$watchCollection('messages', function(){
                    var elem = document.getElementById('logArea');
                    elem.scrollTop = elem.scrollHeight;
                });
            }
        }
    });
});