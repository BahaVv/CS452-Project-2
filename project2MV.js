function makeRotationXMatrix(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);

  return [
    1, 0, 0, 0,
    0, cos, sin, 0,
    0, -sin, cos, 0,
    0, 0, 0, 1
  ];
}

function makeRotationYMatrix(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);

  return [
    cos, 0, -sin, 0,
    0, 1, 0, 0,
    sin, 0, cos, 0,
    0, 0, 0, 1
  ];
}

function makeRotationZMatrix(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);

  return [
    cos, sin, 0, 0,
    -sin, cos, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

/* A convoluded function that returns a list of vertex normals.
    Iterates through all the points and caclulates all the face normals around
    it then uses those face normals to create the vertex normal.*/
function generateNormals() {
  var vertNormals = [];
  for (var i = 0; i < vertices.length; i++) {
    var faceNormals = [];
    for (var j = 0; j < indexList.length; j+=3) {
      if (indexList[j] === i || indexList[j+1] === i || indexList[j+2] === i) {
        let fourTimesInd = 4*indexList[j];
        let p0 = vec3(flatVertices[fourTimesInd], flatVertices[fourTimesInd+1], flatVertices[fourTimesInd+2]);
        fourTimesInd = 4*indexList[j+1];
        let p1 = vec3(flatVertices[fourTimesInd], flatVertices[fourTimesInd+1], flatVertices[fourTimesInd+2]);
        fourTimesInd = 4*indexList[j+2];
        let p2 = vec3(flatVertices[fourTimesInd], flatVertices[fourTimesInd+1], flatVertices[fourTimesInd+2]);
        let v1= subtract(p1, p0);
        let v2 = subtract(p2, p0);
        faceNormals.push(cross(v1, v2));
      }
    }
    var vertNormal = vec3(0, 0, 0);
    for (j = 0; j < faceNormals.length; j++) {
      vertNormal = add(vertNormal, faceNormals[j]);
    }
    vertNormal = normalize(vertNormal);
    vertNormals.push(vertNormal);
  }

  return vertNormals;
}

/* Sets the matrices used for transformations. */
function calcMAndMinv() {

  // Unit vectors specifying the local coordinate system for the viewer.
  var n = normalize(subtract(e, a));
  var u = normalize(cross(vup, n));
  var v = normalize(cross(n, u));

  // The inverse rotation matrix.
  var camRotInv = mat4(u[0], u[1], u[2], 0,
    v[0], v[1], v[2], 0,
    n[0], n[1], n[2], 0,
    0, 0, 0, 1);

  // The inverse translation matrix.
  var camTransInv = mat4(1, 0, 0, -e[0],
    0, 1, 0, -e[1],
    0, 0, 1, -e[2],
    0, 0, 0, 1);

  M = flatten(mult(camRotInv, camTransInv));
  MinvTrans = [
    u[0], v[0], n[0], e[0],
    u[1], v[1], n[1], e[1],
    u[2], v[2], n[2], e[2],
    0, 0, 0, 1
  ];
}

/* Sets the projection matrices. */
function calcPorthAndPper() {
  Porth = [
    2/(orthRight-orthLeft), 0, 0, 0,
    0, 2/(orthTop-orthBottom), 0, 0,
    0, 0, -2/(far-near), 0,
    -(orthLeft+orthRight)/(orthLeft-orthRight), -(orthTop+orthBottom)/(orthTop-orthBottom), -(far+near)/(far-near), 1
  ];

  Pper = [
    near/perRight, 0, 0, 0,
    0, near/perTop, 0, 0,
    0, 0, -(far+near)/(far-near), -1,
    0, 0, -(2*far*near)/(far-near), 0
  ];
}
