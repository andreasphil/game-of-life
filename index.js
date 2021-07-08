//  @ts-check
import { Game, parsePattern } from "./lib/game.js";
import { createCanvas, paint, visibleDimensions } from "./lib/renderer.js";

// Renderer setup
// TODO: Adjust on window resize
const { canvas, ctx } = createCanvas("host");
const { rows: height, cols: width } = visibleDimensions(canvas);

// Game setup
const game = new Game(width, height);
const pattern = parsePattern(`
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

game.applyPattern(pattern, 8, 8);
paint(game.living, canvas, ctx);

// Main loop
(function go() {
  paint(game.tick(), canvas, ctx);
  requestAnimationFrame(go);
})();
