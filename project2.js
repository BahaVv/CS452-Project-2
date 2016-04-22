// GL
var gl;
// Graphics Shader
var program;
// Number of vertices in the shape and the number of polygons.
var numVertices;
var numTriangles;
// A transposed list of vertices.
var flatVertices;
// A list of all vertices.
var vertices;
// Associates vertices with points in a triangle.
var indexList;
// A list of all vertex normals.
var vertNormals;

// A matrix representing the model view transformation transpoed and inverse.
// for lighting calculations.
var MinvTrans;
// A matrix representing a model view transformation.
var M;

// Matrices representing a orthogonal and perspective projection.
var Porth;
var Pper;

var PLoc;

// Viewer location.
var e;
// Look-at point.
var a;
// Up direction.
var vup;

// Bounds for a orthogonal projection.
var orthLeft, orthRight, orthTop, orthBottom;
var perLeft, perRight, perTop, perBottom;

// Distance bounds
var near, far;

// A vector for holding a solid color to be passed to the vertex shader
var colorVector;
// Uniform location for colorVector
var colorVectorLoc;

var c1 = 1;
var alph1 = 0, alph2 = 0, alph3 = 0;

var moaiObj, cubeObj, pyramidObj, octaObj, sphereObj;

function createObject(numVert, numTriangles, vertices, indexList) {
  var obj = {
    numVert: numVert,
    numTriangles: numTriangles,
    vertices: vertices,
    indexList: indexList,
    vertNormals: generateNormals(vertices, indexList)
  };

  return obj;
}

function setupGL() {
  var canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.enable(gl.DEPTH_TEST);
  gl.viewport( 0, 0, 512, 512 );
  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
}

function initGL(){
  setupGL();

  // viewer point, look-at point, up direction.
  setViewingData();

  setLightData();

  // Sets the needed matrices.
  calcMAndMinv();
  calcPorthAndPper();

  // Below is all of the accessing of the GPU
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  moaiObj = createObject(1738, 3170, getHeadVertices(), getHeadFaces());

  var MLoc = gl.getUniformLocation(program, "M");
  gl.uniformMatrix4fv(MLoc, false, M);

  var MinvTransLoc = gl.getUniformLocation(program, "MinvTrans");
  gl.uniformMatrix4fv(MinvTransLoc, false, MinvTrans);

  PLoc = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(PLoc, false, Pper);

  getNeededLocations();
  enablePointLight();
  enableDirectionalLight();

  colorVectorLoc = gl.getUniformLocation(program, "colorVector");

  alphaLoc = gl.getUniformLocation(program, "alpha");
  gl.uniform1f(alphaLoc, alpha);

  render();
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  setupBuffers(moaiObj);
  colorVector = vec4(1.0, 0.0, 0.0, 1.0);
  gl.uniform4fv(colorVectorLoc, colorVector);
  gl.drawElements( gl.TRIANGLES, 3 * moaiObj.numTriangles, gl.UNSIGNED_SHORT, 0 );
  rotate();

  requestAnimFrame(render);
}

function setupBuffers(obj) {
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indexList), gl.STATIC_DRAW);

  var verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(program,"vertexPosition");
  gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vertexPosition );

  var normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertNormals), gl.STATIC_DRAW);

  var nvPosition = gl.getAttribLocation(program,"nv");
  gl.vertexAttribPointer( nvPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( nvPosition );
}

function setViewingData() {
  e = vec3(0.0, 0.0, 10.0);
  a = vec3(0.0, 0.0, 0.0);
  vup = vec3(0.0, 1.0, 0.0);

  // Set bounds for projections.
  viewerDist = length(subtract(e, a));
  near = viewerDist - 8;
  far = viewerDist + 10;

  // Othographic projection bounds.
  orthLeft = -4;
  orthRight = 4;
  orthTop = 4;
  orthBottom = -4;

  // Perspecive projection bounds.
  perTop = near * Math.tan(Math.PI/4);
  perBottom = -perTop;
  perRight = perTop;
  perLeft = -perRight;
}

function rotate() {
  var rotMatX = makeRotationXMatrix(alph1);
  var rotMatY = makeRotationYMatrix(alph2);
  var rotMatZ = makeRotationZMatrix(alph3); // mult(makeRotationYMatrix(alph), mult(makeRotationYMatrix(alph), makeRotationXMatrix(alph)));
  var rotMatXLoc = gl.getUniformLocation(program, "rotMatX");
  var rotMatYLoc = gl.getUniformLocation(program, "rotMatY");
  var rotMatZLoc = gl.getUniformLocation(program, "rotMatZ");
  gl.uniformMatrix4fv(rotMatXLoc, false, rotMatX);
  gl.uniformMatrix4fv(rotMatYLoc, false, rotMatY);
  gl.uniformMatrix4fv(rotMatZLoc, false, rotMatZ);
  alph1+=c1 * 0.00;
  alph2+=0.05;
  alph3+=0.00;
}
