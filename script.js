eruda.init({
  defaults: {
    theme: "Dark"
  }
});

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Bird {
  constructor() {
    this.x = 150;
    this.y = (Math.random() * canvas.height/2);
    this.size = 64;
    
    this.image = new Image();
    this.image.src = "./bird.png";

    this.velocity = -1;
    this.isJumping = false;
    this.tick = 1;

    this.dead = false;

    this.score = 0;

    this.neuralNetwork = new NeuralNetwork();
  }
  update() {
    if(this.dead) return;
    if(this.y - this.size/2 <= 0 || this.y + this.size/2 >= canvas.height) {
      this.reset();
    }
    if(this.isJumping) {
      this.tick = -10;
      this.isJumping = false;
    }
    this.y -= (this.velocity*9.81*this.tick)/10;
    this.draw();
    this.tick++;
    this.score+=.01;
  }
  draw() {
    ctx.drawImage(this.image, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
  }
  reset() {
    this.dead = true;
  }
  crossover(parent) {
    let child = new Bird();
    // change weights and biases
    for(let parameter = 0;parameter < this.neuralNetwork.network.length;parameter++) {
      let layer = child.neuralNetwork.network[parameter];
      // weights
      var rw = Math.random() * layer.weights.array.length * layer.weights.array[0].length;
      var windex = 0;
      for(let row = 0; row < layer.weights.array.length; row++) {
        for(let column = 0; column < layer.weights.array[0].length; column++) {
          // Mutation
          if(Math.random() * 100 <= mutationRate) {
            child.neuralNetwork.network[parameter].weights.array[row][column] = (Math.random()*20)-10;
            continue;
          }
          // Crossover
          if(rw > windex) {
            child.neuralNetwork.network[parameter].weights.array[row][column] = this.neuralNetwork.network[parameter].weights.array[row][column];
          }else {
            child.neuralNetwork.network[parameter].weights.array[row][column] = parent.neuralNetwork.network[parameter].weights.array[row][column];
          }
          windex++;
        }
      }
      // biases
      var rb = Math.random() * layer.biases.array.length * layer.biases.array[0].length;
      var bindex = 0;
      for(let row = 0; row < layer.biases.array.length; row++) {
        for(let column = 0; column < layer.biases.array[0].length; column++) {
          // Mutation
          if(Math.random() * 100 <= mutationRate) {
            child.neuralNetwork.network[parameter].biases.array[row][column] = (Math.random()*20)-10;
            continue;
          }
          // Crossover
          if(rb > bindex) {
            child.neuralNetwork.network[parameter].biases.array[row][column] = this.neuralNetwork.network[parameter].biases.array[row][column];
          }else {
            child.neuralNetwork.network[parameter].biases.array[row][column] = parent.neuralNetwork.network[parameter].biases.array[row][column];
          }
          bindex++;
        }
      }
    }
    return child;
  }
}

var currentPipe;
class Pipe {
  constructor(x) {
    this.spacing = 220;
    this.x = x;
    this.y = ((Math.random() * canvas.height*.6)+canvas.height*.2)+this.spacing/2;
    this.size = 128;
  }
  update() {
    this.x-=10;
    if(this.x <= -this.size) {
      this.x = canvas.width;
      this.y = ((Math.random() * canvas.height*.6)+canvas.height*.2)+this.spacing/2;
    }
    this.draw();
  }
  draw() {
    ctx.fillStyle = "limegreen";
    ctx.fillRect(this.x, this.y, this.size, canvas.height);
    ctx.fillRect(this.x, 0, this.size, this.y-this.spacing);
  }
  checkCollision(target) {
    if(
      target.x-target.size/2 < this.x + this.size &&
      target.x-target.size/2 + 64 > this.x &&
      target.y-target.size/2 < this.y-this.spacing &&
      64 + target.y-target.size/2 > 0
    ) {
      target.reset();
      return;
    }
    if(
      target.x-target.size/2 < this.x + this.size &&
      target.x-target.size/2 + 64 > this.x &&
      target.y-target.size/2 < this.y + canvas.height &&
      64 + target.y-target.size/2 > this.y
    ) {
      target.reset();
      return;
    }
  }
}

class NeuralNetwork {
  constructor() {
    this.network = [
      {
        weights: new WeightMatrix(3, 4),
        biases: new BiasVector(3)
      },
      {
        weights: new WeightMatrix(2, 3),
        biases: new BiasVector(2)
      },
      {
        weights: new WeightMatrix(1, 2),
        biases: new BiasVector(1)
      },
    ];
  }
  Output(topPipeDistance, bottomPipeDistance, nextPipeDistance, velocity) {
    let input = new InputVector([
      [topPipeDistance],
      [bottomPipeDistance],
      [nextPipeDistance],
      [velocity]
    ]);
    var total = input;
    for(let i = 0;i < this.network.length;i++) {
      var output = MMath.Sigmoid(
        MMath.Add(
          MMath.Multiply(
            this.network[i].weights,
            total
          ),
          this.network[i].biases
        )
      );
      total = output;
    }
    return (total.array[0][0] >= .5) ? 1 : 0;
  }
}
let birds = [];

let populationSize = 100;
let mutationRate = 1;

let obstacles = [
  new Pipe(((canvas.width/6)*5)+canvas.width),
  new Pipe((canvas.width/2)-64+canvas.width),
  new Pipe((canvas.width/6)-128+canvas.width)
];

let generation = 1;
let highScore = 0;

function Start() {
  for(let i = 0;i < populationSize;i++) {
    birds.push(new Bird());
  }
  Update();
}

function Update() {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let score = 0;

  let minDistance = Infinity;
  let closestPipe;
  for(let obstacle of obstacles) {
    obstacle.current = false;
    if(obstacle.x - 150 < minDistance && obstacle.x > 0) {
      minDistance = obstacle.x - 150;
      closestPipe = obstacle;
    }
    obstacle.update();
    for(let bird of birds) {
      obstacle.checkCollision(bird);
    }
  }
  closestPipe.current = true;

  let birdsDead = 0;
  for(let bird of birds) {
    if(bird.dead) {
      birdsDead++;
      continue;
    }
    // distance to top pipe
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(bird.x+70, bird.y);
    ctx.lineTo(bird.x+70, Math.max(closestPipe.y, 0));
    ctx.stroke();

    // distance to bottom pipe
    ctx.beginPath();
    ctx.moveTo(bird.x+50, bird.y);
    ctx.lineTo(bird.x+50, closestPipe.y-closestPipe.spacing);
    ctx.stroke();

    // horizontal distance to pipe
    ctx.strokeStyle = "dodgerblue";
    ctx.beginPath();
    ctx.moveTo(bird.x, closestPipe.y-closestPipe.spacing/2);
    ctx.lineTo(closestPipe.x, closestPipe.y-closestPipe.spacing/2);
    ctx.stroke();

    // velocity
    ctx.lineWidth = 6;
    ctx.strokeStyle = "limegreen";
    ctx.beginPath();
    ctx.moveTo(bird.x-50, bird.y);
    ctx.lineTo(bird.x-50, bird.y-(bird.tick*2));
    ctx.stroke();
      
    bird.update();
    if(bird.neuralNetwork.Output(
      getDistance(0, bird.y, 0, Math.min(closestPipe.y, canvas.height)), // Distance to bottom pipe
      getDistance(0, bird.y, 0, Math.max(closestPipe.y - closestPipe.spacing, 0)), // Distance to top pipe
      getDistance(bird.x, 0, closestPipe.x, 0), // vertical distance to pipe
      bird.velocity // velocity
    ) === 1) {
      bird.isJumping = true;
    }
    if(bird.score > highScore) {
      highScore = bird.score;
      document.querySelector(".top").innerHTML = "Top Score: "+Math.round(highScore*100)/100;
    }
    score = bird.score;
  }

  document.querySelector(".remaining").innerHTML = "Remaining Birds: "+(populationSize-birdsDead)+"/"+populationSize;
  document.querySelector(".score").innerHTML = "Score: "+Math.round(score*100)/100;
  
  if(birdsDead === populationSize) {
    // reset level
    obstacles = [
      new Pipe(((canvas.width/6)*5)+canvas.width),
      new Pipe((canvas.width/2)-64+canvas.width),
      new Pipe((canvas.width/6)-128+canvas.width)
    ];
    // Selection
    let newBirds = [];
    for(let i = 0;i < populationSize;i++) {
      let parentA = PickItem(birds);
      let parentB = PickItem(birds);
      // Crossover and Mutation
      let child = parentA.crossover(parentB);
      newBirds.push(child);
    }
    birds = newBirds;
    generation++;
    document.querySelector(".generation").innerHTML = "Generation: "+generation;
  }
}

function Activation(x) {
  return 1/(1+Math.exp(-x));
}

function PickItem(list) {
  let sum = 0;
  for(let item of list) {
    item.score = item.score ** 3;
    sum += item.score;
  }
  for(let item of list) {
    item.probability = (item.score / sum);
  }
  let index = 0;
  let r = Math.random();

  while(r > 0) {
    r -= list[index].probability;
    index++;
  }
  return list[index-1];
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(
    (x2-x1) ** 2 +
    (y2-y1) ** 2
  );
}

window.onload = function() {
  Start();
}
