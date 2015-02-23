goog.provide('Walker');

goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Walker = function(message) {
  goog.base(this, message);

  this.isRoot = true;

  this.viewRotation = quat.create();

  this.color = vec4.create();


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

  this.legAngle = 0;
  this.leftLeg.setPitchOnly(this.legAngle);
  this.rightLeg.setPitchOnly(-this.legAngle);
  this.rightArm.setPitchOnly(this.legAngle);
  this.leftArm.setPitchOnly(-this.legAngle);

  this.health = 100;
};
goog.inherits(Walker, Thing);


Walker.HEIGHT = 2;

Walker.prototype.advance = function(dt) {
  // vec4.copy(this.head.upOrientation, this.viewRotation);
};


Walker.prototype.getViewOrientation = function() {
  var result = quat.create();
  return function() {
    return quat.multiply(result, this.upOrientation, this.viewRotation);
  };
}();


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
    parentScale: this.scale,
  });

  this.rightLeg = new OffsetBox({
    size: [.2, 1, .2],
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, -.9, 0],
    isStatic: true,
    texture: boxTexture,
    color: this.color,
    parentScale: this.scale,
  });

  this.leftArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [.45, -2 + 1.975, 0],
    offset: [0, -.45, 0],
    roll: 0.25,
    name: "left leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    color: this.color,
    parentScale: this.scale,
  });
  this.rightArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [-.45, -2 + 1.975, 0],
    offset: [0, -.45, 0],
    roll: -0.25,
    name: "right leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    color: this.color,
    parentScale: this.scale,
  });

  this.head = new OffsetContainer({
    thing: new DataThing({
      texture: boxTexture,
      data: HeadData,
      uScale: .015,
      position: [0, -2 + 2.3, -.1],
      name: "head",
      color: this.color,
      isStatic: true,
      yaw: Math.PI,
      damageMultiplier: 4,
    }),
    parentScale: this.scale,
  });

  this.torso = new Box({
    size: [.6, 1, .2],
    position: [0, -2 + 1.5, 0],
    name: "torso",
    textureCounts: [1, 1],
    isStatic: true,
    damageMultiplier: 1.7,
    texture: boxTexture,
    color: this.color,
    parentScale: this.scale,
  });

  // this.fakehead = new Box({
  //   size: [.4, .55, .45],
  //   position: [0, .3, -.088],
  //   color: [1, 1, 1, .5]
  // });




  this.addParts([
    this.head,
    this.torso,
    this.rightLeg,
    this.leftLeg,
    this.rightArm,
    this.leftArm,
    // this.fakehead,
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
