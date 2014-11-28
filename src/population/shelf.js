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
    texture: Textures.get(TextureList.WALL),
    // texturesByFace: message.texturesByFace,
    textureCounts: [50, 50],
    // textureCountsByFace: message.textureCountsByFace,
    invert: true,
    color: message.color,
    isStatic: true
  });

  this.addPart(this.box);

  Env.world.shelf = this;
};
goog.inherits(Shelf, Thing);
Types.registerType(Shelf, QuantumTypes.SHELF);


Shelf.readMessage = function(reader) {
  return {
    klass: Shelf,
    alive: reader.readInt8(),
    position: reader.readVec3(),
    velocity: reader.readVec3(),
    upOrientation: reader.readVec4(),
    size: reader.readVec3()
  }
};

Shelf.prototype.update = function(message) {
  this.velocity = message.velocity;
  this.position = message.position;
  this.upOrientation = message.upOrientation;
  this.size = message.size;
};


Shelf.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};
