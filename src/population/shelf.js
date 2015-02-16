goog.provide('Shelf');

goog.require('Box');
goog.require('QuantumTypes');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Shelf = function(message) {
  message.isRoot = true;
  goog.base(this, message);

  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: Textures.get(TextureList.SPACE),
    // texturesByFace: message.texturesByFace,
    textureCounts: [9, 9],
    // textureCountsByFace: message.textureCountsByFace,
    invert: true,
    color: message.color,
    isStatic: true
  });

  this.updateProto = new Shelf.Proto();

  this.addPart(this.box);

  Env.world.shelf = this;
};
goog.inherits(Shelf, Thing);
Types.registerType(Shelf, QuantumTypes.SHELF);


Shelf.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};


Shelf.newFromReader = function(reader) {
  var proto = new Shelf.Proto();
  proto.read(reader);
  return new Shelf({
    alive: proto.alive.get(),
    position: proto.position.get(),
    velocity: proto.velocity.get(),
    upOrientation: proto.upOrientation.get(),
    size: proto.size.get(),
  });
};


Shelf.prototype.updateFromReader = function(reader) {
  var proto = this.updateProto;
  proto.read(reader);
  this.alive = proto.alive.get();
  vec3.copy(this.position, proto.position.get());
  vec3.copy(this.velocity, proto.velocity.get());
  quat.copy(this.upOrientation, proto.upOrientation.get());

  // TODO: handle size change
};


Shelf.prototype.draw = function() {

  Env.gl.getActiveProgram().setUseLighting(false);
  goog.base(this, 'draw');
  Env.gl.getActiveProgram().setUseLighting(true);
};


/**
 * @constructor
 * @struct
 * @extends {Thing.Proto}
 */
Shelf.Proto = function() {
  goog.base(this);
  this.size = this.addField(10, new Vec3Field());
};
goog.inherits(Shelf.Proto, Thing.Proto);

