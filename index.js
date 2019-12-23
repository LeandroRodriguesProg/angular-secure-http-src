/*global angular, Blob, URL */

(function () {
  'use strict';

  angular.module('angular.secureResources', [])
    .directive('httpSrc', ['$http', function ($http) {
      return {
        // do not share scope with sibling img tags and parent
        // (prevent show same images on img tag)
        template:'<a ng-if="browserIE" href="{{objectURL}}" target="_blank"> <b>Clique aqui para fazer download</b> </a> <a ng-if="!browserIE" ng-click="openForIE()"> <b>Clique aqui para fazer download</b> </a>',
        scope: {
          httpSrc: '@'
        },
        link: function ($scope, elem, attrs) {
          function revokeObjectURL() {
            if ($scope.objectURL) {
              URL.revokeObjectURL($scope.objectURL);
            }
          }

          $scope.$watch('objectURL', function (objectURL) {
              if (elem[0].tagName === "A") {
                      elem.attr('href', objectURL);
                      elem.attr('target', "_blank");
                  } else {
                    elem.attr('src', objectURL);
              }
          });

          $scope.$on('$destroy', function () {
            revokeObjectURL();
          });

          attrs.$observe('httpSrc', function (url) {
            revokeObjectURL();

            if (url && url.indexOf('data:') === 0) {
              $scope.objectURL = url;
            } else if (url) {
              $http.get(url, {
                  responseType: 'arraybuffer',
                  cache: true,
                  headers: {
                    'accept': 'image/webp,image/*,*/*;q=0.8'
                  }
                })
                .then(function (response) {
                  var blob = new Blob(
                    [response.data], { type: response.headers('Content-Type') }
                  );
                  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    $scope.browserIE=true;
                    $scope.objectURL = blob;
                } else {
                  $scope.browserIE=false;
                    $scope.objectURL = URL.createObjectURL(blob);
                }

                $scope.openForIE = function() {
                  window.navigator.msSaveOrOpenBlob($scope.objectURL, "fichaAt.pdf");
                }
                
                  
                });
            }
          });
        }
      };
    }]);
})();
 }
