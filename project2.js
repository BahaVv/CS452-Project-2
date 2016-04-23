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

// Bool to see if object being rendered has a texture
var textured

// Distance bounds
var near, far;

// A vector for holding a solid color to be passed to the vertex shader
var colorVector;
// Uniform location for colorVector
var colorVectorLoc;

var c1 = 1;
var alph1 = 0, alph2 = 0, alph3 = 0;

var moaiObj, cubeObj, pyramidObj, octaObj, sphereObj;

var indexBuffer, verticesBuffer, normalsBuffer;

var vertexPosition, nvPosition;

var picture, textureImage;

var texCoordBuffer, texCoordLoc;

var isTextureLoc;

var vecCol1, vecCol2, vecCol3, vecCol4, vecCol5;

var slider;

function createObject(numVert, numTriangles, vertices, indexList, textureCoords) {

  var obj = {
    numVert: numVert,
    numTriangles: numTriangles,
    vertices: vertices,
    indexList: indexList,
    vertNormals: generateNormals(vertices, indexList)
	textureCoords: textureCoords
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
  
  // Apologies.
  var moaiTex = new Array(getHeadVertices.length() * 2);
  var octaTex = new Array(getOctaVertices.length() * 2);
  var sphereTex = new Array(getSphereVertices.length() * 2);

  moaiObj = createObject(1738, 3170, getHeadVertices(), getHeadFaces(), moaiTex);
  cubeObj = createObject(36, 36, getCubeVertices(), getCubeFaces(), getCubeTextureMap());
  pyramidObj = createObject(18, 18, getPyramidVertices(), getPyramidFaces(), getPyramidTextureMap());
  octaObj = createObject(36, 36, getOctaVertices(), getOctaFaces(), octaTex);
  sphereObj = createObject(getSphereVertices().length, getSphereFaces().length, getSphereVertices(), getSphereFaces(), sphereTex);

  console.log(cubeObj.numVert);
  console.log(cubeObj.numTriangles);

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

  indexBuffer = gl.createBuffer();
  verticesBuffer = gl.createBuffer();
  normalsBuffer = gl.createBuffer();

  vertexPosition = gl.getAttribLocation(program,"vertexPosition");
  nvPosition = gl.getAttribLocation(program,"nv");
  
	// Initialize first texture
	picture = document.getElementById("BlueRogues");
	textureImage = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, textureImage);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, picture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoords), gl.STATIC_DRAW);

	texCoordLoc = gl.getAttribLocation(program, "textureCoordinate");
	gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(texCoordLoc);
	
	isTextureLoc = gl.getUniformLocation(program, "isTexture");
	gl.uniform1f(isTextureLoc, 0.0);

	render();

  slider = document.getElementById("speedSlider");

  randomizeColors();

  render();
}

function randomizeColors() {
  vecCol1 = getRandColor();
  vecCol2 = getRandColor();
  vecCol3 = getRandColor();
  vecCol4 = getRandColor();
  vecCol5 = getRandColor();
}

function getRandColor() {
  return vec4(Math.random().toFixed(2),Math.random().toFixed(2),Math.random().toFixed(2),1.0);
}

function render() {
  console.log(slider.value);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  // Draw moai
  gl.uniform1f(isTextureLoc, 0.0)
  gl.uniform1i(gl.getUniformLocation(program, "texMap0"), 0);
  //colorVector = vec4(1.0, 0.0, 0.0, 1.0);
  colorVector = vecCol1;
  gl.uniform4fv(colorVectorLoc, colorVector);
  setupBuffers(moaiObj);
  gl.drawElements( gl.TRIANGLES, 3 * moaiObj.numTriangles, gl.UNSIGNED_SHORT, 0 );
  rotate();

  // Draw cube
  gl.uniform1f(isTextureLoc, 1.0)
  picture = document.getElementById("BlueRogues");
  textureImage = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, picture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, "texMap0"), 0);
  //colorVector = vec4(0.0, 0.5, 0.0, 1.0);
  colorVector = vecCol2;
  gl.uniform4fv(colorVectorLoc, colorVector);
  setupBuffers(cubeObj);
  gl.drawElements( gl.TRIANGLES, cubeObj.numTriangles, gl.UNSIGNED_SHORT, 0 );
  rotate();

  // Draw pyramid
  gl.uniform1f(isTextureLoc, 1.0)
  picture = document.getElementById("BrickTexture");
  textureImage = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, picture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, "texMap0"), 0);
  //colorVector = vec4(0.5, 0.25, 0.5, 1.0);
  colorVector = vecCol3;
  gl.uniform4fv(colorVectorLoc, colorVector);
  setupBuffers(pyramidObj);
  gl.drawElements( gl.TRIANGLES, pyramidObj.numTriangles, gl.UNSIGNED_SHORT, 0 );

  // Draw octa
  gl.uniform1f(isTextureLoc, 0.0)
  gl.uniform1i(gl.getUniformLocation(program, "texMap0"), 0);
  //colorVector = vec4(0.5, 0.25, 0.5, 1.0);
  colorVector = vecCol4;
  gl.uniform4fv(colorVectorLoc, colorVector);
  setupBuffers(octaObj);
  gl.drawElements( gl.TRIANGLES, octaObj.numTriangles, gl.UNSIGNED_SHORT, 0 );

  // Draw sphere
  gl.uniform1f(isTextureLoc, 0.0)
  gl.uniform1i(gl.getUniformLocation(program, "texMap0"), 0);
  //colorVector = vec4(0.5, 0.25, 0.5, 1.0);
  colorVector = vecCol5;
  gl.uniform4fv(colorVectorLoc, colorVector);
  setupBuffers(sphereObj);
  gl.drawElements( gl.TRIANGLES, sphereObj.numTriangles, gl.UNSIGNED_SHORT, 0 );

  requestAnimFrame(render);
}

function setupBuffers(obj) {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indexList), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertices), gl.STATIC_DRAW);

  gl.enableVertexAttribArray( vertexPosition );
  gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.vertNormals), gl.STATIC_DRAW);

  gl.vertexAttribPointer( nvPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( nvPosition );
  
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.textureCoords), gl.STATIC_DRAW);
	
  gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray(texCoordLoc);
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
  c1 = slider.value;
  var rotMatX = makeRotationXMatrix(alph1);
  var rotMatY = makeRotationYMatrix(alph2);
  var rotMatZ = makeRotationZMatrix(alph3);
  var rotMatXLoc = gl.getUniformLocation(program, "rotMatX");
  var rotMatYLoc = gl.getUniformLocation(program, "rotMatY");
  var rotMatZLoc = gl.getUniformLocation(program, "rotMatZ");
  gl.uniformMatrix4fv(rotMatXLoc, false, rotMatX);
  gl.uniformMatrix4fv(rotMatYLoc, false, rotMatY);
  gl.uniformMatrix4fv(rotMatZLoc, false, rotMatZ);
  alph1+=c1*0.005;
  alph2+=c1*0.005;
  alph3+=c1*0.005;
}
