goog.provide('Rail');

goog.require('LeafThing');
goog.require('QuantumTypes');


/**
 * @constructor
 * @extends {LeafThing}
 * @struct
 */
Rail = function(proto) {
  this.centers = this.makeCenters();

  goog.base(this, {
    color: proto.color.get(),
    drawType: LeafThing.DrawType.ELEMENTS,
    upOrientation: proto.upOrientation.get(),
    position: proto.p0.get(),
  });

  this.transluscent = true;

  this.alive = true;
  this.firstFrame = true;
  this.p1 = proto.p1.get();
  this.damage = 200;
  this.finalize();

  this.updateProto = new Rail.Proto();

};
goog.inherits(Rail, LeafThing);
Types.registerType(Rail, QuantumTypes.RAIL);

Rail.offset = vec3.fromValues(0, -.2, 0);


Rail.prototype.getP0 = function() {
  return this.position;
};


Rail.prototype.getP1 = function() {
  return this.p1;
};

Rail.prototype.advance = function(dt) {
  this.color[3] -= dt;
  if (this.color[3] < 0) {
    Env.world.projectiles.remove(this);
    Env.world.drawables.remove(this);
  }
  if (Math.random() < .7) {
    quat.rotateZ(this.upOrientation,
        this.upOrientation,
        Math.random() * 2 * Math.PI);
  }
  if (this.firstFrame) {
    this.firstFrame = false;
  } else if (this.alive) {
    this.alive = !this.alive;
  }
};


Rail.prototype.makeCenters = function() {
  var centers = [];
  for (var i = -300; i < -1; i += .5) {
    centers.push([
      (Math.random()*2 - 1) * .17,
      (Math.random()*2 - 1) * .17,
      i
    ]);
  }
  centers.push([0, 0, -.7])
  centers.push([0, 0, 0]);

  return centers;
};


Rail.prototype.getPositionBuffer = function() {
  var vertexPositionCoordinates = [];
  var size = .025;
  for (var i = 0; i < this.centers.length - 1; i++) {
    util.array.pushAll(vertexPositionCoordinates, [
      // Top (y = 1)
      this.centers[i+1][0] - size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i  ][0] + size, this.centers[i  ][1] + size, this.centers[i  ][2],
      this.centers[i  ][0] - size, this.centers[i  ][1] + size, this.centers[i  ][2],

      // Bottom (y = -1)
      this.centers[i  ][0] - size, this.centers[i  ][1] - size, this.centers[i  ][2],
      this.centers[i  ][0] + size, this.centers[i  ][1] - size, this.centers[i  ][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] - size, this.centers[i+1][2],
      this.centers[i+1][0] - size, this.centers[i+1][1] - size, this.centers[i+1][2],

      // Right (x = 1)
      this.centers[i  ][0] + size, this.centers[i  ][1] - size, this.centers[i  ][2],
      this.centers[i  ][0] + size, this.centers[i  ][1] + size, this.centers[i  ][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] - size, this.centers[i+1][2],

      // Left (x = -1)
      this.centers[i+1][0] - size, this.centers[i+1][1] - size, this.centers[i+1][2],
      this.centers[i+1][0] - size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i  ][0] - size, this.centers[i  ][1] + size, this.centers[i  ][2],
      this.centers[i  ][0] - size, this.centers[i  ][1] - size, this.centers[i  ][2],

      // // // Front (z = 1)
      // this.centers[i+1][0] - size, this.centers[i+1][1] - size, this.centers[i+1][2],
      // this.centers[i+1][0] + size, this.centers[i+1][1] - size, this.centers[i+1][2],
      // this.centers[i+1][0] + size, this.centers[i+1][1] + size, this.centers[i+1][2],
      // this.centers[i+1][0] - size, this.centers[i+1][1] + size, this.centers[i+1][2],

      // // Back (z = -1)
      // this.centers[i  ][0] - size, this.centers[i  ][1] + size, this.centers[i  ][2],
      // this.centers[i  ][0] + size, this.centers[i  ][1] + size, this.centers[i  ][2],
      // this.centers[i  ][0] + size, this.centers[i  ][1] - size, this.centers[i  ][2],
      // this.centers[i  ][0] - size, this.centers[i  ][1] - size, this.centers[i  ][2],
    ]);
  }
  return Env.gl.generateBuffer(vertexPositionCoordinates, 3);
};


Rail.indexBuffer = null;


Rail.prototype.getIndexBuffer = function() {
  if (!Rail.indexBuffer) {
    var vertexIndicies = [];
    for (var i = 0; i < this.centers.length - 1; i++) {
      Box.eachFace(function(faceName, faceIndex) {
        if (faceName == 'front' || faceName == 'back') return;
        util.array.pushAll(vertexIndicies, [
          faceIndex*4 + 0 + i*16, faceIndex*4 + 1 + i*16, faceIndex*4 + 2 + i*16,
          faceIndex*4 + 0 + i*16, faceIndex*4 + 2 + i*16, faceIndex*4 + 3 + i*16
        ]);
      });
    }
    Rail.indexBuffer = Env.gl.generateIndexBuffer(vertexIndicies);
  }
  return Rail.indexBuffer;
};


Rail.prototype.getNormalBuffer = function() {
  var vertexNormals = [];
  for (var k = 0; k < this.centers.length - 1; k++) {
    Box.eachFace(function(faceName, faceIndex) {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < Box.FACE_NORMALS[faceName].length; j++) {
          vertexNormals.push(
              this.normalMultiplier * Box.FACE_NORMALS[faceName][j]);
        }
      }
    }, this);
  }
  return Env.gl.generateBuffer(vertexNormals, 3);
};



Rail.prototype.getOuterRadius = function() {
  return 100;
};


Rail.newFromReader = function(reader) {
  var proto = new Rail.Proto();
  proto.read(reader);
  return new Rail(proto);
};


Rail.prototype.updateFromReader = function(reader) {
  var proto = this.updateProto;
  proto.read(reader);
  vec3.copy(this.color, proto.color.get());

  // TODO: handle size change
};


/**
 * @constructor
 * @struct
 * @extends {Proto}
 */
Rail.Proto = function() {
  goog.base(this);
  this.upOrientation =  this.addField(10, new QuatField());
  this.color =  this.addField(11, new QuatField());
  this.p0 =  this.addField(12, new Vec3Field());
  this.p1 = this.addField(13, new Vec3Field());
};
goog.inherits(Rail.Proto, Proto);
