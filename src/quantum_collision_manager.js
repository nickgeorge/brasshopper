goog.provide('QuantumCollisionManager');
goog.provide('CollisionFunctions');

goog.require('CollisionManager');


/**
 * @constructor
 * @extends {CollisionManager}
 * @struct
 */
QuantumCollisionManager = function(world) {
  goog.base(this, world);
};
goog.inherits(QuantumCollisionManager, CollisionManager);


QuantumCollisionManager.prototype.thingOnThing = function() {
  var crates = this.world.getThingsByClass(DumbCrate);
  var fellas = this.world.getThingsByClass(Fella);
  var heros = this.world.getThingsByClass(Hero);
  var shelves = this.world.getThingsByClass(Shelf);

  shelves.forEachCross(heros, function(shelf, hero) {
    this.doPerPair(shelf, hero);
  }, this);
  crates.forEachCross(heros, function(crate, hero) {
    this.doPerPair(crate, hero);
  }, this);
  shelves.forEachCross(fellas, function(shelf, fella) {
    this.doPerPair(shelf, fella);
  }, this);
  crates.forEachCross(fellas, function(crate, fella) {
    this.doPerPair(crate, fella);
  }, this);

  // crates.forEach(function(crate) {
  //   fellas.forEach(function(fella) {
  //     this.doPerPair(crate, fella);
  //   }, this);
  // }, this);
};


QuantumCollisionManager.prototype.registerCollisionConditions = function() {
  this.registerCollisionCondition(DumbCrate, Bullet,
      util.fn.constant(0),
      CollisionFunctions.GLOM);
  this.registerCollisionCondition(Head, Bullet,
      util.fn.constant(0),
      CollisionFunctions.GLOM);
  this.registerCollisionCondition(Shelf, Bullet,
      util.fn.constant(0),
      CollisionFunctions.GLOM);
  // this.registerCollisionCondition(DumbCrate, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  // this.registerCollisionCondition(Sphere, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  // this.registerCollisionCondition(Shelf, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  // this.registerCollisionCondition(Fella, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  this.registerCollisionCondition(Fella, Bullet,
      util.fn.constant(0),
      CollisionFunctions.FELLA_AND_BULLET);
  this.registerCollisionCondition(Fella, Rail,
      util.fn.constant(0),
      CollisionFunctions.FELLA_AND_RAIL);

  this.registerCollisionCondition(Shelf, Hero,
      util.fn.constant(Walker.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(Shelf, Fella,
      util.fn.constant(Walker.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(DumbCrate, Fella,
      util.fn.constant(Walker.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(DumbCrate, Hero,
      util.fn.constant(Walker.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  // this.registerCollisionCondition(Sphere, Hero,
  //     util.fn.constant(Walker.HEIGHT),
  //     CollisionFunctions.SPHERELIKE_AND_HERO);
};


// TODO: Move these into individual things.
CollisionFunctions = {
  FELLA_AND_BULLET: function(fella, bullet) {
    var encounter = fella.findThingEncounter(bullet, 0);
    if (encounter) {
      bullet.alive = false;
      var bodyPart = encounter.part.getGlommable();
      fella.hit(bullet, bodyPart);
      encounter.part.glom(bullet, encounter.point);
    }
  },

  FELLA_AND_RAIL: function(fella, rail) {
    var encounter = fella.findEncounter(rail.getP0(), rail.getP1(), .2);
    if (encounter) {
      var bodyPart = encounter.part.getGlommable();
      fella.deathSpeed = 5;
      fella.hit(rail, bodyPart);
    }
  },

  GLOM: function(glomee, glomer) {
    if (!glomer.alive) return;
    var encounter = glomee.findThingEncounter(glomer, 0);
    if (encounter) {
      encounter.part.glom(glomer, encounter.point);
      glomer.alive = false;
      glomer.landed = true;
    }
  },

  BOXLIKE_AND_HERO: function(boxlike, hero) {
    // if (hero.isLanded() && hero.ground.getRoot() == boxlike) {
    //   return;
    // }
    var encounter = boxlike.findThingEncounter(hero, Walker.HEIGHT);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();
    var isOnGround = hero.isLandedOn(part);
    if (!isOnGround) {
      // var plumb = vec3.set(vec3.temp, 0, -Walker.HEIGHT, 0);
      // vec3.transformQuat(plumb, plumb, hero.upOrientation);
      // part.worldToLocalCoords(plumb, plumb, 0);
      // // TODO: wha?!
      // if (plumb[2] < 0 || true) {
      //   var cosAngle = vec3.dot(plumb, vec3.NEG_K)/Walker.HEIGHT;
      //   if (cosAngle > .55 || true) {
          // TODO: Adjust height
          hero.land(part);
          isOnGround = true;
        // }
      // }
    }

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    heroPosition_lc[1] = isOnGround ?
        Walker.HEIGHT + .001 :
        Math.max(Walker.WIDTH + .001, heroPosition_lc[1]);
    part.localToWorldCoords(hero.position, heroPosition_lc);
  },

  SPHERELIKE_AND_HERO: function(spherelike, hero) {
    var encounter = spherelike.findThingEncounter(hero, Walker.HEIGHT);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    vec3.scale(heroPosition_lc, heroPosition_lc,
        (part.radius + Walker.WIDTH + .001)/vec3.length(heroPosition_lc));
    part.localToWorldCoords(hero.position, heroPosition_lc);

    var heroVelocity_lc = part.worldToLocalCoords(vec3.temp, hero.velocity, 0);
    var normal = vec3.normalize([], heroPosition_lc);
    vec3.scaleAndAdd(heroVelocity_lc, heroVelocity_lc,
        normal, -2*vec3.dot(heroVelocity_lc, normal));
    part.localToWorldCoords(hero.velocity, heroVelocity_lc, 0);
  }
};
