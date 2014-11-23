var stage, canvas, queue, container, ratio, ctx, bkgHeight, timer, flakes = [];

var PAS = 7;

var SNOW_SPEED = 3;

var FLAKES_NUMBER = 100;

var FLAKES_TIME_CHANGE_DIRECTION = 20000; //miliseconds

var SNOW_COLOR = {
  red: 255,
  green: 255,
  blue: 255
}

var assets = [{
  type: 'tree',
  posX: 650,
  posY: 2000,
  destX: 500
}, {
  type: 'mountain',
  posX: -350,
  posY: 520,
  destX: -300
}, {
  type: 'mountain',
  posX: 350,
  posY: 650,
  destX: 300
}];

var isPortrait = function() {
  if (window.innerHeight > window.innerWidth) {
    return true;
  } else {
    return false;
  }
}

var isMobile = function() {
  return (/Mobile|Android|iPhone|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera) ? true : false;
}

function init() {
  canvas = document.getElementById('haiku');
  stage = new createjs.Stage("haiku");
  ctx = canvas.getContext("2d");
  createjs.Touch.enable(stage);
  preloadAssets();
  listentouchEvents();
  if (isMobile()) {
    $('#wrapper').width(window.innerWidth);
    $('#wrapper').height(window.innerHeight);
  }
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
  $('.loader').remove();
  initSize();
  initAssets();
  stage.addChild(container);
  window.addEventListener('resize', resize, false);
  timer = setInterval(changeMovement, FLAKES_TIME_CHANGE_DIRECTION);
  initSnowFlakes(SNOW_SPEED, FLAKES_NUMBER);
  createjs.Ticker.addEventListener("tick", tick);
}

function initSize() {
  var bkg = queue.getResult('bkg');
  var bitmap = new createjs.Bitmap(bkg);
  container = new createjs.Container();
  container.addChild(bitmap);

  if (isMobile()) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  ratio = canvas.width / container.getBounds().width;

  container.scaleX = ratio;
  container.scaleY = ratio;

  container.y = -container.getBounds().height * ratio + canvas.height + PAS;
  bkgHeight = -container.getBounds().height * ratio + canvas.height + PAS;
}

function initAssets() {
  var mountain = new createjs.Bitmap(queue.getResult('mountain'));
  var tree = new createjs.Bitmap(queue.getResult('tree'));
  assets.forEach(function(asset, index) {
    var item;
    if (asset.type === 'mountain') {
      item = mountain.clone();
    }
    if (asset.type === 'tree') {
      item = tree.clone();
    }
    item.x = asset.posX;
    item.y = asset.posY;
    item.destX = asset.destX;
    item.posX = asset.posX;
    container.addChild(item);
  });

}

function listentouchEvents() {
  var mc = new Hammer(canvas);
  mc.on("panup", handlePanUp);
  mc.on("pandown", handlePanDown);
}

function resize() {
  if (isMobile() && !isPortrait()) {
    document.body.classList.add('rotate');
  }

  if (isMobile() && isPortrait()) {
    document.body.classList.remove('rotate');
  }

}

function handlePanUp(event) {
  if (container.y >= bkgHeight) {
    Tween.get(container).to({
      y: (container.y - PAS)
    }, 0, Ease.cubicOut);
  }
  moveAssetToRight(container.getChildAt(1), container.getChildAt(1).posX);
  moveAssetToLeft(container.getChildAt(2), container.getChildAt(2).posX);
  moveAssetToRight(container.getChildAt(3), container.getChildAt(3).posX);
}

function handlePanDown(event) {
  if (container.y <= 0) {
    Tween.get(container).to({
      y: (container.y + PAS)
    }, 0, Ease.cubicOut);
  }
  moveAssetToLeft(container.getChildAt(1), container.getChildAt(1).destX);
  moveAssetToRight(container.getChildAt(2), container.getChildAt(2).destX);
  moveAssetToLeft(container.getChildAt(3), container.getChildAt(3).destX);
}

function moveAssetToRight(target, max) {
  if (target.x <= max) {
    Tween.get(target).to({
      x: (target.x + PAS)
    }, 0, Ease.cubicOut);
  }
}

function moveAssetToLeft(target, max) {
  console.log(target.x, max)
  if (target.x >= max) {
    Tween.get(target).to({
      x: (target.x - PAS)
    }, 0, Ease.cubicOut);
  }
}

function initSnowFlakes(speed, flakesNumber) {
  for (var i = 0; i < flakesNumber; i++) {
    var g = new createjs.Graphics();
    var flake = new createjs.Shape(g);
    g.beginFill(createjs.Graphics.getRGB(SNOW_COLOR.red, SNOW_COLOR.green, SNOW_COLOR.blue));
    g.drawCircle(0, 0, 3);
    flake.vel = (Math.random() * speed) + 0.5;
    flake.xSpeed = Math.floor(Math.random() * (0.5 - -0.5 + 1)) + -0.5;
    flake.scaleX = (Math.random() * 1) + 0.3;
    flake.scaleY = flake.scaleX;
    flake.x = Math.random() * canvas.width;
    flake.y = Math.random() * canvas.height;
    stage.addChild(flake);
    flakes.push(flake);
  }
}

function fall(e) {
  for (var i = 0; i < flakes.length; i++) {
    flakes[i].x += flakes[i].xSpeed;
    flakes[i].y += flakes[i].vel;
    if (flakes[i].y > canvas.height) {
      flakes[i].x = Math.random() * stage.getBounds().width;
      flakes[i].y = 0;
    }
  }
}

function changeMovement(e) {
  for (var i = 0; i < flakes.length; i++) {
    flakes[i].xSpeed *= -1;
  }
}

function tick(event) {
  fall();
  stage.update(event);
}