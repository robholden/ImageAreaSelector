# Image Area Selector
A Javascript module for image cropping.

## Installation
``npm install image-area-selector --save``

## Screenshots
<img src="https://media.giphy.com/media/20NWtoZW4edhWESmyw/giphy.gif" width="425"> <img src="https://media.giphy.com/media/8FJe2UCtlvv2TMorMx/giphy.gif" width="425">

## Usage
There are four methods: setup, show, hide, crop.

### HTML
~~~~
<div>
  <img id="img" src="large.jpg"></div>
</div>
<button id="done">Done</button>
~~~~

### Javascript
~~~
var cropper = new Cropper({
  imgId: 'img',           // The id of the image to be used for cropping
  className: 'container', // The image will be surrounded by a div, you can give that div a class name
  keepAspect: true        // Allow any ratio, or keep the image ratio during resizing
})

// You can run this either before/after an image has loaded
cropper.setup();

document.getElementById('img').onclick = function (event) {
  cropper.show(); // Triggers the selector over the image
}

document.getElementById('done').onclick = function (event) {
  /*
    This generates the new picture dimensions in images native size
    It returns the width & height of the new thumbnail as well as the x & y positions (bottom left corner)
    It's up to you to create a thumbnail using these dimensions
  */
  cropper.crop(function(result) {
    console.log(result);
    cropper.hide(); // This hides the selector
  });
}
~~~~

### Stylesheet
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
