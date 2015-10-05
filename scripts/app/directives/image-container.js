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
                        x: evt.clientX - Math.ceil(rect.left),
                        y: evt.clientY - Math.ceil(rect.top)
                    };
                }
                var canvas = document.getElementById('puzzlePicture');
                var context = canvas.getContext('2d');
                context.font = "15px Monospace";
                context.fillText("Drop image here or click to select",canvas.width/4.5,canvas.height/2);

                canvas.addEventListener('mousemove', function(evt) {
                    var mousePos = getMousePos(canvas, evt);

                        $timeout(function () {
                            if (mousePos.x > 0 && mousePos.y > 0) {
                                $scope.message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
                                if ($scope.hasImage) {
                                    $scope.pixel = $scope.pixels[mousePos.y][mousePos.x];
                                    $scope.hoveredColor["background-color"] = "rgba(" + $scope.pixel.r + "," + $scope.pixel.g +
                                        "," + $scope.pixel.b + ", " + $scope.pixel.a + ")";
                                }
                            }
                        });
                }, false);

                function appendFile(image){
                    $scope.src = image.src;
                    $scope.hasImage = true;

                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image,0,0);

                    var imgData = context.getImageData(0,0,canvas.width,canvas.height);
                    var w = -1;
                    for (var i=0;i<imgData.data.length;i+=4)
                    {
                        if (i % (canvas.width*4) == 0){
                            $scope.pixels.push([]);
                            w++;
                        }

                        $scope.pixels[w].push({
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