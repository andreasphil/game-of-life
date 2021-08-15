//  @ts-check
import * as Matrix from "./matrix.js";

/** @typedef {[number, number]} Point */

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
 * @param {number[]} values
 * @returns {number[]}
 */
export function scaleAll(values, factor = window.devicePixelRatio) {
  return values.map((value) => scale(value, factor));
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
 * @returns {Point}
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
  ctx.closePath();
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

export class Renderer {
  /** @type {HTMLCanvasElement} */
  #canvas;

  /** @type {CanvasRenderingContext2D} */
  #ctx;

  /** @type {number} */
  #cellSize;

  /** @type {number} */
  cellGap;

  /** @type {number} */
  #cellRadius;

  /** @type {number} */
  #scaledCellSize;

  /** @type {number} */
  #scaledCellRadius;

  /** @type {import("./matrix.js").SparseMatrix} */
  #state = {};

  #disabledColor = "rgb(0, 0, 0, 0.02)";

  #enabledColors = [
    "#3c096c",
    "#7b2cbf",
    "#c77dff",
  ];

  get cellSize() {
    return this.#cellSize;
  }

  set cellSize(value) {
    this.#cellSize = value;
    this.#scaledCellSize = scale(value);
  }

  get cellRadius() {
    return this.#cellRadius;
  }

  set cellRadius(value) {
    this.#cellRadius = value;
    this.#scaledCellRadius = scale(value);
  }

  /**
   * Returns the total size of a cell, consisting of its size and the gap.
   */
  get cellOffsetSize() {
    return this.#cellSize + this.cellGap;
  }

  /**
   * Returns the maximum number of rows and columns that can be displayed in
   * the grid, based on the size of the grid and the cell size.
   */
  get visibleDimensions() {
    const cell = this.cellOffsetSize;

    return {
      rows: Math.floor(Number.parseInt(this.#canvas.style.height) / cell),
      cols: Math.floor(Number.parseInt(this.#canvas.style.width) / cell),
    };
  }

  /**
   * @param {HTMLElement | string} host
   * @param {object} options
   * @param {number} [options.cellSize]
   * @param {number} [options.cellGap]
   * @param {number} [options.cellRadius]
   */
  constructor(host, options = {}) {
    const { canvas, ctx } = createCanvas(host);
    this.#canvas = canvas;
    this.#ctx = ctx;

    const effectiveOptions = {
      cellSize: 8,
      cellGap: 2,
      cellRadius: 2,
      ...options,
    };

    this.cellSize = effectiveOptions.cellSize;
    this.cellGap = effectiveOptions.cellGap;
    this.cellRadius = effectiveOptions.cellRadius;

    this.fullRepaint();
  }

  /**
   * Calculates the pixel coordinates for a block with the specified sieze and
   * gap in a specified row and column.
   *
   * @param {number} col
   * @param {number} row
   * @returns {Point}
   */
  calcCoordinates(col, row) {
    return calcCoordinates(col, row, this.#cellSize, this.cellGap);
  }

  /**
   * Returns a fill color for a cell with the specified state.
   *
   * @param {boolean} active
   */
  getFill(active) {
    return active
      ? this.#enabledColors[
          Math.floor(Math.random() * this.#enabledColors.length)
        ]
      : this.#disabledColor;
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {boolean} active
   * @param {boolean} clear
   */
  paintCell(x, y, active, clear = true) {
    const [posX, posY] = scaleAll([...this.calcCoordinates(x, y)]);
    const fill = this.getFill(active);

    if (clear) {
      this.#ctx.clearRect(
        posX,
        posY,
        this.#scaledCellSize,
        this.#scaledCellSize
      );
    }

    fillRoundedRect(
      this.#ctx,
      posX,
      posY,
      this.#scaledCellSize,
      this.#scaledCellSize,
      this.#scaledCellRadius,
      fill
    );
  }

  /**
   * Repaints the entire canvas, irrespective of the current state.
   *
   * @param {import("./matrix.js").SparseMatrix} newState
   */
  fullRepaint(newState = this.#state) {
    const { rows, cols } = this.visibleDimensions;
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.paintCell(x, y, Matrix.has(newState, x, y), false);
      }
    }
  }

  /**
   * Repaints the canvas.
   *
   * @param {import("./matrix.js").SparseMatrix} newState
   */
  next(newState) {
    const { rows, cols } = this.visibleDimensions;

    // Iterate over the old state and repaint all cells as disabled if they're
    // not in the new state.
    Matrix.forEach(this.#state, (x, y) => {
      if (x <= cols && y <= rows && !Matrix.has(newState, x, y)) {
        this.paintCell(x, y, false);
      }
    });

    // Iterate over the new state and repaint all cells as enabeled if they're
    // not in the old state.
    Matrix.forEach(newState, (x, y) => {
      if (x <= cols && y <= rows && !Matrix.has(this.#state, x, y)) {
        this.paintCell(x, y, true);
      }
    });

    this.#state = newState;
  }
}
