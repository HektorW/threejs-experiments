var socket;

(function() {

  socket = io.connect(':8090');

  socket.on('connect', function () {
    console.log('connected');
    document.body.className = 'connected';
  });
  socket.on('disconnect', function() {
    console.log('disconnected');
    document.body.className = '';
  })

}());