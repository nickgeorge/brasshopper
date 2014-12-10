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
  // this.setCollisionManager(new QuantumCollisionManager(this));

  this.playMusic = false;
  this.music = Sounds.get(SoundList.SPLIT_YOUR_INFINITIVES);
  this.music.loop = true;

  this.score = 0;
  this.killsLeft = 25

  this.drawablesByType = {};

  this.G = 35;

  this.sendEvents = true;

  this.scoreMap = [];
  this.nameMap = {};

  this.ambientCoefficient = .42;

  this.fpsCamera = null;
  this.freeCamera = null;

  this.inputAdapter = new WorldInputAdapter().
      setMouseMoveHandler(this.onMouseMove, this).
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

  this.fpsCamera = new FpsCamera({});
  this.freeCamera = new FreeCamera({});

  this.camera = this.fpsCamera;
  // this.hero = new Hero({
  //   position: [0, 0, 0;]
  // });
  // this.camera.setAnchor(this.hero)
  // this.addThing(this.hero);
};


QuantumWorld.prototype.getHero = function() {
  return this.hero;
};


QuantumWorld.prototype.onMouseButton = function(event) {
  if (!this.inputAdapter.isPointerLocked()) {
    ContainerManager.getInstance().setPointerLock(true);
    Animator.getInstance().setPaused(false);
    this.sendEvents = true;
  } else {
    Env.client.sendKeyEvent(event.type == 'mousedown', event.button);
  }
};

QuantumWorld.prototype.onKey = function(event) {
  if (Env.client.socket.readyState) {
    Env.client.sendKeyEvent(event.type == 'keydown', event.keyCode);
  }

  if (event.type == 'keydown') {
    switch (event.keyCode) {
      case KeyCode.F:
        ContainerManager.getInstance().setFullScreen(true);
        break;

      case KeyCode.M:
        this.setMusicPaused(!this.music.paused);
        break;

      case KeyCode.P:
        Env.client.sendCode(MessageCode.RESTART);
        break;

      case KeyCode.N:
        PromptBox.ask('What\'s your name?', function(name) {
          if (name) Env.client.myNameIs(name);
        });
        break;

      case KeyCode.ENTER:
        PromptBox.ask('Speak:', function(msg) {
          if (msg) Env.client.say(msg);
        });
        break;

      case KeyCode.O:
        Sounds.on = !Sounds.on;
        break;

      case KeyCode.ESC:
        // Animator.getInstance().togglePause();
        this.sendEvents = !this.sendEvents;
        break
    }
  }
};


QuantumWorld.prototype.onMouseMove = function(event) {
  if (!this.sendEvents) return;
  var movementX = this.inputAdapter.getMovementX(event);
  var movementY = this.inputAdapter.getMovementY(event);
  Env.client.sendMouseMoveEvent(movementX, movementY);
};


QuantumWorld.prototype.onPointerLockChange = function(event) {
  if (!ContainerManager.getInstance().isPointerLocked()) {
    // Animator.getInstance().setPaused(true);
    this.sendEvents = false;
  }
};




QuantumWorld.prototype.draw = function() {
  Env.gl.reset(this.backgroundColor);
  if (!this.hero) return;

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

