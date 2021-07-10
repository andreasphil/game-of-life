//  @ts-check
import { Game, parsePattern } from "./lib/game.js";
import { Renderer } from "./lib/renderer.js";

// Renderer setup
// TODO: Adjust on window resize
const renderer = new Renderer("host", {});
const { rows: height, cols: width } = renderer.visibleDimensions;

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
renderer.next(game.living);

// Main loop
(function go() {
  renderer.next(game.tick());
  requestAnimationFrame(go);
})();
