/**
 * Created by OniQ on 10/10/15.
 */
define(['puzzleServices'], function(puzzleServices){
    puzzleServices.service('logService', function($rootScope, $q) {

        var service = {
            messages: []
        };

        service.log = function(message){
            var d = new Date();
            service.messages.push(d.toString() + ': ' + message);
        };

        service.clear = function(){
            while(service.messages.length > 0){
                service.messages.pop();
            }
        };

        return service;
    });
});