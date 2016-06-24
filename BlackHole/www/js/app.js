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
        constellation.intializeClient("http://192.168.43.32:8088", "21affda431649385c6ff45c10f7043b46d09d821", "BlackClient");
        constellation.connect();

        textInput = function (bullet) {
            constellation.sendMessage({ Scope: 'Package', Args: ['PushBullet'] }, 'SendPush', { Title: 'BlackBullet', Message: bullet });
        }

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
            if (change.newState === $.signalR.connectionState.connected) {
                constellation.requestSubscribeStateObjects("*", "BlackMenu", "Movements", "*");
            }
        });

        $scope.Menu = 'Home';
        constellation.onUpdateStateObject(function (stateobject) {

            $scope.$apply(function () {
                if ($scope[stateobject.PackageName] === undefined) {
                    $scope[stateobject.PackageName] = {};
                }
                $scope[stateobject.PackageName][stateobject.Name] = stateobject;

                // CAS SO MOVEMENTS
                if (stateobject.Name === 'Movements') {
                    // Menu HOME
                    if ($scope.Menu === 'Home') {
                        if (stateobject.Value.Left) {
                            // 'Request' (GT or 'RATP')
                            $scope.Menu = 'Request';
                        }
                        else if (stateobject.Value.Right) {
                            // 'PushBullet'
                            $scope.stopAcc();
                            recognition.start();
                        }
                        else if (stateobject.Value.Flat) {
                            // INFO
                            constellation.sendMessage({ Scope: 'Package', Args: ['BlackInfo'] }, 'Morning', 0);
                            constellation.requestStateObjects("*", "BlackInfo", "Morning", "*");
                        }
                        else if (stateobject.Value.Down) {
                            // SETTINGS

                        }

                    }
                        // Menu 'Request'
                    else if ($scope.Menu === 'Request') {
                        if (stateobject.Value.Left) {
                            // 'RATP'
                            $scope.Menu = 'RATP';
                        }
                        else if (stateobject.Value.Right) {
                            // GOOGLE TRAFFIC
                        }
                    }
                        // Menu 'RATP'
                    else if ($scope.Menu === 'RATP') {
                        if (stateobject.Value.Left) {
                            // Get Schedule
                            TTS.speak({
                                text: "Vous avez sélectionné R A T P Schedule",
                                locale: 'fr-FR',
                                rate: 0.8
                            });
                            RatpSchedule();
                        }
                        else if (stateobject.Value.Right) {
                            // Get Traffic
                            TTS.speak({
                                text: "Vous avez sélectionné R A T P Traffic",
                                locale: 'fr-FR',
                                rate: 0.8
                            });
                            RatpTraffic();
                        }
                    }
                }

                // CAS SO MORNING
                if (stateobject.Name === 'Morning') {
                    if (stateobject.Value.source === 1) {
                        constellation.sendMessage({ Scope: 'Package', Args: ['MessageCallback'] }, 'MyMessage', [stateobject.Value.message, 100, 0]);
                        constellation.sendMessage({ Scope: 'Package', Args: ['BlackInfo'] }, 'Morning', 2);
                        $scope.stopAcc();
                    }
                    if (stateobject.Value.source === 0) {
                        TTS.speak({
                            text: stateobject.Value.message,
                            locale: 'fr-FR',
                            rate: 0.8
                        });
                        constellation.sendMessage({ Scope: 'Package', Args: ['BlackInfo'] }, 'Morning', 2);
                        $scope.stopAcc();
                    }
                }
                })              
        }) // Fin du OnUpdateStateObject

        // FONCTION RATP SCHEDULE
        RatpSchedule = function () {
            type = "metro";
            line = "1";
            station = "Bastille";
            direction = "La Defense";
            constellation.sendMessageWithSaga({ Scope: 'Package', Args: ['Ratp'] }, 'GetSchedule', [type, line, station, direction], function (result) {
                annonce = "les prochaines arrivées,"
                angular.forEach(result.Data, function (id, destination, message) {
                    s = message;
                    if ((s.EndsWith("mn")))
                        annonce = annonce + s.Remove(s.Length - 2, 2) + "minutes";
                    else
                        annonce = annonce + s;
                });
                TTS.speak({
                    text: annonce,
                    locale: 'fr-FR',
                    rate: 0.75
                });
            })
            $scope.Menu = 'Home';
        };

        // FONCTION RATP TRAFFIC
        RatpTraffic = function () {
            type = "metro";
            line = "1";
            constellation.sendMessageWithSaga({ Scope: 'Package', Args: ['Ratp'] }, 'GetTraffic', [type, line], function (result) {
                message = result.Data.message;
                TTS.speak({
                    text: message,
                    locale: 'fr-FR',
                    rate: 0.75
                });
            })
            $scope.Menu = 'Home';
        };
    }])


// Parametrage de la Voice Recognition
var recognition;
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-Fr';
    recognition.onresult = function (event) {
        if (event.results.length > 0) {
            var text = event.results[0][0].transcript;
            textInput(text);
        }
    }
}

