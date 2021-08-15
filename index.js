//  @ts-check
import { Game, parsePattern } from "./lib/game.js";
import { Renderer } from "./lib/renderer.js";

// Renderer setup
// TODO: Adjust on window resize
const renderer = new Renderer("host", { cellRadius: 4, cellGap: 1 });
const { rows: height, cols: width } = renderer.visibleDimensions;

// Game setup
const game = new Game(width, height);
const pattern = parsePattern(`
.OO
OO
.O
`);

game.applyPattern(pattern, 60, 40);
renderer.next(game.living);

// Main loop
(function go() {
  renderer.next(game.tick());
  setTimeout(go, 75);
})();
