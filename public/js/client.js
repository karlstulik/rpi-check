(function() {
	'use strict';

	angular.module( 'app', ['chart.js'] )

	.controller( 'main', function( $scope, $timeout ) {
		var socket = io.connect();

		socket.on('init', function (data) {
			$scope.$apply(function() {
				$scope.data = data;
				$scope.tempOptions = {
					animation: {
						duration: 0
					},
					scales: {
						xAxes: [{
							display: false
						}],
						yAxes: [{
							display: true,
							ticks: {
								beginAtZero:false
							}
						}],
						gridLines: {
							display: true
						}
					},
					title: {
						display: true,
						text: "CPU Temperature in °C" 
					}
				};

				$scope.ramOptions = {
					animation: {
						duration: 0
					},
					scales: {
						xAxes: [{
							display: false
						}],
						yAxes: [{
							display: true,
							ticks: {
								beginAtZero:false
							}
						}],
						gridLines: {
							display: true
						}
					},
					title: {
						display: true,
						text: 'RAM Usage in MB'
					}
				};

				$scope.cpuOptions = {
					animation: {
						duration: 0
					},
					scales: {
						xAxes: [{
							display: false
						}],
						yAxes: [{
							display: true,
							ticks: {
								beginAtZero:false
							}
						}],
						gridLines: {
							display: true
						}
					},
					title: {
						display: true,
						text: "CPU Usage in %"
					}
				};
			});
		});

		socket.on('GpioTrigger', function (data) {
			$scope.$apply(function() {
				$scope.data.pins["gpio"+data.channel] = data.value;
			});
		});

		// socket.on('gpio', function(data) {
		// 	console.log(data);
		// 	$scope.data.pins = data;
		// });

		// socket.on('storage', function(data) {
		// 	$scope.data.system.storage = data;
		// });

		socket.on('trigger', function (data) {
			if ($scope.data) {
				$scope.$apply(function() {
					var time = new Date();
					$scope.data.history.temp[0].push(data.temp);
					$scope.data.history.ram[0].push(data.ram);
					$scope.data.history.cpu[0].push(data.cpu);
					$scope.data.history.labels.push(data.lables);
					if ($scope.data.history.labels.length > 256) {
						$scope.data.history.labels.splice(0, 1);
						$scope.data.history.temp[0].splice(0, 1);
						$scope.data.history.ram[0].splice(0, 1);
						$scope.data.history.cpu[0].splice(0, 1);
					}
				});
			}
		});

		$scope.switchClass = function(ch) {
			if ($scope.data.pins["gpio"+ch]) {
				return 'on';
			} else {
				return 'off';
			}
		};



		// $scope.series = ['Series A', 'Series B'];
		// $scope.chartData = [
		// 	[65, 59, 80, 81, 56, 55, 40]
		// ];

	})

}());