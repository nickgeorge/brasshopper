goog.provide('Walker');

goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Walker = function(message) {
  goog.base(this, message);

  this.ground = null;
  this.gravity = vec3.create();

  this.isRoot = true;

  this.maglock = false;


  this.viewRotation = quat.create();
  this.isViewTransitioning = false;
  this.viewTransitionT = 0;
  this.initialViewRotation = quat.create();
  this.terminalViewRotation = quat.create();

  this.landed = false;
  this.magLock = false;

  this.movementUp = quat.create();

  this.objectCache.land = {
    rotation: quat.create(),
    viewMultiplier: quat.create(),
    conjugateRotation: quat.create()
  };
};
goog.inherits(Walker, Thing);


Walker.HEIGHT = 2;
Walker.WIDTH = .5;

Walker.prototype.advanceWalker = function(dt) {
  this.advanceBasics(dt);

  if (this.isViewTransitioning) {
    this.viewTransitionT += 3 * dt;
    if (this.viewTransitionT >= 1) {
      this.viewTransitionT = 1;
      this.isViewTransitioning = false;
    }
    quat.slerp(this.viewRotation,
        this.initialViewRotation,
        this.terminalViewRotation,
        this.viewTransitionT);
  }

  if (this.landed) {
    if (!this.ground.contains_lc(
        this.ground.worldToLocalCoords(vec3.temp, this.position))) {
      this.unland();
    }
  } else {
    this.gravity[1] = -Env.world.G;
    vec3.add(this.velocity,
        this.velocity,
        vec3.scale(vec3.temp,
            this.gravity,
            dt));
  }
};


// TODO: Adjust height
Walker.prototype.land = function(ground) {
  var cache = this.objectCache.land;

  this.landed = true;
  this.ground = ground;

  var rotation = quat.rotationTo(cache.rotation,
      this.getNormal(),
      this.ground.getNormal());

  if (this.isViewTransitioning) {
    quat.copy(this.viewRotation, this.terminalViewRotation);
  }
  var conjugateRotation = quat.conjugate(cache.conjugateRotation, rotation);
  var viewMultiplier = quat.multiply(cache.viewMultiplier,
      this.getConjugateUp(),
      conjugateRotation);
  quat.multiply(viewMultiplier, viewMultiplier, this.upOrientation);

  quat.multiply(this.initialViewRotation, viewMultiplier, this.viewRotation);
  quat.copy(this.terminalViewRotation, this.viewRotation);
  quat.copy(this.viewRotation, this.initialViewRotation);
  this.viewTransitionT = 0;
  this.isViewTransitioning = true;

  quat.multiply(this.upOrientation, rotation, this.upOrientation);
};


/**
 * @param  {boolean=} opt_neverMaglock
 */
Walker.prototype.unland = function(opt_neverMaglock) {
  var oldGround = this.ground;
  this.landed = false;
  this.ground = null;
  quat.copy(this.movementUp, this.upOrientation);


  if (this.maglock && !opt_neverMaglock) {
    this.tryMaglock(oldGround);
  }

};

Walker.prototype.tryMaglock = function(oldGround) {
  var groundRoot = oldGround.getRoot();
  var closestEncounter = null;
  var p_0_lc = groundRoot.worldToLocalCoords(vec3.create(), this.lastPosition);
  var p_1_lc = groundRoot.worldToLocalCoords(vec3.create(), this.position);

  util.array.forEach(groundRoot.getParts(), function(part) {
    if (part == oldGround) return;
    var encounter = part.findEncounter(p_0_lc, p_1_lc, Walker.HEIGHT, {
      exclude: oldGround,
      tolerance: Walker.HEIGHT * 2,
    });

    if (!encounter) return;
    if (!closestEncounter || encounter.distance < closestEncounter.distance) {
      closestEncounter = encounter;
    }
  }, this);
  if (closestEncounter) {
    closestEncounter.part.snapIn(this);
    this.land(closestEncounter.part);
  }
};

Walker.prototype.isLandedOn = function(ground) {
  return this.ground == ground;
};

Walker.prototype.isLanded = function() {
  return this.landed;
};


Walker.prototype.getOuterRadius = function() {
  return Walker.HEIGHT;
};
