(function (name, context, definition) {
  'use strict'
  if (typeof window.define === 'function' && window.define.amd) {
    window.define(definition)
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition()
  } else if (context.exports) {
    context.exports = definition()
  } else {
    context[name] = definition()
  }
})('Selector', this, function () {
  'use strict'
  var Selector = function (options) {
    if (!(this instanceof Selector)) {
      return new Selector(options)
    }

    var defaultOptions = {
      imgId: 'img',
      className: 'container',
      onStart: null,
      onChange: null,
      onEnd: null,
      minWidth: 50,
      maxWidth: 300,
      minHeight: 50,
      maxHeight: 300,
      relative: false,
      keepAspect: true,
      customRatio: true
    }
    this.options = this.extend(options, defaultOptions);

    this._setProps();
    this._customEventIE();
  }
  Selector.prototype = {
    extend: function (source, target) {
      if (source == null) {
        return target
      }

      for (var k in source) {
        if (source[k] != null && target[k] !== source[k]) {
          target[k] = source[k]
        }
      }

      return target;
    },
    _inProgress: false,
    _img: null,
    _props: {},
    _setProps: function () {
      this._props = {
        aspectRatio: 1,
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
      };
    },
    _customEventIE: function () {
      if (typeof window.CustomEvent === "function") return false; //If not IE

      function CustomEvent(event, params) {
        params = params || {
          bubbles: false,
          cancelable: false,
          detail: undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      }

      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent;
    },
    _clone: function (obj) {
      var o = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          o[prop] = obj[prop];
        }
      }
      return o;
    },
    _triggerEvent: function (eventName, type) {
      if (!this._img) return;
      var event = new CustomEvent(eventName, {
        detail: {
          type: type,
          values: this.coords()
        }
      });
      this._img.dispatchEvent(event);
    },

    setup: function (show) {

      // Check img exists
      var that = this;
      setTimeout(function () {
        var img = document.getElementById(that.options.imgId);
        if (!img) return reject('Element not found: ' + that.options.img);

        that._img = img;

        var notLoaded = function () {
          img.onload = function () {
            that.logic(this);
            if (show === true) that.show();
          }
        }

        if (img.width === 0 || img.height === 0 || img.naturalWidth === 0 || img.naturalHeight === 0) {
          notLoaded();
        } else {
          try {
            that.logic(img);
            if (show === true) that.show();
          } catch (ex) {
            notLoaded();
          }
        }
      }, 0);

      return this;

    },

    destroy: function () {
      if (that.options.onStart) img.removeEventListener('onStart', that.options.onStart);
      if (that.options.onChange) img.removeEventListener('onChange', that.options.onChange);
      if (that.options.onEnd) img.removeEventListener('onEnd', that.options.onEnd);

      var selector = document.getElementById('selector-move');
      if (selector) selector.remove();

      this._setProps();
    },

    coords: function () {
      return {
        width: this._props.width / this._props.ratio,
        height: this._props.height / this._props.ratio,
        x: this._props.x / this._props.ratio,
        y: this._props.y / this._props.ratio,
      };
    },

    logic: function (img) {
      var that = this;

      if (that.options.onStart) img.addEventListener('onStart', that.options.onStart);
      if (that.options.onChange) img.addEventListener('onChange', that.options.onChange);
      if (that.options.onEnd) img.addEventListener('onEnd', that.options.onEnd);

      window.onresize = function () {
        that.logic(img);
      }

      if (that.options.customRatio) {
        that._props.aspectRatio = that.options.maxWidth / that.options.maxHeight;
        var mw = that.options.relative ? that.options.maxWidth : (that.options.maxWidth / that._props.aspectRatio);
        that._props.width = (img.width / 2) < mw ? (img.width / 2) : mw;
        that._props.height = that._props.width / that._props.aspectRatio;
      } else {
        that._props.aspectRatio = img.naturalWidth / img.width;

        var mw = that.options.relative ? that.options.maxWidth : (that.options.maxWidth / that._props.aspectRatio);
        that._props.width = (img.width / 2) < mw ? (img.width / 2) : mw;
        that._props.height = that._props.width / (img.width / img.height);
      }

      var oldProps = that._clone(that._props);
      that._props.ratio = img.width / img.naturalWidth;
      that._props.x = (img.width / 2) - (that._props.width / 2);
      that._props.y = (img.height / 2) - (that._props.height / 2);

      var selector = document.getElementById('selector-move');
      if (selector) selector.remove();

      selector = document.createElement('div');
      selector.id = 'selector-move';
      selector.style.width = that._props.width + 'px';
      selector.style.height = that._props.height + 'px';
      selector.style.top = that._props.y + 'px';
      selector.style.left = that._props.x + 'px';
      selector.style.display = 'none';

      var resizor = document.createElement('div');
      var nw = document.createElement('div');
      var ne = document.createElement('div');
      var se = document.createElement('div');
      var sw = document.createElement('div');

      resizor.id = "selector-resize"
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

        // Update selectors location
        that._props.x = absX;
        that._props.y = absY;

        selector.style.top = absY + img.offsetTop + 'px';
        selector.style.left = absX + img.offsetLeft + 'px';

        // If props have changed call on change fn
        if (oldProps.x != that._props.x || oldProps.y != that._props.y) that._triggerEvent('onChange', 'Move');

      }

      var onResize = function (event) {

        /* Get new pin size */
        var newWidth = that._props.width + (event.clientX - that._props.originX);
        var newHeight = that._props.height + (event.clientY - that._props.originY);

        var xVal = event.clientX - that._props.originX;
        var yVal = event.clientY - that._props.originY;

        var newX = that._props.x;
        var newY = that._props.y;

        /* Determine pos/neg positioning */
        if (that._props.resizing === 'nw' || (that._props.resizing === 'sw' && that.options.keepAspect)) {
          newWidth = that._props.width + (that._props.width - newWidth);
          newHeight = that._props.height + (that._props.height - newHeight);
        }

        if (!that.options.keepAspect) {
          switch (that._props.resizing) {
            case 'nw':
              newX += xVal;
              newY += yVal;

              break;
            case 'sw':
              newWidth += (that._props.width - newWidth) * 2;
              newX += xVal;

              break;
            case 'ne':
              newHeight += (that._props.height - newHeight) * 2;
              newY += yVal;

              break;
          }

          // Don't go out of the boundries
          if (newX < 0) {
            newWidth = that._props.width + (newX - xVal);
            newX = 0;
          } else if ((that._props.x + newWidth + xVal) > img.width) {
            newWidth = img.width - that._props.x;
          }

          if (newY < 0) {
            newHeight = that._props.height;
            newY = 0;
          } else if ((that._props.y + that._props.height) > img.height) {
            newHeight = img.height - that._props.y;
          }
        }

        // Re-calculate based on relative/native
        var relWidth = that.options.relative ? newWidth : (newWidth * that._props.aspectRatio);
        var relHeight = that.options.relative ? newHeight : (newHeight * that._props.aspectRatio);

        var minWidth = that.options.relative ? that.options.minWidth : (that.options.minWidth / that._props.aspectRatio);
        var maxWidth = that.options.relative ? that.options.maxWidth : (that.options.maxWidth / that._props.aspectRatio);

        var minHeight = that.options.relative ? that.options.minHeight : (that.options.minHeight / that._props.aspectRatio);
        var maxHeight = that.options.relative ? that.options.maxHeight : (that.options.maxHeight / that._props.aspectRatio);

        // Min/max width/height
        var xLimitReached = false;
        if (relWidth > that.options.maxWidth) {
          xLimitReached = true;
          newWidth = maxWidth;
        } else if (relWidth < that.options.minWidth) {
          xLimitReached = true;
          newX = that._props.x;
          newWidth = minWidth;
        }

        var yLimitReached = false;
        if (relHeight > that.options.maxHeight) {
          yLimitReached = true;
          newHeight = maxHeight;
        } else if (relHeight < that.options.minHeight) {
          yLimitReached = true;
          newY = that._props.y;
          newHeight = minHeight;
        }

        // Maintain aspect ratio?
        if (that.options.keepAspect) {

          // Set height based on width
          if (that.options.customRatio) newHeight = newWidth / that._props.aspectRatio;
          else newHeight = newWidth * (img.height / img.width);

          // Centre view
          newX -= (newWidth - that._props.width) / 2;
          newY -= (newHeight - that._props.height) / 2;

          // Are we out of view?
          if (newWidth > (img.width - newX)) {
            var backInPx = newWidth - (img.width - newX)
            newX -= backInPx;
          }
          if (newHeight > (img.height - newY)) {
            var backInPx = newHeight - (img.height - newY)
            newY -= backInPx;
          }

          // Ensure in view
          newX = that._props.x < 0 ? 0 : newX;
          newY = newY < 0 ? 0 : newY;

        }

        /* Update width positions */
        if ((that.options.keepAspect || !xLimitReached) && newWidth < that.options.maxWidth) {
          that._props.x = newX;
          selector.style.width = newWidth + 'px';
          selector.style.left = newX + img.offsetLeft + 'px';

          that._props.width = newWidth;
        }

        /* Update height positions */
        if ((that.options.keepAspect || !yLimitReached) && newHeight < that.options.maxHeight) {
          that._props.y = newY;
          selector.style.height = newHeight + 'px';
          selector.style.top = newY + img.offsetTop + 'px';

          that._props.height = newHeight;
        }

        that._props.originX = event.clientX;
        that._props.originY = event.clientY;

        // If props have changed call on change fn
        if (oldProps.height != that._props.height || oldProps.width != that._props.width) that._triggerEvent('onChange', 'Resize');

      }

      var docDown = function (event) {
        that._props.originX = event.clientX;
        that._props.originY = event.clientY;
      }

      var docUp = function () {
        that._triggerEvent('onEnd', that._props.resizing ? 'Resize' : 'Move');

        that._inProgress = false;
        that._props.mousedown = false;
        that._props.offsetX = 0;
        that._props.offsetY = 0;
        that._props.resizing = '';
      }

      var docMove = function (event) {
        if (!that._props.mousedown) return;

        if (that._props.resizing) onResize(event);
        else onMove(event);

        if (!that._inProgress) that._triggerEvent('onStart', that._props.resizing ? 'Resize' : 'Move');
        that._inProgress = true;
      }

      var selDown = function (event) {
        that._props.mousedown = true;
        that._props.offsetX = event.offsetX || that._props.width / 2;
        that._props.offsetY = event.offsetY || that._props.height / 2;
      }

      document.onmousedown = function (event) {
        docDown(event);
      }
      document.ontouchstart = function (event) {
        if (event.touches.length > 0) docDown(event.touches[0]);
      }

      document.onmouseup = function (event) {
        docUp(event);
      }
      document.ontouchend = function (event) {
        docUp();
      }

      document.onmousemove = function (event) {
        docMove(event);
      }
      document.ontouchmove = function (event) {
        if (event.touches.length > 0) docMove(event.touches[0]);
      }

      selector.onmousedown = function (event) {
        selDown(event);
      }
      selector.ontouchstart = function (event) {
        if (event.touches.length > 0) selDown(event.touches[0]);
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

      if (!that.options.keepAspect) {
        nw.ontouchstart = function (event) {
          if (event.touches.length > 0) that._props.resizing = 'nw';
        }
        ne.ontouchstart = function (event) {
          if (event.touches.length > 0) that._props.resizing = 'ne';
        }
        sw.ontouchstart = function (event) {
          if (event.touches.length > 0) that._props.resizing = 'sw';
        }
        se.ontouchstart = function (event) {
          if (event.touches.length > 0) that._props.resizing = 'se';
        }
      }

      resizor.appendChild(nw);
      resizor.appendChild(ne);
      resizor.appendChild(sw);
      resizor.appendChild(se);
      selector.appendChild(resizor);

      // Contain img with container
      // `element` is the element you want to wrap
      var container = document.getElementById('selector-container');
      if (!container) {
        var parent = img.parentNode;
        container = document.createElement('div');
        container.className = this.options.className;
        container.id = 'selector-container';
        parent.replaceChild(container, img);
        container.appendChild(img);
      }
      img.parentElement.appendChild(selector);

    },

    capture: function (crop) {
      var data = this.coords();
      if (crop === true) data['img'] = this.crop();

      return data;
    },

    crop: function () {
      // Source: https://yellowpencil.com/blog/cropping-images-with-javascript/
      // Set up canvas for thumbnail
      var coords = this.coords();
      var tnCanvas = document.createElement('canvas');
      var tnCanvasContext = tnCanvas.getContext('2d');
      tnCanvas.width = coords.width;
      tnCanvas.height = coords.height;

      /* Use the sourceCanvas to duplicate the entire image. 
         This step was crucial for iOS4 and under devices. 
         Follow the link at the end of this post to see what happens when you don’t do this
      */
      var bufferCanvas = document.createElement('canvas');
      var bufferContext = bufferCanvas.getContext('2d');
      bufferCanvas.width = this._img.naturalWidth;
      bufferCanvas.height = this._img.naturalHeight;
      bufferContext.drawImage(this._img, 0, 0);

      /* Now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
      tnCanvasContext.drawImage(bufferCanvas, coords.x, coords.y, coords.width, coords.height, 0, 0, coords.width, coords.height);
      return tnCanvas.toDataURL();
    },

    show: function () {
      setTimeout(function () {
        var selector = document.getElementById('selector-move');
        if (!selector) return console.error('Element not loaded');
        selector.style.display = 'block';
      }, 0);

      return this;
    },

    hide: function () {
      setTimeout(function () {
        var selector = document.getElementById('selector-move');
        if (!selector) return;
        selector.style.display = 'none';
      }, 0);
    }
  }

  return Selector
})

Element.prototype.remove = function () {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
  for (var i = this.length - 1; i >= 0; i--) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
}