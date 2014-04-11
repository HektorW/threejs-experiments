var io = require('socket.io').listen(8090);
io.set('log level', 0);

var stub = {
  emit: function() {},
  on: function() {}
};

var client = stub;
var controls = stub;

io.sockets.on('connection', function(socket) {
  socket.on('role', function(role) {
    if (role === 'client')
      setupClient(socket);
    else if (role === 'controls')
      setupControls(socket);
  });
});

function translateDeviceOrientation(data) {
  data.x = data.gamma;
  data.y = data.beta;
  data.z = data.alpha;
}


function setupClient(socket) {
  client = socket;
}

function setupControls(socket) {
  controls = socket;

  controls.on('orientation', function(data) {
    translateDeviceOrientation(data);
    client.emit('orientation', data);
  });

  controls.on('touch:start', function(data) {
    client.emit('move:start', data);
  });
  controls.on('touch:end', function(data) {
    client.emit('move:end', data);
  });
}