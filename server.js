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
var beep = require('beepbeep')
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

// Vars
var site = false;
var init = {
	"history":{
		"temp":[[]],
		"labels":[],
		"ram":[[]],
		"cpu":[[]]
	},
	"pins":{},
	"system":{
		"model":os.cpus()[0].model,
		"speed":os.cpus()[0].speed,
		"totalmem":(os.totalmem()/1000000).toFixed(2)
	}
};

gpio.setup(7 , gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(12, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(13, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(15, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(18, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(22, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(29, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(31, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(32, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(33, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(35, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(36, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(37, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(38, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(40, gpio.DIR_IN, gpio.EDGE_BOTH);

// Define routes
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

// Sockets
var socket = io.on('connection', function (sock) {
	console.log('connection');
	site = true;
	
	async.series([
		function(callback) {
			gpio.read(7, function(err, val) {
				init.pins.gpio7 = val;
				callback(null, '1');
			});
		},
		function(callback) {
			gpio.read(11, function(err, val) {
				init.pins.gpio11 = val;
				callback(null, '2');
			});
		},
		function(callback) {
			gpio.read(12, function(err, val) {
				init.pins.gpio12 = val;
				callback(null, '3');
			});
		},
		function(callback) {
			gpio.read(13, function(err, val) {
				init.pins.gpio13 = val;
				callback(null, '4');
			});
		},
		function(callback) {
			gpio.read(15, function(err, val) {
				init.pins.gpio15 = val;
				callback(null, '5');
			});
		},
		function(callback) {
			gpio.read(16, function(err, val) {
				init.pins.gpio16 = val;
				callback(null, '6');
			});
		},
		function(callback) {
			gpio.read(18, function(err, val) {
				init.pins.gpio18 = val;
				callback(null, '7');
			});
		},
		function(callback) {
			gpio.read(22, function(err, val) {
				init.pins.gpio22 = val;
				callback(null, '8');
			});
		},
		function(callback) {
			gpio.read(29, function(err, val) {
				init.pins.gpio29 = val;
				callback(null, '9');
			});
		},
		function(callback) {
			gpio.read(31, function(err, val) {
				init.pins.gpio31 = val;
				callback(null, '10');
			});
		},
		function(callback) {
			gpio.read(32, function(err, val) {
				init.pins.gpio32 = val;
				callback(null, '11');
			});
		},
		function(callback) {
			gpio.read(33, function(err, val) {
				init.pins.gpio33 = val;
				callback(null, '12');
			});
		},
		function(callback) {
			gpio.read(35, function(err, val) {
				init.pins.gpio35 = val;
				callback(null, '13');
			});
		},
		function(callback) {
			gpio.read(36, function(err, val) {
				init.pins.gpio36 = val;
				callback(null, '14');
			});
		},
		function(callback) {
			gpio.read(37, function(err, val) {
				init.pins.gpio37 = val;
				callback(null, '15');
			});
		},
		function(callback) {
			gpio.read(38, function(err, val) {
				init.pins.gpio38 = val;
				callback(null, '16');
			});
		},
		function(callback) {
			gpio.read(40, function(err, val) {
				init.pins.gpio40 = val;
				callback(null, '17');
			});
		},
		function(callback) {
			storage.getPartitionSpace("/opt", function(error, space) {
				init.system.storage = space;
				callback(null, '18');
			});
		},
		function(callback) {
			sock.emit('init', init);
			callback(null, '19');
		},
	])

	sock.on('disconnect', function () {
		console.log('disconnect');
		site = false;
	});
});

// GPIO Listeners
gpio.on('change', function(channel, value) {
	var tmp = {
		"channel":channel,
		"value": value
	};

	console.log(tmp);

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
	console.log('Listening on port 3000');
});
	