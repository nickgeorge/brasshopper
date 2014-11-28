goog.provide('Fella');

goog.require('QuantumTypes');
goog.require('SoundList');
goog.require('Thing');
goog.require('Walker');

/**
 * @constructor
 * @extends {Walker}
 * @struct
 */
Fella = function(message) {
  this.speed = message.speed || 0;
  // vec3.set(this.velocity, 0, 0, this.speed);


  goog.base(this, message);

  this.velocity = vec3.fromValues(0, 0, this.speed);

  this.color = vec4.nullableClone(message.color);

  this.health = 100;

  this.deathSpeed = 1;

  // this.dieAudio = Sounds.get(SoundList.GLASS);
};
goog.inherits(Fella, Walker);
Types.registerType(Fella, QuantumTypes.FELLA);


Fella.prototype.advance = function(dt) {
  goog.base(this, 'advance', dt);
  if (!this.alive) return;
  if (this.isLanded()) {
    if (Math.random() < .02) {
      this.rYaw = Math.random()*2 - 1;
    }
    if (Math.random() < .002) {
      this.jump();
    }
  }
};


Fella.prototype.land = function(ground) {
  goog.base(this, 'land', ground);

  vec3.set(this.velocity, 0, 0, this.speed);
};


Fella.prototype.getOuterRadius = function() {
  return Walker.HEIGHT * 4;
};


Fella.prototype.jump = function() {
  if (!this.isLanded()) return;
  vec3.set(this.velocity,
      this.velocity[0] * 1.25 * 4,
      60,
      this.velocity[2] * 1.25 * 4);
  this.unland(true);
  this.rYaw = 0;
};

Fella.prototype.die = function() {

  Sounds.getAndPlay(SoundList.GLASS);
  this.alive = false;
  this.velocity = [0, 0, 0];
  this.rYaw = this.rPitch = this.rRoll = 0;
  this.eachPart(function(part) {
    this.alive = false;
    part.isStatic = false;
    var vTheta = Math.random()*2*Math.PI;
    vec3.random(part.velocity, this.deathSpeed);
  });
  Env.world.effects.remove(this.healthBar);
};


Fella.prototype.hit = function(bullet, part) {
  this.health -= bullet.damage * part.damageMultiplier;
  if (this.health <= 0) {

    if (this.alive) {
      this.die();
      var owner = bullet.owner;
      owner.railAmmo += 1;

      owner.registerKill(this, bullet);

      // vec3.copy(
      //     part.velocity,
      //     part.worldToLocalCoords(vec3.temp,
      //         vec3.scale(vec3.temp,
      //             vec3.transformQuat(vec3.temp,
      //                 bullet.velocity,
      //                 bullet.upOrientation),
      //             1/25),
      //         0));
    }
  } else {
    this.healthBar.updateHealth();
  }
};

