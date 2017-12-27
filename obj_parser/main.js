var fs = require("fs");
var readline = require("readline");

var args = process.argv.slice(2);
var filename = args[0];
var lineRader = null;
var name = null;
var vertexOffset = 0;
var originPoint;
var vertices = [];
var normals = [];
var textureCoords = [];
var faces = [];

var model = {};

Array.prototype.pushArray = function(arr){
  this.push.apply(this, arr);
}

if(!filename)
{
  console.error("No input file provided!");
  return;
}

lineReader = readline.createInterface({
  input: fs.createReadStream(filename),
  crlfDelay: Infinity
});

lineReader.on('line', (line) =>{
  parseLine(line);
});

lineReader.on('close', () =>{
  model[name] = expandFaces(faces);
  process.stdout.write(JSON.stringify(model));
});


function parseLine(line){
  if(line[0] == '#')
    return;
  let lineArr = line.split(' ');
  let data = lineArr.slice(1);
  switch(lineArr[0]){
    case 'v':
      vertices.push(data.map(Number));
      break;
    case 'vn':
      normals.push(data.map(Number));
      break;
    case 'vt':
      textureCoords.push(data.map(Number));
      break;
    case 'f':
      faces.pushArray(data);
      break;
    case 'org':
      originPoint = data;
      break;
    case 'o':
      if(!name){
        data = String(data);
        name = data.replace(/[\., ]/g, '_');
      }
      model[name] = expandFaces(faces);
      vertexOffset += vertices.length / 3;
      faces = [];
      data = String(data);
      name = data.replace(/[\., ]/g, '_');

      break;
  };
}

function expandFaces(faces){
  var model = {
    vertices: [],
    normals: [],
    textureCoords: [],
    indices: []
  };
  for(var face of faces){
    let vertexInfo =  face.split('/');
    model.vertices.pushArray(vertices[vertexInfo[0] - 1]);
    model.indices.push((model.vertices.length -3)/3);
    model.textureCoords.pushArray(textureCoords[vertexInfo[1] - 1]);
    model.normals.pushArray(normals[vertexInfo[2] - 1]);
  }
  model.origin = originPoint;
  return model;
}
