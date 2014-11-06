var stage, queue, container, posY, canvasWidth, canvasHeight;

function init() {
  document.getElementById('haiku').width = $('#wrapper').width();
  document.getElementById('haiku').height = $('#wrapper').height();
  stage = new createjs.Stage("haiku");
  createjs.Touch.enable(stage);
  preloadAssets();
  listentouchEvents();
}

function preloadAssets() {
  queue = new createjs.LoadQueue();
  queue.loadManifest([{
    id: "bkg",
    src: "assets/background.jpg"
  }], true);
  queue.on("complete", handleComplete);
}

function handleComplete() {
  var bkg = queue.getResult('bkg');
  var bitmap = new createjs.Bitmap(bkg);
  var currentWidth = bkg.width;

  canvasWidth = $('#haiku').width();
  canvasHeight = $('#haiku').height();

  container = new createjs.Container();

  bitmap.scaleX = canvasWidth / currentWidth;
  bitmap.scaleY = canvasWidth / currentWidth;
  bitmap.y = $('#haiku').height() - (bitmap.getBounds().height * bitmap.scaleY);
  container.addChild(bitmap);
  stage.addChild(container);
  createjs.Ticker.addEventListener("tick", tick);
}

function listentouchEvents() {
  var element = document.getElementById('haiku');
  var mc = new Hammer(element);
  mc.on("panup", handlePanUp);
  mc.on("pandown", handlePanDown);
  //element.addEventListener("touchmove", touchMove, false);
  element.addEventListener("touchstart", touchStart, false);
  element.addEventListener("touchend", touchEnd, false);
}

function handlePanUp(event) {
  console.log(event);
  if (container.y >= 0 && container.y < canvasHeight) {
    Tween.get(container).to({
      y: (container.y + 10)
    }, 0, Ease.cubicOut);
  }
}

function handlePanDown(event) {
  console.log(event);
  if (container.y >= 0 && container.y < canvasHeight) {
    Tween.get(container).to({
      y: (container.y - 10)
    }, 0, Ease.cubicOut);
  }
}

function touchMove(event) {
  if (container.y >= 0 && container.y < canvasHeight) {
    var pas = event.touches[0].pageY - posY;
    console.log(event.touches[0].pageY, posY)
    Tween.get(container).to({
      y: (container.y + pas)
    }, 0, Ease.linear);
  } else {
    container.y = 0;
  }
}

function touchStart(event) {
  console.log('start');
  posY = event.touches[0].pageY;

}

function touchEnd(event) {
  console.log('end');
  posY = container.y;
}

function tick(event) {
  if (container.y < 0) {
    container.y = 0;
  }
  if (container.y > canvasHeight) {
    //container.y = canvasHeight;
  }
  stage.update(event);
}