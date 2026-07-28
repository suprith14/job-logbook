function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Draws a simplified line-icon for an actor name into a 24x24 local coordinate
// space, centered at (cx, cy) and scaled to `size` pixels. Mirrors ActorIcon.tsx's
// SVG set — same shapes, same keyword matching — but via Canvas 2D so it can be
// baked into exported GIF frames (SVG components can't render there).
export function drawActorIcon(ctx: CanvasRenderingContext2D, name: string, cx: number, cy: number, size: number, color: string) {
  const n = name.toLowerCase();
  const s = size / 24;

  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (n.includes('browser')) {
    roundRectPath(ctx, 3, 4, 18, 16, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 9);
    ctx.lineTo(21, 9);
    ctx.stroke();
    dot(ctx, 6, 6.5, 0.6);
    dot(ctx, 8.5, 6.5, 0.6);
  } else if (n.includes('database') || n === 'db' || n.includes(' db')) {
    ctx.beginPath();
    ctx.ellipse(12, 6, 8, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(4, 12);
    ctx.bezierCurveTo(4, 13.66, 7.58, 15, 12, 15);
    ctx.bezierCurveTo(16.42, 15, 20, 13.66, 20, 12);
    ctx.lineTo(20, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 12);
    ctx.lineTo(4, 18);
    ctx.bezierCurveTo(4, 19.66, 7.58, 21, 12, 21);
    ctx.bezierCurveTo(16.42, 21, 20, 19.66, 20, 18);
    ctx.lineTo(20, 12);
    ctx.stroke();
  } else if (n.includes('dns') || n.includes('network')) {
    ctx.beginPath();
    ctx.arc(12, 12, 8.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(12, 12, 3.6, 8.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3.5, 12);
    ctx.lineTo(20.5, 12);
    ctx.stroke();
  } else if (n.includes('developer') || n.includes('user') || n.includes('client') || n.includes('reviewer') || n === 'you') {
    ctx.beginPath();
    ctx.arc(12, 8, 3.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, 20);
    ctx.bezierCurveTo(5, 16, 8.2, 13.5, 12, 13.5);
    ctx.bezierCurveTo(15.8, 13.5, 19, 16, 19, 20);
    ctx.stroke();
  } else if (n.includes('pipeline') || n.includes('ci') || n.includes('build')) {
    ctx.beginPath();
    ctx.arc(12, 12, 3, 0, Math.PI * 2);
    ctx.stroke();
    const dirs: Array<[number, number]> = [
      [0, -1], [0, 1], [1, 0], [-1, 0],
      [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7], [-0.7, -0.7],
    ];
    dirs.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(12 + dx * 6.8, 12 + dy * 6.8);
      ctx.lineTo(12 + dx * 9.5, 12 + dy * 9.5);
      ctx.stroke();
    });
  } else if (n.includes('staging') || n.includes('test')) {
    ctx.beginPath();
    ctx.moveTo(9, 3);
    ctx.lineTo(15, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(10, 8.5);
    ctx.lineTo(4.5, 18);
    ctx.bezierCurveTo(3.7, 19.3, 4.6, 21, 6.2, 21);
    ctx.lineTo(17.8, 21);
    ctx.bezierCurveTo(19.4, 21, 20.3, 19.3, 19.5, 18);
    ctx.lineTo(14, 8.5);
    ctx.lineTo(14, 3);
    ctx.stroke();
  } else if (n.includes('cache') || n.includes('cdn') || n.includes('edge')) {
    ctx.beginPath();
    ctx.moveTo(13, 3);
    ctx.lineTo(4, 14);
    ctx.lineTo(10, 14);
    ctx.lineTo(9, 21);
    ctx.lineTo(18, 10);
    ctx.lineTo(12, 10);
    ctx.closePath();
    ctx.fill();
  } else if (n.includes('server') || n.includes('production') || n.includes('backend') || n.includes('api')) {
    for (let row = 0; row < 3; row++) {
      const y = 4 + row * 6;
      roundRectPath(ctx, 4, y, 16, 4.5, 1);
      ctx.stroke();
      dot(ctx, 7, y + 2.25, 0.6);
    }
  } else {
    ctx.save();
    ctx.translate(12, 12);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-5, -5, 10, 10);
    ctx.restore();
  }

  ctx.restore();
}
