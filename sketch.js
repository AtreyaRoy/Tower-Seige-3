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

// Slingshot settings
var dragging = false;
var MAX_PULL = 110;       // furthest the polygon can be pulled from the sling (px)
var LAUNCH_POWER = 0.2;   // launch speed per pixel of pull

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
  if (!(scaleFactor > 0)) scaleFactor = 1;   // e.g. a hidden tab reports a 0x0 window
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

  // While dragging, hold the polygon at the mouse (no build-up of speed, so no wobble)
  if (dragging) {
    holdPolygonAtMouse();
  }

  imageMode(CENTER);
  image(polygon_img, polygon.position.x, polygon.position.y, 40, 40);
  slingShot.display();
}

function mousePressed(){
  // Start a drag only if the polygon is on the sling and the click is on or near it
  var d = dist(gameMouseX(), gameMouseY(), polygon.position.x, polygon.position.y);
  if (slingShot.sling.bodyA && d < 60) {
    dragging = true;
    Matter.Body.setStatic(polygon, true);   // frozen while held, so physics can't nudge it
  }
}

// Place the polygon at the mouse, but no further than MAX_PULL from the sling point
function holdPolygonAtMouse(){
  var pull = createVector(gameMouseX() - SLING_POINT.x, gameMouseY() - SLING_POINT.y);
  pull.limit(MAX_PULL);
  Matter.Body.setPosition(polygon, {x: SLING_POINT.x + pull.x, y: SLING_POINT.y + pull.y});
  Matter.Body.setVelocity(polygon, {x: 0, y: 0});
  Matter.Body.setAngularVelocity(polygon, 0);
}

function mouseReleased(){
  if (!dragging) return;
  dragging = false;
  holdPolygonAtMouse();
  Matter.Body.setStatic(polygon, false);

  // Launch opposite to the pull: the further back, the faster it flies
  var vx = (SLING_POINT.x - polygon.position.x) * LAUNCH_POWER;
  var vy = (SLING_POINT.y - polygon.position.y) * LAUNCH_POWER;
  slingShot.fly();
  Matter.Body.setVelocity(polygon, {x: vx, y: vy});
}

function keyPressed(){
  if (keyCode === 32 && !dragging) {
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
