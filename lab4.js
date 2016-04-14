// Name: Benjamin Lanon

var gl;
var numVertices;
var numTriangles;
var program;
var ModelViewLoc, ProjectionLoc;
var ModelViewMat, OrthoProjectionMat, PerspectProjectionMat, ProjectionMat;
var specularOn, spotlightOn, pointOn;
var p0Loc, Ia0Loc, Id0Loc, Is0Loc, ka0Loc, kd0Loc, ks0Loc, alpha0Loc, pointBoolLoc;
var p1Loc, Ia1Loc, Id1Loc, Is1Loc, ka1Loc, kd1Loc, ks1Loc, alpha1Loc, spotlightBoolLoc;

function initGL(){
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.enable(gl.DEPTH_TEST);
    gl.viewport( 0, 0, 512, 512 );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    genMatrices();

    numVertices = 1738;
    numTriangles = 3170;
    vertices = getVertices(); // vertices and faces are defined in object.js
    indexList = getFaces();

    specularOn = true;
    spotlightOn = true;
    pointOn = true;

    ProjectionMat = OrthoProjectionMat;

    var faceNormals = getFaceNormals(vertices, indexList);
    var vertexNormals = getVertexNormals(vertices, faceNormals, indexList);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);

    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vertexPosition = gl.getAttribLocation(program,"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );

    var verticesNormBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);

    var vertexNormalPosition = gl.getAttribLocation(program, "nv");
    gl.vertexAttribPointer(vertexNormalPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalPosition);

    p0Loc = gl.getUniformLocation(program, "p0");
    Ia0Loc = gl.getUniformLocation(program, "Ia0");
    Id0Loc = gl.getUniformLocation(program, "Id0");
    Is0Loc = gl.getUniformLocation(program, "Is0");
    ka0Loc = gl.getUniformLocation(program, "ka0");
    kd0Loc = gl.getUniformLocation(program, "kd0");
    ks0Loc = gl.getUniformLocation(program, "ks0");
    alpha0Loc = gl.getUniformLocation(program, "alpha0");
    pointBoolLoc = gl.getUniformLocation(program, "pointBool");

    p1Loc = gl.getUniformLocation(program, "p1");
    Ia1Loc = gl.getUniformLocation(program, "Ia1");
    Id1Loc = gl.getUniformLocation(program, "Id1");
    Is1Loc = gl.getUniformLocation(program, "Is1");
    ka1Loc = gl.getUniformLocation(program, "ka1");
    kd1Loc = gl.getUniformLocation(program, "kd1");
    ks1Loc = gl.getUniformLocation(program, "ks1");
    alpha1Loc = gl.getUniformLocation(program, "alpha1");
    spotlightBoolLoc = gl.getUniformLocation(program, "spotlightBool");

    ModelViewLoc = gl.getUniformLocation(program, "ModelView");
    ProjectionLoc = gl.getUniformLocation(program, "Projection");

    sendViewingMatrices();
    drawObject();
};

function sendViewingMatrices() {
  gl.uniformMatrix4fv(ModelViewLoc, false, flatten(ModelViewMat));
  gl.uniformMatrix4fv(ProjectionLoc, false, flatten(ProjectionMat));
}

function sendLigthing() {
  gl.uniform3fv(p0Loc, vec3(0.0, 1.5, -1.75));
  gl.uniform3fv(Ia0Loc, vec3(.2, .1, .1));
  gl.uniform3fv(Id0Loc, vec3(.8, .8, .8));
  gl.uniform3fv(Is0Loc, vec3(.8, .8, .8));
  gl.uniform3fv(ka0Loc, vec3(.1, .1, .1));
  gl.uniform3fv(kd0Loc, vec3(2, 2, 2));
  gl.uniform3fv(ks0Loc, specularOn ? vec3(1.0, 1.0, 1.0) : vec3(0, 0, 0));
  gl.uniform1f(alpha0Loc, 2.0);
  gl.uniform1f(pointBoolLoc, pointOn ? 1.0 : 0.0);

  gl.uniform3fv(p1Loc, vec3(0.0, -2.5, -5));
  gl.uniform3fv(Ia1Loc, vec3(0, 100, 100));
  gl.uniform3fv(Id1Loc, vec3(0, 0, 0));
  gl.uniform3fv(Is1Loc, vec3(3, 3, 3));
  gl.uniform3fv(ka1Loc, vec3(.1, .1, .1));
  gl.uniform3fv(kd1Loc, vec3(2, 2, 2));
  gl.uniform3fv(ks1Loc, specularOn ? vec3(10.0, 10.0, 10.0) : vec3(0, 0, 0));
  gl.uniform1f(alpha1Loc, 2.0);
  gl.uniform1f(spotlightBoolLoc, spotlightOn ? 1.0 : 0.0);
}

