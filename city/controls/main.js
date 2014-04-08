var socket;

(function() {

  socket = io.connect(':8090');

  socket.on('connect', function () {
    socket.emit('role', 'controls');
    console.log('connected');
    document.body.className = 'connected';
  });
  socket.on('disconnect', function() {
    console.log('disconnected');
    document.body.className = '';
  })


  window.addEventListener('deviceorientation', function (event) {
    socket.emit('orientation', {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  });
  window.addEventListener('touchstart', function (event) {
    socket.emit('touch:start', {});
  });
  window.addEventListener('touchend', function (event) {
    socket.emit('touch:end', {});
  });

}());