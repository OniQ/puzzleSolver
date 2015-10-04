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
    var app = angular.module('puzzle', ['ngRoute', 'puzzle.controllers', 'puzzle.directives', 'puzzle.services']);

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