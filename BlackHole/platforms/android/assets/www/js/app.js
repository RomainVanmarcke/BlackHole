// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('blackapp', ['ionic', 'ngCordova', 'ngConstellation'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.controller('BlackCtrl', ['$scope', '$cordovaDeviceMotion', 'constellationConsumer',
    function ($scope, $cordovaDeviceMotion, constellation) {

        $scope.state = false;
        constellation.intializeClient("http://AdPC:8088", "53d869509578d1cf7d4e2f37ea287687c54fc431", "BlackClient");
        constellation.connect();

        $scope.runAcc = function () {
            $scope.state = true;
            TTS.speak({
                text: "Vivien et Romain sont généreux",
                locale: 'fr-FR',
                rate: 1
            });

            var options = {
                frequency: 500
            };
            $scope.watch = $cordovaDeviceMotion.watchAcceleration(options);
            $scope.watch.then(
                null,
                function (error) {
                },
                function (result) {
                    $scope.X = result.x;
                    $scope.Y = result.y;
                    $scope.Z = result.z;
                    $scope.timeStamp = result.timestamp;

                    constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector']}, 'SOModifier', ['accelerometer', { "State": $scope.state, "X": $scope.X, "Y": $scope.Y, "Z": $scope.Z }]);
                });
        };

        $scope.stopAcc = function () {
            $scope.state = false;
            $scope.watch.clearWatch();
            $scope.X = 0;
            $scope.Y = 0;
            $scope.Z = 0;
            constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector']}, 'SOModifier', ['accelerometer', { "State": $scope.state, "X": $scope.X, "Y": $scope.Y, "Z": $scope.Z }]);
        };
    }])
