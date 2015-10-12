/**
 * Created by OniQ on 04/10/15.
 */
/**
 * Created by OniQ on 20/04/15.
 */
define([
    // Dependencies
    'ngRoute'
], function(
) {
    Date.prototype.toString = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = this.getDate().toString();
        var hh = this.getHours().toString();
        var mm = this.getMinutes().toString();
        var ss = this.getSeconds().toString();
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]) + ' ' +
            + (hh[1]?hh:"0"+hh[0]) + ':' + (mm[1]?mm:"0"+mm[0]) + ':' + (ss[1]?ss:"0"+ss[0]); // padding
    };

    var app = angular.module('puzzle', ['ngRoute', 'ui.bootstrap', 'puzzle.controllers', 'puzzle.directives', 'puzzle.services']);

    app.config(function ($routeProvider, $provide) {
        $routeProvider
            .when('/app', {
                templateUrl: 'templates/main.html',
                controller: 'mainController'
            })
        .otherwise({redirectTo: "/app"});
    });

    app.run(function($rootScope){
        $rootScope.supportedFiles = ['png'];
    });

    return app;
});