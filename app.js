
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var spawn = require('child_process').spawn;
var	gamepadInterface = spawn('sudo', ['./gamepad-interface']);
var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


//=============================================================================
//    SOCKETS CREATION
//=============================================================================

var maxPlayers = 4,
    numPlayers = 0,
    players = [];

var nes = {
    controllerTypeName: 'NES',
    controllerTypeId: 0,
    buttons: [
        {
            id: 0,
            name: 'BTN_FORWARD',
            shape: 'rect',
            x: '206',
            y: '0',
            attributes: [
                
                {name: 'width', value: '228'},
                {name: 'height', value: '296'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 1,
            name: 'BTN_RIGHT',
            shape: 'rect',
            x: '384',
            y: '246',
            attributes: [
                {name: 'width', value: '256'},
                {name: 'height', value: '228'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 2,
            name: 'BTN_BACK',
            shape: 'rect',
            x: '206',
            y: '424',
            attributes: [
                {name: 'width', value: '228'},
                {name: 'height', value: '320'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 3,
            name: 'BTN_LEFT',
            shape: 'rect',
            x: '0',
            y: '246',
            attributes: [
                {name: 'width', value: '256'},
                {name: 'height', value: '228'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 4,
            name: 'BTN_B',
            label: {
                text: 'B',
                attributes: [
                    {name: 'x', value: '100'},
                    {name: 'y', value: '200'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#fff'},
                    {name: 'font-size', value: '100'},
                ]
            },
            shape: 'rect',
            x: '720',
            y: '160',
            attributes: [
                {name: 'width', value: '200'},
                {name: 'height', value: '400'}
            ],
            style: [
                {name: 'fill', value: '#f00'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 5,
            name: 'BTN_A',
            label: {
                text: 'A',
                attributes: [
                    {name: 'x', value: '100'},
                    {name: 'y', value: '200'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#fff'},
                    {name: 'font-size', value: '100'},
                ]
            },
            shape: 'rect',
            x: '1020',
            y: '160',
            attributes: [
                {name: 'width', value: '200'},
                {name: 'height', value: '400'}
            ],
            style: [
                {name: 'fill', value: '#f00'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 6,
            name: 'BTN_START',
            label: {
                text: 'Start',
                attributes: [
                    {name: 'x', value: '100'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#fff'},
                    {name: 'font-size', value: '50'},
                ]
            },
            shape: 'rect',
            x: '720',
            y: '580',
            attributes: [
                {name: 'width', value: '200'},
                {name: 'height', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 7,
            name: 'BTN_SELECT',
            label: {
                text: 'Select',
                attributes: [
                    {name: 'x', value: '100'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#fff'},
                    {name: 'font-size', value: '50'},
                ]
            },
            shape: 'rect',
            x: '1020',
            y: '580',
            attributes: [
                {name: 'width', value: '200'},
                {name: 'height', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        }
    ],
    joysticks: []
},
snes = {
controllerTypeName: 'SNES',
    controllerTypeId: 1,
    buttons: [
        {
            id: 0,
            name: 'BTN_FORWARD',
            shape: 'rect',
            x: '206',
            y: '0',
            attributes: [
                
                {name: 'width', value: '228'},
                {name: 'height', value: '296'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 1,
            name: 'BTN_RIGHT',
            shape: 'rect',
            x: '384',
            y: '246',
            attributes: [
                {name: 'width', value: '256'},
                {name: 'height', value: '228'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 2,
            name: 'BTN_BACK',
            shape: 'rect',
            x: '206',
            y: '424',
            attributes: [
                {name: 'width', value: '228'},
                {name: 'height', value: '320'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 3,
            name: 'BTN_LEFT',
            shape: 'rect',
            x: '0',
            y: '246',
            attributes: [
                {name: 'width', value: '256'},
                {name: 'height', value: '228'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 4,
            name: 'BTN_X',
            label: {
                text: 'X',
                attributes: [
                    {name: 'x', value: '50'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#000'},
                    {name: 'font-size', value: '100'},
                ]
            },
            shape: 'circle',
            x: '915',
            y: '75',
            attributes: [
                {name: 'cx', value: '50'},
                {name: 'cy', value: '50'},
                {name: 'r', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#00f'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 5,
            name: 'BTN_A',
            label: {
                text: 'A',
                attributes: [
                    {name: 'x', value: '50'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#000'},
                    {name: 'font-size', value: '100'},
                ]
            },
            shape: 'circle',
            x: '1070',
            y: '230',
            attributes: [
                {name: 'cx', value: '50'},
                {name: 'cy', value: '50'},
                {name: 'r', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#f00'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 6,
            name: 'BTN_START',
            label: {
                text: 'Start',
                attributes: [
                    {name: 'x', value: '100'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#fff'},
                    {name: 'font-size', value: '50'},
                ]
            },
            shape: 'rect',
            x: '720',
            y: '600',
            attributes: [
                {name: 'width', value: '200'},
                {name: 'height', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 7,
            name: 'BTN_SELECT',
            label: {
                text: 'Select',
                attributes: [
                    {name: 'x', value: '100'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#fff'},
                    {name: 'font-size', value: '50'},
                ]
            },
            shape: 'rect',
            x: '1020',
            y: '600',
            attributes: [
                {name: 'width', value: '200'},
                {name: 'height', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#333'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 8,
            name: 'BTN_Y',
            label: {
                text: 'Y',
                attributes: [
                    {name: 'x', value: '50'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#000'},
                    {name: 'font-size', value: '100'},
                ]
            },
            shape: 'circle',
            x: '760',
            y: '230',
            attributes: [
                {name: 'cx', value: '50'},
                {name: 'cy', value: '50'},
                {name: 'r', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#0f0'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        },
        {
            id: 9,
            name: 'BTN_B',
            label: {
                text: 'B',
                attributes: [
                    {name: 'x', value: '50'},
                    {name: 'y', value: '50'},
                    {name: 'dy', value: '0.5em'},
                    {name: 'text-anchor', value: 'middle'}
                ],
                style: [
                    {name: 'fill', value: '#000'},
                    {name: 'font-size', value: '100'},
                ]
            },
            shape: 'circle',
            x: '915',
            y: '400',
            attributes: [
                {name: 'cx', value: '50'},
                {name: 'cy', value: '50'},
                {name: 'r', value: '100'}
            ],
            style: [
                {name: 'fill', value: '#ff0'},
                {name: 'stroke', value: '#000'},
                {name: 'stroke-width', value: '3px'}
            ]
        }
    ],
    joysticks: []
},
controller = snes;

for (var i = 0; i < maxPlayers; i++) {
    players[i] = false;
    controller.buttons.forEach(function(value) {
        var cmd = 'config\n' + i + '\n' + value.id +'\n' + value.name +'\n';
        //console.log(cmd);
        gamepadInterface.stdin.write(cmd);
    });
    gamepadInterface.stdin.write('create\n' + i + '\n');  
}

gamepadInterface.stdout.on('data', function(data) {
	console.log('stdout: ' + data);
});

gamepadInterface.stderr.on('data', function(data) {
	console.log('stderr: ' + data);
});

io.sockets.on('connection', function (socket) {
	var playerId;

    if (numPlayers >= maxPlayers) {
        socket.emit('max-players-reached', {});
        return;
    }

    for (var i = 0; i < maxPlayers; i++) {
        if (!players[i]) {
            playerId = i;
            players[i] = true;
            numPlayers++;
            console.log("numPlayers " + numPlayers);
            break;
        }
    }

	socket.emit('new-player', { id: playerId });
	socket.emit('controller', controller);
	console.log('Player ' + playerId + ' joined');  
	
	socket.on('btn-pressed', function (data) {
		gamepadInterface.stdin.write('btn_press\n' + playerId + '\n' + data.id + '\n');
		console.log('Button ' + data.id + ' pressed');
	});

	socket.on('btn-released', function (data) {
		console.log('Button ' + data.id + ' released');
		gamepadInterface.stdin.write('btn_release\n' + playerId + '\n' + data.id + '\n');
	});

	socket.on('disconnect', function () {
		numPlayers--;
        players[i] = false;
	});

    socket.on('error', function(err) {
        console.log('Caught random error');
    });
});

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );

    for (var i = 0; i < maxPlayers; i++) {
        gamepadInterface.stdin.write('remove\n' + i + '\n');
    }

    process.exit();
});