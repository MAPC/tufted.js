var saveImages = function(callback) {
  var zip = new JSZip();
  var img = zip.folder("images");

  $("svg").each(function(index, svg) {
    var simg = new Simg(svg);

    simg.toImg(function(image) {
      var filedata = Simg.getBase64Image(image);
      var filename = "chart-" + index + ".png"
      img.file(filename, filedata, {base64: true})
    })

  });

  setTimeout(function(){
    if(callback) callback(zip);
  }, 500);
  
}

var saveZip = function(zip) {
  var content = zip.generate({type:"blob"});
  saveAs(content, "example.zip");
}

var downloadSvgs = function () {
  saveImages(function(zip) {
    saveZip(zip);
  })
}

module.exports = {
  downloadSvgs: downloadSvgs
}