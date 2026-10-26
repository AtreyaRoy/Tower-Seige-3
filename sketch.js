const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world;
var ground, stand1, stand2;
var polygon, slingShot;
var polygon_img, backgroundImg;
var blocks = [];
var score = 0;

// Where the polygon rests on the sling
var SLING_POINT = {x: 100, y: 200};

// The game world is always 900 x 400; the canvas is scaled to fit the window
var GAME_W = 900, GAME_H = 400;
var scaleFactor = 1;

function preload(){
  polygon_img = loadImage("images/polygon.png");
}

function setup() {
  createCanvas(GAME_W, GAME_H);
  fitToWindow();
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);

  getBackgroundImage();

  ground = new Ground();
  stand1 = new Stand(390,300,250,10);
  stand2 = new Stand(700,200,200,10);

  // Tower 1: a pyramid of 7-5-3-1 blocks on the first stand
  buildPyramid(390, 275, [7, 5, 3, 1], ["skyblue", "pink", "turquoise", "grey"]);
  // Tower 2: a pyramid of 5-3-1 blocks on the second stand
  buildPyramid(700, 175, [5, 3, 1], ["skyblue", "turquoise", "pink"]);

  polygon = Bodies.circle(SLING_POINT.x, SLING_POINT.y, 20);
  World.add(world, polygon);
  slingShot = new Slingshot(polygon, SLING_POINT);
}

// Builds a pyramid centred on centreX; each row is one block-height (40px) above the last
function buildPyramid(centreX, baseY, rows, colours){
  for (var r = 0; r < rows.length; r++) {
    var count = rows[r];
    var startX = centreX - (count - 1) * 15;
    for (var i = 0; i < count; i++) {
      blocks.push(new Block(startX + i * 30, baseY - r * 40, 30, 40, colours[r]));
    }
  }
}

// Resize the canvas to the largest size that fits the window, keeping the 9:4 shape
function fitToWindow(){
  scaleFactor = min(windowWidth / GAME_W, windowHeight / GAME_H);
  resizeCanvas(floor(GAME_W * scaleFactor), floor(GAME_H * scaleFactor));
}

function windowResized(){
  fitToWindow();
}

// Mouse position in game coordinates
function gameMouseX(){ return mouseX / scaleFactor; }
function gameMouseY(){ return mouseY / scaleFactor; }

function draw() {
  // Clear the whole canvas every frame, then stretch the picture over it
  background(56,44,44);
  scale(scaleFactor);
  if (backgroundImg) {
    imageMode(CORNER);
    image(backgroundImg, 0, 0, GAME_W, GAME_H);
  }

  noStroke();
  textSize(20);
  fill("lightyellow");
  text("Drag the polygon to destroy the blocks",300,30);
  text("SCORE : " + score,750,40);
  textSize(12);
  text("Press Space to get a second chance to play!",620,350);

  ground.display();
  fill(200);
  stand1.display();
  stand2.display();

  strokeWeight(2);
  stroke(15);
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].display();
    score += blocks[i].score();
  }

  imageMode(CENTER);
  image(polygon_img, polygon.position.x, polygon.position.y, 40, 40);
  slingShot.display();
}

function mouseDragged(){
  // Only allow dragging while the polygon is still on the sling
  if (slingShot.sling.bodyA) {
    Matter.Body.setPosition(polygon, {x: gameMouseX(), y: gameMouseY()});
  }
}

function mouseReleased(){
  slingShot.fly();
}

function keyPressed(){
  if (keyCode === 32) {
    // Put the polygon back on the sling, at rest, for another shot
    Matter.Body.setPosition(polygon, SLING_POINT);
    Matter.Body.setVelocity(polygon, {x: 0, y: 0});
    Matter.Body.setAngularVelocity(polygon, 0);
    slingShot.attach(polygon);
  }
}

// Day/night background based on the current hour in India.
// Tries the World Time API first; if it fails, uses the computer's own clock.
async function getBackgroundImage(){
  var hour;
  try {
    var response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
    var responseJSON = await response.json();
    hour = parseInt(responseJSON.datetime.slice(11, 13));
  } catch (error) {
    hour = new Date().getHours();
  }

  var bg;
  if (hour >= 6 && hour < 18) {
    bg = "images/light.jpg";
  } else {
    bg = "images/dark.jpg";
  }
  backgroundImg = loadImage(bg);
}
