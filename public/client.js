let canvas;
const BLACK = '#2a2a2a';
const GOLD = '#ffb94e';
const CANVAS_W = 672 / 2;
const W = CANVAS_W / 3;
const CANVAS_H = 5 * W;
const W2 = W / 2;
const W4 = W / 4;
const W8 = W / 8;
const W16 = W / 16;
let population = [];
const fitnessColor = chroma.scale([BLACK, GOLD])
                           .mode('lab')
                           .correctLightness(true);
let previous = null;

function drawEyes(x, inner, outer, color) {  
  noFill();
  stroke(color)
  strokeWeight(2);
  ellipse(x, W4, outer, outer);
  ellipse(W - x, W4, outer, outer);
  
  fill(color);
  noStroke();
  ellipse(x, W4, inner, inner);
  ellipse(W - x, W4, inner, inner);
}

function drawNose(anchor, height, base, color) {
  noFill();
  stroke(color)
  strokeWeight(2);
  beginShape();
  
  vertex(anchor, W / 4);
  
  vertex(
    Math.min(W / 2, anchor + base),
    (W / 4) + height
  );
  
  vertex(
    Math.max(W / 2, W - (anchor + base)),
    (W / 4) + height
  );
  
  vertex(W - anchor, W / 4);
  
  endShape();
}

function drawMouth(width, height, color) {
  stroke(color);
  beginShape();
  vertex(W2 + (width / 2), (3 / 4) * W);
  bezierVertex(
    W2 + (width / 3), height + ((3 / 4) * W),
    W2 - (width / 3), height + ((3 / 4) * W),
    W2 - (width / 2), (3 / 4) * W,
  );
  endShape(CLOSE);
}

function drawMonster(x, y, genotype) {
  // margin -- eye -- margin -- eye -- margin
  // margin is WIDTH / 16
  
  resetMatrix();
  translate(x, y);
  
  const eyePosition =  map(
    genotype.eyeBalance,
    0,
    1,
    W16 + (genotype.outerEyeDiameter / 2),
    W2 - (genotype.outerEyeDiameter / 2),
  );
  
  const nosePosition = eyePosition + (genotype.outerEyeDiameter / 2);
  
  let best = { fitness: 1 };
  for (let i = 0; i < population.length; i += 1) {
    if (population[i].fitness > best.fitness) {
      best = population[i];
    }
  }
    
  const color = fitnessColor(genotype.fitness / 15).hex();
  //let color = BLACK;
  
  drawEyes(eyePosition, genotype.innerEyeDiameter, genotype.outerEyeDiameter, color);
  drawNose(nosePosition, genotype.noseHeight, genotype.noseWidth, color);
  drawMouth(genotype.mouthWidth, genotype.mouthHeight, color);
}

function randomMonster() {
  const randomEyeDiameter1 = random(W16, 6 * W16);
  const randomEyeDiameter2 = random(W16, 6 * W16);
  
  const outerEyeDiameter = Math.max(randomEyeDiameter1, randomEyeDiameter2);
  const innerEyeDiameter = Math.min(randomEyeDiameter1, randomEyeDiameter2);
  
  const eyeBalance = random();
  
  const noseHeight = random(0, W2 - W16);
  const noseWidth = random(0,  W2 - (2 * W16));
  
  const mouthWidth = random(W16, 14 * W16);
  const mouthHeight = random(W / 8, W / 4);
  
  return {
    outerEyeDiameter,
    innerEyeDiameter,
    eyeBalance,
    noseHeight,
    noseWidth,
    mouthWidth,
    mouthHeight,
    fitness: 0,
  };
}

function evolveMonster(mommy, daddy) {
  const monster = randomMonster();
  
  for (let gene of Object.keys(mommy)) {
    const parentBalance = random();
    
    if (parentBalance < 0.6) {
      monster[gene] = mommy[gene];
    } else if (parentBalance < 0.8) {
      monster[gene] = daddy[gene];
    }
  }

  monster.fitness = (mommy.fitness + daddy.fitness) / 2;
  
  return monster;
}

function setup() {
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  canvas.parent('sketch');
  noLoop();
  background('#fafafa');
  population.push(randomMonster());
  population.push(randomMonster());
}

function draw() {
  for (let i = 0; i < population.length; i += 1) {
    drawMonster((i % 3) * W, Math.floor(i / 3) * W, population[i]);
  }
}

function mousePressed() {
  const grid = W;
  const i = Math.floor(mouseX / grid); 
  const j = Math.floor(mouseY / grid);
  
  const mommy = population[i + (j * 3)];
  let daddy;
  
  if (mommy) {
    
    if (!previous) {
      daddy = population[population.length - 1];
    } else {
      daddy = previous;
    }    
    
    mommy.fitness += 1;
    population.push(evolveMonster(mommy, daddy));
    
    resetMatrix();
    clear();
    background('#fafafa');
    draw();
    
    previous = mommy;
  }
}

const exportBtn = document.getElementById('export');

exportBtn.addEventListener('click', function (event) {
  saveCanvas('barry', 'png');
});

const resetBtn = document.getElementById('reset');

resetBtn.addEventListener('click', function (event) {
  
  population = [];
  population.push(randomMonster());
  population.push(randomMonster());
  
  resetMatrix();
  clear();
  background('#fafafa');
  draw();
}); 