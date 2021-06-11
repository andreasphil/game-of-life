// @ts-check

/**
 * @typedef World
 * @property {number} width
 * @property {number} height
 * @property {Record<number, Set<number>>} living
 */

/**
 * TODO: Memoize this?
 * TODO: Instead of ignoring outside cells, maybe fold or add a tolerance?
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {number[][]}
 */
export function getNeighbors(x, y, width, height) {
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
 * @param {World["living"]} living
 * @param {number} x
 * @param {number} y
 */
export function isAlive(living, x, y) {
  return !!living[x]?.has(y);
}

/**
 * TODO: Try other rulesets?
 * @param {World} world
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function willLive({ width, height, living }, x, y) {
  const { length } = getNeighbors(x, y, width, height).filter(([x, y]) =>
    isAlive(living, x, y)
  );

  const alive = isAlive(living, x, y);

  // From Wikipedia:
  //
  // 1. Any live cell with two or three live neighbours survives.
  // 2. Any dead cell with three live neighbours becomes a live cell.
  // 3. All other live cells die in the next generation. Similarly, all other
  //    dead cells stay dead.
  //
  // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

  return (alive && (length === 2 || length === 3)) || (!alive && length === 3);
}

/**
 * This mutates the world.
 * @param {World} world
 * @param {number} x
 * @param {number} y
 * @param {boolean} alive
 */
export function setAlive(world, x, y, alive) {
  if (x < 0 || x >= world.width) {
    throw new Error(`x=${x} is out of bounds for width ${world.width}`);
  }

  if (y < 0 || y >= world.height) {
    throw new Error(`y=${y} is out of bounds for height ${world.height}`);
  }

  if (!alive && isAlive(world.living, x, y)) {
    world.living[x].delete(y);
    if (world.living[x].size === 0) {
      // TODO: Not sure if it wouldn't be more efficient to keep the empty set
      // instead of creating it again if a cell with the same x becomes alive
      delete world.living[x];
    }
  } else if (alive) {
    if (!world.living[x]) {
      world.living[x] = new Set();
    }
    world.living[x].add(y);
  }
}

/**
 * @param {string} patternString
 * @returns {Array<[number, number]>}
 */
export function parsePattern(patternString) {
  const rows = patternString.split("\n").filter((row) => row.trim().length > 0);

  /** @type Array<[number, number]> */
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

/**
 * This mutates the world.
 * @param {World} world
 * @param {Array<[number, number]>} pattern
 * @param {number} offsetX
 * @param {number} offsetY
 */
export function applyPattern(world, pattern, offsetX = 0, offsetY = 0) {
  if (offsetX > 0 || offsetY > 0) {
    pattern = pattern.map(([x, y]) => [x + offsetX, y + offsetY]);
  }

  pattern.forEach(([x, y]) => {
    setAlive(world, x, y, true);
  });
}

/**
 * This mutates the world.
 * @param {World} world
 * @returns {World}
 */
export function tick(world) {
  const next = create(world.width, world.height);

  for (let x = 0; x < world.width; x++) {
    for (let y = 0; y < world.height; y++) {
      setAlive(next, x, y, willLive(world, x, y));
    }
  }

  return next;
}

/**
 * @param {number} width
 * @param {number} height
 */
export function create(width, height) {
  /** @type {Record<number, Set<number>>} */
  const living = {};

  return {
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    living,
  };
}
