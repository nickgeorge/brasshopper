CollisionManager = function(world) {
  this.world = world;
  this.collisionFunctions = {};

  this.registerCollisionFunctions();
};

CollisionFunctions = {
  GLOM: function(glomee, glomer) {
    if (!glomer.alive) return;
    var encounter = glomee.findThingEncounter(glomer, 0);
    if (encounter) {
      encounter.part.glom(glomer, encounter);
      glomer.alive = false;
    }
  },

  BOXLIKE_AND_HERO: function(boxlike, hero) {
    var encounter = boxlike.findThingEncounter(hero, Hero.HEIGHT);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();
    var isOnGround = hero.isLandedOn(part);
    if (!isOnGround) {
      var plumb = vec3.set(vec3.temp, 0, -Hero.HEIGHT, 0);
      part.worldToLocalCoords(plumb, plumb, 0);
      if (plumb[2] < 0) {
        var cosAngle = vec3.dot(plumb, [0, 0, -1])/Hero.HEIGHT;
        if (cosAngle > .65) {
          hero.land(part);
          isOnGround = true;
        }
      }
      if (!isOnGround) {
        encounter = boxlike.findThingEncounter(hero, Hero.WIDTH);
        if (!encounter) {
          return;
        }
        hero.unland();
        var part = encounter.part;
      }
    }

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    heroPosition_lc[2] = isOnGround ?
        Hero.HEIGHT + .001 :
        Math.max(Hero.WIDTH + .001, heroPosition_lc[2]);
    part.localToWorldCoords(hero.position, heroPosition_lc);
    hero.computeTransforms();

    var heroVelocity_lc = part.worldToLocalCoords(vec3.temp, hero.velocity, 0);
    var normal = vec3.normalize([], heroPosition_lc);
    vec3.scaleAndAdd
    heroVelocity_lc[2] = wasLanded ?
        Math.max(0, heroVelocity_lc[2]) :
        Math.abs(heroVelocity_lc[2]);
    part.localToWorldCoords(hero.velocity, heroVelocity_lc, 0);
  },

  SPHERELIKE_AND_HERO: function(spherelike, hero) {
    var encounter = spherelike.findThingEncounter(hero, Hero.WIDTH);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    vec3.scale(heroPosition_lc, heroPosition_lc,
        (part.radius + Hero.WIDTH + .001)/vec3.length(heroPosition_lc));
    part.localToWorldCoords(hero.position, heroPosition_lc);
    hero.computeTransforms();

    var heroVelocity_lc = part.worldToLocalCoords(vec3.temp, hero.velocity, 0);
    var normal = vec3.normalize([], heroPosition_lc);
    vec3.scaleAndAdd(heroVelocity_lc, heroVelocity_lc,
        normal, -2*vec3.dot(heroVelocity_lc, normal));
    part.localToWorldCoords(hero.velocity, heroVelocity_lc, 0);
  }
};


CollisionManager.prototype.test = function(thingA, thingB) {
  var typeA = thingA.getType();
  var typeB = thingB.getType();
  var collisionFunction = this.collisionFunctions[typeA] ? 
      this.collisionFunctions[typeA][typeB] :
      null;
  if (collisionFunction) collisionFunction(thingA, thingB);
};


CollisionManager.prototype.registerCollisionFunction = function(
    classA, classB, fn) {
  var typeA = classA.type;
  var typeB = classB.type;
  this.collisionFunctions[typeA] = this.collisionFunctions[typeA] || {};
  this.collisionFunctions[typeB] = this.collisionFunctions[typeB] || {};

  this.collisionFunctions[typeA][typeB] = fn;
  this.collisionFunctions[typeB][typeA] = function(thingB, thingA) {
    fn(thingA, thingB);
  }
};


CollisionManager.prototype.registerCollisionFunctions = function() {
  this.registerCollisionFunction(DumbCrate, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Sphere, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Shelf, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Fella, Bullet, CollisionFunctions.GLOM);

  this.registerCollisionFunction(Shelf, Hero, CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionFunction(DumbCrate, Hero, CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionFunction(Sphere, Hero, CollisionFunctions.SPHERELIKE_AND_HERO);
};


CollisionManager.prototype.checkCollisions = function() {
  // TODO: Check everything, collide with the collision with min
  // value of t
  for (var i = 0, thingA; thingA = this.world.things[i]; i++) {
    for (var j = i + 1, thingB; thingB = this.world.things[j]; j++) {
      // if (util.math.sqr(thingA.getOuterRadius() + thingB.getOuterRadius()) < 
      //     thingA.distanceSquaredTo(thingB)) {
      //   continue;
      // }
      this.test(thingA, thingB);
    }
  }
  for (var i = 0, thing; thing = this.world.things[i]; i++) {
    for (var j = 0, projectile; projectile = this.world.projectiles[j]; j++) {
      // if (util.math.sqr(thing.getOuterRadius() + projectile.getOuterRadius()) < 
      //     thing.distanceSquaredTo(projectile)) {
      //   continue;
      // }
      // debugger;
      this.test(thing, projectile);
    }
  }
};


