/**
 * Created by OniQ on 04/10/15.
 */
/**
 * Created by OniQ on 20/04/15.
 */
define(['../modules/puzzleControllers'], function(puzzleCtrl){
    puzzleCtrl.controller('mainController', ['$scope',
        function ($scope) {
            /*var littleEndian = (function() {
                var buffer = new ArrayBuffer(2);
                new DataView(buffer).setInt16(0, 256, true);
                return new Int16Array(buffer)[0] === 256;
            })();
            console.log(littleEndian); // true or false*/

            //var canvas = angular.element('#displayWindow')[0];
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                // Great success! All the File APIs are supported.
            } else {
                throw new Error('The File APIs are not fully supported in this browser.');
            }

            $scope.pixels = [];

        }]);
});
