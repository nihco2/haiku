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
  previousSeason: 'summer',
  currentSeason: 'summer',
  currentDirection: 'down',
  num: 0,
  it: 0,
  collectedGems: 0,
  scroll_end: 0,
  currentSound: null,
  nextSound: null,
  MAX_VOLUME: 0.02,
  SCROLL_VELOCITY: 300,
  ASSET_MOVEMENT: 5,
  RUN_LIMIT: 1000,
  PARTICLES_SPEED: 3,
  SNOW_SIZE: 7,
  PARTICLES_NUMBER_WINTER: 40,
  PARTICLES_NUMBER_AUTUMN: 12,
  END_TOUCH_EVENT: 500,
  PARTICLES_TIME_CHANGE_DIRECTION: 20000, //miliseconds
  DESKTOP_HEIGHT: 568,
  SNOW_COLOR: {
    red: 255,
    green: 255,
    blue: 255
  },
  SCROLL_TIME: 3000,
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
  isOldMobile: function() {
    return navigator.userAgent.match(/iPhone/i) !== null && window.screen.height <= (960 / 2);
  },
  isOnScreen: function(el) {
    var elTop = this.seasons[el.season].localToGlobal(el.x, el.y).y;
    var height = el.getBounds() ? el.getBounds().height : 0;
    return (elTop + height - el.delay >= 0);
  },
  isRetina: function() {
    return (window.retina || window.devicePixelRatio > 1);
  },
  checkSeason: function(season) {
    return (this.container.y >= -(season.y + season.getBounds().height) && this.container.y <= -season.y);
  },
  preloadAssets: function(manifest, sounds) {
    var self = this;
    createjs.Sound.alternateExtensions = ["mp3"];
    this.queue.installPlugin(createjs.Sound);
    this.queue.loadManifest(manifest, true);
    this.queue.on("complete", this.handleComplete);
    this.queue.on("progress", this.handleProgress);
    this.queue.addEventListener("fileload", this.handleFileLoad);
  },
  handleFileLoad: function(event) {
    //console.log(event.item.id);
  },
  handleProgress: function(event) {
    var loaded = Math.round(event.loaded * 100) + '%';
    $('.loader').text(loaded);
  },
  handleComplete: function() {
    $('.loader').remove();
    $('.js-btn-start').show();
    this.initSeasons();
    this.initSize();
    this.initWalk();
    this.initAssets();
    this.initListeners();
    this.initTexts();
    this.displayGems();
    if (!this.isOldMobile()) {
      this.initParticles(this.PARTICLES_SPEED);
    }
  },
  initSeasons: function() {
    var seasons = [],
      fingersSpriteSheet = new createjs.SpriteSheet(JSON.parse(this.queue.getResult('fingersSpriteSheet'))),
      fingersSprite = new createjs.Sprite(fingersSpriteSheet, 'walk'),
      tutoBkg = new createjs.Bitmap(this.queue.getResult('tuto')),
      finalContainer = new createjs.Container(),
      finalBitmap = new createjs.Bitmap(this.queue.getResult('end')),
      patern = new createjs.Bitmap(this.queue.getResult('patern')),
      totalBmp = new createjs.Bitmap(this.queue.getResult('total'));

    self = this;
    totalBmp.name = 'total';
    finalContainer.addChild(finalBitmap);
    finalContainer.name = 'final';
    self.container.addChild(finalContainer);
    fingersSprite.name = 'fingersSprite';
    seasons[0] = patern.clone(),
    seasons[0]['name'] = 'spring';
    seasons[1] = patern.clone(),
    seasons[1]['name'] = 'winter',
    seasons[2] = patern.clone(),
    seasons[2]['name'] = 'autumn',
    seasons[3] = patern.clone(),
    seasons[3]['name'] = 'summer';
    seasons.forEach(function(season, index) {
      var bitmapContainer = new createjs.Container();
      season.alpha = 0;
      bitmapContainer.name = season.name;
      bitmapContainer.addChild(season);
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
        tutoHeight = tutoContainer.getBounds().height;
        totalBmp.y = tutoHeight;
      } else if (season.name === 'autumn') {
        self.seasons[season.name].particlesNumber = self.PARTICLES_NUMBER_AUTUMN;
        self.seasons[season.name].particleEnabled = true;
      } else if (season.name === 'winter') {
        self.seasons[season.name].particlesNumber = self.PARTICLES_NUMBER_WINTER;
        self.seasons[season.name].particleEnabled = true;
      }
      (index > 0) ? bitmapContainer.y = self.container.getBounds().height - 2 : bitmapContainer.y = finalContainer.getBounds().height;
    });

    this.container.addChild(totalBmp);
    this.container.swapChildren(totalBmp, this.container.getChildByName('spring'));
    self.stage.addChild(this.container);
  },
  initSize: function() {
    var tuto = this.seasons.summer.getChildByName('tuto');
    this.stage.canvas.width = this.container.getBounds().width;
    if (!this.isMobile()) {
      this.stage.canvas.height = this.DESKTOP_HEIGHT * (this.stage.canvas.width / $('#wrapper').width());
      $('#wrapper').css('top', window.innerHeight / 2 - this.DESKTOP_HEIGHT / 2).height(this.DESKTOP_HEIGHT - 1);
      $('#haiku').width($('#wrapper').width);
    } else {
      $('#haiku').width(window.innerWidth);
      $('#wrapper').height(window.innerHeight);
      this.stage.canvas.height = window.innerHeight * (this.stage.canvas.width / window.innerWidth);
      tuto.getChildByName('fingersSprite').y = tuto.getBounds().height / 2 - tuto.getChildByName('fingersSprite').getBounds().height + 40;
    }
    this.bkgHeight = this.container.getBounds().height;
    this.scrollHeight = -this.bkgHeight + this.stage.canvas.height;
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
      this.seasons[season].addChild(walk);
    }
  },

  initParticles: function(speed) {
    var timer = setInterval(this.changeMovement, this.PARTICLES_TIME_CHANGE_DIRECTION);

    for (var season in this.seasons) {
      if (this.seasons[season].particlesNumber) {
        for (var i = 0; i < this.seasons[season].particlesNumber; i++) {
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
    }
  },
  fadeInSound: function(instance) {
    var self = this;
    var interval = setInterval(function() {
      if (instance.getVolume() < self.MAX_VOLUME) {
        instance.setVolume(instance.getVolume() + 0.001);
      } else {
        clearInterval(interval);
      }
    }, 200);
  },
  fadeOutSound: function(instance) {
    var self = this;
    var interval = setInterval(function() {
      if (instance.getVolume() > 0) {
        instance.setVolume(instance.getVolume() - 0.001);
      } else {
        self.currentSound = self.nextSound;
        clearInterval(interval);
      }
    }, 200);
  },
  initListeners: function() {
    var self = this,
      left = true,
      social = document.getElementById("social"),
      socDOMElement = new DOMElement(social);

    $('.js-btn-start').on('click', function() {
      self.currentSound = createjs.Sound.play('snd_summer', {
        loop: -1
      });

      self.currentSound.setVolume(0);
      self.fadeInSound(self.currentSound);

      $('#gems').show();
      $('#wrapper').fadeIn('slow');
      $('header').fadeOut('slow');
      $('#final').show();
      self.container.getChildByName('final').addChild(socDOMElement);

      if (!self.isMobile()) {
        $('#warning').modal();
        $('.continue').on('click', function() {
          $('#warning').modal('hide');
        });
      }
      $(document).keydown(function(e) {
        switch (e.which) {
          case 37: // left
            if (left && self.container.y < -self.scrollHeight && self.gameEnabled) {
              left = false;
              self.handlePanDown({
                distance: self.stage.canvas.height / 2,
                deltaTime: 0
              });
            }
            break;
          case 38: // up
            break;
          case 39: // right
            if (!left && self.container.y < -self.scrollHeight && self.gameEnabled) {
              left = true;
              self.handlePanDown({
                distance: self.stage.canvas.height / 2,
                deltaTime: 0
              });
            }
            break;
          case 40: //down
            break;
          default:
            return;
        }
        e.preventDefault();
      });

      $(this).removeClass('press');
    }).on('mousedown', function() {
      $(this).addClass('press');
    });

    mc = new Hammer(document.getElementById('wrapper'));
    mc.get('pan').set({
      threshold: 0
    });

    if (this.isMobile()) {
      mc.on('panup', this.handlePanUp);
      mc.on('pandown', this.handlePanDown);
      mc.on('panend', this.handleEnd);
      mc.on('panstart', this.handleStart);
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
      txt.lineWidth = self.stage.canvas.width;
      txt.x = self.stage.canvas.width / 2;
      txt.name = item.name;

      if (!item.text) {
        var regex = /<br\s*[\/]?>/gi;
        txt.text = $('#' + item.id).find('.content p').html().replace(regex, '\n');
      } else {
        txt.text = item.text;
      }
      if (self.seasons[$('#' + item.id).data('season')]) {
        var txt2 = new createjs.Text();
        txt.y = self.seasons[$('#' + item.id).data('season')].getBounds().height + item.position;
        txt2.y = txt.y + txt.getBounds().height;
        txt.x = self.stage.canvas.width / 2 - txt.getBounds().width / 2;
        txt2.text = $('#' + item.id).find('.content p.author').text();
        txt2.font = item.typo;
        txt2.color = item.color;
        txt2.lineWidth = self.stage.canvas.width;
        txt2.x = self.stage.canvas.width - $('#' + item.id).find('.content p.author').width() - 100;
        txt2.textAlign = 'right';

        self.seasons[$('#' + item.id).data('season')].addChild(txt);
        self.seasons[$('#' + item.id).data('season')].addChild(txt2);
      } else if (item.id === 'tuto' && self.isMobile()) {
        var tuto = self.seasons.summer.getChildByName('tuto'),
          fingersSprite = tuto.getChildByName('fingersSprite');
        fingersSprite.x = tuto.getBounds().width / 2 - fingersSprite.getBounds().width / 2;
        txt.y = 800;
        txt.textAlign = 'center';
        tuto.addChild(txt);
      } else if (!self.isMobile() && item.id === 'desktop') {
        var tuto = self.seasons.summer.getChildByName('tuto');
        txt.y = 1000;
        txt.textAlign = 'center';
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
    var self = this,
      interval;
    //if (event.deltaTime < this.SCROLL_TIME) {
    this.currentDirection = 'down';
    this.scroll_end = event.distance / 2;
    this.num = (event.distance * (this.bkgHeight - this.stage.canvas.height) / this.stage.canvas.height) / this.SCROLL_VELOCITY;
    if (event.distance > this.RUN_LIMIT && this.gameEnabled) {
      this.disablePan();
      this.scrollToBottom();
      this.gameEnabled = false;
      return alert('Rien ne sert de courir petit scarabée !');
    }

    if (this.container.y >= this.scrollHeight && this.isMobile()) {
      Tween.get(this.container).to({
        y: this.container.y + this.num
      }, 0, Ease.cubicOut);
    } else if (!this.isMobile() && this.gameEnabled) {
      this.gameEnabled = false;
      if (this.container.y >= -this.DESKTOP_HEIGHT) {
        Tween.get(this.container).to({
          y: 0
        }, 500, Ease.sineOut);
        this.disablePan();
      } else {
        interval = setInterval(function() {
          self.moveAssets('up');
        }, 10);
        Tween.get(this.container).to({
          y: this.container.y + this.SCROLL_VELOCITY
        }, 500, Ease.sineOut).call(function() {
          self.gameEnabled = true;
          clearInterval(interval);
        });
      }
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
      }, 2000, Ease.cubicOut).call(function() {
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
      this.previousSeason = 'autumn';

      if (!$('body').hasClass('bkg-winter')) {
        $('body').removeClass('bkg-autumn');
        $('body').addClass('bkg-winter');
        $('.bg_winter').fadeTo(5000, 1);
        this.soundTransition('snd_winter');
      }
    } else if (this.checkSeason(this.seasons.spring)) {
      this.currentSeason = 'spring';
      this.previousSeason = 'winter';

      if (!$('body').hasClass('bkg-spring')) {
        $('body').removeClass('bkg-winter');
        $('body').addClass('bkg-spring');
        $('.bg_spring').fadeTo(5000, 1);
        this.soundTransition('snd_spring');
      }
    } else if (this.checkSeason(this.seasons.summer)) {
      this.currentSeason = 'summer';
    } else if (this.checkSeason(this.seasons.autumn)) {
      this.currentSeason = 'autumn';
      this.previousSeason = 'summer';
      if (!$('body').hasClass('bkg-autumn')) {
        $('body').addClass('bkg-autumn');
        $('.bg_autumn').fadeTo(5000, 1);
        this.soundTransition('snd_autumn');
      }
    }
  },
  soundTransition: function(season) {
    this.nextSound = createjs.Sound.play(season, {
      loop: -1
    });
    this.nextSound.setVolume(0);
    this.fadeOutSound(this.currentSound);
    this.fadeInSound(this.nextSound);
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
    var prevFootsteps = this.seasons[this.previousSeason].getChildByName('walk');
    var otherSeasons = 0;
    switch (this.currentSeason) {
      case 'summer':
        otherSeasons = 15000;
        prevOtherSeasons = 15000;
        break;
      case 'autumn':
        otherSeasons = 10000;
        prevOtherSeasons = 15000;
        break;
      case 'winter':
        otherSeasons = 5000;
        prevOtherSeasons = 10000;
        break;
      case 'spring':
        otherSeasons = 0;
        prevOtherSeasons = 5000;
        break;
    }
    if (this.isOldMobile()) {
      footsteps.mask.y = -(this.container.y + otherSeasons + window.innerHeight * 2);
      prevFootsteps.mask.y = -(this.container.y + prevOtherSeasons + window.innerHeight * 2);
    } else if (!this.isMobile()) {
      footsteps.mask.y = -(this.container.y + otherSeasons + $('#haiku').height());
      prevFootsteps.mask.y = -(this.container.y + prevOtherSeasons + $('#haiku').height());
    } else {
      footsteps.mask.y = -(this.container.y + otherSeasons + window.innerHeight);
      prevFootsteps.mask.y = -(this.container.y + prevOtherSeasons + window.innerHeight);
    }
  },
  tick: function() {
    this.fall();
    this.stage.update();
  },
  changeMovement: function() {
    if (this.seasons[this.currentSeason].particlesNumber) {
      for (var i = 0; i < this.seasons[this.currentSeason].particlesNumber; i++) {
        this.seasons[this.currentSeason].particles[i].xSpeed *= -1;
      }
    }
  },
  fall: function() {
    if (this.previousSeason !== this.currentSeason && !this.isOldMobile()) {
      if ((this.currentSeason === 'winter' || this.currentSeason === 'spring')) {
        var pSeason = this.seasons[this.previousSeason];
        if (pSeason.particleEnabled) {
          pSeason.particleEnabled = false;
          for (var i = 0; i < pSeason.particles.length; i++) {
            Tween.get(pSeason.particles[i]).to({
              alpha: 0
            }, 1500, Ease.cubicOut);
          }
        }
      }
    }
    if (this.currentSeason === 'winter' || this.currentSeason === 'autumn') {
      var season = this.seasons[this.currentSeason];
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
    var self = this;
    var collect = function(event) {
      var soc = $('#' + event.target.id).find('.content');
      createjs.Sound.play('gem_grab');
      $('#' + event.target.id).addClass(event.target.id).addClass('gemEnabled');
      Tween.get(event.target).to({
        alpha: 0
      }, 500, Ease.cubicOut);
      $('#' + event.target.id).popover({
        html: true,
        container: '.center',
        content: function() {
          return soc.show();
        }
      }).on('hide.bs.popover', function() {
        $('#' + event.target.id).append(soc.hide());
        $('#wrapper').removeClass('overflow');
      }).on('show.bs.popover', function() {
        $('#' + event.target.id).append(soc.show());
        $('.gemEnabled').popover('hide');
        $('#wrapper').addClass('overflow');
      });
    };
    this.stage.enableMouseOver(10);
    for (var season in this.seasons) {
      var gemId = 'gem' + index;
      var img = this.queue.getResult(gemId);
      var gem = new createjs.Bitmap(img);
      gem.cursor = 'pointer';
      gem.id = gemId;
      index++;
      gem.x = $('#' + gemId).data('x');
      gem.y = $('#' + gemId).data('y');
      gem.on('click', collect);
      this.seasons[$('#' + gemId).data('season')].addChild(gem);
      $(document).mouseup(function(e) {
        var popocontainer = jQuery(".popover");
        if (popocontainer.has(e.target).length === 0) {
          jQuery('.popover').toggleClass('in').remove();
        }
      });
    }
    finalScreen.addChild(gemsDOMElement);
    gemsDOMElement.y = 250;
    this.shareInit();
  },
  socShare: function(socialMedia, text) {
    var socialMediaUrl;
    if (!text) {
      text = "D%C3%A9couvrez%20une%20balade%20po%C3%A9tique%20et%20tactile%20%C3%A0%20travers%20les%20quatre%20saisons%20dans%20ce%20ha%C3%AFku%20interactif%20de%20Cosmografik%20";
    }
    switch (socialMedia) {
      case 'facebook':
        if (!text) {
          FB.ui({
            method: 'feed',
            name: "Le marcheur de saison",
            link: "http://54.173.82.58/~marcheur/",
            picture: "http://54.173.82.58/~marcheur/assets/post_facebook.jpg",
            caption: window.location.href,
            description: $('meta[property="og:description"]').attr('content')
          });
        } else {
          FB.ui({
            method: 'feed',
            name: "Le marcheur de saison",
            link: "http://54.173.82.58/~marcheur/",
            picture: "http://54.173.82.58/~marcheur/assets/post_facebook.jpg",
            caption: window.location.href,
            description: decodeURI(text)
          });
        }
        //socialMediaUrl = "http://www.facebook.com/sharer/sharer.php?s=100&amp;p[url]=" + encodeURIComponent(window.location.href) + "&amp;p[images][0]=&amp;p[title]=Le%20marcheur%20de%20saison&amp;p[summary]=" + text;
        break;
      case 'twitter':
        socialMediaUrl = "http://twitter.com/intent/tweet?url=http://tinyurl.com/luhgqny&amp;text=" + text + ";hashtags=haiku";
        break;
      case 'pinterest':
        socialMediaUrl = "https://pinterest.com/pin/create/button/?url=" + encodeURIComponent(window.location.href) + "&media=" + window.location.href + "/assets/post_pinterest.jpg&description=" + text + ":http://tinyurl.com/luhgqny";
        break;
    }
    window.open(socialMediaUrl, socialMedia, "toolbar=0,status=0,width=900,height=626");
  },
  reset: function() {
    var self = this,
      item;
    this.scrollToBottom();
    this.soundTransition('snd_summer');
    self.collection.forEach(function(item, index) {
      item.y = item.posY;
      item.x = item.posX;
    });

    for (var season in this.seasons) {
      if (this.seasons[season].particles) {
        for (var i = 0; i < this.seasons[season].particles.length; i++) {
          this.seasons[season].particles[i].alpha = 1;
        }
      }
    }
  },
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    var self = this;
    self.stage = new createjs.Stage('haiku');
    createjs.Touch.enable(this.stage);
    createjs.Ticker.setFPS(24);

    $.ajax({
      url: 'assets/assets.json',
      dataType: 'json',
      success: function(data) {
        self.setState({
          data: data
        });
        self.preloadAssets(self.state.data.manifest, self.state.data.sounds);
        self.animations = self.state.data.animations;
        self.texts = self.state.data.texts;
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        location.reload();
      }.bind(this)
    });
    $('.cross').on('click', function() {
      $('#credits').modal('hide');
    });

    $('.restart').on('click', function() {
      self.reset();
      $('#wrapper').removeClass('overflow');
      $('body').removeClass('bkg-spring');
      $('.cb-slideshow li:not(.cb-slideshow li:nth-child(1)) span').css('opacity', 0);
    });
    $('#wrapper').append($('aside'));
    $('aside').append($('#final'));
    this.shareInit();
  },

  shareInit: function() {
    var self = this;
    $('.social-share li').on('click', function(event) {
      var provider = $(event.target).data('provider');
      var text = $(event.target).data('haiku');
      if (text) {
        return self.socShare(provider, text);
      }

      self.socShare(provider);
    });
  },

  render: function() {
    if (!this.isMobile()) {
      $('body').addClass('desktop');
      $('header,aside').css('top', window.innerHeight / 2 - this.DESKTOP_HEIGHT / 2);
      $('header').addClass('shadow')
      //$('header,#wrapper').width((640 * window.innerHeight) / 1136);
    } else {
      $('body').addClass('mobile');
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