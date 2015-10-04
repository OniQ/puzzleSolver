/**
 * Created by OniQ on 04/10/15.
 */
define(['puzzleDirectives'], function(puzzleDirectives){
    puzzleDirectives.directive('imageContainer', function(imageManager) {
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

                function appendFile(image){
                    $scope.src = image.src;
                    $scope.hasImage = true;
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