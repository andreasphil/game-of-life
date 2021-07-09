// @ts-check
/** @typedef {Record<number, Set<number>>} SparseMatrix */

/**
 * @param {SparseMatrix} matrix
 * @param {number} x
 * @param {number} y
 */
export function has(matrix, x, y) {
  return !!matrix[x]?.has(y);
}

/**
 * @param {SparseMatrix} matrix
 * @param {number} x
 * @param {number} y
 * @param {boolean} value
 */
export function set(matrix, x, y, value) {
  if (!value && has(matrix, x, y)) {
    matrix[x].delete(y);
  } else if (value) {
    if (!matrix[x]) {
      matrix[x] = new Set();
    }
    matrix[x].add(y);
  }
}

/**
 * @param {SparseMatrix} matrix
 * @param {(x: number, y: number) => void} fn
 */
export function forEach(matrix, fn) {
  for (let x of Object.keys(matrix)) {
    for (let y of matrix[x]) {
      fn(Number.parseInt(x), y);
    }
  }
}
