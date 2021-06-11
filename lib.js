//  @ts-check

/**
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
}

/**
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
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {number} gap
 */
export function calcCoordinates(x, y, size, gap) {
  const box = size + gap;
  return [box * x + gap, box * y + gap];
}
