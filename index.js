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

  opts: {
    imgId: 'img', 
    className: 'container',
    minWidth: 50,
    maxWidth: 300,
    minHeight: 50,
    maxHeight: 300,
    keepAspect: true
  },

  crop: function(callback) {
    callback({
      width: this._props.width * this._props.ratio,
      height: this._props.height * this._props.ratio,
      xy: [this._props.x * this._props.ratio, this._props.y * this._props.ratio]
    });
  },

  show: function () {
    var cropper = document.getElementById('cropper-move');
    if (! cropper) return console.error('Element not loaded');
    cropper.style.display = 'block';
    return this;
  },

  hide: function () {
    var cropper = document.getElementById('cropper-move');
    if (! cropper) return;

    cropper.style.display = 'none';
  },

  setup: function(opts) {    

    // Check img exists
    opts = opts || this.opts;
    var img = document.getElementById(opts.imgId);
    if (!img) return console.error('Element not found: ' + this.opts.img);

    // Bind options
    if (opts.keepAspect != null) this.opts.keepAspect = opts.keepAspect;
    if (opts.minWidth != null) this.opts.minWidth = opts.minWidth;
    if (opts.maxWidth != null) this.opts.maxWidth = opts.maxWidth; else this.opts.maxWidth = img.width;
    if (opts.minHeight != null) this.opts.minHeight = opts.minHeight;
    if (opts.maxHeight != null) this.opts.maxHeight = opts.maxHeight; else this.opts.maxHeight = img.height;

    var that = this;
    try {
      that.logic(img);
    } catch (ex) {
      img.onload = function(event) {
        that.logic(img);
      }
    }

    return this;
  },

  logic: function (img) {
    var that = this;

    that._props.ratio = img.naturalWidth / img.width;
    that._props.width = img.width / 2;
    that._props.height = img.height / 2;
    that._props.x = (img.width / 2) - (that._props.width / 2);
    that._props.y = (img.height / 2) - (that._props.height / 2);

    var cropper = document.getElementById('cropper-move');
    if (cropper) cropper.remove();

    cropper = document.createElement('div');
    cropper.id = 'cropper-move';    
    cropper.style.width = that._props.width + 'px';
    cropper.style.height = that._props.height + 'px';
    cropper.style.top = that._props.y + 'px';
    cropper.style.left = that._props.x + 'px';
    cropper.style.display = 'none';

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

      var newX = that._props.x;
      var newY = that._props.y;
  
      /* Determine pos/neg positioning */
      if (that._props.resizing === 'nw' || (that._props.resizing === 'sw' && that.opts.keepAspect)) {
        width = that._props.width + (that._props.width - width);
        height = that._props.height + (that._props.height - height);
      }

      if (! that.opts.keepAspect) {
        switch (that._props.resizing) {
          case 'nw':
            newX += xVal;
            newY += yVal;
            break;
          case 'sw':
            width += (that._props.width - width) * 2;
            newX += that._props.width - width;
            break;
          case 'ne':
            height += (that._props.height - height) * 2;
            newY += yVal;
            break;
          case 'se':
            break;
        }

        // Don't go out of the boundries
        if (newX < 0) {
          width = that._props.width;
          newX = 0;
        } else if ((that._props.x + width) > img.width) {
          width = that._props.width;
        }
        
        if (newY < 0) {
          height = that._props.height;
          newY = 0;
        } else if ((that._props.y + height) > img.height) {
          height = that._props.height;
        }
      }

      // Min/max width/height
      if (width > that.opts.maxWidth) {
        width = that.opts.maxWidth;
      } else if (width < that.opts.minWidth) {
        width = that.opts.minWidth;
        newX = that._props.x;
      }
      if (height > that.opts.maxHeight) {
        height = that.opts.maxHeight;
      } else if (height < that.opts.minHeight) {
        height = that.opts.minHeight;
        newY = that._props.y;
      }

      // Maintain aspect ratio?
      if (that.opts.keepAspect) {

        // Set height based on width
        height = width * (img.height / img.width);
        
        // Centre view
        newX -= (width - that._props.width) / 2;
        newY -= (height - that._props.height) / 2;
  
        // Are we out of view?
        if (width > (img.width - newX)) {
          var backInPx = width - (img.width - newX)
          newX -= backInPx;
        }
        if (height > (img.height - newY)) {
          var backInPx = height - (img.height - newY)
          newY -= backInPx;
        }
        
        // Ensure in view
        newX = that._props.x < 0 ? 0 : newX;
        newY = newY < 0 ? 0 : newY;

      }
  
      /* Update positions */
      cropper.style.width = width + 'px';
      cropper.style.height = height + 'px';
      cropper.style.top = newY + 'px';
      cropper.style.left = newX + 'px';
      
      that._props.width = width;
      that._props.height = height;
      that._props.x = newX;
      that._props.y = newY;

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
    
    // Contain img with container
    // `element` is the element you want to wrap
    var container = document.getElementById('cropper-container');
    if (! container) {
      var parent = img.parentNode;
      container = document.createElement('div');
      container.className = this.opts.className;
      container.id = 'cropper-container';
      parent.replaceChild(container, img);
      container.appendChild(img);
    }
    img.parentElement.appendChild(cropper);
  }
}

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = this.length - 1; i >= 0; i--) {
      if(this[i] && this[i].parentElement) {
          this[i].parentElement.removeChild(this[i]);
      }
  }
}