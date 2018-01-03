# Image Area Selector
A Javascript module for image cropping.

## Installation
``npm install image-area-selector --save``

## Usage
There are four methods: setup, show, hide, crop.

#### Setup
Sets up the plugin.

#### Show
Shows the selector

#### Hide
Hides the selector

#### Crop
Returns an object contain selected dimensions (native width|height|x&y of bottom left corner)

~~~
var cropper = require('./index');

cropper.setup({
  imgId: 'img',
  className: 'container',
  keepAspect: true
});

document.getElementById('img').onclick = function (event) {
  cropper.show();
}

document.getElementById('done').onclick = function (event) {
  cropper.crop(function(result) {
    console.log(result);
    cropper.hide();
  });
}

<div>
  <img id="img" src="large.jpg"></div>
</div>
<button id="done">Done</button>
~~~

## Stylesheet
Styling is up to you, but you can use the below for minimal styles.
~~~
* {
  box-sizing: border-box;
}

body {
  padding: 25px;
  user-select: none;
}

div {
  position: relative;
}

img {
  display: block;
  width: 100%;
  max-width: 500px;
}

#cropper-container {
  display: inline-block;
  overflow: hidden;
}

#cropper-move {
  position: absolute;
  box-shadow: 0 0 0 20000px rgba(0, 0, 0, 0.5);
  /* border: 3px dotted black; */
  cursor: move;
}

#cropper-resize {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
}

#cropper-resize div {
  position: absolute;
  width: 15px;
  height: 15px;
}

#cropper-resize .nw {
  top: 0;
  left: 0;
  border-top: 5px solid black;
  border-left: 5px solid black;
  cursor: nw-resize;
}

#cropper-resize .ne {
  top: 0;
  right: 0;
  border-top: 5px solid black;
  border-right: 5px solid black;
  cursor: ne-resize;
}

#cropper-resize .sw {
  bottom: 0;
  left: 0;
  border-bottom: 5px solid black;
  border-left: 5px solid black;
  cursor: sw-resize;
}

#cropper-resize .se {
  bottom: 0;
  right: 0;
  border-bottom: 5px solid black;
  border-right: 5px solid black;
  cursor: se-resize;
}
~~~
