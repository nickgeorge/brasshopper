Bullet = function(message) {
  message.velocityType = Thing.VelocityType.ABSOLUTE;
  goog.base(this, message);
  this.radius = message.radius;
  this.owner = message.owner;
  this.sphere = new Sphere({
    radius: this.radius,
    position: [0, 0, 0],
    texture: Textures.get(TextureList.PLASMA),
    rYaw: 100,
    rPitch: 100,
    rRoll: 100,
    color: [1, .3, .8, 1],
  });
  this.parts = [this.sphere];

  this.damage = 30;

  this.alive = true;
};
goog.inherits(Bullet, Thing);
Bullet.type = UniqueId.generate();

Bullet.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};
