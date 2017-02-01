'use strict';

// // Imports
var express = require('express');
var path = require('path');
var morgan = require('morgan')
var gpio = require('rpi-gpio');
var exec = require('child_process').exec;
var os = require('os');
var osu  = require('os-utils');
var storage = require("storage-device-info");
var _ = require("underscore");
var async = require("async");
var fs = require('fs');
// console.log(osu.getProcesses());

// Express & socket.io config
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Logging
app.use(morgan('dev'));

// Set static folders
app.use(express.static(path.join(__dirname, 'public')));

gpio.destroy();

var pinV;
var site = false;
var init = {
	"history":{
		"temp":[[]],
		"labels":[],
		"ram":[[]],
		"cpu":[[]]
	},
	"pins":{
		"gpio7":null,
		"gpio11":null,
		"gpio12":null,
		"gpio13":null,		
		"gpio15":null,
		"gpio16":null,
		"gpio18":null,
		"gpio22":null,
		"gpio29":null,
		"gpio31":null,
		"gpio32":null,
		"gpio33":null,
		"gpio35":null,
		"gpio36":null,
		"gpio37":null,
		"gpio38":null,
		"gpio40":null,
	},
	"system":{
		"model":os.cpus()[0].model,
		"speed":os.cpus()[0].speed,
		"totalmem":(os.totalmem()/1000000).toFixed(2)
	}
};

async.series([
	function(mainCallback) {
		fs.readFile('/proc/cpuinfo', 'utf8', function(err, data) {
			var match = data.match(/Revision\s*:\s*[0-9a-f]*([0-9a-f]{4})/)[1];
			pinV = (match.substring(0, 3) == '000') ? '26' : '40';
			mainCallback(null, "1");
		});
	},
	function(mainCallback) {
		gpio.setup(7 , gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(12, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(13, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(15, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(18, gpio.DIR_IN, gpio.EDGE_BOTH);
		gpio.setup(22, gpio.DIR_IN, gpio.EDGE_BOTH);
		console.log(pinV);
		if (pinV == '40') {
			gpio.setup(29, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(31, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(32, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(33, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(35, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(36, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(37, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(38, gpio.DIR_IN, gpio.EDGE_BOTH);
			gpio.setup(40, gpio.DIR_IN, gpio.EDGE_BOTH);
		}


		// Define routes
		app.get('/', function(req, res) {
			res.sendFile(path.join(__dirname + '/views/index.html'));
		});

		// Sockets
		var socket = io.on('connection', function (sock) {
			console.log('connection');
			site = true;
			
			sock.on('disconnect', function () {
				console.log('disconnect');
				site = false;
			});

			async.series([
				function(callback) {
					gpio.read(7, function(err, val7) {
						gpio.read(11, function(err, val11) {
							gpio.read(12, function(err, val12) {
								gpio.read(13, function(err, val13) {
									gpio.read(15, function(err, val15) {
										gpio.read(16, function(err, val16) {
											gpio.read(18, function(err, val18) {
												gpio.read(22, function(err, val22) {
													init.pins.gpio7 = val7;
													init.pins.gpio11 = val11;
													init.pins.gpio12 = val12;
													init.pins.gpio13 = val13;
													init.pins.gpio15 = val15;
													init.pins.gpio16 = val16;
													init.pins.gpio18 = val18;
													init.pins.gpio22 = val22;
													callback(null, "1");
												});
											});
										});
									});
								});
							});
						});
					});
				},
				function(callback) {
					if (pinV == '40') {
						gpio.read(29, function(err, val29) {
							gpio.read(31, function(err, val31) {
								gpio.read(32, function(err, val32) {
									gpio.read(33, function(err, val33) {
										gpio.read(35, function(err, val35) {
											gpio.read(36, function(err, val36) {
												gpio.read(37, function(err, val37) {
													gpio.read(38, function(err, val38) {
														gpio.read(40, function(err, val40) {
															init.pins.gpio29 = val29;
															init.pins.gpio31 = val31;
															init.pins.gpio32 = val32;
															init.pins.gpio33 = val33;
															init.pins.gpio35 = val35;
															init.pins.gpio36 = val36;
															init.pins.gpio37 = val37;
															init.pins.gpio38 = val38;
															init.pins.gpio40 = val40;
															callback(null, "2");
														});
													});
												});
											});
										});
									});
								});
							});
						});
					} else {
						callback(null, "2");
					}
				},
				function(callback) {
					storage.getPartitionSpace("/opt", function(error, space) {
						init.system.storage = space;
						sock.emit('init', init);
						callback(null, "2");
					});
				}
			]);
		});

		// GPIO Listeners
		gpio.on('change', function(channel, value) {
			var tmp = {
				"channel":channel,
				"value": value
			};

			socket.emit('GpioTrigger', tmp);
		});

		setInterval(function() {
			var time = new Date();
			var tmp = {
				"temp":0,
				"cpu":0,
				"ram":(os.totalmem()-os.freemem())/1000000,
				"lables":time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()+'s'
			}
			osu.cpuUsage(function(v){
				exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
					tmp.temp = stdout/1000;
					tmp.cpu = v*100.0;
					init.history.temp[0].push(tmp.temp);
					init.history.cpu[0].push(tmp.cpu);
					init.history.ram[0].push(tmp.ram);
					init.history.labels.push(tmp.lables);
					if (site) {
						console.log('emit');
						socket.emit('trigger', tmp);
					}
					if (init.history.labels.length > 256) {
						init.history.temp[0].splice(0, 1);
						init.history.cpu[0].splice(0, 1);
						init.history.ram[0].splice(0, 1);
						init.history.labels.splice(0, 1);
					}

				});
			});
		}, 3000);

		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
		});

		// error handler
		app.use(function(err, req, res, next) {
			// set locals, only providing error in development
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};

			// render the error page
			res.status(err.status || 500);
			res.send('404 not found');
		});

		// Start server
		server.listen(3000, function() {
			mainCallback(null, "1");
			console.log('Listening on port 3000');
		});		
	}
])	