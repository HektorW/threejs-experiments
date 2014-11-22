(function(factory) {

  if (typeof define !== 'undefined' && define.amd) {
    define(['zepto', 'underscore', 'events'], factory);
  } else {
    window.FileHandler = factory(Zepto, _, Events);
  }

}(function($) {

  function FileHandler() {
    this.init();
  }

  _.extend(FileHandler.prototype, Events);

  FileHandler.prototype.init = function() {
    this._createDOMElement();

    $body = $(document.body);
    $body.on('dragover', _.bind(this.onDragOver, this));
    $body.on('dragleave', _.bind(this.onDragLeave, this));
    $body.on('drop', _.bind(this.onDrop, this));
  };

  FileHandler.prototype._createDOMElement = function() {
    this.$overlay = $('<div>', {
      id: 'filehandler-overlay',
      css: {
        position: 'fixed',
        top: '1px',
        left: '1px',
        width: '99%',
        height: '99%',
        border: 'dashed 3px #eee',
        borderRadius: '10px',
        display: 'none',
        pointerEvents: 'none'
      }
    });

    $(document.body).append(this.$overlay);
  };


  FileHandler.prototype.parseFile = function(file) {
    if (!file) return;
    if (file.type.indexOf('image') === -1) return;

    var reader = new FileReader();
    reader.onload = _.bind(function(readerEvent) {
      this.trigger('imagedata', {
        name: file.name,
        type: file.type,
        data: readerEvent.target.result
      });
    }, this);
    reader.readAsDataURL(file);
  };

  FileHandler.prototype.resizeImage = function(image, width, height) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        res = new Image();

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(0, 0, width, height);

    res.src = canvas.toDataURL('image/jpg');

    return res;
  };


  // Handlers
  FileHandler.prototype.onDragOver = function(event) {
    if (event.preventDefault) event.preventDefault();
    this.$overlay.show();
    return false;
  };
  FileHandler.prototype.onDragLeave = function(event) {
    if (event.preventDefault) event.preventDefault();
    this.$overlay.hide();
    return false;
  };
  FileHandler.prototype.onDrop = function(event) {
    event.preventDefault();
    this.$overlay.hide();

    this.parseFile(event.dataTransfer.files[0]);
  };

  return FileHandler;
}));