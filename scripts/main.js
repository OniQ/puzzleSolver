/**
 * Created by OniQ on 20/04/15.
 */
require.config({
    baseUrl: "scripts",
    map:{
        // Maps
    },
    paths:{
        // Aliases and paths of modules
        "angular" : "lib/angular",
        "ngRoute" : "lib/angular-route",
        "modules" : "app/modules",
        "ctrl": "app/controllers",
        "puzzleDirectives": "app/modules/puzzleDirectives",
        "puzzleServices": "app/modules/puzzleServices"
    },
    shim:{
        'puzzle': {
            deps: [
                'modules/puzzleControllers',
                'ctrl/mainController',
                'puzzleDirectives',
                'puzzleServices',
                //Libs
                'lib/underscore-min',
                'lib/ui-bootstrap-tpls-0.14.1.min',
                //Directives
                'app/directives/image-container',
                'app/directives/range-slider',
                'app/directives/logger',
                //Services
                'app/services/imageManager',
                'app/services/logService'
            ]
        }
    }
});

require(
    [
        'puzzle'
    ],
    function () {
        angular.bootstrap(document, ['puzzle']);
    });
