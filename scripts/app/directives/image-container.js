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

                function Pixel(r, g, b, a){
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;

                    this.getColor = function(){
                        return "rgba(" + this.r + "," + this.g +
                        "," + this.b + ", " + this.a + ")";
                    };

                    this.copy = function(){
                        return angular.copy(this);
                    };

                    this.defineIfBackground = function(selectedPixel){
                        if (selectedPixel instanceof (Pixel)){
                            this.rDiff = this.r - selectedPixel.r;
                            this.gDiff = this.g - selectedPixel.g;
                            this.bDiff = this.b - selectedPixel.b;
                            this.rIsBkg = Math.abs(this.rDiff) <= $scope.rangeR;
                            this.gIsBkg = Math.abs(this.gDiff) <= $scope.rangeG;
                            this.bIsBkg = Math.abs(this.bDiff) <= $scope.rangeB;
                            this.isBackground = this.rIsBkg
                                && this.gIsBkg
                                && this.bIsBkg
                        }
                    };
                }

                $scope.pixel = new Pixel(0, 0, 0, 0);
                $scope.fixedPixel = angular.copy($scope.pixel);

                $scope.pictureClicked = function(){
                    if (!$scope.hasImage)
                        fileInput.click();
                    else{
                        $scope.fixedColor = angular.copy($scope.hoveredColor);
                        $scope.fixedPixel = $scope.pixel.copy();
                    }
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
                                    var pixel = $scope.pixels[mousePos.y][mousePos.x];
                                    $scope.pixel = new Pixel(pixel.r,pixel.g, pixel.b, pixel.a);
                                    $scope.hoveredColor["background-color"] = $scope.pixel.getColor();
                                    if ($scope.fixedPixel) {
                                        $scope.pixel.defineIfBackground($scope.fixedPixel);
                                    }
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