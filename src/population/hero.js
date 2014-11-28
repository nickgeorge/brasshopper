goog.provide('Hero');

goog.require('Gimble');
goog.require('QuantumTypes');
goog.require('Walker');
goog.require('WorldInputAdapter');


/**
 * @constructor
 * @extends {Walker}
 * @struct
 */
Hero = function(message) {
  goog.base(this, message);

  this.keyMove = vec3.create();


  this.v_ground = 20;
  this.v_air = 30;
  this.bobAge = 0;

  this.walkAudio = Sounds.get(SoundList.STEP);
  this.walkAudio.loop = true;
  this.walkAudio.volume = 1
  this.landAudio = Sounds.get(SoundList.LAND);
  this.jumpAudio = Sounds.get(SoundList.JUMP);
  this.shootAudio = Sounds.get(SoundList.ARROW);
  this.captureAudio = Sounds.get(SoundList.CAPTURE);

  this.railAmmo = 3;

  this.gimble = new Gimble({
    referenceObject: this
  });
  // Env.world.addEffect(this.gimble);

  this.sensitivityX = .0035;
  this.sensitivityY = .0035;


  this.objectCache.thing = {
    rotY: quat.create(),
    bobOffset: vec3.create()
  };

  this.kills = 0;
};
goog.inherits(Hero, Walker);
Types.registerType(Hero, QuantumTypes.HERO);

// Hero.JUMP_VELOCITY = vec3.fromValues(0, 70, -40);
Hero.JUMP_MODIFIER = 10;


Hero.prototype.advance = function(dt) {
  // this.advanceWalker(dt);
  goog.base(this, 'advance', dt);

  // if (this.landed) {
  //   var sum = Math.abs(this.keyMove[0]) + Math.abs(this.keyMove[2]);
  //   var factor = sum == 2 ? 1/util.math.ROOT_2 : 1;
  //   vec3.set(this.velocity,
  //       factor * this.v_ground * (this.keyMove[0]),
  //       0,
  //       factor * this.v_ground * (this.keyMove[2]));
  //   if (sum) {
  //     this.bobAge += dt * 2 * Math.PI / .55;
  //     if (this.walkAudio.paused) {
  //       this.walkAudio.loop = true;
  //       this.walkAudio.currentTime = 0;
  //       this.walkAudio.maybePlay();
  //     }
  //   } else {
  //     this.walkAudio.loop = false;
  //     this.bobAge = 0;
  //   }

  // } else {
  //   var sum = Math.abs(this.keyMove[0]) + Math.abs(this.keyMove[2]);
  //   var factor = sum == 2 ? 1/util.math.ROOT_2 : 1;
  //   var effBoost = vec3.fromValues(
  //       factor * (this.keyMove[0]),
  //       0,
  //       factor * (this.keyMove[2]));
  //   vec3.scale(effBoost, effBoost, 20);

  //   var v_mp = vec3.transformQuat(vec3.temp,
  //       this.fromUpOrientation(effBoost),
  //       quat.conjugate([],this.getMovementUp()));

  //   vec3.add(this.velocity,
  //       this.velocity,
  //       vec3.scale(vec3.temp,
  //           v_mp,
  //           dt));

  //   this.walkAudio.loop = false;
  //   this.bobAge = 0;
  // }
};


Hero.prototype.land = function(ground) {
  goog.base(this, 'land', ground);

  this.unclaimCrates();
  this.landAudio.maybePlay();
};


Hero.prototype.jump = function() {
  if (!this.isLanded()) return;
  vec3.set(this.velocity,
      this.velocity[0] * 1,
      60,
      this.velocity[2] * 1);
  this.unland(true);

  this.jumpAudio.maybePlay();
};

Hero.prototype.unclaimCrates = function() {
  if (this.ground.getRoot().getType() == Shelf.type) {
    Env.world.things.forEach(function(thing) {
      if (thing.getType() == DumbCrate.type) {
        if (thing.claimed) {
          thing.claimed = false;

          thing.box.color = [1, 0, 0, .75];
          thing.transluscent = true;
        }
      }
    });
  }
};


/** @override */
Hero.prototype.getMovementUp = function() {
  var result = quat.create();
  return function() {
    return this.isLanded() ?
        quat.copy(result, this.upOrientation) :
        quat.copy(result, this.movementUp);
  }
}();


Hero.prototype.getConjugateViewOrientation = function() {
  var result = quat.create();
  return function() {
    return quat.conjugate(result, this.getViewOrientation());
  }
}();


Hero.prototype.fromViewOrientation = function() {
  var result = vec3.create();
  return function(a, opt_viewOrientation) {
    var viewOrientation = opt_viewOrientation || this.getViewOrientation();
    return vec3.transformQuat(result, a, viewOrientation);
  };
}();


Hero.prototype.toViewOrientation = function() {
  var result = vec3.create();
  return function(a, opt_conjugateViewOrientation) {
    var conjugateViewOrientation = opt_conjugateViewOrientation ||
        this.getConjugateViewOrientation();
    return vec3.transformQuat(result, a, conjugateViewOrientation);
  };
}();


Hero.prototype.getEyePosition = function(out) {
  var bobOffset = vec3.set(this.objectCache.thing.bobOffset,
      0, Math.sin(-this.bobAge)/3 - Walker.HEIGHT + 2.3, 0);
  vec3.transformQuat(bobOffset,
      bobOffset,
      this.upOrientation);

  return vec3.add(out, this.position, bobOffset);
};


Hero.prototype.registerKill = function(fella, bullet) {
  var score = 10;
  if (bullet.getType() == Bullet.type) score *= 1.5;
  if (!this.isLanded()) score *= 20;
  else if (this.ground != this.ground) score *= 5;

  Env.world.score += score;

  if (this.isLanded()) {
    var groundRoot = this.ground.getRoot();
    if (groundRoot.getType() == DumbCrate.type && !groundRoot.claimed) {
      this.captureAudio.maybePlay();
      groundRoot.claimed = true;
      groundRoot.box.color = [0, 0, 1, .75];
      groundRoot.transluscent = true;
    }
  }
};


Hero.prototype.update = function(message) {
  this.velocity = message.velocity;
  this.position = message.position;
  this.upOrientation = message.upOrientation;
  this.viewRotation = message.viewRotation;
  // this.setColor(message.color);
};


Hero.readMessage = function(reader) {
  var msg = {
    klass: Hero,
    alive: reader.readInt8(),
    position: reader.readVec3(),
    velocity: reader.readVec3(),
    upOrientation: reader.readVec4(),
    viewRotation: reader.readVec4(),
  }
  return msg;
};
