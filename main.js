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