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

.controller('BlackCtrl', ['$scope', '$cordovaDeviceMotion', 'constellationConsumer', '$timeout',
    function ($scope, $cordovaDeviceMotion, constellation, $timeout) {

        $scope.state = false;
        HWM = false;
        FIO = true;
        DI = true;
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

                    constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector'] }, 'SOModifier', ['accelerometer', { "State": $scope.state, "X": $scope.X, "Y": $scope.Y, "Z": $scope.Z }]);
                });
        };

        $scope.stopAcc = function () {
            $scope.state = false;
            $scope.watch.clearWatch();
            $scope.X = 0;
            $scope.Y = 0;
            $scope.Z = 0;
            constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector'] }, 'SOModifier', ['accelerometer', { "State": $scope.state, "X": $scope.X, "Y": $scope.Y, "Z": $scope.Z }]);
            constellation.sendMessage({ Scope: 'Package', Args: ['BlackMenu'] }, 'SOModifierBM', ['Movements', { "Flat": false, "Left": false, "Right": false, "Down": false }]);

        };

        constellation.onConnectionStateChanged(function (change) {
            if (change.newState === $.signalR.connectionState.connected) {
                constellation.requestSubscribeStateObjects("*", "BlackMenu", "Movements", "*");
                constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector'] }, 'SOModifier', ['accelerometer', { "State": $scope.state, "X": 0, "Y": 0, "Z": 0 }]);
                constellation.sendMessage({ Scope: 'Package', Args: ['BlackMenu'] }, 'SOModifierBM', ['Movements', { "Flat": false, "Left": false, "Right": false, "Down": false }]);
                constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector'] }, 'SOModifier', ['SettingsInfo', { "HWM": HWM, "FIO": FIO, "DI": DI}]);

            }
        });

        var millisecondsToWait = 2000;
        myrate = 1;
        $scope.Menu = 'Accueil';
        constellation.onUpdateStateObject(function (stateobject) {

            $scope.$apply(function () {
                if ($scope[stateobject.PackageName] === undefined) {
                    $scope[stateobject.PackageName] = {};
                }
                $scope[stateobject.PackageName][stateobject.Name] = stateobject;

                // CAS SO MOVEMENTS
                if (stateobject.Name === 'Movements') {
                    // Menu Accueil
                    if ($scope.Menu === 'Accueil') {
                        if (stateobject.Value.Left) {
                            // 'Request' (GT or 'RATP')
                            setTimeout(function () {
                                $scope.Menu = 'Request';
                                TTS.speak({
                                    text: "Requete",
                                    locale: 'fr-FR',
                                    rate: myrate
                                });
                            }, 1000);
                            //$scope.Menu = 'Request';
                        }
                        else if (stateobject.Value.Right) {
                            // 'PushBullet'
                            $scope.Menu = "PushBullet";
                            TTS.speak({
                                text: "Peush Boulette",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            $scope.stopAcc();
                            setTimeout(function () {
                                recognition.start();                               
                            }, millisecondsToWait);
                            setTimeout(function () {
                                $scope.Menu= "Accueil";
                            }, millisecondsToWait);

                        }
                        else if (stateobject.Value.Flat) {
                            // INFO
                            TTS.speak({
                                text: "Voici les infos du jour : ",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            constellation.sendMessage({ Scope: 'Package', Args: ['BlackInfo'] }, 'Morning', 0);
                            constellation.requestStateObjects("*", "BlackInfo", "Morning", "*");

                        }
                        else if (stateobject.Value.Down) {
                            // SETTINGS
                            TTS.speak({
                                text: "Raiglages",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            qSaga(10);
                            $scope.stopAcc();
                            $scope.Menu = 'Accueil';
                        }

                    }
                        // Menu 'Request'
                    else if ($scope.Menu === 'Request') {
                        if (stateobject.Value.Left) {
                            // 'RATP'
                            $scope.Menu = 'RATP';
                            TTS.speak({
                                text: "Menu R A T P.",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            //$timeout(1000);

                        }
                        else if (stateobject.Value.Right) {
                            // GOOGLE TRAFFIC
                            $scope.Menu = 'Google Traffic';
                            TTS.speak({
                                text: "Menu Google Traffic",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                        }

                        else if (stateobject.Value.Down) {
                            // Retour Accueil
                            TTS.speak({
                                text: "Accueil",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            $scope.Menu = 'Accueil';
                        }
                    }
                        // Menu 'RATP'
                    else if ($scope.Menu === 'RATP') {
                        if (stateobject.Value.Left) {
                            // Get Schedule
                            TTS.speak({
                                text: "planning R A T P",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            setTimeout(function () {
                                RatpSchedule();
                            }, millisecondsToWait);
                            //RatpSchedule();
                            $scope.Menu = 'Planning';
                        }
                        else if (stateobject.Value.Right) {
                            // Get Traffic
                            TTS.speak({
                                text: "Etat du traffic R A T P",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            setTimeout(function () {
                                RatpTraffic();
                            }, millisecondsToWait);
                            $scope.Menu = 'Traffic';
                        }
                        else if (stateobject.Value.Down) {
                            // Retour Accueil
                            TTS.speak({
                                text: "Accueil",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            $scope.Menu = 'Accueil';
                        }
                    }
                        // Menu GOOGLE TRAFFIC
                    else if ($scope.Menu === 'Google Traffic') {
                        if (stateobject.Value.Left) {
                            $scope.stopAcc();
                            TTS.speak({
                                text: "D�part",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            qSaga(1);
                        }
                        else if (stateobject.Value.Right) {
                            $scope.stopAcc();
                            TTS.speak({
                                text: "D�part",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            qSaga(2);
                        }
                        else if (stateobject.Value.Down) {
                            // RETOUR Accueil
                            TTS.speak({
                                text: "Accueil",
                                locale: 'fr-FR',
                                rate: myrate
                            });
                            $scope.Menu = 'Accueil';
                        }
                        else if (stateobject.Value.Flat) {

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
                            rate: myrate
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
                annonce = "les prochaines arrivees: ";
                for (i in [0, 1, 2, 3]) {
                    s = result.Data[i].message;
                    if (s.indexOf("mn") >= 0) {
                        s = s[0] + s[1] + " minutes";
                    };
                    annonce = annonce + ", " + s;
                };
                TTS.speak({
                    text: annonce,
                    locale: 'fr-FR',
                    rate: myrate
                });
                $scope.Menu = 'Accueil';

            })
        };

        // BLACKSETTINGS
        BlackSettings = function (hard, day, fore) {
            var message = "Vous avez activer : ";
            constellation.sendMessage({ Scope: 'Package', Args: ['BlackConnector'] }, 'SOModifier', ['SettingsInfo', { "HWM": hard, "FIO": fore, "DI": day }]);
            if (hard) {
                message = message + "Les infos du PC , ";
            }
            if (day) {
                message = message + "Les infos du jour , ";
            }
            if (fore) {
                message = message + "la mai TO, ";
            }
            else if (!hard && !day && !fore) {
                message = "Vous n'avez rien activer !";
            }
            TTS.speak({
                text: message,
                locale: 'fr-FR',
                rate: myrate
            });
            
        }

        // FONCTION RATP TRAFFIC
        RatpTraffic = function () {
            type = "metro";
            line = "1";
            constellation.sendMessageWithSaga({ Scope: 'Package', Args: ['Ratp'] }, 'GetTraffic', [type, line], function (result) {
                message = result.Data.message;
                TTS.speak({
                    text: message,
                    locale: 'fr-FR',
                    rate: myrate
                });
            })
            $scope.Menu = 'Accueil';
        };
        GoogleTraffic = function (depart, destination, nb) {
            constellation.sendMessageWithSaga({ Scope: 'Package', Args: ['GoogleTraffic'] }, 'GetRoutes', [depart, destination], function (result) {
                saga(result, destination, depart);
            })
            $scope.Menu = "Accueil";
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

function saga(result, dest, depart) {
    var message = "";
    if (nbsaga === 1) {
        message = message + "Pour aller de " + depart + " a " + dest + ", il faut voyager " + result.Data[0].Name + ", le temps de trajet avec traffic sera de " + result.Data[0].InfoTraffic + "utes, la distance est de : " + result.Data[0].DistanceString;
    }
    else if (nbsaga === 2) {
        for (var i = 1; i < result.Data.length; i++) {
            message = message + "Pour aller de " + depart + " a " + dest + ", vous pouvez voyager " + result.Data[i].Name + ", le temps de trajet avec traffic sera de " + result.Data[i].InfoTraffic + "utes, la distance est de : " + result.Data[i].DistanceString + ".";
        }
    }
    TTS.speak({
        text: message,
        locale: 'fr-FR',
        rate: myrate
    });
}

var nbsaga = 0;
var depart = "";
var reconDest;
document.addEventListener('deviceready', deviceReady, false);

function deviceReady() {
    reconDest = new SpeechRecognition();
    reconDest.lang = 'fr-Fr';
    reconDest.onresult = function (event) {
        if (event.results.length > 0) {
            var text = event.results[0][0].transcript;
            GoogleTraffic(depart, text, nbsaga);
        }
    }
}

var reconDepart;
document.addEventListener('deviceready', deviceIsReady, false);

function deviceIsReady() {
    reconDepart = new SpeechRecognition();
    reconDepart.lang = 'fr-Fr';
    reconDepart.onresult = function (event) {
        if (event.results.length > 0) {
            depart = event.results[0][0].transcript;
            if (nbsaga < 10) {
                TTS.speak({
                    text: "Destination",
                    locale: 'fr-FR',
                    rate: myrate
                });
                setTimeout(function () { reconDest.start(); }, 1000);
            }
            else if (nbsaga === 10) {
                TestSettings(depart);
            }
        }
    }
}

function qSaga(nb) {
    nbsaga = nb;
    setTimeout(function () { reconDepart.start(); }, 1000);
}

function TestSettings(message) {
    message = message.toLowerCase();
    var DI = false;
    var FI = false;
    var HWM = false;
    if (message.indexOf('info') >= 0 && message.indexOf('jour') >= 0) {
        DI = true;
    }
    if (message.indexOf('info') >= 0 && message.indexOf('pc') >= 0) {
        HWM = true;
    }
    if (message.indexOf('forecast') >= 0) {
        FI = true;
    }
    BlackSettings(HWM, DI, FI);
}