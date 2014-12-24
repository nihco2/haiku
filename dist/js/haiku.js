var Haiku = React.createClass({
  container: new createjs.Container(),
  queue: new createjs.LoadQueue(),
  stage: null,
  scrollHeight: null,
  bkgHeight: null,
  gameEnabled: true,
  flakes: [],
  texts: [],
  animations: [],
  collection: [],
  seasons: {},
  currentSeason: 'summer',
  num: 0,
  it: 0,
  FOOTSTEPS: 60,
  SCROLL_VELOCITY: 200,
  ASSET_MOVEMENT: 3,
  RUN_LIMIT: 1000,
  SNOW_SPEED: 3,
  SNOW_SIZE: 7,
  FLAKES_NUMBER: 80,
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
    return (el.y >= -this.seasons[this.currentSeason].y - window.innerHeight - el.getBounds().height / 2);
  },
  checkSeason: function(season) {
    return (this.container.y >= -(season.y + season.getBounds().height) && this.container.y <= -season.y);
  },
  preloadAssets: function(manifest, sounds) {
    createjs.Sound.alternateExtensions = ["mp3"];
    this.queue.installPlugin(createjs.Sound);
    this.queue.loadManifest(manifest, true);
    this.queue.loadFile(sounds);
    this.queue.on("complete", this.handleComplete);
    this.queue.on("progress", this.handleProgress);
  },
  handleProgress: function(event) {
    var loaded = Math.round(event.loaded * 100) + '%';
    $('.loader').text(loaded);
  },
  handleComplete: function() {
    $('.loader').remove();
    $('.js-btn-start').addClass('block');
    this.initSeasons();
    this.initSize();
    this.initAssets();
    this.initListeners();
    this.initWalk();
    this.initTexts();
    this.displayGems();
    this.initSnowFlakes(this.SNOW_SPEED, this.FLAKES_NUMBER);
    this.scrollHeight = -this.bkgHeight + this.stage.canvas.height * 2 - this.stage.canvas.height + window.innerHeight * 2;
    this.container.y = this.scrollHeight;
  },
  initSeasons: function() {
    var seasons = [],
      fingersSpriteSheet = new createjs.SpriteSheet(JSON.parse(this.queue.getResult('fingersSpriteSheet'))),
      fingersSprite = new createjs.Sprite(fingersSpriteSheet, 'run'),
      tutoBkg = new createjs.Bitmap(this.queue.getResult('tuto')),
      finalContainer = new createjs.Container(),
      finalBitmap = new createjs.Bitmap(this.queue.getResult('end')),
      self = this;

    finalContainer.addChild(finalBitmap);
    finalContainer.name = 'final';
    self.container.addChild(finalContainer);

    fingersSprite.name = 'fingersSprite';
    seasons[0] = self.queue.getResult('spring'),
    seasons[0]['name'] = 'spring';
    seasons[1] = self.queue.getResult('winter'),
    seasons[1]['name'] = 'winter',
    seasons[2] = self.queue.getResult('autumn'),
    seasons[2]['name'] = 'autumn',
    seasons[3] = self.queue.getResult('summer'),
    seasons[3]['name'] = 'summer';
    seasons.forEach(function(season, index) {
      var bitmap = new createjs.Bitmap(season);
      var bitmapContainer = new createjs.Container();
      bitmapContainer.name = season.name;
      bitmapContainer.addChild(bitmap);
      self.container.addChild(bitmapContainer);
      self.seasons[season.name] = bitmapContainer;
      if (season.name === 'summer') {
        var tutoContainer = new createjs.Container();
        tutoContainer.addChild(tutoBkg);
        tutoContainer.name = 'tuto';
        tutoContainer.addChild(fingersSprite);
        self.seasons.summer.addChild(tutoContainer);
        tutoContainer.y = self.seasons.summer.getBounds().height;
      }
      (index > 0) ? bitmapContainer.y = self.container.getBounds().height - 1 : bitmapContainer.y = finalContainer.getBounds().height;
    })

    self.stage.addChild(this.container);
  },
  initSize: function() {

    this.stage.canvas.width = this.container.getBounds().width;
    this.stage.canvas.height = window.innerHeight * 2;

    var ratio = this.stage.canvas.height / this.stage.canvas.width;
    this.bkgHeight = this.container.getBounds().height + this.stage.canvas.height;

    if (this.isMobile()) {
      $('#haiku').width(window.innerWidth).height(window.innerHeight);
    } else {
      $('#haiku').width($('#wrapper').width).height(window.innerHeight);
    }

  },
  initAssets: function() {
    var self = this;
    console.log(self.animations)
    self.animations.forEach(function(asset, index) {
      var item = new createjs.Bitmap(self.queue.getResult(asset.type));

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
      self.seasons[asset.season].addChild(item);
    });
  },
  resize: function() {
    if (this.isMobile()) {
      $('#wrapper').width(window.innerWidth);
      $('#wrapper').height(window.innerHeight);
    }
  },

  initWalk: function() {
    var footstep = new createjs.Bitmap(this.queue.getResult('footstep')),
      winter = this.container.getChildByName('winter'),
      footPosX = this.stage.canvas.width / 2 - footstep.getBounds().width;

    winter.addChild(footstep);

    footstep.y = winter.getBounds().height - footstep.getBounds().height;
    footstep.x = this.stage.canvas.width / 2 - footstep.getBounds().width;

    for (var i = 0; i < this.FOOTSTEPS; i++) {
      var footstepClone = footstep.clone();
      lastFootStepIndex = winter.getNumChildren() - 1;
      footstepClone.y = winter.getChildAt(lastFootStepIndex).y - footstep.getBounds().height * 2;

      if (i % 2 === 0) {
        footstepClone.x = footPosX + (2 * footstep.getBounds().width);
      }
      footstepClone.name = 'footstep' + i;
      winter.addChild(footstepClone);
      footstepClone.visible = false;
    }
  },
  initSnowFlakes: function(speed, flakesNumber) {
    var timer = setInterval(this.changeMovement, this.FLAKES_TIME_CHANGE_DIRECTION),
      winter = this.container.getChildByName('winter');
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
      flake.y = Math.random() * winter.getBounds().height;
      winter.addChild(flake);
      this.flakes.push(flake);
    }
  },
  initListeners: function() {
    var self = this,
      social = document.getElementById("social"),
      socDOMElement = new DOMElement(social);

    $('.js-btn-start').on('click', function() {
      $('.white').show().fadeTo('slow', 1, function() {
        $('#gems').show();
        $('#wrapper').show().fadeTo('slow', 1);
        $('header').remove();

        self.container.getChildByName('final').addChild(socDOMElement);
        $('.white').fadeTo('slow', 0, function() {
          $(this).remove();
        });
      });
      /*
      createjs.Sound.play("wind", {
        loop: 'infinite'
      });*/
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
  initTexts: function() {
    var self = this;

    self.texts.forEach(function(item) {
      var txt = new createjs.Text();
      var b = txt.getBounds();
      txt.font = item.typo;
      txt.color = item.color;

      txt.textAlign = 'center';
      txt.lineWidth = self.stage.canvas.width;
      txt.x = self.stage.canvas.width / 2;

      if (!item.text) {
        var regex = /<br\s*[\/]?>/gi;
        txt.text = $('#' + item.id).data('content').replace(regex, '\n');
      } else {
        txt.text = item.text;
      }
      if (self.seasons[$('#' + item.id).data('season')]) {
        txt.y = self.seasons[$('#' + item.id).data('season')].getBounds().height + item.position;
        self.seasons[$('#' + item.id).data('season')].addChild(txt);
      } else if (item.id === 'tuto') {
        var tuto = self.seasons.summer.getChildByName('tuto'),
          fingersSprite = tuto.getChildByName('fingersSprite');
        fingersSprite.x = tuto.getBounds().width / 2 - fingersSprite.getBounds().width / 2;
        txt.y = 800;
        self.container.y -= window.innerHeight;
        tuto.addChild(txt);
      }
    })
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
    var i = 0;
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

    if (this.container.y >= -window.innerHeight) {
      this.scrollToTop();
    }
    this.moveAssets('up');

    if (this.checkSeason(this.seasons.winter)) {
      this.currentSeason = 'winter';
      this.walking();
    } else if (this.checkSeason(this.seasons.spring)) {
      this.currentSeason = 'spring';
    } else if (this.checkSeason(this.seasons.summer)) {
      this.currentSeason = 'summer';
    } else {
      this.currentSeason = 'autumn';
    }
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
  scrollToTop: function() {
    var self = this;
    Tween.get(this.container).to({
      y: 0
    }, self.END_TOUCH_EVENT, Ease.cubicOut).call(function() {
      self.disablePan();
      self.gameEnabled = false;
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
    var lastFootStep = this.seasons.winter.getChildByName('footstep' + this.it);
    //(lastFootStep.y + this.container.y) > (this.stage.canvas.height / 2 - lastFootStep.getBounds().height)
    //console.log(lastFootStep.y, this.container.y, this.container.y + winter.y + winter.getBounds().height)
    //console.log(lastFootStep.y + this.container.y, -this.stage.canvas.height / 2 - this.bkgHeight + winter.getBounds().height);
    var seasonsHeight = 400 + this.seasons.summer.getBounds().height + this.seasons.autumn.getBounds().height + this.seasons.winter.getBounds().height + this.container.getChildByName('final').getBounds().height;
    if (lastFootStep) {
      if (lastFootStep.y + this.container.y > this.stage.canvas.height / 2 - this.bkgHeight + seasonsHeight) {
        this.it++;
        lastFootStep.visible = true;
      }
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
      if (this.flakes[i].y > this.container.getChildByName('winter').getBounds().height) {
        this.flakes[i].x = Math.random() * this.stage.canvas.width;
        this.flakes[i].y = this.container.getChildByName('winter').y;
      }
    }
  },
  displayGems: function() {
    var gems = document.getElementById("gems");
    var gemsDOMElement = new DOMElement(gems);
    var finalScreen = this.container.getChildByName('final');
    var index = 1;
    var collect = function(event) {
      $('#' + event.target.id).show();
      Tween.get(event.target).to({
        alpha: 0
      }, 500, Ease.cubicOut);
    };
    for (var season in this.seasons) {
      var gemId = 'gem' + index;
      var img = this.queue.getResult(gemId);
      var gem = new createjs.Bitmap(img);
      gem.id = gemId;
      index++;
      gem.x = $('#' + gemId).data('x');
      gem.y = $('#' + gemId).data('y');
      gem.on('click', collect);
      this.seasons[$('#' + gemId).data('season')].addChild(gem);
    };

    $('[data-toggle="popover"]').popover({
      html: true
    });
    finalScreen.addChild(gemsDOMElement);
    gemsDOMElement.y = 300;
  },
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    var soc = $("#social-haikus"),
      self = this;
    self.stage = new createjs.Stage('haiku');
    createjs.Touch.enable(this.stage);
    createjs.Ticker.setFPS(24);
    $('.gem').on('show.bs.popover', function() {
      $('[data-toggle="popover"]').popover('hide');
    }).on('shown.bs.popover', function() {
      soc.show();
      $('.popover').append(soc);
    });
    $.ajax({
      url: 'assets/assets.json',
      dataType: 'json',
      success: function(data) {
        this.setState({
          data: data
        });
        self.preloadAssets(this.state.data.manifest, this.state.sounds);
        self.animations = this.state.data.animations;
        self.texts = this.state.data.texts;
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    if (!this.isMobile()) {
      $('header,#wrapper').width((640 * window.innerHeight) / 1136);
    }
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