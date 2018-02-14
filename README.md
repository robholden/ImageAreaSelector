# Image Area Selector
A Javascript plugin that selects an area of an image.

## Installation
``npm install image-area-selector --save``

## Screenshots
<img src="https://media.giphy.com/media/20NWtoZW4edhWESmyw/giphy.gif" width="400"> <img src="https://media.giphy.com/media/8FJe2UCtlvv2TMorMx/giphy.gif" width="400">

## Usage
There are four methods: setup, show, hide, capture.

### HTML
~~~~
<div>
  <img id="img" src="large.jpg"></div>
</div>
<button id="done">Done</button>
~~~~

### Javascript
~~~
var selector = new Selector({
  imgId: 'img',           // The id of the image to be used for selecting
  className: 'container', // The image will be surrounded by a div, you can give that div a class name
  keepAspect: true,       // Allow any ratio, or keep the image ratio during resizing
  minWidth: 50,           // Minimum allowed width (native)
  maxWidth: 300,          // Maximum allowed width (native)
  minHeight: 50,          // Minimum allowed height (native)
  maxHeight: 300          // Maximum allowed height (native)
})

// You can run this either before/after an image has loaded
selector.setup();

document.getElementById('img').onclick = function (event) {
  selector.show(); // Triggers the selector over the image
}

document.getElementById('done').onclick = function (event) {
  /*
    This generates the new picture dimensions in images native size
    It returns the width & height of the new thumbnail as well as the x & y positions (bottom left corner)
    It's up to you to create a thumbnail using these dimensions
  */
  selector.capture(function(result) {
    console.log(result);
    selector.hide(); // This hides the selector
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

#selector-container {
  display: inline-block;
  overflow: hidden;
}

#selector-move {
  position: absolute;
  box-shadow: 0 0 0 20000px rgba(0, 0, 0, 0.5);
  /* border: 3px dotted black; */
  cursor: move;
}

#selector-resize {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
}

#selector-resize div {
  position: absolute;
  width: 15px;
  height: 15px;
}

#selector-resize .nw {
  top: 0;
  left: 0;
  border-top: 5px solid black;
  border-left: 5px solid black;
  cursor: nw-resize;
}

#selector-resize .ne {
  top: 0;
  right: 0;
  border-top: 5px solid black;
  border-right: 5px solid black;
  cursor: ne-resize;
}

#selector-resize .sw {
  bottom: 0;
  left: 0;
  border-bottom: 5px solid black;
  border-left: 5px solid black;
  cursor: sw-resize;
}

#selector-resize .se {
  bottom: 0;
  right: 0;
  border-bottom: 5px solid black;
  border-right: 5px solid black;
  cursor: se-resize;
}
~~~
