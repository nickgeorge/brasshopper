goog.provide('DumbCrate');

goog.require('QuantumTypes');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
DumbCrate = function(message) {
  message.isRoot = true;
  goog.base(this, message);
  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    color: [1, 1, 1, 1],
    isStatic: true,
    glommable: false,
  });

  this.claimed = false;

  this.addPart(this.box);
};
goog.inherits(DumbCrate, Thing);
Types.registerType(DumbCrate, QuantumTypes.DUMB_CRATE);


DumbCrate.readMessage = function(reader) {
  return {
    klass: DumbCrate,
    alive: reader.readInt8(),
    position: reader.readVec3(),
    velocity: reader.readVec3(),
    upOrientation: reader.readVec4(),
    size: reader.readVec3()
  }
};

DumbCrate.prototype.update = function(message) {
  this.velocity = message.velocity;
  this.position = message.position;
  this.upOrientation = message.upOrientation;
  this.size = message.size;
};

DumbCrate.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};

