/**
 * Created by OniQ on 04/10/15.
 */
define(['puzzleServices'], function(puzzleServices){
    puzzleServices.service('imageManager', function($rootScope, $q) {

            var service = {
                fileName: null,
                fileType: null,
                bytes: []
            };

            function readBytes(file){
                var fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onloadend = function(e) {

                    var buffer = e.target.result;
                    var dataView = new DataView(buffer);

                    for (var i = 0; i < 256; i++) {
                        var byte = dataView.getUint8(i);
                        service.bytes.push(byte.toString(16) + ' ');
                    }

                };
                fileReader.onerror = function(e){
                    throw new Error("Some bad error happened while uploading file: " + e.targer.result);
                };
            }

            function loadImage(file){
                var reader = new FileReader();
                var image  = new Image();
                var deferred = $q.defer();

                reader.readAsDataURL(file);
                reader.onload = function(_file) {
                    image.src = _file.target.result;
                    image.onload = function() {
                        service.image = image;
                        deferred.resolve(service.image);
                    };
                    image.onerror= function() {
                        deferred.reject('Invalid file type: '+ file.type);
                    };
                };
                return deferred.promise;
            }

            service.processFile = function(file){
                service.fileName = file.name;
                service.fileType = service.fileName .split('.').pop();
                if ($rootScope.supportedFiles.indexOf(service.fileType) == -1 )
                    throw new Error("Not supporter file type");
                readBytes(file);
                return loadImage(file);
            };

            return service;
        }
    );
});