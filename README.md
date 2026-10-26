# Tower Siege

A physics-based slingshot game that runs in the browser. Pull back the polygon, let go, and knock the blocks off two towers. Every block you knock out is worth 10 points.

**Play it:** https://atreyaroy.github.io/Tower-Seige-3/

## How to play

- **Drag** the polygon away from the sling and **release** to launch it.
- After each shot the polygon returns to the sling by itself, once it stops, leaves the screen, or after 6 seconds. **Space** brings it back straight away.
- A block counts as knocked out once it is hit hard enough (speed ≥ 3), then fades away.

## How it works

- **Physics:** [Matter.js](https://brm.io/matter-js/) simulates gravity, collisions, friction and restitution for every block.
- **Slingshot:** a Matter.js `Constraint` (a spring) holds the polygon to the sling point. While you drag, the polygon is frozen at the mouse, up to a maximum pull of 110px. On release it is launched in the opposite direction, at a speed proportional to how far it was pulled back.
- **Rendering:** [p5.js](https://p5js.org/) draws each body every frame from its physics position and angle.
- **Day/night background:** at start-up the game asks the World Time API for the current hour in India and picks a light or dark background. If the API can't be reached, it falls back to the computer's own clock.

## Code structure

| File | What it does |
|------|--------------|
| `sketch.js` | Sets up the world, builds both towers, runs the game loop and handles input |
| `js/Block.js` | A block: its physics body, knock-out detection, fade-out and scoring |
| `js/SlingShot.js` | The spring constraint that holds and launches the polygon |
| `js/Stand.js`, `js/Ground.js` | Static platforms |

## Run it locally

Browsers block image loading from `file://`, so serve the folder:

```
python -m http.server
```

then open http://localhost:8000.

## History

I first built this in 2020 while learning to code in school. In 2026 I came back to it with help from Claude, an AI assistant, and:

- fixed the file layout so the game actually loads,
- fixed scoring, which added points every frame instead of once per block,
- replaced 25 hand-written block variables with a `buildPyramid()` function,
- made the day/night background work over HTTPS, with an offline fallback,
- stopped the polygon from being dragged after it has been launched,
- made the game scale to fit any window and fixed the background not covering the canvas,
- fixed the polygon wobbling while being dragged, by holding it still and calculating the launch from the pull distance,
- made the polygon return to the sling automatically after each shot,
- removed debug output and libraries the game never used.
