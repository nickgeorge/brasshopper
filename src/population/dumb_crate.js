goog.provide('DumbCrate');
goog.provide('DumbCrate.Proto');

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
    texture: Textures.get(TextureList.THWOMP),
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    color: [1, 1, 1, 1],
    isStatic: true,
    glommable: false,
  });

  this.claimed = false;
  this.updateProto = new DumbCrate.Proto();

  this.addPart(this.box);
};
goog.inherits(DumbCrate, Thing);
Types.registerType(DumbCrate, QuantumTypes.DUMB_CRATE);


DumbCrate.readMessage = function(reader) {
  return {
    klass: DumbCrate,
    alive: reader.readByte(),
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


DumbCrate.newFromReader = function(reader) {
  var proto = new DumbCrate.Proto();
  proto.read(reader);
  return new DumbCrate({
    alive: proto.alive.get(),
    position: proto.position.get(),
    velocity: proto.velocity.get(),
    upOrientation: proto.upOrientation.get(),
    size: proto.size.get(),
  });
};


DumbCrate.prototype.updateFromReader = function(reader) {
  var proto = this.updateProto;
  proto.read(reader);
  this.alive = proto.alive.get();
  vec3.copy(this.position, proto.position.get());
  vec3.copy(this.velocity, proto.velocity.get());
  quat.copy(this.upOrientation, proto.upOrientation.get());
  // quat.copy(this.color, proto.color.get());
  this.setColor(proto.color.get());

  // TODO: handle size change
};


/**
 * @constructor
 * @struct
 * @extends {Thing.Proto}
 */
DumbCrate.Proto = function() {
  goog.base(this);
  this.size = this.addField(10, new Vec3Field());
  this.color = this.addField(11, new QuatField());
};
goog.inherits(DumbCrate.Proto, Thing.Proto);
