Fella = function(message) {

  this.legAngle = (Math.random()*2 - 1) * Fella.MAX_LEG_ANGLE;
  this.stepDirection = 1;
  this.speed = message.speed || 0;
  // vec3.set(this.velocity, 0, 0, this.speed);


  goog.base(this, message);

  this.velocity = vec3.fromValues(0, 0, this.speed);

  this.color = vec4.nullableClone(message.color);

  this.health = 100;

  this.head = null;
  this.torso = null;
  this.rightLeg = null;
  this.leftLeg = null;
  this.rightArm = null;
  this.leftArm = null;
  this.deathSpeed = 1;
  this.buildBody();

  this.healthBar = new HealthBar({

    refThing: this,
    position: [0, .8, 0]
  });
  this.addEffect(this.healthBar);
};
goog.inherits(Fella, Walker);
Types.registerType(Fella, QuantumTypes.FELLA);

Fella.MAX_LEG_ANGLE = Math.PI/6;


Fella.prototype.advance = function(dt) {
  this.advanceWalker(dt);
  if (!this.alive) return;
  if (Math.random() < .02) {
    this.rYaw = Math.random()*2 - 1;
  }
  this.legAngle += this.speed * this.stepDirection * dt;

  if (this.legAngle >= Fella.MAX_LEG_ANGLE) {
    this.stepDirection = -1;
  }
  if (this.legAngle <= -Fella.MAX_LEG_ANGLE) {
    this.stepDirection = 1;
  }

  this.leftLeg.setPitchOnly(this.legAngle);
  this.rightLeg.setPitchOnly(-this.legAngle);
  this.rightArm.setPitchOnly(this.legAngle);
  this.leftArm.setPitchOnly(-this.legAngle);
};


Fella.prototype.getOuterRadius = function() {
  return Hero.HEIGHT * 4;
};

Fella.prototype.die = function() {

  Sounds.getAndPlay(SoundList.GLASS);
  this.alive = false;
  this.velocity = [0, 0, 0];
  this.rYaw = this.rPitch = this.rRoll = 0;
  this.eachPart(function(part) {
    this.alive = false;
    part.isStatic = false;
    var vTheta = Math.random()*2*Math.PI;
    vec3.random(part.velocity, this.deathSpeed);
  });
  Env.world.effects.remove(this.healthBar);
};


Fella.prototype.hit = function(bullet, part) {
  this.health -= bullet.damage * part.damageMultiplier;
  if (this.health <= 0) {

    if (this.alive) {
      this.die();
      var owner = bullet.owner;
      owner.railAmmo += 1;

      var score = 10;
      if (bullet.getType() == Bullet.type) score *= 1.5;
      if (!owner.isLanded()) score *= 20;
      else if (owner.ground != this.ground) score *= 5;

      Env.world.score += score;

      if (owner.isLanded()) {
        var groundRoot = owner.ground.getRoot();
        if (groundRoot.getType() == DumbCrate.type && !groundRoot.claimed) {
          groundRoot.claimed = true;
          Env.world.killsLeft--;
          groundRoot.box.color = [0, 0, 1, .75];
          groundRoot.transluscent = true;
        }
      }

      // vec3.copy(
      //     part.velocity,
      //     part.worldToLocalCoords(vec3.temp,
      //         vec3.scale(vec3.temp,
      //             vec3.transformQuat(vec3.temp,
      //                 bullet.velocity,
      //                 bullet.upOrientation),
      //             1/25),
      //         0));
    }
  } else {
    this.healthBar.updateHealth();
  }
};


Fella.prototype.buildBody = function() {
  this.leftLeg = new OffsetBox({
    size: [.2, 1, .2],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, -Hero.HEIGHT + 1.1, 0],
    isStatic: true,
  });

  this.rightLeg = new OffsetBox({
    size: [.2, 1, .2],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, -Hero.HEIGHT + 1.1, 0],
    isStatic: true,
  });

  this.leftArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [.355, -Hero.HEIGHT + 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: Math.PI/32,
    name: "left leg",
    isStatic: true,
    damageMultiplier: .85
  });
  this.rightArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [-.355, -Hero.HEIGHT + 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: -Math.PI/32,
    name: "right leg",
    isStatic: true,
    damageMultiplier: .85
  });

  this.head = new DataThing({
    data: HeadData,
    uScale: .015,
    position: [0, -Hero.HEIGHT + 2.2, 0],
    name: "head",
    color: this.color,
    isStatic: true,
    damageMultiplier: 4,
  });

  this.torso = new Box({
    size: [.6, 1, .2],
    position: [0, -Hero.HEIGHT + 1.5, 0],
    color: this.color,
    name: "torso",
    textureCounts: [1, 1],
    isStatic: true,
    damageMultiplier: 1.7,
  });

  this.addParts([
    this.head,
    this.torso,
    this.rightLeg,
    this.leftLeg,
    this.rightArm,
    this.leftArm,
  ]);
};
