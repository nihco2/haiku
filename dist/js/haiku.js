var Haiku = React.createClass({
  container: new createjs.Container(),
  queue: new createjs.LoadQueue(),
  stage: null,
  scrollHeight: null,
  bkgHeight: null,
  gameEnabled: true,
  texts: [],
  animations: [],
  collection: [],
  seasons: {},
  currentSeason: 'summer',
  currentDirection: 'down',
  num: 0,
  it: 0,
  scroll_end: 0,
  FOOTSTEPS: 60,
  SCROLL_VELOCITY: 200,
  ASSET_MOVEMENT: 4,
  RUN_LIMIT: 1000,
  PARTICLES_SPEED: 3,
  SNOW_SIZE: 7,
  PARTICLES_NUMBER: 40,
  END_TOUCH_EVENT: 500,
  PARTICLES_TIME_CHANGE_DIRECTION: 20000, //miliseconds
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
    var elTop = this.seasons[el.season].localToGlobal(el.x, el.y).y;
    var height = el.getBounds() ? el.getBounds().height : 0;
    return (elTop + height - el.delay >= 0);
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
    this.initWalk();
    this.initAssets();
    this.initListeners();
    this.initTexts();
    this.displayGems();
    this.initParticles(this.PARTICLES_SPEED, this.PARTICLES_NUMBER);
  },
  initSeasons: function() {
    var seasons = [],
      fingersSpriteSheet = new createjs.SpriteSheet(JSON.parse(this.queue.getResult('fingersSpriteSheet'))),
      fingersSprite = new createjs.Sprite(fingersSpriteSheet, 'walk'),
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
      self.seasons[season.name].particles = [];
      if (season.name === 'summer') {
        var tutoContainer = new createjs.Container();
        tutoContainer.addChild(tutoBkg);
        tutoContainer.name = 'tuto';

        self.seasons.summer.addChild(tutoContainer);
        tutoContainer.y = self.seasons.summer.getBounds().height;
        if (!self.isMobile()) {
          var desktop = new createjs.Bitmap(self.queue.getResult('keyboard'));
          desktop.y = tutoContainer.getBounds().height - 500;
          desktop.x = tutoContainer.getBounds().width / 2 - desktop.getBounds().width / 2;
          tutoContainer.addChild(desktop);
        } else {
          tutoContainer.addChild(fingersSprite);
        }
      }
      (index > 0) ? bitmapContainer.y = self.container.getBounds().height - 1 : bitmapContainer.y = finalContainer.getBounds().height;
    })

    self.stage.addChild(this.container);

  },
  initSize: function() {
    var tuto = this.seasons.summer.getChildByName('tuto');
    this.stage.canvas.width = this.container.getBounds().width;
    if (!this.isMobile()) {
      this.stage.canvas.height = window.innerHeight * (this.stage.canvas.width / $('#wrapper').width());
      $('#haiku').width($('#wrapper').width);
    } else {
      this.stage.canvas.height = window.innerHeight * (this.stage.canvas.width / window.innerWidth);
    }
    this.bkgHeight = this.container.getBounds().height;
    this.scrollHeight = -this.bkgHeight + this.stage.canvas.height;
    if (this.isMobile()) {
      tuto.getChildByName('fingersSprite').y = tuto.getBounds().height / 2 - tuto.getChildByName('fingersSprite').getBounds().height;
    }

    this.scrollToBottom();
  },
  initAssets: function() {
    var self = this,
      item;
    self.animations.forEach(function(asset, index) {
      if (asset.type === 'spritesheet') {
        spriteSheet = new createjs.SpriteSheet(JSON.parse(self.queue.getResult(asset.name)));
        item = new createjs.Sprite(spriteSheet, 'anim');
      } else {
        item = new createjs.Bitmap(self.queue.getResult(asset.name));
      }
      item.name = asset.name;
      item.season = asset.season;
      item.y = asset.posY;
      item.x = asset.posX;
      item.destX = asset.destX;
      item.destY = asset.destY;
      item.posX = asset.posX;
      item.posY = asset.posY;
      item.delay = asset.delay;
      self.collection.push(item);
      self.seasons[asset.season].addChild(item);
    });
  },
  resize: function() {

  },

  initWalk: function() {
    for (var season in this.seasons) {
      var walk = new createjs.Bitmap(this.queue.getResult(season + 'Walk'));
      var shape = new createjs.Shape();
      walk.name = 'walk';
      shape.graphics.beginFill("#ff0000").drawRect(0, 0, this.container.getBounds().width, this.seasons[season].getBounds().height);
      shape.y = this.seasons[season].getBounds().height;
      walk.mask = shape;
      walk.x = 120;
      this.seasons[season].addChild(walk);
    }
  },

  initParticles: function(speed, particlesNumber) {
    var timer = setInterval(this.changeMovement, this.PARTICLES_TIME_CHANGE_DIRECTION);
    for (var season in this.seasons) {
      for (var i = 0; i < particlesNumber; i++) {
        var particle = {};
        switch (season) {
          case 'winter':
            var g = new createjs.Graphics();
            particle = new createjs.Shape(g);
            g.beginFill(createjs.Graphics.getRGB(this.SNOW_COLOR.red, this.SNOW_COLOR.green, this.SNOW_COLOR.blue));
            g.drawCircle(0, 0, this.SNOW_SIZE);
            break;
          case 'spring':
            particle = new createjs.Container();
            break;
          case 'autumn':
            particle = new createjs.Bitmap(this.queue.getResult('feuille'));
            particle.scaleX = particle.scaleY = 0.8;
            break;
          case 'summer':

            particle = new createjs.Container();
            break;
        }

        particle.vel = (Math.random() * speed) + 0.5;
        particle.xSpeed = Math.floor(Math.random() * (0.5 - -0.5 + 1)) + -0.5;
        particle.scaleX = (Math.random() * 1) + 0.3;
        particle.scaleY = particle.scaleX;
        particle.x = Math.random() * this.stage.canvas.width;
        particle.y = Math.random() * this.seasons[season].getBounds().height;
        this.seasons[season].addChild(particle);
        this.seasons[season].particles.push(particle);
      }
    }
  },
  initListeners: function() {
    var self = this,
      left = true,
      social = document.getElementById("social"),
      socDOMElement = new DOMElement(social);

    $('.js-btn-start').on('click', function() {
      $('.white').show().fadeTo('slow', 1, function() {
        $('#gems').show();
        $('#wrapper').show().fadeTo('slow', 1);
        $('header,footer').remove();

        self.container.getChildByName('final').addChild(socDOMElement);
        $('.white').fadeTo('slow', 0, function() {
          $(this).remove();
        });
      });

      $(document).keydown(function(e) {
        console.log(self.container.y);
        switch (e.which) {
          case 37: // left
            if (left && self.container.y < -self.scrollHeight) {
              left = false;
              self.handlePanDown({
                distance: self.stage.canvas.height / 2
              });
            }
            break;
          case 38: // up
            self.container.y -= 30;
            break;
          case 39: // right
            if (!left && self.container.y < -self.scrollHeight) {
              left = true;
              self.handlePanDown({
                distance: self.stage.canvas.height / 2
              });
            }
            break;
          case 40: //down
            self.container.y += 30;
            break;
          default:
            return;
        }
        e.preventDefault();
      })
      /*createjs.Sound.play("wind", {
        loop: 'infinite'
      });*/
      $(this).removeClass('press');
    }).on('mousedown', function() {
      $(this).addClass('press');
    });;

    $('.social-share li').on('click', function(event) {
      var provider = $(event.target).data('provider');
      var text = $(event.target).parents('#social-haikus').prev().html();

      if (!text) {
        text = $('h1').text();
      } else {
        var regex = /<br\s*[\/]?>/gi;
        text = text.replace(regex, ' ');
      }
      self.socShare(provider, text);
    });

    mc = new Hammer(this.stage.canvas);
    mc.get('pan').set({
      threshold: 0
    });

    if(this.isMobile()){
      mc.on("panup", this.handlePanUp);
      mc.on("pandown", this.handlePanDown);
      mc.on("panend", this.handleEnd);
      mc.on("panstart", this.handleStart);
    }
    
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
      txt.name = item.name;
      if (!item.text) {
        var regex = /<br\s*[\/]?>/gi;
        txt.text = $('#' + item.id).data('content').replace(regex, '\n');
      } else {
        txt.text = item.text;
      }
      if (self.seasons[$('#' + item.id).data('season')]) {
        txt.y = self.seasons[$('#' + item.id).data('season')].getBounds().height + item.position;
        self.seasons[$('#' + item.id).data('season')].addChild(txt);
      } else if (item.id === 'tuto' && self.isMobile()) {
        var tuto = self.seasons.summer.getChildByName('tuto'),
          fingersSprite = tuto.getChildByName('fingersSprite');
        fingersSprite.x = tuto.getBounds().width / 2 - fingersSprite.getBounds().width / 2;
        txt.y = 800;
        tuto.addChild(txt);
      } else if (!self.isMobile() && item.id === 'desktop') {
        var tuto = self.seasons.summer.getChildByName('tuto');
        txt.y = 800;
        tuto.addChild(txt);
      }
      self.container.y -= window.innerHeight;
    })
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

    this.currentDirection = 'down';
    this.scroll_end = event.distance / 2;
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
    //end game
    if (this.container.y >= -window.innerHeight / 2) {
      this.scrollToTop();
      this.disablePan();
    }
    this.walking();
    this.moveAssets('up');
    this.setCurrentSeason();
  },
  handlePanUp: function(event) {
    this.currentDirection = 'up';
    this.scroll_end = event.distance / 2;
    this.num = (event.distance * (this.bkgHeight - this.stage.canvas.height) / this.stage.canvas.height) / this.SCROLL_VELOCITY;
    if (this.container.y >= this.scrollHeight - this.num && this.container.y < -this.num) {
      Tween.get(this.container).to({
        y: this.container.y - this.num
      }, 0, Ease.cubicOut);
    }
    this.walking();
    this.moveAssets('down');
    this.setCurrentSeason();
  },
  handleStart: function() {

  },
  handleEnd: function() {
    var self = this;
    if (self.container.y < self.scrollHeight + self.num) {
      self.disablePan();
      self.scrollToBottom();
    } else if (this.container.y > this.SCROLL_VELOCITY) {
      self.disablePan();
      Tween.get(this.container).to({
        y: 0
      }, self.END_TOUCH_EVENT, Ease.cubicOut).call(function() {
        self.enablePan();
      });
    } else {
      self.disablePan();
      this.walking();
      Tween.get(self.container).to({
        y: (self.currentDirection === 'down') ? self.container.y + self.scroll_end : self.container.y - self.scroll_end
      }, self.END_TOUCH_EVENT, Ease.quadOut).call(function() {
        if (self.container.y < -self.container.getBounds().height) {
          self.scrollToBottom();
        } else if (self.container.y > 0) {
          self.scrollToTop();
        }
        self.enablePan();
      });
    }
  },
  setCurrentSeason: function() {
    if (this.checkSeason(this.seasons.winter)) {
      this.currentSeason = 'winter';
      if (!$('body').hasClass('bkg-winter')) {
        $('body').addClass('bkg-winter');
      }
    } else if (this.checkSeason(this.seasons.spring)) {
      this.currentSeason = 'spring';
      if (!$('body').hasClass('bkg-spring')) {
        $('body').addClass('bkg-spring');
      }
    } else if (this.checkSeason(this.seasons.summer)) {
      this.currentSeason = 'summer';
    } else {
      this.currentSeason = 'autumn';
      if (!$('body').hasClass('bkg-autumn')) {
        $('body').addClass('bkg-autumn');
      }
    }
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
    self.disablePan();
    Tween.get(this.container).to({
      y: 0
    }, self.END_TOUCH_EVENT, Ease.cubicOut).call(function() {
      self.enablePan();
    });
  },
  moveAssets: function(vertical) {
    var self = this;

    self.collection.forEach(function(item) {
      if (self.isOnScreen(item) && vertical === 'up') {

        if (item.posX > item.destX) {
          self.moveAssetToLeft(item, item.destX);
        } else if (item.posX < item.destX) {
          self.moveAssetToRight(item, item.destX);
        }
        if (item.posY > item.destY) {
          self.moveAssetToUp(item, item.destY);
        } else if (item.posY < item.destY) {
          self.moveAssetToDown(item, item.destY);
        }
      }

      if (self.isOnScreen(item) && vertical === 'down') {
        if (item.posX > item.destX) {
          self.moveAssetToRight(item, item.posX);
        } else if (item.posX < item.destX) {
          self.moveAssetToLeft(item, item.posX);
        }
        if (item.posY > item.destY) {
          self.moveAssetToDown(item, item.posY);
        } else if (item.posY < item.destY) {
          self.moveAssetToUp(item, item.posY);
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
  moveAssetToUp: function(target, max) {
    if (target.y >= max) {
      Tween.get(target).to({
        y: (target.y - this.ASSET_MOVEMENT)
      }, 0, Ease.cubicOut);
    }
  },
  moveAssetToDown: function(target, max) {
    if (target.y <= max) {
      Tween.get(target).to({
        y: (target.y + this.ASSET_MOVEMENT)
      }, 0, Ease.cubicOut);
    }
  },
  walking: function() {
    var footsteps = this.seasons[this.currentSeason].getChildByName('walk');
    var otherSeasons = 0;
    switch (this.currentSeason) {
      case 'summer':
        otherSeasons = 15000;
        break;
      case 'autumn':
        otherSeasons = 10000;
        break;
      case 'winter':
        otherSeasons = 5000;
        break;
      case 'spring':
        otherSeasons = 0;
        break;
    }
    footsteps.mask.y = -(this.container.y + otherSeasons + this.stage.canvas.height / 2);
  },
  tick: function() {
    this.fall();
    this.stage.update(event);
  },
  changeMovement: function() {
    for (var i = 0; i < this.PARTICLES_NUMBER; i++) {
      this.seasons[this.currentSeason].particles[i].xSpeed *= -1;
    }
  },
  fall: function() {
    var particleSeasons = [this.seasons.autumn, this.seasons.winter];
    for (var aSeason in particleSeasons) {
      var season = particleSeasons[aSeason]
      for (var i = 0; i < season.particles.length; i++) {
        season.particles[i].x += season.particles[i].xSpeed;
        season.particles[i].y += season.particles[i].vel;
        (i % 2 === 0) ? season.particles[i].rotation += Math.floor((Math.random() * 2) + 1) : season.particles[i].rotation -= Math.floor((Math.random() * 2) + 1);
        if (season.particles[i].y > season.getBounds().height || season.particles[i].x > this.stage.canvas.width || season.particles[i].x < 0) {
          season.particles[i].x = Math.random() * this.stage.canvas.width;
          season.particles[i].y = 0;
        }
      }
    }
  },
  displayGems: function() {
    var gems = document.getElementById("gems");
    var gemsDOMElement = new DOMElement(gems);
    var finalScreen = this.container.getChildByName('final');
    var index = 1;
    var collect = function(event) {
      $('#' + event.target.id).addClass(event.target.id);
      Tween.get(event.target).to({
        alpha: 0
      }, 500, Ease.cubicOut);
      $('#' + event.target.id).popover({
        html: true,
        container: '.center'
      });
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
    }
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
  socShare: function(socialMedia, text) {
    var socialMediaUrl;
    switch (socialMedia) {
      case 'facebook':
        socialMediaUrl = "http://www.facebook.com/sharer.php?u=" + text;
        break;
      case 'twitter':
        socialMediaUrl = "http://twitter.com/home?status=" + text;
        break;
      case 'pinterest':
        socialMediaUrl = "https://pinterest.com/pin/create/button/?url=" + encodeURIComponent(window.location.href) + "&media=" + window.location.href + "/assets/post_pinterest.jpg&description=" + text;
        break;
    }
    window.open(socialMediaUrl, socialMedia, "toolbar=0,status=0,width=900,height=626");
  },
  render: function() {
    if (!this.isMobile()) {
      $('footer').show();
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