goog.provide('QuantumWorld');

goog.require('Fella');
goog.require('Hero');
goog.require('QuantumCollisionManager');
goog.require('Shelf');
goog.require('Sun');
goog.require('World');


/**
 * @constructor
 * @extends {World}
 * @struct
 */
QuantumWorld = function() {
  goog.base(this);
  this.shelf = null;

  this.scoreMap = [];
  this.nameMap = {};
  this.hero = null;



  this.light = null;
  this.setBackgroundColor([0, 0, 0, 1]);
  this.setCollisionManager(new QuantumCollisionManager(this));

  this.playMusic = false;
  this.music = Sounds.get(SoundList.SPLIT_YOUR_INFINITIVES);
  this.music.loop = true;

  this.score = 0;
  this.killsLeft = 25

  this.drawablesByType = {};

  this.G = 35;


  this.scoreMap = [];
  this.nameMap = {};

  this.ambientCoefficient = .42
  new Twiddler(this, 'ambientCoefficient', .025);

  this.inputAdapter = new WorldInputAdapter().
      setMouseButtonHandler(this.onMouseButton, this).
      setKeyHandler(this.onKey, this).
      setPointerLockChangeHandler(this.onPointerLockChange, this);
};
goog.inherits(QuantumWorld, World);


QuantumWorld.prototype.addDrawable = function(drawable) {
  goog.base(this, 'addDrawable', drawable);

  var key = drawable.getType();
  if (!this.drawablesByType[key]) {
    this.drawablesByType[key] = [];
  }
  this.drawablesByType[key].push(drawable);
};


QuantumWorld.prototype.removeDrawable = function(drawable) {
  goog.base(this, 'removeDrawable', drawable);

  var key = drawable.getType();
  util.array.remove(this.drawablesByType[key], drawable);
};


/**
 * @param {boolean} isPaused
 */
QuantumWorld.prototype.onPauseChanged = function(isPaused) {
  if (this.playMusic) this.setMusicPaused(isPaused);
};


/**
 * @param {boolean} isPaused
 */
QuantumWorld.prototype.setMusicPaused = function(isPaused) {
  if (isPaused) {
    this.music.pause();
  } else {
    this.music.maybePlay();
  }
};


QuantumWorld.prototype.advance = function(dt) {
  this.advanceBasics(dt);

  vec3.set(this.light.ambientColor,
      this.ambientCoefficient,
      this.ambientCoefficient,
      this.ambientCoefficient);

  var claimedCrates = 0;

  this.things.forEach(function(thing) {
    if (thing.getType() == DumbCrate.type) {
      if (thing.claimed) claimedCrates++;
    }
  });
  this.killsLeft = 25 - claimedCrates;
};


QuantumWorld.prototype.populate = function() {

  this.shelf = new Shelf({
    position: [0, 0, 0],
    size: [200, 200, 200],
    texture: Textures.get(TextureList.WALL),
    textureCounts: [50, 50],
    color: [1, 1, 1, 1]
  })
  this.addThing(this.shelf);

  var addThings = true;

  if (addThings) {
    for (var k = 0; k < 25; k++) {
      var dumbCrate = new DumbCrate({

        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        size: [
          5 + Math.random() * 25,
          5 + Math.random() * 25,
          5 + Math.random() * 25,
        ],
        texture: Textures.get(TextureList.THWOMP),
        textureCounts: [1, 1],
        pitch: Math.random() * 2*Math.PI,
        yaw: Math.random() * 2*Math.PI,
        roll: Math.random() * 2*Math.PI,
        isStatic: true
      });
      this.addThing(dumbCrate);

    }
    for (var k = 0; k < 0; k++) {
      var sphere = new Sphere({

        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        radius: 1.5 + Math.random()*7,
        texture: Textures.get(TextureList.EARTH),
        pitch: Math.random()*2*Math.PI,
        roll: Math.random()*2*Math.PI,
        rYaw: (2*Math.random() - 1) * 2*Math.random() * Math.PI,
        latitudeCount: 25,
        longitudeCount: 25
      });
      this.addThing(sphere);
    }
  }

  for (var i = 0; i < 300 * 1 + 0; i++) {
    var fella = new Fella({
      position: [
        0, 0, 0
        // util.math.random(-40, 40),
        // -this.shelf.size[1]/2 + 5,
      // util.math.random(-40, 40)
      ],
      // speed: 4 + Math.random() * 2,
      speed: 3,
      color: vec4.WHITE,
      yaw: Math.random()*2*Math.PI,
      pitch: Math.random()*2*Math.PI,
      rYaw: Math.random()*2 - 1
    });
    this.addThing(fella);
  }

  this.light = new Light({
    ambientColor: [this.ambientCoefficient,
      this.ambientCoefficient,
      this.ambientCoefficient
    ],
    directionalColor: [.8, .6, .4],
  });

  var sun = new Sun({
    yaw: 0 * Math.random() * 2 * Math.PI,
    pitch: 0 * Math.random() * 2 * Math.PI,
    position: [0, 0, 0],
    alive: true,
    rPitch: 8*Math.PI,
    rYaw: 8*.9*Math.PI,
    rRoll: 8*.8*Math.PI,
  });
  this.light.anchor = sun;
  this.addThing(sun);
  this.addLight(this.light);

  this.camera = new FpsCamera({});
  this.hero = new Hero({
    position: [0, -95, 0]
  });
  this.camera.setAnchor(this.hero);
  this.addThing(this.hero);
};


