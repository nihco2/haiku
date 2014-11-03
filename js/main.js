var stage, queue;

function init() {
  document.getElementById('haiku').width = $('#wrapper').width();
  document.getElementById('haiku').height = $('#wrapper').height();
  stage = new createjs.Stage("haiku");
  queue = new createjs.LoadQueue();
  queue.loadManifest([{
    id: "bkg",
    src: "assets/background.jpg"
  }], true);
  queue.on("complete", handleComplete, queue);
}

function handleComplete() {
  var bkg = queue.getResult('bkg');
  var bitmap = new createjs.Bitmap(bkg);
  var currentWidth = bkg.width;
  var canvasWidth = $('#haiku').width();
  bitmap.scaleX = canvasWidth / currentWidth;
  bitmap.scaleY = canvasWidth / currentWidth;
  bitmap.y = $('#haiku').height() - (bitmap.getBounds().height * bitmap.scaleY);
  stage.addChild(bitmap);
  stage.update();
}
