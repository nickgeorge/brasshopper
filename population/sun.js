Sun = function(message) {
  this.super();

  this.size = message.size || 1;
  this.box = new Box([this.size, this.size, this.size]).
      setColor([1, 1, .6]);

  this.parts = [this.box];

  this.klass = "Sun";
};
util.inherits(Sun, Thing);

Sun.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);
  this.position = [
    4.25 * Math.sin(this.age / .4),
    4.25 * Math.sin(this.age / .5),
    4.25 * Math.sin(this.age / .6)
  ];
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.box.draw();
  shaderProgram.setUseLighting(true);
};