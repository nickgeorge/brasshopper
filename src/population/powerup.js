goog.provide('Powerup');
goog.provide('Powerup.Proto');

goog.require('QuantumTypes');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Powerup = function(message) {
  message.isRoot = true;
  goog.base(this, message);

  this.updateProto = new Powerup.Proto();

  this.model = new DataThing({
    data: LightningData,
    color: [1, 1, 0, .8],
    name: "model",
    isStatic: true,
    uScale: 2,

  });
  this.addPart(this.model);
};
goog.inherits(Powerup, Thing);
Types.registerType(Powerup, QuantumTypes.POWERUP);


Powerup.readMessage = function(reader) {
  return {
    klass: Powerup,
    alive: reader.readByte(),
    position: reader.readVec3(),
    velocity: reader.readVec3(),
    upOrientation: reader.readVec4(),
  }
};

Powerup.prototype.render = function() {
  Env.gl.getActiveProgram().setUseLighting(false);
  goog.base(this, 'render');
  Env.gl.getActiveProgram().setUseLighting(true);
};


Powerup.prototype.updateFromReader = function(reader) {
  var proto = this.updateProto;
  proto.read(reader);

  this.updateFromProto(proto);
};


Powerup.newFromReader = function(reader) {
  var proto = new Powerup.Proto();
  proto.read(reader);
  var powerup = new Powerup({
    alive: proto.alive.get(),
    position: proto.position.get(),
    velocity: proto.velocity.get(),
    upOrientation: proto.upOrientation.get(),
  });
  return powerup;
};

/**
 * @constructor
 * @struct
 * @extends {Thing.Proto}
 */
Powerup.Proto = function() {
  goog.base(this);
};
goog.inherits(Powerup.Proto, Thing.Proto);
