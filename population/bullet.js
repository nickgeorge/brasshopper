Bullet = function(message) {
  this.super(message);
  this.radius = message.radius;
  this.sphere = new Sphere({
    radius: this.radius,
    // color: [.3, 1, .3, 1],
    position: [0, 0, 0],
    texture: Textures.PLASMA,
    rYaw: 100,
    rPitch: 100,
    rRoll: 100,
    color: [1, .3, .8, 1],
  });
  this.parts = [this.sphere];

  this.alive = true;
};
util.inherits(Bullet, Thing);
Bullet.type = Types.BULLET;

Bullet.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  if (this.alive) {
    // this.velocity[1] -= world.G/400;
  }
};

Bullet.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};