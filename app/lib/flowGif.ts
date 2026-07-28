import { GIFEncoder, quantize, applyPalette, GIFEncoderInstance } from 'gifenc';
import { actorsFromSteps } from './actors';
import { drawActorIcon } from './canvasIcons';
import type { TechRefStep } from '../types';

const WIDTH = 560;
const HEIGHT = 300;
const TRAVEL_FRAMES = 8;
const TRAVEL_DELAY = 45;
const HOLD_DELAY = 1500;

const COLORS = {
  bg: '#12161d',
  surface: '#1b212b',
  surfaceRaised: '#232a35',
  line: '#2e3644',
  amber: '#e8a33d',
  amberFaint: 'rgba(232,163,61,0.14)',
  rose: '#c96a5e',
  roseFaint: 'rgba(201,106,94,0.14)',
  text: '#e7e4dd',
  textMuted: '#8890a0',
  textFaint: '#5c6472',
};

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  actors: string[],
  step: TechRefStep,
  packetProgress: number,
  stepIndex: number,
  totalSteps: number
) {
  const n = actors.length;
  const isError = step.status === 'error';
  const accent = isError ? COLORS.rose : COLORS.amber;
  const accentFaint = isError ? COLORS.roseFaint : COLORS.amberFaint;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const actorsTop = 14;
  const actorH = 46;
  const colW = WIDTH / Math.max(n, 1);
  const fromIdx = step.from ? actors.indexOf(step.from) : -1;
  const toIdx = step.to ? actors.indexOf(step.to) : -1;
  const isSelfLoop = !!step.from && !!step.to && step.from === step.to;

  actors.forEach((a, i) => {
    const cx = colW * (i + 0.5);
    const active = i === fromIdx || i === toIdx;
    const boxW = Math.min(colW - 10, 140);
    const boxX = cx - boxW / 2;
    ctx.fillStyle = active ? accentFaint : COLORS.surface;
    ctx.strokeStyle = active ? accent : COLORS.line;
    ctx.lineWidth = 1;
    roundRectPath(ctx, boxX, actorsTop, boxW, actorH, 8);
    ctx.fill();
    ctx.stroke();
    drawActorIcon(ctx, a, cx, actorsTop + 15, 16, active ? accent : COLORS.textMuted);
    ctx.fillStyle = active ? accent : COLORS.textMuted;
    ctx.font = '600 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(truncate(a, 16), cx, actorsTop + 40);
  });

  const trackTop = actorsTop + actorH + 20;
  const trackH = 40;
  const midY = trackTop + trackH / 2;

  actors.forEach((a, i) => {
    const cx = colW * (i + 0.5);
    ctx.strokeStyle = COLORS.line;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, trackTop);
    ctx.lineTo(cx, trackTop + trackH);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const fromPct = fromIdx >= 0 ? (fromIdx + 0.5) / n : 0.5;
  const toPct = toIdx >= 0 ? (toIdx + 0.5) / n : 0.5;
  const fromX = fromPct * WIDTH;
  const toX = toPct * WIDTH;

  if (isSelfLoop) {
    ctx.fillStyle = accent;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↻', fromX, midY + 6);
  } else if (fromIdx >= 0 && toIdx >= 0) {
    ctx.strokeStyle = isError ? accent : COLORS.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.min(fromX, toX), midY);
    ctx.lineTo(Math.max(fromX, toX), midY);
    ctx.stroke();

    const packetX = fromX + (toX - fromX) * packetProgress;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(packetX, midY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    if (step.payload) {
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      const label = truncate(step.payload, 28);
      const padX = 6;
      const labelW = ctx.measureText(label).width + padX * 2;
      ctx.fillStyle = accent;
      roundRectPath(ctx, packetX - labelW / 2, midY + 10, labelW, 14, 3);
      ctx.fill();
      ctx.fillStyle = COLORS.bg;
      ctx.fillText(label, packetX, midY + 20);
    }
  }

  ctx.fillStyle = accent;
  ctx.font = '600 11px monospace';
  ctx.textAlign = 'center';
  const titleLabel = step.latency ? `${truncate(step.title, 36)} · ${step.latency}` : truncate(step.title, 46);
  ctx.fillText(titleLabel, WIDTH / 2, trackTop - 6);

  const detailTop = trackTop + trackH + 14;
  const detailH = HEIGHT - detailTop - 14;
  ctx.fillStyle = COLORS.surfaceRaised;
  roundRectPath(ctx, 14, detailTop, WIDTH - 28, detailH, 8);
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`STEP ${stepIndex + 1} / ${totalSteps}${isError ? ' · ERROR' : ''}`, 24, detailTop + 18);

  ctx.fillStyle = COLORS.text;
  ctx.font = '12px sans-serif';
  wrapText(ctx, step.detail || '', 24, detailTop + 38, WIDTH - 48, 16, 3);
}

function writeCurrentFrame(gif: GIFEncoderInstance, ctx: CanvasRenderingContext2D, delay: number) {
  const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const palette = quantize(data, 128);
  const index = applyPalette(data, palette);
  gif.writeFrame(index, WIDTH, HEIGHT, { palette, delay, repeat: 0 });
}

// Renders the same sequence diagram ProcessFlow shows live, frame by frame, onto an
// offscreen canvas, and encodes it into a real animated GIF entirely in the browser —
// no server round-trip, no external service.
export async function generateFlowGif(steps: TechRefStep[]): Promise<Blob> {
  const actors = actorsFromSteps(steps);
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

  const gif = GIFEncoder();

  steps.forEach((step, i) => {
    const fromIdx = step.from ? actors.indexOf(step.from) : -1;
    const toIdx = step.to ? actors.indexOf(step.to) : -1;
    const isSelfLoop = !!step.from && !!step.to && step.from === step.to;
    const hasTravel = !isSelfLoop && fromIdx >= 0 && toIdx >= 0;

    if (hasTravel) {
      for (let f = 0; f < TRAVEL_FRAMES; f++) {
        const progress = f / (TRAVEL_FRAMES - 1);
        drawFrame(ctx, actors, step, progress, i, steps.length);
        writeCurrentFrame(gif, ctx, f === TRAVEL_FRAMES - 1 ? HOLD_DELAY : TRAVEL_DELAY);
      }
    } else {
      drawFrame(ctx, actors, step, 1, i, steps.length);
      writeCurrentFrame(gif, ctx, HOLD_DELAY);
    }
  });

  gif.finish();
  const bytes = gif.bytes();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: 'image/gif' });
}

export function slugifyForFilename(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'flow'
  );
}
