

const canvas = document.createElement('canvas');
canvas.height = canvas.width = 800;

document.body.append(canvas);

const ctx = canvas.getContext('2d');

const camera = { x: 0, y: 0, z: 0 };

const cube = (position) => {
  return {
    coordinates: [
      {x: -1, y: 1, z: 1 },
      {x: 1, y: 1 , z: 1},
      {x: 1, y: -1 , z: 1},
      {x: -1, y: -1 , z: 1},
    
      {x: -1, y: 1,   z: -1 },
      {x: 1, y: 1 ,   z: -1 },
      {x: 1, y: -1 ,  z: -1 },
      {x: -1, y: -1 , z: -1 },
    ],
    lines: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 0 },
     
      { a: 4, b: 5 },
      { a: 5, b: 6 },
      { a: 6, b: 7 },
      { a: 7, b: 4 },
    
      { a: 0, b: 4 },
      { a: 1, b: 5 },
      { a: 2, b: 6 },
      { a: 3, b: 7 },
    ],
    faces: [
      { a: 0, b: 1, c: 2, d: 3 }, //  front
      { a: 0, b: 4, c: 7, d: 3 }, // left
      { a: 1, b: 5, c: 6, d: 2 }, // right
      { a: 4, b: 7, c: 6, d: 5 },  // back
      { a: 0, b: 1, c: 5, d: 4 },  //  top
      { a: 3, b: 7, c: 6, d: 2 },  // bottom
    ],
    position
  }
}

function rotateX(p, t) {
  return {
    x: p.x,
    y: p.y*Math.cos(t) - p.z*Math.sin(t),
    z: p.y*Math.sin(t) + p.z*Math.cos(t)
  }
}

function rotateZ(p, t) {
  return {
    x: p.x*Math.cos(t) - p.y*Math.sin(t),
    y: p.x*Math.sin(t) + p.y*Math.cos(t),
    z: p.z
  }
}

function min(p, q) {
  return { x: p.x - q.x, y: p.y - q.y, z: p.z - q.z }
}

function cross(a, b) {
  return {
    x: a.y*b.z - a.z*b.y,
    y: a.z*b.x - a.x*b.z,
    z: a.x*b.y - a.y*b.x
  }
}

function mag(a) {
  return Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z);
}

function div(a, d) {
  return { x: a.x/d, y: a.y/d, z: a.z/d }
}

function norm(a,b,c) {
  const bMinA = min(b,a);
  const cMinA = min(c,a);

  const cp = cross(bMinA, cMinA);

  return div(cp, mag(cp));
}

function translate(p, q) {
  return {
    x: p.x + q.x, y: p.y + q.y, z: p.z + q.z
  }
}

function eps(p) {
  const eps = Math.exp(-15);
  return {
    x: p.x > eps ? p.x : 0,
    y: p.y > eps ? p.y : 0,
    z: p.z > eps ? p.z : 0,
  }
}

function drawLine(a, b) {
  ctx.beginPath();       // Start a new path
  ctx.moveTo(a.x, a.y);    // Move the pen to (30, 50)
  ctx.lineTo(b.x, b.y);  // Draw a line to (150, 100)
  ctx.stroke();
}

function project(p) {
  return  { x: p.x/(p.z || 1), y: p.y/(p.z  || 1) };
}

function mapToScreen(p) {
  return { x: (p.x + 1)/2 * canvas.width, y: (p.y + 1)/2 * canvas.height };
}

const startTime = new Date().getTime();

const c1 = cube({ x: 0, y: 0, z: 4 });
const c2 = cube({ x: 4, y: 0, z: 8 });
const c3 = cube({ x: 0, y: 4, z: 8 });

const cubes = [c1, c2, c3];

setInterval(() => {
  const currentTime = (new Date().getTime() - startTime)/1000 % (Math.PI*2);

  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,800, 800);

  cubes.forEach(cube => {
    const transformed = cube.coordinates
      // .map(c => rotateZ(c, currentTime))
      .map(c => rotateX(c, currentTime));

    const faceNormals = cube.faces.map(face => {
      const a = transformed[face.a];
      const b = transformed[face.b];
      const c = transformed[face.c];

     return norm(a, b, c);
    });

    const mapped = transformed.map(point => {
      const translated = translate(point, cube.position);
      const projected = project(translated);
      const mappedToScreen = mapToScreen(projected);

      return mappedToScreen;
    });   

    cube.lines.forEach(l => drawLine(mapped[l.a], mapped[l.b]));
    // cube.faces.forEach((face, i) => {
    //   const region = new Path2D();

    //   region.moveTo(mapped[face.a].x, mapped[face.a].y);
    //   region.lineTo(mapped[face.b].x, mapped[face.b].y);
    //   region.lineTo(mapped[face.c].x, mapped[face.c].y);
    //   region.lineTo(mapped[face.d].x, mapped[face.d].y);
    //   region.closePath();

    //   let color = faceNormals[i].z * 255;
    //   color = color > 0 ? color : 0;

    //   ctx.fillStyle = `rgb(${color},${color},${color})`;
    //   ctx.fill(region, "nonzero");
    // });

    const imageData = ctx.getImageData(0,0,800,800);

    ctx.putImageData(imageData, 0, 0);
  });
  
}, 50);


