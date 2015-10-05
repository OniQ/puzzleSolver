/**
 * Created by OniQ on 04/10/15.
 */
define(['puzzleDirectives'], function(puzzleDirectives){
    puzzleDirectives.directive('imageContainer', function($timeout, imageManager) {
        return {
            templateUrl: "templates/directives/image-container.html",
            controller: function ($scope, $element, $attrs) {
                var fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/png";
                fileInput.id = "fileInput";

                $scope.selectFile = function(){
                    fileInput.click();
                };

                function getMousePos(canvas, evt) {
                    var rect = canvas.getBoundingClientRect();
                    return {
                        x: evt.clientX - rect.left,
                        y: evt.clientY - rect.top
                    };
                }
                var canvas = document.getElementById('puzzlePicture');
                var context = canvas.getContext('2d');

                canvas.addEventListener('mousemove', function(evt) {
                    var mousePos = getMousePos(canvas, evt);
                    $timeout(function(){
                        $scope.message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
                    });
                }, false);

                function appendFile(image){
                    $scope.src = image.src;
                    $scope.hasImage = true;

                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image,0,0);

                    var imgData = context.getImageData(0,0,canvas.width,canvas.height);
                    for (var i=0;i<imgData.data.length;i+=4)
                    {
                        $scope.pixels.push({
                            r: imgData.data[i],
                            g: imgData.data[i+1],
                            b: imgData.data[i+2],
                            a: imgData.data[i+3]
                        });
                    }
                }

                function handleFileDrop(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    var files = evt.dataTransfer.files;

                    if (files.length > 0)
                        imageManager.processFile(files[0]).then(appendFile);

                }

                function handleDragOver(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    evt.dataTransfer.dropEffect = 'copy';
                }

                $element.bind('dragover', handleDragOver);
                $element.bind('drop', handleFileDrop);

                function handleFileSelect(evt) {
                    var files = evt.target.files;
                    if (files.length > 0)
                        imageManager.processFile(files[0]).then(appendFile);
                }

                fileInput.addEventListener('change',
                    handleFileSelect,
                    false);
            }
        }
    })
});