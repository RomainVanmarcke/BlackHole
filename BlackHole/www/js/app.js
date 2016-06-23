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
        constellation.intializeClient("http://romain-msi:8088", "21affda431649385c6ff45c10f7043b46d09d821", "BlackClient"); // essayer + à la place de romain-msi
        constellation.connect();

        $scope.runAcc = function () {
            $scope.state = true;

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

        constellation.onConnectionStateChanged(function (change) {
           
            $scope.$apply(function () {
                $scope.state = change.newState === $.signalR.connectionState.connected;
            });
            if (change.newState === $.signalR.connectionState.connected) {
                constellation.requestSubscribeStateObjects("*", "Black$scope.Menu", "Movements", "*");
            }
            


        });

        $scope.Menu = Home;
        constellation.onUpdateStateObject(function (stateobject) {

            $scope.$apply(function () {
                if ($scope[stateobject.PackageName] == undefined) {
                    $scope[stateobject.PackageName] = {};
                }
                $scope[stateobject.PackageName][stateobject.Name] = stateobject;

                // $scope.Menu HOME
                if ($scope.Menu == Home) {
                    if (stateobject.Value.Left) {
                        // REQUEST (GT or RATP)
                        $scope.Menu = Request;

                    }
                    else if (stateobject.Value.Right) {
                        // PUSHBULLET
                        $scope.Menu = PushBullet;

                    }
                    else if (stateobject.Value.Flat) {
                        // INFO

                    }
                    else if (stateobject.Value.Down) {
                        // SETTINGS

                    }

                }
                // $scope.$scope.Menu REQUEST
                else if ($scope.Menu == Request) {
                    if (stateobject.Value.Left) {
                        // RATP
                        $scope.Menu = RATP;
                    }
                    else if (stateobject.Value.Right) {
                        // GOOGLE TRAFFIC
                    }

                }

                // $scope.Menu RATP
                else if ($scope.Menu == RATP) {
                    if (stateobject.Value.Left) {
                        // Get Schedule
                    }
                    else if (stateobject.Value.Right) {
                        // Get Traffic
                    }
                }

                // $scope.Menu PUSHBULLET
                else if ($scope.Menu == PushBullet) {
                    if (stateobject.Value.Left) {
                        // Start RECORDING
                    }
                    else if (stateobject.Value.Right) {
                        // Envoyer message
                    }
                }
            })
        })



    }])

