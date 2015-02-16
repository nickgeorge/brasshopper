goog.provide('Sun');

goog.require('Sphere');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Sun = function(message) {
  goog.base(this, message);
  this.radius = message.radius || 5;
  this.sphere = new Sphere({
    radius: this.radius,
    texture: Textures.get(TextureList.SUN),
    longitudeCount: 20,
    latitudeCount: 20
  });

  this.addPart(this.sphere);
};
goog.inherits(Sun, Thing);
Types.registerType(Sun, QuantumTypes.SUN);

Sun.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  var world = Env.world;
  this.position = [
    150*(1/3) * Math.sin(this.age / .5/6),
    -150*(1/2) * Math.sin(this.age / .6/6),
    150*(1/3) * Math.sin(this.age / .4/6),
  ];
};

Sun.prototype.render = function() {
  Env.gl.getActiveProgram().setUseLighting(false);
  this.sphere.render();
  Env.gl.getActiveProgram().setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};
