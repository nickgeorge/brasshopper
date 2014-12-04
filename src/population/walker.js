goog.provide('Walker');

goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Walker = function(message) {
  message.scale = [3, 3, 30];
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

  this.color = [
    Math.random() / 2 + .5,
    Math.random() / 2 + .5,
    Math.random() / 2 + .5,
    1
  ]


  this.head = null;
  this.sphereHead = null;
  this.torso = null;
  this.rightLeg = null;
  this.leftLeg = null;
  this.rightArm = null;
  this.leftArm = null;
  this.buildBody();


  this.healthBar = new HealthBar({

    refThing: this,
    position: [0, .8, 0]
  });
  this.addEffect(this.healthBar);


  this.objectCache.land = {
    rotation: quat.create(),
    viewMultiplier: quat.create(),
    conjugateRotation: quat.create()
  };


  this.legAngle = (Math.random()*2 - 1) * Walker.MAX_LEG_ANGLE;
  this.stepDirection = 1;
  this.leftLeg.setPitchOnly(this.legAngle);
  this.rightLeg.setPitchOnly(-this.legAngle);
  this.rightArm.setPitchOnly(this.legAngle);
  this.leftArm.setPitchOnly(-this.legAngle);
};
goog.inherits(Walker, Thing);


Walker.HEIGHT = 2;
Walker.WIDTH = .5;

Walker.MAX_LEG_ANGLE = Math.PI/6;

Walker.prototype.advance = function(dt) {
  // this.advanceBasics(dt);

  // if (this.isViewTransitioning) {
  //   this.viewTransitionT += 3 * dt;
  //   if (this.viewTransitionT >= 1) {
  //     this.viewTransitionT = 1;
  //     this.isViewTransitioning = false;
  //   }
  //   quat.slerp(this.viewRotation,
  //       this.initialViewRotation,
  //       this.terminalViewRotation,
  //       this.viewTransitionT);
  // }

  // if (this.landed) {
  //   if (!this.ground.contains_lc(
  //       this.ground.worldToLocalCoords(vec3.temp, this.position))) {
  //     this.unland();
  //   }
  // } else {
  //   this.gravity[1] = -Env.world.G;
  //   vec3.add(this.velocity,
  //       this.velocity,
  //       vec3.scale(vec3.temp,
  //           this.gravity,
  //           dt));
  // }

  // if (this.legAngle >= Walker.MAX_LEG_ANGLE) {
  //   this.stepDirection = -1;
  // }
  // if (this.legAngle <= -Walker.MAX_LEG_ANGLE) {
  //   this.stepDirection = 1;
  // }
  // if (this.isLanded()) {
  //   this.legAngle += 5 * this.stepDirection * dt;
  // } else {
  //   this.legAngle = Math.PI / 3;
  // }

  vec4.copy(this.head.upOrientation, this.viewRotation);
};


Walker.prototype.getViewOrientation = function() {
  var result = quat.create();
  return function() {
    return quat.multiply(result, this.upOrientation, this.viewRotation);
  };
}();


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

Walker.prototype.buildBody = function() {
  var boxTexture = Textures.get(TextureList.GRANITE);
  this.leftLeg = new OffsetBox({
    size: [.2, 1, .2],
    // color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, -Walker.HEIGHT + 1.1, 0],
    isStatic: true,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: this.color,
    // textureCounts: [1, 10]
  });

  this.rightLeg = new OffsetBox({
    size: [.2, 1, .2],
    // color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, -Walker.HEIGHT + 1.1, 0],
    isStatic: true,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: this.color,
  });

  this.leftArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [.45, -Walker.HEIGHT + 1.975, 0],
    // color: this.color,
    offset: [0, -.45, 0],
    roll: 0.25,
    name: "left leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: this.color,
  });
  this.rightArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [-.45, -Walker.HEIGHT + 1.975, 0],
    // color: this.color,
    offset: [0, -.45, 0],
    roll: -0.25,
    name: "right leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: this.color,
  });

  this.sphereHead = new Sphere({
    // uScale: .015,
    position: [0, -Walker.HEIGHT + 2.2, 0],
    name: "head",
    // color: this.color,
    isStatic: true,
    damageMultiplier: 4,
    collideRadius: 1,
    radius: .27,
  });
  this.sphereHead.visible = false;

  this.head = new OffsetContainer({
    thing: new DataThing({
      texture: boxTexture,
      data: HeadData,
      uScale: .015,
      position: [0, -Walker.HEIGHT + 2.3, -.1],
      name: "head",
      color: this.color,
      isStatic: true,
      yaw: Math.PI,
      // damageMultiplier: 4,
      // collideRadius: 1,
      // radius: .27
    }),
  });

  this.torso = new Box({
    size: [.6, 1, .2],
    position: [0, -Walker.HEIGHT + 1.5, 0],
    // color: this.color,
    name: "torso",
    textureCounts: [1, 1],
    isStatic: true,
    damageMultiplier: 1.7,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: this.color,
  });

  this.addParts([
    this.head,
    this.sphereHead,
    this.torso,
    this.rightLeg,
    this.leftLeg,
    this.rightArm,
    this.leftArm,
  ]);
};



Walker.prototype.drawHead = function() {
  if (this.isDisposed || !this.visible) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.head.draw();
  Env.gl.popModelMatrix();
};


Walker.prototype.drawNotHead = function() {
  if (this.isDisposed || !this.visible) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.torso.draw();
  this.leftLeg.draw();
  this.rightLeg.draw();
  this.leftArm.draw();
  this.rightArm.draw();
  this.healthBar.draw();
  Env.gl.popModelMatrix();
};


Walker.prototype.drawHealthBar = function() {
  if (this.isDisposed || !this.visible) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.healthBar.draw();
  Env.gl.popModelMatrix();
};
