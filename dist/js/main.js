var stage,
  canvas,
  queue,
  container,
  ratio,
  mc,
  bkgHeight,
  scrollHeight,
  num,
  gameEnabled = true,
  collection = [],
  flakes = [];

//plus le pas est grand moins c'est rapide
var PAS = 50;
//plus c'est grand plus les assets se déplacent vite
var ASSET_MOVEMENT = 5;

var RUN_LIMIT = 800;

var SNOW_SPEED = 3;

var FLAKES_NUMBER = 70;

var END_TOUCH_EVENT = 500;

var FLAKES_TIME_CHANGE_DIRECTION = 20000; //miliseconds

var SNOW_COLOR = {
  red: 255,
  green: 255,
  blue: 255
}

var assets = [{
  type: 'tree',
  name: 'tree1',
  comeFrom: 'right',
  posY: 2000,
  destX: 500
}, {
  type: 'mountain',
  name: 'mountain1',
  comeFrom: 'left',
  posY: 520,
  destX: -300
}, {
  type: 'mountain',
  name: 'mountain2',
  comeFrom: 'right',
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

var isOnScreen = function(el) {
  //console.log('!!!!', el.name, el.x)
  return (el.y >= -container.y - window.innerHeight + el.getBounds().height);
};


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
    id: "spring",
    src: "assets/bg_printemps.jpg"
  }, {
    id: "winter",
    src: "assets/bg_hiver.jpg"
  }, {
    id: "autumn",
    src: "assets/bg_automne.jpg"
  }, {
    id: "summer",
    src: "assets/bg_ete.jpg"
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
  $('.js-btn-start').addClass('block');
  initSeasons();
  initSize();
  initAssets();

  window.addEventListener('resize', resize, false);
  timer = setInterval(changeMovement, FLAKES_TIME_CHANGE_DIRECTION);
  initSnowFlakes(SNOW_SPEED, FLAKES_NUMBER);
  createjs.Ticker.addEventListener("tick", tick);
}

function initSeasons() {
  var seasons = [];
  seasons[0] = queue.getResult('winter'),
  seasons[1] = queue.getResult('summer'),
  seasons[2] = queue.getResult('autumn'),
  seasons[3] = queue.getResult('spring');

  container = new createjs.Container();
  seasons.forEach(function(season, index) {
    var bitmap = new createjs.Bitmap(season);
    container.addChild(bitmap);
    (index > 0) ? bitmap.y = container.getBounds().height : bitmap.y = 0;
    bitmap.visible = false;
  })
  bitmap = new createjs.Bitmap(queue.getResult('bkg'));
  container.addChild(bitmap);
  stage.addChild(container);

}

function initSize() {

  canvas.width = container.getBounds().width;
  canvas.height = window.innerHeight * 2;

  ratio = canvas.height / canvas.width;
  bkgHeight = container.getBounds().height
  $('#haiku').width(window.innerWidth).height(window.innerWidth * ratio);
  container.y = -bkgHeight + canvas.height;
  scrollHeight = -bkgHeight + canvas.height;
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
      item.scaleX = item.scaleY = 1.5;
    }
    if (asset.comeFrom === 'right') {
      item.x = canvas.width;
    } else {
      item.x = -item.getBounds().width;
    }
    item.name = asset.name;
    item.comeFrom = asset.comeFrom;
    item.y = asset.posY;
    item.destX = asset.destX;
    item.posX = item.x;
    collection.push(item);
    container.addChild(item);
  });
}

function listentouchEvents() {
  $('.js-btn-start').on('click', function() {
    $('header').hide();
    $('#wrapper').show();
  });
  mc = new Hammer(canvas);
  mc.get('pan').set({
    threshold: 0
  });
  mc.on("panup", handlePanUp);
  mc.on("pandown", handlePanDown);
  canvas.addEventListener("touchend", handleEnd, false);
}

function scrollToBottom() {
  Tween.get(container).to({
    y: scrollHeight
  }, END_TOUCH_EVENT, Ease.cubicOut).call(function() {
    enablePan();
    gameEnabled = true;
  });
}


function resize() {
  if (isMobile()) {
    $('#wrapper').width(window.innerWidth);
    $('#wrapper').height(window.innerHeight);

    if (isPortrait()) {
      /*container.scaleX = ratioP;
      container.scaleY = ratioP;*/
      container.y = -container.getBounds().height * ratioP + canvas.height + PAS;
      scrollHeight = -container.getBounds().height * ratioP + canvas.height + PAS;
    } else {
      /*container.scaleX = ratioL;
      container.scaleY = ratioL;*/
      container.y = -container.getBounds().height * ratioL + canvas.height + PAS;
      scrollHeight = -container.getBounds().height * ratioL + canvas.height + PAS;
    }
  }

}

function handleEnd() {
  //console.log('end event', container.y, scrollHeight);
  if (container.y < scrollHeight + num) {
    disablePan();
    scrollToBottom();
  }
  if (container.y > PAS) {
    disablePan();
    Tween.get(container).to({
      y: 0
    }, END_TOUCH_EVENT, Ease.cubicOut).call(function() {
      enablePan();
    });
  }
}

function disablePan() {
  mc.set({
    enable: false
  });
}


function enablePan() {
  mc.set({
    enable: true
  });
}


function handlePanUp(event) {
  num = (event.deltaY * (bkgHeight - canvas.height) / canvas.height) / PAS;

  if (container.y >= scrollHeight - num && container.y < -num) {
    Tween.get(container).to({
      y: container.y + num
    }, 0, Ease.cubicOut);
  }
  moveAssets('down');
}

function handlePanDown(event) {
  num = (event.deltaY * (bkgHeight - canvas.height) / canvas.height) / PAS;
  if (event.deltaY > RUN_LIMIT && gameEnabled) {
    disablePan();
    scrollToBottom();
    gameEnabled = false;
    return alert('Rien ne sert de courir petit scarabée !');
  }
  if (container.y <= -num && container.y >= scrollHeight) {
    Tween.get(container).to({
      y: container.y + num
    }, 0, Ease.cubicOut);
  }
  moveAssets('up');
}

function moveAssets(vertical) {
  collection.forEach(function(item) {
    //console.log(item.name, isOnScreen(item, st));
    if (isOnScreen(item) && vertical === 'up') {
      if (item.comeFrom === 'right') {
        moveAssetToLeft(item, item.destX);
      } else {
        moveAssetToRight(item, item.destX);
      }
    }
    if (isOnScreen(item) && vertical === 'down') {
      if (item.comeFrom === 'right') {
        moveAssetToRight(item, item.posX);
      } else {
        moveAssetToLeft(item, item.posX);
      }
    }
  })
}

function moveAssetToRight(target, max) {
  if (target.x <= max) {
    Tween.get(target).to({
      x: (target.x + ASSET_MOVEMENT)
    }, 0, Ease.cubicOut);
  }
}

function moveAssetToLeft(target, max) {
  if (target.x >= max) {
    Tween.get(target).to({
      x: (target.x - ASSET_MOVEMENT)
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