(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  _props: {
    ratio: 1,
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    mousedown: false,
    offsetX: 0,
    offsetY: 0,
    originX: 0,
    originY: 0,
    resizing: ''
  },

  set: function(id, src, opts) {
    var container = document.getElementById(id);
    if (!container) return console.error('Element not found: ' + id);

    var img = document.createElement('img');
    img.src = src;
    img.id = 'img';

    opts = opts || {};
    var that = this;
    img.onload = function(event) {
      that._props.ratio = img.naturalWidth / img.width;
      that._props.width = img.width / 2;
      that._props.height = img.height / 2;
      that._props.x = (img.width / 2) - (that._props.width / 2);
      that._props.y = (img.height / 2) - (that._props.height / 2);

      var cropper = document.createElement('div');
      cropper.id = "cropper-move";
      cropper.style.width = that._props.width + 'px';
      cropper.style.height = that._props.height + 'px';
      cropper.style.top = that._props.y + 'px';
      cropper.style.left = that._props.x + 'px';

      var resizor = document.createElement('div');
      var nw = document.createElement('div');
      var ne = document.createElement('div');
      var se = document.createElement('div');
      var sw = document.createElement('div');

      resizor.id = "cropper-resize"
      nw.className = "nw";
      ne.className = "ne";
      se.className = "se";
      sw.className = "sw";

      var onMove = function (event) {
        
        /* Get the image position and re-calculate mouses x,y */
        var bounds = img.getBoundingClientRect();
        var absX = event.clientX - bounds.left;
        var absY = event.clientY - bounds.top;
        
        /* Stops the selector being auto-centred */
        absX -= that._props.offsetX;
        absY -= that._props.offsetY;
        
        /* Only move selector within bounds of the image */
        if (absX > (img.width - that._props.width)) {
          absX = img.width - that._props.width;
        } else if (absX < 0) {
          absX = 0;
        }

        if (absY > (img.height - that._props.height)) {
          absY = img.height - that._props.height;
        } else if (absY < 0) {
          absY = 0;
        }
        
        // Update croppers location
        that._props.x = absX;
        that._props.y = absY;

        cropper.style.top = absY + 'px';
        cropper.style.left = absX + 'px';

      }

      var onResize = function (event) {
        
        /* Get new pin size */
        var width = that._props.width + event.clientX - that._props.originX;
        var height = that._props.height + event.clientY - that._props.originY;

        var xVal = event.clientX - that._props.originX;
        var yVal = event.clientY - that._props.originY;
    
        /* Determine pos/neg positioning */
        var pSize = 0;
        switch (that._props.resizing) {
          case 'sw':
            width = -width;
            break;
          case 'se':
            break;
          case 'nw':
            width = that._props.width + (that._props.width - width);
            height = that._props.height + (that._props.height - height);
            break;
          case 'ne':
            height = -height;
            break;
        }

        /* Ensure new size is valid */
        if (width > (opts.max || img.width)) {
          width = opts.max || img.width;
        } else if (width < (opts.max || 50)) {
          width = (opts.max || 50);
        }
        if (height > (opts.max || img.height)) {
          height = opts.max || img.height;
        } else if (height < (opts.min || 50)) {
          height = (opts.max || 50);
        }

        // Maintain aspect ratio?
        if (opts.keepAspect || true) {
          if (width > height) {
            height = width * (img.height / img.width);
          }
          if (height > width) {
            width = height / (img.height / img.width);
          }
        }

        // Centre view
        that._props.x -= (width - that._props.width) / 2;
        that._props.y -= (height - that._props.height) / 2;

        // Are we out of view?
        if (width > (img.width - that._props.x)) {
          var backInPx = width - (img.width - that._props.x)
          that._props.x -= backInPx;
        }
        if (height > (img.height - that._props.y)) {
          var backInPx = height - (img.height - that._props.y)
          that._props.y -= backInPx;
        }
    
        /* Set the cropper to the highest value (keeps ratio) */
        cropper.style.width = width + 'px';
        cropper.style.height = height + 'px';
        cropper.style.top = that._props.y + 'px';
        cropper.style.left = that._props.x + 'px';
        
        that._props.width = width;
        that._props.height = height;

        that._props.originX = event.clientX;
        that._props.originY = event.clientY;

      }
      
      cropper.onmousedown = function (event) {
        that._props.mousedown = true;
        that._props.offsetX = event.offsetX;
        that._props.offsetY = event.offsetY;
      }

      document.onmousedown = function (event) {
        that._props.originX = event.clientX;
        that._props.originY = event.clientY;
      }

      document.onmouseup = function (event) {
        that._props.mousedown = false;
        that._props.offsetX = 0;
        that._props.offsetY = 0;
        that._props.resizing = '';
      }

      document.onmousemove = function(event) {

        // Only move on mousedown
        if (! that._props.mousedown) return;

        if (that._props.resizing) {
          onResize(event);
        } else {
          onMove(event);
        }

      }      

      nw.onmousedown = function (event) {
        that._props.resizing = 'nw';
      }

      ne.onmousedown = function (event) {
        that._props.resizing = 'ne';
      }

      sw.onmousedown = function (event) {
        that._props.resizing = 'sw';
      }

      se.onmousedown = function (event) {
        that._props.resizing = 'se';
      }

      resizor.appendChild(nw);
      resizor.appendChild(ne);
      resizor.appendChild(sw);
      resizor.appendChild(se);
      cropper.appendChild(resizor);
      img.parentElement.appendChild(cropper);
    }

    container.appendChild(img);
  }
}

},{}],2:[function(require,module,exports){
var cropper = require('./index');

cropper.set('container', 'large.jpg');
},{"./index":1}]},{},[2]);
