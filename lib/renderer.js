//  @ts-check
import { isAlive } from "./game.js";

const SIZE = 8;
const GAP = 2;

/**
 * Adjust the value to a different pixel density factor. The factor defaults
 * to the device pixel ratio.
 *
 * @param {number} value
 * @param {number} factor
 * @returns {number}
 */
export function scale(value, factor = window.devicePixelRatio) {
  return value * factor;
}

/**
 * `scale()`s all provided values. Returns an array with the values in the
 * same order as they were provided to the function.
 *
 * @param {...number} values
 * @returns {number[]}
 */
export function scaleAll(...values) {
  return values.map((value) => scale(value));
}

/**
 * Initializes an empty canvas inside the host element. The size is adapted
 * to the host element, but won't scale automatically if the size of the host
 * element changes.
 *
 * @param {HTMLElement | string} host Target element or ID
 */
export function createCanvas(host) {
  if (typeof host === "string") {
    host = document.getElementById(host);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  host.appendChild(canvas);

  canvas.style.display = "block";
  resizeCanvas(canvas);

  return { canvas, ctx };
}

/**
 * Updates the size of the canvas element to match the size of its host
 * element.
 *
 * @param {HTMLCanvasElement} canvas
 */
export function resizeCanvas(canvas) {
  const { clientHeight, clientWidth } = canvas.parentElement;
  canvas.style.height = `${clientHeight}px`;
  canvas.style.width = `${clientWidth}px`;

  canvas.height = scale(clientHeight);
  canvas.width = scale(clientWidth);
}

/**
 * Calculates the pixel coordinates for a block with the specified sieze and
 * gap in a specified row and column.
 *
 * @param {number} col
 * @param {number} row
 * @param {number} size
 * @param {number} gap
 * @returns {import("./game.js").Point}
 */
export function calcCoordinates(col, row, size, gap) {
  const box = size + gap;
  return [box * col + gap, box * row + gap];
}

/**
 * Uses the provided context to draw a rounded rectangle at the specified
 * coordinates.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 */
export function roundedRect(ctx, x, y, width, height, radius) {
  [x, y, width, height, radius] = scaleAll(x, y, width, height, radius);

  const tl = [x, y];
  const tr = [x + width, y];
  const br = [x + width, y + height];
  const bl = [x, y + height];

  ctx.beginPath();
  ctx.moveTo(tl[0] + radius, tl[1]);
  ctx.lineTo(tr[0] - radius, tr[1]);
  ctx.quadraticCurveTo(tr[0], tr[1], tr[0], tr[1] + radius);

  ctx.lineTo(br[0], br[1] - radius);
  ctx.quadraticCurveTo(br[0], br[1], br[0] - radius, br[1]);

  ctx.lineTo(bl[0] + radius, bl[1]);
  ctx.quadraticCurveTo(bl[0], bl[1], bl[0], bl[1] - radius);

  ctx.lineTo(tl[0], tl[1] + radius);
  ctx.quadraticCurveTo(tl[0], tl[1], tl[0] + radius, tl[1]);
}

/**
 * Same as `roundedRect`, but also fills the resulting rectangle.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @param {string | CanvasGradient | CanvasPattern} fill
 */
export function fillRoundedRect(ctx, x, y, width, height, radius, fill) {
  if (fill) {
    ctx.fillStyle = fill;
  }

  roundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
}

/**
 * Returns the maximum number of rows and columns that fit into the canvas for
 * the specified block size and gap between the blocks.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} size
 * @param {number} gap
 * @returns
 */
export function visibleDimensions(canvas, size = SIZE, gap = GAP) {
  return {
    rows: Math.floor(Number.parseInt(canvas.style.height) / (size + gap)),
    cols: Math.floor(Number.parseInt(canvas.style.width) / (size + gap)),
  };
}

/**
 * Repaints the canvas.
 *
 * TODO: Maybe this can be optimized by only repainting updated cells
 *
 * @param {import("./game.js").SparseMatrix} living
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 */
export function paint(living, canvas, ctx, size = SIZE, gap = GAP) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { rows, cols } = visibleDimensions(canvas, size, gap);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const [posX, posY] = calcCoordinates(x, y, size, gap);
      const fill = isAlive(living, x, y) ? "#51c4d3" : "rgb(0, 0, 0, 0.02)";

      fillRoundedRect(ctx, posX, posY, size, size, 2, fill);
    }
  }
}
