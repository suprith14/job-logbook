import type { TechRefStep } from '../types';

// Actors in the order they first appear, so diagram column order matches how the
// flow was authored. Shared by the live ProcessFlow view and the GIF renderer so
// both draw the exact same layout.
export function actorsFromSteps(steps: TechRefStep[]): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  steps.forEach((s) => {
    [s.from, s.to].forEach((a) => {
      if (a && !seen.has(a)) {
        seen.add(a);
        order.push(a);
      }
    });
  });
  return order;
}