QuantumWorld.prototype.getHero = function() {
  return this.hero;
};


QuantumWorld.prototype.onMouseButton = function(event) {
  if (!this.inputAdapter.isPointerLocked()) {
    ContainerManager.getInstance().setPointerLock(true);
    Animator.getInstance().setPaused(false);
  }
};


QuantumWorld.prototype.onKey = function(event) {
  if (event.type == 'keydown') {
    switch (event.keyCode) {
      case KeyCode.F:
        ContainerManager.getInstance().setFullScreen(true);
        break;

      case KeyCode.N:
        PromptBox.ask('What\'s your name?', function(name) {
          if (name) Env.client.myNameIs(name);
        });
        break;

      case KeyCode.M:
        this.setMusicPaused(!this.music.paused);
        break;

      case KeyCode.ENTER:
        PromptBox.ask('Speak:', function(msg) {
          if (msg) Env.client.say(msg);
        });
        break;

      case KeyCode.ESC:
        Animator.getInstance().setPaused(true);
        break;

      case KeyCode.O:
        Sounds.on = !Sounds.on;
        break;
    }
  }
};


QuantumWorld.prototype.onPointerLockChange = function(event) {
  if (!ContainerManager.getInstance().isPointerLocked()) {
    Animator.getInstance().setPaused(true);
  }
};




QuantumWorld.prototype.draw = function() {
  Env.gl.reset(this.backgroundColor);

  Env.gl.pushViewMatrix();

  this.applyLights();
  this.camera.transform();
  Env.gl.setViewMatrixUniforms();

  var inFocus = 0;
  var zCulling = false;

  if (this.sortBeforeDrawing) {
    var cameraPosition = this.camera.getPosition();

    this.transluscent.length = 0;
    this.opaque.length = 0;

    var hero = this.camera.getAnchor();
    var heroConjugateViewOrientation = hero.getConjugateViewOrientation();
    this.drawables.forEach(function(drawable) {
      if (drawable.isDisposed) return;
      drawable.computeDistanceSquaredToCamera(cameraPosition);
      if (drawable.getType() == Fella.type && zCulling) {
        var positionInView = hero.toViewOrientation(drawable.position,
            heroConjugateViewOrientation);
        if (positionInView[2] < 0) {
          inFocus++;
          this.opaque.push(drawable);
        }
      } else {
        if (drawable.transluscent) {
          this.transluscent.push(drawable);
        } else {
          this.opaque.push(drawable);
        }
      }
    }, this);

    this.transluscent.sort(function(thingA, thingB) {
      return thingB.distanceSquaredToCamera -
          thingA.distanceSquaredToCamera;
    });

    for (var type in this.drawablesByType) {
      var things = this.drawablesByType[type];
      if (type == Fella.type) {
        this.drawFellas(things);
      } else {
        util.array.forEach(things, function(thing) {
          if (!thing.transluscent) thing.draw();
        });
      }
    }
    // util.array.forEach(this.opaque, function(opaqueDrawable) {
    //   opaqueDrawable.draw();
    // });

    util.array.forEach(this.transluscent, function(transluscentDrawable) {
      transluscentDrawable.draw();
    });

  } else {
    this.drawables.forEach(function(drawable) {
      drawable.draw();
    });
  }

  // console.log("rendered " + inFocus);

  Env.gl.popViewMatrix();
};

QuantumWorld.prototype.drawFellas = function(fellas) {
  for (var i = 0; fellas[i]; i++) {
    fellas[i].drawHead();
  }

  for (var i = 0; fellas[i]; i++) {
    fellas[i].drawNotHead();
  }

  for (var i = 0; fellas[i]; i++) {
    fellas[i].drawHealthBar();
  }
};

