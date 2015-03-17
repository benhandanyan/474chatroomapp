var theapp = angular.module("chatapp", ['ngRoute']);

theapp.config(["$routeProvider", "$locationProvider", 
	function($routeProvider, $locationProvider){
	    $routeProvider.when("/room/:topic", {
		    templateUrl : "/chatroom.html",
		    controller  : "RoomController"
	    }).when("/lobby", {
	      templateUrl : "/lobby.html",
	      controller : "LobbyController"
	    }).otherwise({
		    redirectTo : "/lobby"
	    });
	    $locationProvider.html5Mode(true);
}]);

var socket = io.connect();
var rooms = [];
var myroom = "";
socket.on("welcome", function(data){
  rooms = data.rooms;
  console.log("fresh rooms in");
});


theapp.controller("LobbyController", ["$scope",  
  function($scope){
    $scope.rooms = rooms;
    socket.emit("unsubscribe", myroom);
    socket.emit("rooms");
    socket.on("welcome", function(data){
      $scope.rooms = data.rooms;
      $scope.$apply();
    });
  }
]);

theapp.controller("RoomController", ["$scope","$routeParams", 
      function($scope, $routeParams) {
        $scope.roomTopic = $routeParams.topic;
        socket.emit("subscribe", $scope.roomTopic);
        myroom = $scope.roomTopic;
        $scope.messages = [];
        $scope.name = '';
        $scope.text = '';
        socket.on('connect', function () {
          $scope.setName();
        });

        socket.on('message', function (msg) {
          console.log("new message", msg.text);
          $scope.messages.push(msg);
          $scope.$apply();
        });

        $scope.send = function send() {
          console.log('Sending message:', $scope.text);
          socket.emit('send', {text: $scope.text, room: $scope.roomTopic, name: $scope.name});
          $scope.text = '';
        };

        $scope.setName = function setName() {
          socket.emit('identify', $scope.name);
        };
  }]);