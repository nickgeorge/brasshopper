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
  vec4.copy(this.head.upOrientation, this.viewRotation);
};


Walker.prototype.getViewOrientation = function() {
  var result = quat.create();
  return function() {
    return quat.multiply(result, this.upOrientation, this.viewRotation);
  };
}();

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
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, -.9, 0],
    isStatic: true,
    texture: boxTexture,
    color: this.color,
    // textureCounts: [1, 10]
  });

  this.rightLeg = new OffsetBox({
    size: [.2, 1, .2],
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, -.9, 0],
    isStatic: true,
    texture: boxTexture,
    color: this.color,
  });

  this.leftArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [.45, -Walker.HEIGHT + 1.975, 0],
    offset: [0, -.45, 0],
    roll: 0.25,
    name: "left leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    color: this.color,
  });
  this.rightArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [-.45, -Walker.HEIGHT + 1.975, 0],
    offset: [0, -.45, 0],
    roll: -0.25,
    name: "right leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    color: this.color,
  });

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
      damageMultiplier: 4,
    }),
  });

  this.torso = new Box({
    size: [.6, 1, .2],
    position: [0, -Walker.HEIGHT + 1.5, 0],
    name: "torso",
    textureCounts: [1, 1],
    isStatic: true,
    damageMultiplier: 1.7,
    texture: boxTexture,
    color: this.color,
  });

  this.addParts([
    this.head,
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
