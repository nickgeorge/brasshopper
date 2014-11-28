goog.provide('Bullet');

goog.require('QuantumTypes');
goog.require('TextureList');
goog.require('Thing');
goog.require('Sphere');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
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
    color: [.3, .3, 1, 1],
  });
  this.parts = [this.sphere];

  this.damage = 30;

  this.alive = true;
};
goog.inherits(Bullet, Thing);
Types.registerType(Bullet, QuantumTypes.BULLET);

Bullet.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};
