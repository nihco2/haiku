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
  posY: 920,
  destX: -300
}, {
  type: 'mountain',
  name: 'mountain2',
  comeFrom: 'right',
  posY: 1050,
  destX: 300
}];
var Haiku = React.createClass({
  container: new createjs.Container(),
  queue: new createjs.LoadQueue(),
  stage: null,
  scrollHeight: null,
  bkgHeight: null,
  gameEnabled: true,
  flakes: [],
  collection: [],
  num: 0,
  it: 0,
  FOOTSTEPS: 50,
  SCROLL_VELOCITY: 55,
  ASSET_MOVEMENT: 3,
  RUN_LIMIT: 1000,
  SNOW_SPEED: 3,
  SNOW_SIZE: 7,
  FLAKES_NUMBER: 45,
  END_TOUCH_EVENT: 500,
  FLAKES_TIME_CHANGE_DIRECTION: 20000, //miliseconds
  SNOW_COLOR: {
    red: 255,
    green: 255,
    blue: 255
  },
  isPortrait: function() {
    if (window.innerHeight > window.innerWidth) {
      return true;
    } else {
      return false;
    }
  },
  isMobile: function() {
    return (/Mobile|Android|iPhone|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera) ? true : false;
  },
  isOnScreen: function(el) {
    return (el.y >= -this.container.y - window.innerHeight - el.getBounds().height / 2);
  },
  preloadAssets: function() {
    createjs.Sound.alternateExtensions = ["mp3"];
    this.queue.installPlugin(createjs.Sound);
    this.queue.loadManifest([{
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
      id: "footstep",
      src: "assets/step.png",
    }, {
      id: "tree",
      src: "assets/arbre.png",
    }], true);

    this.queue.loadFile({
      id: "wind",
      src: "assets/wind.mp3"
    });
    this.queue.on("complete", this.handleComplete);

  },
  handleComplete: function() {
    $('.loader').remove();
    $('.js-btn-start').addClass('block');
    this.initSeasons();
    this.initSize();
    this.initAssets();
    this.initListeners();
    this.initSnowFlakes(this.SNOW_SPEED, this.FLAKES_NUMBER);
  },
  initSeasons: function() {
    var seasons = [],
      self = this;
    seasons[0] = self.queue.getResult('winter'),
    seasons[1] = self.queue.getResult('summer'),
    seasons[2] = self.queue.getResult('autumn'),
    seasons[3] = self.queue.getResult('spring');
    seasons.forEach(function(season, index) {
      var bitmap = new createjs.Bitmap(season);
      self.container.addChild(bitmap);
      (index > 0) ? bitmap.y = self.container.getBounds().height : bitmap.y = 0;
    })
    bitmap = new createjs.Bitmap(self.queue.getResult('bkg'));
    self.container.addChild(bitmap);
    self.stage.addChild(this.container);
  },
  initSize: function() {

    this.stage.canvas.width = this.container.getBounds().width;
    this.stage.canvas.height = window.innerHeight * 2;

    var ratio = this.stage.canvas.height / this.stage.canvas.width;
    this.bkgHeight = this.container.getBounds().height

    $('#haiku').width(window.innerWidth).height(window.innerWidth * ratio);
    this.container.y = -this.bkgHeight + this.stage.canvas.height;
    this.scrollHeight = -this.bkgHeight + this.stage.canvas.height;
  },
  initAssets: function() {
    var mountain = new createjs.Bitmap(this.queue.getResult('mountain'));
    var tree = new createjs.Bitmap(this.queue.getResult('tree'));
    var footstep = new createjs.Bitmap(this.queue.getResult('footstep'));
    var self = this;
    assets.forEach(function(asset, index) {
      var item;
      if (asset.type === 'mountain') {
        item = mountain.clone();
      }
      if (asset.type === 'tree') {
        item = tree.clone();
        item.scaleX = item.scaleY = 1.5;
        item.visible = false;
      }
      if (asset.comeFrom === 'right') {
        item.x = self.stage.canvas.width;
      } else {
        item.x = -item.getBounds().width;
      }

      item.name = asset.name;
      item.comeFrom = asset.comeFrom;
      item.y = asset.posY;
      item.destX = asset.destX;
      item.posX = item.x;
      self.collection.push(item);
      self.container.addChild(item);
    });

    footstep.y = this.bkgHeight - footstep.getBounds().height;

    footstep.x = this.stage.canvas.width / 2 - footstep.getBounds().width;

    this.container.addChild(footstep);
    this.initWalk(footstep);
  },
  resize: function() {
    if (this.isMobile()) {
      $('#wrapper').width(window.innerWidth);
      $('#wrapper').height(window.innerHeight);
    }
  },

  initWalk: function(footstep) {
    var footPosX = this.stage.canvas.width / 2 - footstep.getBounds().width;
    for (var i = 0; i < this.FOOTSTEPS; i++) {
      var footstepClone = footstep.clone();
      lastFootStepIndex = this.container.getNumChildren() - 1;
      footstepClone.y = this.container.getChildAt(lastFootStepIndex).y - footstep.getBounds().height * 2;

      if (i % 2 === 0) {
        footstepClone.x = footPosX + (2 * footstep.getBounds().width);
      }
      footstepClone.name = 'footstep' + i;
      this.container.addChild(footstepClone);
      footstepClone.visible = false;
    }
  },
  initSnowFlakes: function(speed, flakesNumber) {
    var timer = setInterval(this.changeMovement, this.FLAKES_TIME_CHANGE_DIRECTION);
    for (var i = 0; i < flakesNumber; i++) {
      var g = new createjs.Graphics();
      var flake = new createjs.Shape(g);
      g.beginFill(createjs.Graphics.getRGB(this.SNOW_COLOR.red, this.SNOW_COLOR.green, this.SNOW_COLOR.blue));
      g.drawCircle(0, 0, this.SNOW_SIZE);
      flake.vel = (Math.random() * speed) + 0.5;
      flake.xSpeed = Math.floor(Math.random() * (0.5 - -0.5 + 1)) + -0.5;
      flake.scaleX = (Math.random() * 1) + 0.3;
      flake.scaleY = flake.scaleX;
      flake.x = Math.random() * this.stage.canvas.width;
      flake.y = Math.random() * this.stage.canvas.height;
      this.stage.addChild(flake);
      this.flakes.push(flake);
    }
  },
  initListeners: function() {
    $('.js-btn-start').on('click', function() {
      $('header').hide();
      $('#wrapper').show();
      createjs.Sound.play("wind", {
        loop: 'infinite'
      });
    });

    mc = new Hammer(this.stage.canvas);
    mc.get('pan').set({
      threshold: 0
    });

    mc.on("panup", this.handlePanUp);
    mc.on("pandown", this.handlePanDown);

    this.stage.canvas.addEventListener("touchend", this.handleEnd, false);
    window.addEventListener('resize', this.resize, false);
    createjs.Ticker.addEventListener("tick", this.tick);
  },
  handleEnd: function() {
    if (this.container.y < this.scrollHeight + this.num) {
      this.disablePan();
      this.scrollToBottom();
    }

    if (this.container.y > this.SCROLL_VELOCITY) {
      this.disablePan();
      Tween.get(this.container).to({
        y: 0
      }, this.END_TOUCH_EVENT, Ease.cubicOut).call(function() {
        this.enablePan();
      });
    }
  },
  disablePan: function() {
    mc.set({
      enable: false
    });
  },
  enablePan: function() {
    mc.set({
      enable: true
    });
  },
  handlePanDown: function(event) {
    this.num = (event.distance * (this.bkgHeight - this.stage.canvas.height) / this.stage.canvas.height) / this.SCROLL_VELOCITY;
    if (event.distance > this.RUN_LIMIT && this.gameEnabled) {
      this.disablePan();
      this.scrollToBottom();
      this.gameEnabled = false;
      return alert('Rien ne sert de courir petit scarabée !');
    }

    if (this.container.y <= -this.num && this.container.y >= this.scrollHeight) {
      Tween.get(this.container).to({
        y: this.container.y + this.num
      }, 0, Ease.cubicOut);
    }

    this.moveAssets('up');
    this.walking();
  },
  handlePanUp: function(event) {
    this.num = (event.distance * (this.bkgHeight - this.stage.canvas.height) / this.stage.canvas.height) / this.SCROLL_VELOCITY;
    if (this.container.y >= this.scrollHeight - this.num && this.container.y < -this.num) {
      Tween.get(this.container).to({
        y: this.container.y - this.num
      }, 0, Ease.cubicOut);
    }
    this.moveAssets('down');
  },
  scrollToBottom: function() {
    var self = this;
    Tween.get(this.container).to({
      y: this.scrollHeight
    }, self.END_TOUCH_EVENT, Ease.cubicOut).call(function() {
      self.enablePan();
      self.gameEnabled = true;
    });
  },
  moveAssets: function(vertical) {
    var self = this;
    self.collection.forEach(function(item) {
      if (self.isOnScreen(item) && vertical === 'up') {
        if (item.comeFrom === 'right') {
          self.moveAssetToLeft(item, item.destX);
        } else {
          self.moveAssetToRight(item, item.destX);
        }
      }

      if (self.isOnScreen(item) && vertical === 'down') {
        if (item.comeFrom === 'right') {
          self.moveAssetToRight(item, item.posX);
        } else {
          self.moveAssetToLeft(item, item.posX);
        }
      }
    })
  },
  moveAssetToLeft: function(target, max) {
    if (target.x >= max) {
      Tween.get(target).to({
        x: (target.x - this.ASSET_MOVEMENT)
      }, 0, Ease.cubicOut);
    }
  },
  moveAssetToRight: function(target, max) {
    if (target.x <= max) {
      Tween.get(target).to({
        x: (target.x + this.ASSET_MOVEMENT)
      }, 0, Ease.cubicOut);
    }
  },
  walking: function() {
    var lastFootStep = this.container.getChildByName('footstep' + this.it);
    if (lastFootStep && (lastFootStep.y + this.container.y) > (this.stage.canvas.height / 2 - lastFootStep.getBounds().height)) {
      this.it++;
      lastFootStep.visible = true;
    }
  },
  tick: function() {
    this.fall();
    this.stage.update(event);
  },
  changeMovement: function() {
    for (var i = 0; i < this.flakes.length; i++) {
      this.flakes[i].xSpeed *= -1;
    }
  },
  fall: function() {
    for (var i = 0; i < this.flakes.length; i++) {
      this.flakes[i].x += this.flakes[i].xSpeed;
      this.flakes[i].y += this.flakes[i].vel;
      if (this.flakes[i].y > this.stage.canvas.height) {
        this.flakes[i].x = Math.random() * this.stage.getBounds().width;
        this.flakes[i].y = 0;
      }
    }
  },
  componentDidMount: function() {
    this.stage = new createjs.Stage('haiku');
    createjs.Touch.enable(this.stage);
    this.preloadAssets();
  },
  render: function() {
    return React.DOM.canvas({
      id: 'haiku'
    });
  }
});

var HaikuComponent = React.createFactory(Haiku);

React.render(
  HaikuComponent(),
  document.getElementById('wrapper')
);