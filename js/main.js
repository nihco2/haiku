var stage, canvas, queue, container, ratio, bkgHeight;
var PAS = 5;
var baseWidth = 380;
var baseHeight = 640;
var assets = [{
  type: 'tree',
  posX: 390,
  posY: 390,
  destX: 300
}, {
  type: 'mountain',
  posX: -150,
  posY: 60,
  destX: 0
}, {

  type: 'mountain',
  posX: 380,
  posY: -60,
  destX: 250
}];

function init() {
  canvas = document.getElementById('haiku');
  canvas.width = $('#wrapper').width();
  canvas.height = $('#wrapper').height();
  stage = new createjs.Stage("haiku");
  var context = canvas.getContext("2d");
  createjs.Touch.enable(stage);
  context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
  preloadAssets();
  listentouchEvents();
}

function preloadAssets() {
  queue = new createjs.LoadQueue();
  queue.loadManifest([{
    id: "bkg",
    src: "assets/background.jpg"
  }, {
    id: "mountain",
    src: "assets/montagne.png",
  }, {
    id: "tree",
    src: "assets/arbre.png",
  }], true);
  queue.on("complete", handleComplete);
}

function handleComplete() {
  initSize();
  initAssets();
  stage.addChild(container);
  createjs.Ticker.addEventListener("tick", tick);
}

function initSize() {
  var bkg = queue.getResult('bkg');
  var bitmap = new createjs.Bitmap(bkg);
  var currentWidth = bkg.width;
  var canvasWidth = $('#haiku').width();
  ratio = canvasWidth / currentWidth;
  container = new createjs.Container();
  bitmap.scaleX = ratio;
  bitmap.scaleY = ratio;
  bitmap.y = $('#haiku').height() - (bitmap.getBounds().height * bitmap.scaleY);
  container.addChild(bitmap);
  bkgHeight = -bitmap.y - PAS;
}

function initAssets() {
  var mountain = new createjs.Bitmap(queue.getResult('mountain'));
  var tree = new createjs.Bitmap(queue.getResult('tree'));
  var itemRatio = baseWidth / $('#haiku').width();
  mountain.scaleX = mountain.scaleY = tree.scaleY = tree.scaleX = ratio;
  assets.forEach(function(asset, index) {
    var item;
    if (asset.type === 'mountain') {
      item = mountain.clone();
    }
    if (asset.type === 'tree') {
      item = tree.clone();
    }
    item.x = asset.posX * (baseWidth / $('#haiku').width());
    item.y = asset.posY * (baseHeight / $('#haiku').height());
    item.destX = asset.destX * itemRatio;
    item.posX = asset.posX * itemRatio;
    container.addChild(item);
    console.log(item.destX, asset.destX, itemRatio)
  });
}

function listentouchEvents() {
  var mc = new Hammer(canvas);
  mc.on("panup", handlePanUp);
  mc.on("pandown", handlePanDown);
}

function handlePanUp(event) {
  console.log(container.y, bkgHeight);
  if (container.y >= 0 && container.y < bkgHeight + PAS) {
    Tween.get(container).to({
      y: (container.y - PAS)
    }, 0, Ease.cubicOut);

  }
  if (container.y < 200) {
    moveAssetToRight(container.getChildAt(1), container.getChildAt(1).posX);
    moveAssetToLeft(container.getChildAt(2), container.getChildAt(2).posX);
    moveAssetToRight(container.getChildAt(3), container.getChildAt(3).posX);
  }
}

function handlePanDown(event) {
  console.log(container.y, bkgHeight);
  if (container.y >= 0 && container.y < bkgHeight) {
    Tween.get(container).to({
      y: (container.y + PAS)
    }, 0, Ease.cubicOut);
  }
  if (container.y > 10) {
    moveAssetToLeft(container.getChildAt(1), container.getChildAt(1).destX);
    moveAssetToRight(container.getChildAt(2), container.getChildAt(2).destX);
    moveAssetToLeft(container.getChildAt(3), container.getChildAt(3).destX);
  }
}

function moveAssetToRight(target, max) {
  if (target.x <= max) {
    Tween.get(target).to({
      x: (target.x + PAS)
    }, 0, Ease.cubicOut);
  }
}

function moveAssetToLeft(target, max) {
  if (target.x >= max) {
    Tween.get(target).to({
      x: (target.x - PAS)
    }, 0, Ease.cubicOut);
  }
}

function tick(event) {
  if (container.y < 0) {
    container.y = 0;
  }
  if (container.y > bkgHeight) {
    //container.y = bkgHeight;

  }
  stage.update(event);
}
