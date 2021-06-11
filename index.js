//  @ts-check
import { fillRoundedRect, calcCoordinates } from "./lib.js";
import * as Game from "./gol.js";

/** @type HTMLCanvasElement */
const c = document.getElementById("canv");
const ctx = c.getContext("2d");

/**
 * TODO: Increase density on retina displays so it doesn't look blurry
 * TODO: Maybe this can be optimized by only repainting updated cells
 * @param {import("./gol.js").World} world
 */
function paint(world) {
  ctx.clearRect(0, 0, c.width, c.height);

  const gap = 2;
  const s = 8;
  const rows = world.height;
  const cols = world.width;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const [posX, posY] = calcCoordinates(x, y, s, gap);
      const fill = Game.isAlive(world.living, x, y)
        ? "#51c4d3"
        : "rgb(0, 0, 0, 0.05)";

      fillRoundedRect(ctx, posX, posY, s, s, 4, fill);
    }
  }
}

// Game setup
let world = Game.create(64, 64);
const pattern = Game.parsePattern(`
........................O
......................O.O
............OO......OO............OO
...........O...O....OO............OO
OO........O.....O...OO
OO........O...O.OO....O.O
..........O.....O.......O
...........O...O
............OO
`);

Game.applyPattern(world, pattern, 8, 8);

// Main loop
paint(world);
window.setInterval(() => {
  world = Game.tick(world);
  paint(world);
}, 100);
