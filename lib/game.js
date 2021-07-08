// @ts-check

/** @typedef {Record<number, Set<number>>} SparseMatrix */
/** @typedef {[number, number]} Point */

/**
 * Given a cell, returns the coordinates of all cells surrounding the cell.
 * Cells and possible neighbors outside the boundaries specified by width and
 * height are ignored.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {Point[]}
 */
export function getNeighbors(x, y, width, height) {
  /** @type Point[] */
  const n = [];

  if (x < 0 || y < 0 || x >= width || y >= height) {
    // Ignore cells outside the boundary.
    return n;
  }

  if (y - 1 >= 0) {
    n.push([x, y - 1]); // North
  }
  if (x + 1 < width && y - 1 >= 0) {
    n.push([x + 1, y - 1]); // North east
  }
  if (x + 1 < width) {
    n.push([x + 1, y]); // East
  }
  if (x + 1 < width && y + 1 < height) {
    n.push([x + 1, y + 1]); // South east
  }
  if (y + 1 < height) {
    n.push([x, y + 1]); // South
  }
  if (x - 1 >= 0 && y + 1 < height) {
    n.push([x - 1, y + 1]); // South west
  }
  if (x - 1 >= 0) {
    n.push([x - 1, y]); // West
  }
  if (x - 1 >= 0 && y - 1 >= 0) {
    n.push([x - 1, y - 1]); // North west
  }

  return n;
}

/**
 * @param {SparseMatrix} living
 * @param {number} x
 * @param {number} y
 */
export function isAlive(living, x, y) {
  return !!living[x]?.has(y);
}

/**
 * Determines if a cell is going to be alive or dead in the next iteration.
 * From Wikipedia (https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life):
 *
 * 1. Any live cell with two or three live neighbours survives.
 * 2. Any dead cell with three live neighbours becomes a live cell.
 * 3. All other live cells die in the next generation. Similarly, all other
 *    dead cells stay dead.
 *
 * @param {Game} game
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function willLive({ width, height, living }, x, y) {
  const { length } = getNeighbors(x, y, width, height).filter(([x, y]) =>
    isAlive(living, x, y)
  );

  if (isAlive(living, x, y)) {
    return length === 2 || length === 3;
  } else {
    return length === 3;
  }
}

/**
 * Changes the provided list of living cells such that the cell with the
 * specified coordinates is alive (true) or dead (false). Note that this
 * mutates the list.
 *
 * If a maximum for X or Y is provided, the function throws an error if
 * the x or y values exceed the maximum.
 *
 * @param {SparseMatrix} living
 * @param {number} x
 * @param {number} y
 * @param {Boolean} alive
 * @param {number} mx Optional maximum for X
 * @param {number} my Optional maximum for Y
 */
export function setAlive(living, x, y, alive, mx = Infinity, my = Infinity) {
  if (x < 0 || x >= mx) {
    throw new Error(`x=${x} is out of bounds for width ${mx}`);
  }

  if (y < 0 || y >= my) {
    throw new Error(`y=${y} is out of bounds for height ${my}`);
  }

  if (!alive && isAlive(living, x, y)) {
    living[x].delete(y);
  } else if (alive) {
    if (!living[x]) {
      living[x] = new Set();
    }
    living[x].add(y);
  }

  return living;
}

/**
 * Converts a pattern string into a list of living cells. The pattern can
 * consist of multiple lines with characters in them. The index of the line
 * will become the y coordinate of the cell, the index of the character in the
 * line the X coordinate. The cell will be alive if the character equals `O`,
 * and dead for every other character. Empty lines and trailing whitespace is
 * ignored.
 *
 * @param {string} patternString
 * @returns {Point[]}
 */
export function parsePattern(patternString) {
  const rows = patternString.split("\n").filter((row) => row.trim().length > 0);

  /** @type Point[] */
  const alive = [];

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "O") {
        alive.push([x, y]);
      }
    }
  }

  return alive;
}

export class Game {
  /** @type {number} */
  #width;

  /** @type {number} */
  #height;

  /** @type {SparseMatrix} */
  #living;

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get living() {
    return this.#living;
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.#width = width;
    this.#height = height;

    this.clear();
  }

  /**
   * Lets all cells in the `pattern` list become alive. Note that cells already
   * living stay alive. Use `clear()` first if you want *only* the cells listed
   * in the pattern to be alive.
   *
   * @param {Point[]} pattern
   * @param {number} offsetX
   * @param {number} offsetY
   * @returns Living cells
   */
  applyPattern(pattern, offsetX = 0, offsetY = 0) {
    if (offsetX > 0 || offsetY > 0) {
      pattern = pattern.map(([x, y]) => [x + offsetX, y + offsetY]);
    }

    pattern.forEach(([x, y]) => {
      setAlive(this.living, x, y, true, this.width, this.height);
    });

    return this.living;
  }

  /**
   * Kills all cells.
   *
   * @returns Living cells
   */
  clear() {
    this.#living = {};
    return this.living;
  }

  /**
   * Calculates the next iteration of the game.
   *
   * @returns Living cells
   */
  tick() {
    /** @type {SparseMatrix} */
    const next = {};

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        setAlive(next, x, y, willLive(this, x, y), this.width, this.height);
      }
    }

    this.#living = next;

    return this.living;
  }
}
