# Image Area Selector
A Javascript plugin for image cropping.

## Installation
``[Coming Soon] npm install image-area-selector --save``

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