function genMatrices() {
  var e = vec3(0.015, 0, -0.025);
  var up_vec = vec3(0.0, 1.0, 0.0);
  var a = vec3(0.0, 0.0, 0.0);

  n = normalize(subtract(e, a));
  u = normalize(cross(up_vec, n));
  v = normalize(cross(n, u));

  var McamrotInv = mat4(u[0], v[0], n[0], 0,
    u[1], v[1], n[1], 0,
    u[2], v[2], n[2], 0,
    0, 0, 0, 1);

  var McamtransInv = mat4(1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    -e[0],-e[1],-e[2],1);

  ModelViewMat = mult(McamrotInv, McamtransInv);

  console.log("ModelView: ");
  console.log(ModelViewMat);

  var ea_len = length(subtract(e,a));

  var top_ = 4,
    bottom = -4,
    left = -4,
    right = 4,
    far = ea_len + 4,
    near = ea_len - 4;

  console.log(ea_len);

  OrthoProjectionMat = mat4(2.0/(left-right), 0.0, 0.0, 0.0,
    0.0, 2.0/(top_-bottom), 0.0, 0.0,
    0.0, 0.0, -2.0/(near-far), 0.0,
    -(left+right)/(left-right), -(top_+bottom)/(top_-bottom), -(far+near)/(far-near), 1.0);

  console.log("OrthoProjection: ");
  console.log(OrthoProjectionMat);

  // NOT FULLY IMPLEMENTED
  var perspectTop = near * Math.tan(Math.PI/3.0),
    perspectBottom = -perspectTop,
    perspectLeft = -perspectLeft,
    perspectRight = perspectTop;

  PerspectProjectionMat = mat4(near/perspectRight, 0.0, 0.0, 0.0,
    0.0, near/perspectTop, 0.0, 0.0,
    0.0, 0.0, -(far+near)/(far-near), -1.0,
    0.0, 0.0, -(2*far*near)/(far-near), 0.0);

  console.log("PerspectProjection: ");
  console.log(PerspectProjectionMat);
}

function getFaceNormals(vertices, indexList) {
  var faceNormals = new Array(indexList.length/3);

  for(var i = 0; i <= indexList.length - 3; i += 3) {
    faceNormals[i/3] =
      normalize(cross(
        subtract(vertices[indexList[i+1]], vertices[indexList[i]]),
        subtract(vertices[indexList[i+2]], vertices[indexList[i]]))
      );
  }

  return faceNormals;
}

function getVertexNormals(vertices, faceNormals, indexList) {
  var vertexNormals = new Array(vertices.length);

  for(var i = 0; i < vertices.length; ++i) {
    vertexNormals[i] = vec3(0,0,0);
  }

  for(var i = 0; i < faceNormals.length; ++i) {
    var p0 = indexList[3*i],
      p1 = indexList[3*i+1],
      p2 = indexList[3*i+2];

    vertexNormals[p0] = add(vertexNormals[p0], faceNormals[i]);
    vertexNormals[p2] = add(vertexNormals[p1], faceNormals[i]);
    vertexNormals[p2] = add(vertexNormals[p2], faceNormals[i]);
  }

  return vertexNormals.map(function(v) { return normalize(v); });
}

function togglePoint() {
  pointOn = !pointOn;
}

function toggleSpotlight() {
  spotlightOn = !spotlightOn;
}

function toggleSpecular() {
  specularOn = !specularOn;
}

function setToOrtho() {
  ProjectionMat = OrthoProjectionMat;
}

function setToPerspect() {
  ProjectionMat = PerspectProjectionMat;
}

function drawObject() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.drawElements( gl.TRIANGLES, 3 * numTriangles, gl.UNSIGNED_SHORT, 0 );
    sendLigthing();
    sendViewingMatrices();
    requestAnimFrame(drawObject);
}
