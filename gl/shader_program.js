ShaderProgram = function() {}

ShaderProgram.USE_TEXTURE_DEFAULT = false;
ShaderProgram.USE_LIGHTING_DEFAULT = true;
ShaderProgram.UNIFORM_COLOR_DEFAULT = [1, 1, 1, 1.0];
ShaderProgram.UNIFORM_SCALE_DEFAULT = [1, 1, 1];

ShaderProgram.getShader = function(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = shaderScript.firstChild.textContent;

  var shader;
  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
};

ShaderProgram.createShaderProgram = function(gl) {
  var shaderProgram = gl.createProgram();
  var fragmentShader = ShaderProgram.getShader(gl, 'fragment-shader');
  var vertexShader = ShaderProgram.getShader(gl, 'vertex-shader');

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialise shaders');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.perspectiveMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPerspectiveMatrix');
  shaderProgram.modelMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
  shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
  shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, 'uAmbientColor');
  shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingLocation');
  shaderProgram.eyeLocationUniform = gl.getUniformLocation(shaderProgram, 'uEyeLocation');
  shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingColor');

  shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, 'uUseLighting');
  shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, 'uUseTexture');
  shaderProgram.uniformColor = gl.getUniformLocation(shaderProgram, 'uColor');
  shaderProgram.uniformScale = gl.getUniformLocation(shaderProgram, 'uScale');

  for (var key in ShaderProgram.prototype) {
    shaderProgram[key] = ShaderProgram.prototype[key];
  }


  shaderProgram.loadedTexture = -1;
  shaderProgram.loadedColor = [];
  shaderProgram.loadedScale = [];
  shaderProgram.loadedNormalBuffer = null;
  shaderProgram.loadedIndexBuffer = null;
  shaderProgram.loadedPositionBuffer = null;
  shaderProgram.reset();
  return shaderProgram;
};

ShaderProgram.prototype.reset = function() {
  this.setUseLighting(ShaderProgram.USE_LIGHTING_DEFAULT);
  this.setUseTexture(ShaderProgram.USE_TEXTURE_DEFAULT)
  this.setUniformColor(ShaderProgram.UNIFORM_COLOR_DEFAULT);
  this.setUniformScale(ShaderProgram.UNIFORM_SCALE_DEFAULT);
};

ShaderProgram.prototype.setUseLighting = function(useLighting) {
  gl.uniform1i(this.useLightingUniform, useLighting);
};

ShaderProgram.prototype.setUseTexture = function(useTexture) {
  gl.uniform1i(this.useTextureUniform, useTexture);
};

ShaderProgram.prototype.setUniformColor = function(uniformColor) {
  if (vec4.equals(uniformColor, this.loadedColor)) return;
  this.loadedColor = uniformColor;
  // // debugger;
  // console.log(uniformColor);
  gl.uniform4fv(this.uniformColor, uniformColor);
};

ShaderProgram.prototype.setUniformScale = function(uniformScale) {
  if (vec4.equals(uniformScale, this.loadedScale)) return;
  this.loadedScale = uniformScale;
  gl.uniform3fv(this.uniformScale, uniformScale);
};

ShaderProgram.prototype.bindVertexPositionBuffer = function(buffer) {
  if (this.loadedPositionBuffer == buffer) {
    return;
  }
  this.loadedPositionBuffer = buffer;
  this.bindAttributeBuffer_(buffer, this.vertexPositionAttribute);
};

ShaderProgram.prototype.bindVertexNormalBuffer = function(buffer) {
  if (this.loadedNormalBuffer == buffer) {
    return;
  }
  this.loadedNormalBuffer = buffer;
  this.bindAttributeBuffer_(buffer, this.vertexNormalAttribute);
};

ShaderProgram.prototype.bindVertexTextureBuffer = function(buffer) {
  if (this.loadedTextureBuffer == buffer) {
    return;
  }
  this.loadedTextureBuffer = buffer;
  this.bindAttributeBuffer_(buffer, this.textureCoordAttribute);
};

ShaderProgram.prototype.bindVertexIndexBuffer = function(buffer) {
  if (this.loadedIndexBuffer == buffer) return;
  this.loadedIndexBuffer = buffer;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
};

ShaderProgram.prototype.bindAttributeBuffer_ = function(buffer, location) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0); 
};

ShaderProgram.prototype.bindTexture = function(texture) {
  if (this.loadedTexture == texture) return;
  this.loadedTexture = texture;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
};

