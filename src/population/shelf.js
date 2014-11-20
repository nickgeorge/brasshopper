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
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    invert: true,
    color: message.color,
    isStatic: true
  });

  this.addPart(this.box);
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


Shelf.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};
