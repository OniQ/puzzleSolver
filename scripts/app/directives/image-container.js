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

                function Pixel(r, g, b, a, i){
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;
                    this.i = i;

                    this.getColor = function(invert){
                        if (invert)
                            return "rgba(" + (255 - this.r) + "," + (255 - this.g) +
                                "," + (255 - this.b) + ", " + this.a + ")";
                        return "rgba(" + this.r + "," + this.g +
                        "," + this.b + ", " + this.a + ")";
                    };

                    this.copy = function(){
                        return angular.copy(this);
                    };

                    this.defineIfBackground = function(selectedPixel){
                        this.isBackground  = (this.r == 255 && this.g == 255 && this.b == 255);

                        /*if (selectedPixel instanceof (Pixel)){
                            this.rDiff = this.r - selectedPixel.r;
                            this.gDiff = this.g - selectedPixel.g;
                            this.bDiff = this.b - selectedPixel.b;
                            this.rIsBkg = Math.abs(this.rDiff) <= $scope.rangeR;
                            this.gIsBkg = Math.abs(this.gDiff) <= $scope.rangeG;
                            this.bIsBkg = Math.abs(this.bDiff) <= $scope.rangeB;
                            this.isBackground = this.rIsBkg
                                && this.gIsBkg
                                && this.bIsBkg
                        }*/
                    };

                    this.getDistance = function(pixel){
                        var dist = Math.sqrt( (this.x-pixel.x)*(this.x-pixel.x) + (this.y-pixel.y)*(this.y-pixel.y) );
                        return dist;
                    }
                }

                $scope.pixel = new Pixel(0, 0, 0, 0);
                $scope.fixedPixel = angular.copy($scope.pixel);

                $scope.rangeR = 50;
                $scope.rangeG = 50;
                $scope.rangeB = 50;
                $scope.frequency = 50;

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
                                    $scope.pixel = $scope.pixels[mousePos.y][mousePos.x];
                                    $scope.hoveredColor["background-color"] = $scope.pixel.getColor();
                                    if ($scope.fixedPixel) {
                                        $scope.pixel.defineIfBackground($scope.fixedPixel);
                                    }
                                }
                            }
                        });
                }, false);

                function Queue(){
                    this.queue = [];

                    this.activate = function(i)
                    {
                        if (!i)
                            i = 0;
                        if (i >= this.queue.length)
                            return;
                        var next = this;
                        var q = this.queue[i];
                        $timeout(function(){
                            q.fn.apply(next, q.args);
                        }, $scope.frequency).then(
                            function(){
                                next.activate(++i);
                            }
                        );
                    };

                    this.register = function(fn){
                        var args = Array.prototype.slice.call(arguments);
                        args.shift();
                        this.queue.push({
                            fn: fn,
                            args: args
                        });
                    };
                }

                $scope.puzzles = []
                $scope.p = 0;

                $scope.processPixel = function(x, y){
                    var id = context.createImageData(1,1);
                    var d  = id.data;
                    var pixel = $scope.pixels[y][x];
                    pixel.defineIfBackground();
                    d[0]   = 0;
                    d[1]   = 255;
                    d[2]   = 0;
                    d[3]   = 255;

                    if (!pixel.isBackground){
                        d[1]   = 0;
                        d[2]   = 255;
                    }

                    context.putImageData(id, x, y );
                };

                $scope.detectPuzzles = function(){
                    //var imgData = context.getImageData(0,0,canvas.width,canvas.height);1
                    //for (var i=0;i < imgData.data.length;i+=4) {
                    //    $timeout(function(){
                    //        imgData.data[i] = 0;
                    //        imgData.data[i+1] = 255;
                    //        imgData.data[i+2] = 0;
                    //        imgData.data[i+3] = 255;
                    //        context.putImageData(imgData, 0, 0);
                    //    }, 200);
                    //}
                    var queue = new Queue();
                    for (var y = 0; y < $scope.pixels.length; y++)
                        for (var x = 0; x < $scope.pixels[y].length; x++){
                            queue.register($scope.processPixel, x, y);
                        }
                    queue.activate();
                };

                $scope.restoreBackground = function(){
                    if ($scope.originalImageData)
                        context.putImageData($scope.originalImageData, 0, 0);
                };

                $scope.cutBackground = function(){
                    if (!$scope.hasImage)
                        return;
                    $scope.restoreBackground();
                    var imgData = context.getImageData(0,0,canvas.width,canvas.height);
                    for (var i=0;i < imgData.data.length;i+=4) {
                        var pixel = new Pixel(
                            imgData.data[i],
                            imgData.data[i+1],
                            imgData.data[i+2],
                            imgData.data[i+3],
                        i);
                        pixel.defineIfBackground($scope.fixedPixel);
                        if (pixel.isBackground)
                            imgData.data[i+3] = 0;
                        delete pixel;
                    }
                    context.putImageData(imgData, 0, 0);
                };

                function appendFile(image){
                    $scope.src = image.src;
                    $scope.hasImage = true;

                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image,0,0);

                    $scope.originalImageData = context.getImageData(0,0,canvas.width,canvas.height);
                    var imgData = $scope.originalImageData;
                    var w = -1;
                    for (var i=0;i<imgData.data.length;i+=4)
                    {
                        if (i % (canvas.width*4) == 0){
                            $scope.pixels.push([]);
                            w++;
                        }

                        $scope.pixels[w].push(new Pixel(
                            imgData.data[i],
                            imgData.data[i+1],
                            imgData.data[i+2],
                            imgData.data[i+3],
                            i)
                        );
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