// Lighting Uniform locations that need to be altered.
var alphaLoc, IaLoc, IdLoc, IsLoc, kaLoc, kdLoc, ksLoc, p0Loc;

// Point light along with its intensity, reflectance coefficients, and on state.
var p0;
var pointOn;
var Ia, Id, Is;
var ka, kd, ks;

// Shiny factor.
var alpha;
// A boolean for whether specularity is currently on.
var specular;
// A copy of the specular reflectance coefficient for toggling.
var spcularVals;

// Directional light with its direction, color, and on state.
// diffuse only.
var lightDirection;
var directionColor;
var directionOn;

function setLightData() {
  // Point light source position.
  p0 = vec3(-1.0, 2.0, -1.0);
  pointOn = true;
  // Point light source intensity.
  Ia = vec3(0.5, 0.8, 0.5);
  Id = vec3(0.4, 0.8, 0.3);
  Is = vec3(1.0, 1.0, 1.0);

  // Point light source reflectance coefficients.
  ka = vec3(0.5, 0.5, 0.6);
  kd = vec3(0.8, 0.6, 0.6);
  ks = vec3(1.0, 1.0, 1.0);

  // Shine value and specular state.
  alpha = 1.0;
  specular = true;

  // Direction and color value for the diffuse directional light.
  lightDirection = vec3(0.0, 0.0, -1.0);
  directionColor = vec3(0.5, 0.7, 0.7);
  directionOn = true;
}

/* Retrieves uniform locations */
function getNeededLocations() {
  p0Loc = gl.getUniformLocation(program, "p0");
  IaLoc = gl.getUniformLocation(program, "Ia");
  IdLoc = gl.getUniformLocation(program, "Id");
  IsLoc = gl.getUniformLocation(program, "Is");
  kaLoc = gl.getUniformLocation(program, "ka");
  kdLoc = gl.getUniformLocation(program, "kd");
  ksLoc = gl.getUniformLocation(program, "ks");
}

/* Enables the point light */
function enablePointLight() {
  gl.uniform3f(p0Loc, p0[0], p0[1], p0[2]);
  gl.uniform3f(IaLoc, Ia[0], Ia[1], Ia[2]);
  gl.uniform3f(IdLoc, Id[0], Id[1], Id[2]);
  gl.uniform3f(IsLoc, Is[0], Is[1], Is[2]);
  gl.uniform3f(kaLoc, ka[0], ka[1], ka[2]);
  gl.uniform3f(kdLoc, kd[0], kd[1], kd[2]);
  gl.uniform3f(ksLoc, ks[0], ks[1], ks[2]);
}

/* Disables the point light */
function disablePointLight() {
  gl.uniform3f(kaLoc, 0.0, 0.0, 0.0);
  gl.uniform3f(kdLoc, 0.0, 0.0, 0.0);
  gl.uniform3f(ksLoc, 0.0, 0.0, 0.0);
}

/* Enables directional light */
function enableDirectionalLight() {
  lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
  gl.uniform3f(lightDirectionLoc, lightDirection[0], lightDirection[1], lightDirection[2]);

  directionColorLoc = gl.getUniformLocation(program, "directionColor");
  gl.uniform3f(directionColorLoc, directionColor[0], directionColor[1], directionColor[2]);
}

/* Disables directional light */
function disableDirectionalLight() {
  gl.uniform3f(directionColorLoc, 0.0, 0.0, 0.0);
}
