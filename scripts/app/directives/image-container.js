/**
 * Created by OniQ on 04/10/15.
 */
define(['puzzleDirectives'], function(puzzleDirectives){
    puzzleDirectives.directive('imageContainer', function($timeout, imageManager, logService) {
        return {
            templateUrl: "templates/directives/image-container.html",
            controller: function ($scope, $element, $attrs) {

                var fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/png";
                fileInput.id = "fileInput";

                var canvas = document.getElementById('puzzlePicture');
                var context = canvas.getContext('2d');
                context.font = "15px Monospace";
                context.fillText("Drop image here or click to select",canvas.width/4.5,canvas.height/2);

                $scope.rangeR = 50;
                $scope.rangeG = 50;
                $scope.rangeB = 50;
                $scope.frequency = 0;

                function Pixel(r, g, b, a, x, y, i){
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;
                    this.x = x;
                    this.y = y;
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
                        //this.isBackground  = (this.r == 255 && this.g == 255 && this.b == 255);

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

                    this.getDistance = function(pixel){
                        var dist = Math.sqrt( (this.x-pixel.x)*(this.x-pixel.x) + (this.y-pixel.y)*(this.y-pixel.y) );
                        return dist;
                    }
                }

                $scope.reset = function(){
                    $scope.pixels = [];
                    $scope.pixel = new Pixel(255, 255, 255, 255);
                    $scope.fixedPixel = angular.copy($scope.pixel);
                };

                $scope.reset();

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
                        if (i >= this.queue.length) {
                            //end of queue
                            $scope.$broadcast('queue-end');
                            console.log($scope.puzzles.length);
                            for (var puzzle in $scope.puzzles){
                                console.log($scope.puzzles[puzzle]);
                            }
                            return;
                        }
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

                $scope.puzzles = [];
                $scope.p = 0;
                $scope.colors = [];

                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min)) + min;
                }

                $scope.processPixel = function(x, y){
                    var id = context.createImageData(1,1);
                    var d  = id.data;
                    var pixel = $scope.pixels[y][x];
                    pixel.defineIfBackground();
                    if (x == 0)
                        $scope.p = 0;

                    if (pixel.a != 0) {
                        if (!$scope.puzzles[$scope.p]) {
                            //new object
                            $scope.colors.push({
                                r: getRandomInt(0, 255),
                                g: getRandomInt(0, 255),
                                b: getRandomInt(0, 255)
                            });
                            $scope.puzzles[$scope.p] = [];
                        }
                        $scope.p = 0;
                        while ($scope.puzzles[$scope.p].length > 1) {
                            if (_.any($scope.puzzles[$scope.p], function (p) {
                                    var dist = pixel.getDistance(p);
                                    return dist <= $scope.maxDist;
                                }))
                            {
                                d[0] = $scope.colors[$scope.p].r;
                                d[1] = $scope.colors[$scope.p].g;
                                d[2] = $scope.colors[$scope.p].b;
                                d[3] = 255;
                                break;
                            }
                            if (!$scope.puzzles[$scope.p+1]){
                                //new object
                                $scope.colors.push({
                                    r: getRandomInt(0, 255),
                                    g: getRandomInt(0, 255),
                                    b: getRandomInt(0, 255)
                                });
                                $scope.p++;
                                $scope.puzzles[$scope.p] = [];
                                break;
                            }
                            $scope.p++;
                        }

                        $scope.puzzles[$scope.p].push(pixel);
                        context.putImageData(id, x, y );
                    }
                };

                $scope.detectPuzzles = function(){
                    $scope.cutBackground();
                    logService.log('Begin of puzzle detect');
                    $timeout(function () {
                        var queue = new Queue();
                        for (var y = 0; y < $scope.pixels.length; y++)
                            for (var x = 0; x < $scope.pixels[y].length; x++) {
                                //queue.register($scope.processPixel, x, y);
                                $scope.processPixel(x, y);
                            }
                        queue.activate();
                        logService.log('End of puzzle detect')
                    });
                };

                function Color(r, g, b, a){
                    this.r = r;
                    this.b = b;
                    this.g = g;
                    this.a = 255;
                    if (a)
                        this.a = a;
                }

                var COLOR_RED = new Color(255, 0, 0);
                var COLOR_GREEN = new Color(0, 255, 0);
                var COLOR_BLUE = new Color(0, 0, 255);
                var COLOR_YELLOW = new Color(0, 255, 255);

                $scope.writePixel = function(pixel, color){
                    var id = context.createImageData(1,1);
                    var d  = id.data;
                    var _color = pixel;
                    if (color)
                        _color = color;
                    d[0]   = _color.r;
                    d[1]   = _color.g;
                    d[2]   = _color.b;
                    d[3]   = _color.a;
                    context.putImageData(id, pixel.x, pixel.y);
                };

                function detectCorners(){
                    for (var i = 0; i <  $scope.puzzles.length; i++){
                        var puzzle = $scope.puzzles[i];

                        var sortedX = _.sortBy(puzzle, 'x');
                        var minX = _.min(sortedX, function(p){return p.x;});
                        var maxX = _.max(sortedX, function(p){return p.x;});

                        var sortedY = _.sortBy(puzzle, 'y');
                        var minY = _.min(sortedY, function(p){return p.y;});
                        var maxY = _.max(sortedY, function(p){return p.y;});

                        var minXA = _.select (sortedX, function(p){return p.x == minX.x});
                        var maxXA = _.select (sortedX, function(p){return p.x == maxX.x});

                        var minYA = _.select (sortedY, function(p){return p.y == minY.y;});
                        var maxYA = _.select (sortedY, function(p){return p.y == maxY.y;});


                        var bottomLeft = _.last(_.sortBy(minXA, 'y'));
                        var topRight  =_.first(_.sortBy(maxXA, 'y'));
                        var topLeft = _.first(_.sortBy(minYA, 'x'));
                        var bottomRight  =_.last(_.sortBy(maxYA, 'x'));
                        //color corners
                        $scope.writePixel(bottomRight, COLOR_RED);
                        $scope.writePixel(topRight, COLOR_RED);
                        $scope.writePixel(topLeft, COLOR_RED);
                        $scope.writePixel(bottomLeft, COLOR_RED);
                    }
                }

                $scope.$on('queue-end', function(){
                    logService.log('Puzzles found: ' + $scope.puzzles.length);
                    detectCorners();
                });

                $scope.restoreBackground = function(){
                    if ($scope.originalImageData)
                        context.putImageData($scope.originalImageData, 0, 0);
                };

                $scope.iterateOverPixels = function(action){
                    for (var y = 0; y < $scope.pixels.length; y++)
                        for (var x = 0; x < $scope.pixels[y].length; x++) {
                            var pixel = $scope.pixels[y][x];
                            action(pixel);
                        }
                };

                $scope.cutBackground = function(){
                    if (!$scope.hasImage)
                        return;
                    $scope.restoreBackground();
                    $scope.iterateOverPixels(function(pixel){
                        pixel.defineIfBackground($scope.fixedPixel);
                        if (pixel.isBackground)
                            pixel.a = 0
                    });
                    $scope.writePixels();
                };

                $scope.writePixels = function(){
                    var imgData = context.getImageData(0,0,canvas.width,canvas.height);
                    var d = imgData.data;
                    var x = 0, y = 0;
                    for (var i = 0;i < imgData.data.length;i+=4, x++) {
                        if (x >= $scope.pixels[y].length){
                            y++;
                            x = 0;
                        }
                        try {
                            var pixel = $scope.pixels[y][x];
                        }
                        catch(e){
                            console.log(x);
                            console.log(y);
                            console.log(i);
                        }
                        d[i] = pixel.r;
                        d[i+1] = pixel.g;
                        d[i+2] = pixel.b;
                        d[i+3] = pixel.a;
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
                    var y = -1;
                    var x = -1;
                    for (var i=0;i<imgData.data.length;i+=4)
                    {
                        x++;
                        if (i % (canvas.width*4) == 0){
                            $scope.pixels.push([]);
                            y++;
                            x = 0;
                        }

                        $scope.pixels[y].push(new Pixel(
                            imgData.data[i],
                            imgData.data[i+1],
                            imgData.data[i+2],
                            imgData.data[i+3],
                            x, y,
                            i)
                        );
                    }
                }

                function handleFileDrop(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    $scope.reset();

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