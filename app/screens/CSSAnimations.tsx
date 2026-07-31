'use client';

import { useEffect, useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const CATEGORIES = ['Layout Fundamentals', 'Transitions & Keyframe Animations', 'Transforms & 3D', 'Modern & Advanced CSS'];

interface Option {
  label: string;
  value: string;
}

interface Control {
  key: string;
  label: string;
  options: Option[];
}

function opts(values: string[]): Option[] {
  return values.map((v) => ({ label: v, value: v }));
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const EASING_OPTIONS: Option[] = [
  { label: 'linear', value: 'linear' },
  { label: 'ease', value: 'ease' },
  { label: 'ease-in', value: 'ease-in' },
  { label: 'ease-out', value: 'ease-out' },
  { label: 'ease-in-out', value: 'ease-in-out' },
  { label: 'bounce (cubic-bezier overshoot)', value: 'cubic-bezier(0.68,-0.55,0.27,1.55)' },
];

// Every demo renders real markup styled by a <style> tag whose content is generated from
// the current dropdown selections (see buildCss on each concept below) — pick a new value
// and the browser genuinely re-renders it live, exactly like a real stylesheet change
// would. Class/keyframe names are prefixed per-demo so two expanded cards never collide.

interface DemoProps {
  css: string;
  values: Record<string, string>;
}

function BoxModelDemo({ css }: DemoProps) {
  return (
    <div className="demo-bm-wrap">
      <style>{css}</style>
      <div className="demo-bm-margin">
        <div className="demo-bm-border">
          <div className="demo-bm-padding">
            <div className="demo-bm-content">content</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlexDemo({ css }: DemoProps) {
  return (
    <div className="demo-flex-row">
      <style>{css}</style>
      <div className="demo-flex-item">1</div>
      <div className="demo-flex-item">2</div>
      <div className="demo-flex-item">3</div>
    </div>
  );
}

function GridDemo({ css }: DemoProps) {
  return (
    <div className="demo-grid">
      <style>{css}</style>
      {[1, 2, 3, 4, 5].map((n) => (
        <div className="demo-grid-item" key={n}>
          {n}
        </div>
      ))}
    </div>
  );
}

function StackDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-stack">
      <style>{css}</style>
      <div className="demo-stack-box demo-stack-a">z: {values.zA}</div>
      <div className="demo-stack-box demo-stack-b">z: {values.zB}</div>
      <div className="demo-stack-box demo-stack-c">z: {values.zC}</div>
    </div>
  );
}

function PositionDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-pos-scene">
      <style>{css}</style>
      <div className="demo-pos-port">
        <div className="demo-pos-content">
          <div className="demo-pos-filler">before</div>
          <div className="demo-pos-item">position: {values.position}</div>
          <div className="demo-pos-filler">after</div>
          <div className="demo-pos-filler">after</div>
          <div className="demo-pos-filler">after</div>
        </div>
      </div>
      <span className="pf-latency">scroll the box above</span>
    </div>
  );
}

function DisplayDemo({ css }: DemoProps) {
  return (
    <div className="demo-display-wrap">
      <style>{css}</style>
      <p className="demo-display-para">
        Text before <span className="demo-display-item">Item A</span> and after <span className="demo-display-item">Item B</span> more text continues here.
      </p>
    </div>
  );
}

function OverflowDemo({ css }: DemoProps) {
  return (
    <div className="demo-overflow-wrap">
      <style>{css}</style>
      <div className="demo-overflow-box">
        This box has more text in it than its fixed height can show, so the overflow behavior actually matters here.
      </div>
    </div>
  );
}

function PseudoElementDemo({ css }: DemoProps) {
  return (
    <div className="demo-pseudo-wrap">
      <style>{css}</style>
      <div className="demo-pseudo-badge">Task complete</div>
    </div>
  );
}

function AspectRatioDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-ratio-wrap">
      <style>{css}</style>
      <div className="demo-ratio-box">{values.ratio}</div>
    </div>
  );
}

function HoverTransitionDemo({ css }: DemoProps) {
  return (
    <div className="demo-hover-wrap">
      <style>{css}</style>
      <div className="demo-hover-box" />
      <span className="pf-latency">hover the box</span>
    </div>
  );
}

function KeyframeSpinDemo({ css }: DemoProps) {
  return (
    <div className="demo-spin-wrap">
      <style>{css}</style>
      <div className="demo-spin-box" />
    </div>
  );
}

function EasingRaceDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-easing-wrap">
      <style>{css}</style>
      <div className="demo-easing-track">
        <div className="demo-easing-dot demo-easing-linear" />
      </div>
      <span className="demo-easing-caption">{values.curveA}</span>
      <div className="demo-easing-track">
        <div className="demo-easing-dot demo-easing-ease" />
      </div>
      <span className="demo-easing-caption">{values.curveB}</span>
      <div className="demo-easing-track">
        <div className="demo-easing-dot demo-easing-bounce" />
      </div>
      <span className="demo-easing-caption">{values.curveC}</span>
    </div>
  );
}

function FadeInUpDemo({ css }: DemoProps) {
  return (
    <div className="demo-fade-wrap">
      <style>{css}</style>
      <div className="demo-fade-card">translate + opacity</div>
    </div>
  );
}

function FillModeDemo({ css }: DemoProps) {
  const [replay, setReplay] = useState(0);
  return (
    <div className="demo-fill-wrap">
      <style>{css}</style>
      <div key={replay} className="demo-fill-box" />
      <button className="ghost-btn" style={{ marginTop: 10 }} onClick={() => setReplay((r) => r + 1)}>
        ▶ Replay animation
      </button>
    </div>
  );
}

function PlayStateDemo({ css }: DemoProps) {
  return (
    <div className="demo-playstate-wrap">
      <style>{css}</style>
      <div className="demo-playstate-box" />
    </div>
  );
}

function StaggerDemo({ css }: DemoProps) {
  return (
    <div className="demo-stagger-wrap">
      <style>{css}</style>
      {[1, 2, 3, 4, 5].map((n) => (
        <div className="demo-stagger-dot" key={n} />
      ))}
    </div>
  );
}

function TransitionDelayDemo({ css }: DemoProps) {
  return (
    <div className="demo-delay-wrap">
      <style>{css}</style>
      <div className="demo-delay-box" />
      <span className="pf-latency">hover the box — notice the pause before it reacts</span>
    </div>
  );
}

function Transform2DDemo({ css }: DemoProps) {
  return (
    <div className="demo-2d-wrap">
      <style>{css}</style>
      <div className="demo-2d-box" />
    </div>
  );
}

function TransformOriginDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-origin-wrap">
      <style>{css}</style>
      <div className="demo-origin-item">
        <div className="demo-origin-box demo-origin-center" />
        <div className="demo-origin-label">origin: center</div>
      </div>
      <div className="demo-origin-item">
        <div className="demo-origin-box demo-origin-corner" />
        <div className="demo-origin-label">origin: {values.origin}</div>
      </div>
    </div>
  );
}

function FlipCardDemo({ css }: DemoProps) {
  return (
    <div className="demo-flip-wrap">
      <style>{css}</style>
      <div className="demo-flip-card">
        <div className="demo-flip-face demo-flip-front">Front</div>
        <div className="demo-flip-face demo-flip-back">Back</div>
      </div>
      <span className="pf-latency">hover the card</span>
    </div>
  );
}

function CombinedTransformDemo({ css }: DemoProps) {
  return (
    <div className="demo-combo-wrap">
      <style>{css}</style>
      <div className="demo-combo-box" />
    </div>
  );
}

function SkewDemo({ css }: DemoProps) {
  return (
    <div className="demo-skew-wrap">
      <style>{css}</style>
      <div className="demo-skew-box" />
    </div>
  );
}

function PerspectiveOriginDemo({ css }: DemoProps) {
  return (
    <div className="demo-porigin-scene">
      <style>{css}</style>
      <div className="demo-porigin-box" />
    </div>
  );
}

function VariablesDemo({ css }: DemoProps) {
  return (
    <div className="demo-vars-wrap">
      <style>{css}</style>
      <div className="demo-vars-box">background: var(--accent)</div>
    </div>
  );
}

function ClampDemo({ css }: DemoProps) {
  const [width, setWidth] = useState(320);
  return (
    <div className="demo-clamp-wrap">
      <style>{css}</style>
      <div className="demo-clamp-frame" style={{ width, maxWidth: '100%' }}>
        <p className="demo-clamp-text">Fluid heading text</p>
      </div>
      <input
        type="range"
        min={140}
        max={480}
        value={width}
        onChange={(e) => setWidth(Number(e.target.value))}
        style={{ width: '100%', marginTop: 10 }}
      />
      <span className="pf-latency">container width: {width}px</span>
    </div>
  );
}

function HasSelectorDemo({ css }: DemoProps) {
  return (
    <div className="demo-has-wrap">
      <style>{css}</style>
      <div className="demo-has-card">
        <input type="checkbox" id="demo-has-checkbox" />
        <label className="demo-has-label" htmlFor="demo-has-checkbox">
          Mark complete — card restyles via :has(), no JS
        </label>
      </div>
    </div>
  );
}

function ScrollTimelineDemo({ css }: DemoProps) {
  return (
    <div className="demo-scroll-wrap">
      <style>{css}</style>
      <div className="demo-scroll-port">
        <div className="demo-scroll-item">Scroll me ↕</div>
        <div className="demo-scroll-item">Item 2</div>
        <div className="demo-scroll-item">Item 3</div>
        <div className="demo-scroll-item">Item 4</div>
      </div>
    </div>
  );
}

const SUPPORTS_FEATURES = [
  { label: 'backdrop-filter: blur()', property: 'backdrop-filter', value: 'blur(10px)' },
  { label: 'aspect-ratio', property: 'aspect-ratio', value: '1 / 1' },
  { label: 'gap in flexbox', property: 'gap', value: '8px' },
  { label: 'container queries', property: 'container-type', value: 'inline-size' },
];

function SupportsDemo({ css, values }: DemoProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const feature = SUPPORTS_FEATURES[Number(values.feature)];

  useEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports) {
      setSupported(CSS.supports(feature.property, feature.value));
    }
  }, [feature.property, feature.value]);

  return (
    <div className="demo-supports-wrap">
      <style>{css}</style>
      <div className="demo-supports-box">{feature.label}</div>
      <span className="pf-latency">
        CSS.supports(&quot;{feature.property}: {feature.value}&quot;) →{' '}
        {supported === null ? 'checking…' : supported ? '✓ supported in your browser' : '✗ not supported — fallback CSS applies'}
      </span>
    </div>
  );
}

function IsWhereDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-isw-box">
      <style>{css}</style>
      <span className="item">
        :{values.variant}(.item) {values.variant === 'is' ? 'wins the tie — same specificity, later in source' : 'always loses — zero specificity, no matter what'}
      </span>
    </div>
  );
}

function FilterDemo({ css }: DemoProps) {
  return (
    <div className="demo-filter-wrap">
      <style>{css}</style>
      <div className="demo-filter-box" />
    </div>
  );
}

function BackdropFilterDemo({ css }: DemoProps) {
  return (
    <div className="demo-backdrop-bg">
      <style>{css}</style>
      <div className="demo-backdrop-panel">frosted glass panel</div>
    </div>
  );
}

function GradientTextDemo({ css }: DemoProps) {
  return (
    <div className="demo-gradtext-wrap">
      <style>{css}</style>
      <div className="demo-gradtext">Gradient Heading</div>
    </div>
  );
}

function ColorMixDemo({ css, values }: DemoProps) {
  return (
    <div className="demo-colormix-wrap">
      <style>{css}</style>
      <div className="demo-colormix-box">{values.percent} / {100 - Number(values.percent.replace('%', ''))}%</div>
    </div>
  );
}

interface CSSConcept {
  id: string;
  category: string;
  topic: string;
  explanation: string;
  controls: Control[];
  defaultValues: Record<string, string>;
  buildCss: (v: Record<string, string>) => string;
  Demo: (props: DemoProps) => JSX.Element;
}

const CSS_CONCEPTS: CSSConcept[] = [
  // --- Layout Fundamentals ---
  {
    id: 'css-box-model',
    category: 'Layout Fundamentals',
    topic: 'The box model',
    explanation: 'Every element is four nested boxes: content, padding, border, and margin. `box-sizing: border-box` makes the declared width include padding and border instead of adding to them — set it to border-box below and watch the border layer stop growing past its fixed width as padding/border increase.',
    controls: [
      { key: 'padding', label: 'padding', options: opts(['8px', '16px', '24px', '32px']) },
      { key: 'border', label: 'border width', options: opts(['2px', '4px', '8px']) },
      { key: 'margin', label: 'margin', options: opts(['8px', '16px', '24px', '32px']) },
      { key: 'boxSizing', label: 'box-sizing', options: opts(['content-box', 'border-box']) },
    ],
    defaultValues: { padding: '22px', border: '4px', margin: '26px', boxSizing: 'content-box' },
    buildCss: (v) => `
.demo-bm-wrap{display:flex;justify-content:center;padding:8px 0;}
.demo-bm-margin{position:relative;background:rgba(232,163,61,0.18);padding:${v.margin};border-radius:4px;}
.demo-bm-margin::before{content:"margin";position:absolute;top:3px;left:8px;font-size:9px;letter-spacing:0.05em;text-transform:uppercase;color:#e8a33d;font-family:'IBM Plex Mono',monospace;}
.demo-bm-border{position:relative;width:180px;box-sizing:${v.boxSizing};background:rgba(63,167,150,0.2);border:${v.border} dashed #3fa796;padding:${v.padding};}
.demo-bm-border::before{content:"border (fixed width: 180px)";position:absolute;top:3px;left:8px;font-size:9px;letter-spacing:0.05em;text-transform:uppercase;color:#3fa796;font-family:'IBM Plex Mono',monospace;white-space:nowrap;}
.demo-bm-padding{position:relative;background:rgba(201,106,94,0.2);padding:10px;}
.demo-bm-padding::before{content:"padding";position:absolute;top:3px;left:8px;font-size:9px;letter-spacing:0.05em;text-transform:uppercase;color:#c96a5e;font-family:'IBM Plex Mono',monospace;}
.demo-bm-content{background:#12161d;color:#e7e4dd;font-size:11px;text-align:center;padding:14px 8px;border-radius:3px;font-family:'IBM Plex Mono',monospace;}`,
    Demo: BoxModelDemo,
  },
  {
    id: 'css-flexbox',
    category: 'Layout Fundamentals',
    topic: 'Flexbox: main axis vs cross axis',
    explanation: '`justify-content` controls spacing along the main axis; `align-items` controls alignment along the cross axis. Item 2 has no explicit height, so switching align-items to `stretch` visibly fills it to the container height — with any other value it shrinks to fit its content instead.',
    controls: [
      { key: 'flexDirection', label: 'flex-direction', options: opts(['row', 'column']) },
      { key: 'justifyContent', label: 'justify-content', options: opts(['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']) },
      { key: 'alignItems', label: 'align-items', options: opts(['flex-start', 'center', 'flex-end', 'stretch']) },
    ],
    defaultValues: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    buildCss: (v) => `
.demo-flex-row{display:flex;flex-direction:${v.flexDirection};justify-content:${v.justifyContent};align-items:${v.alignItems};height:${v.flexDirection === 'row' ? '90px' : '220px'};background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:16px;}
.demo-flex-item{width:42px;border-radius:8px;background:#e8a33d;display:flex;align-items:center;justify-content:center;color:#12161d;font-weight:700;font-family:'IBM Plex Mono',monospace;}
.demo-flex-item:nth-child(1){height:42px;}
.demo-flex-item:nth-child(2){background:#3fa796;}
.demo-flex-item:nth-child(3){height:30px;background:#c96a5e;}`,
    Demo: FlexDemo,
  },
  {
    id: 'css-grid',
    category: 'Layout Fundamentals',
    topic: 'Grid: template columns and spanning',
    explanation: '`grid-template-columns: repeat(N, 1fr)` splits the container into N equal flexible columns. Any item can override how much space it takes with `grid-column: span N` — the rest of the layout adapts without you touching any other item\'s CSS.',
    controls: [
      { key: 'columns', label: 'columns', options: opts(['2', '3', '4', '5']) },
      { key: 'gap', label: 'gap', options: opts(['4px', '8px', '16px', '24px']) },
      { key: 'span', label: 'item 2: grid-column span', options: opts(['1', '2', '3']) },
    ],
    defaultValues: { columns: '3', gap: '8px', span: '2' },
    buildCss: (v) => `
.demo-grid{display:grid;grid-template-columns:repeat(${v.columns}, 1fr);gap:${v.gap};}
.demo-grid-item{background:var(--surface);border:1px solid var(--line);border-radius:6px;height:46px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-family:'IBM Plex Mono',monospace;font-size:12px;}
.demo-grid-item:nth-child(2){grid-column:span ${v.span};background:rgba(232,163,61,0.12);border-color:#8a6a35;color:#e8a33d;}`,
    Demo: GridDemo,
  },
  {
    id: 'css-stacking',
    category: 'Layout Fundamentals',
    topic: 'Positioning & stacking context (z-index)',
    explanation: '`z-index` only compares elements within the same stacking context. Reorder which box paints on top below — the highest z-index wins regardless of each box\'s position in the HTML, which is exactly why "I set z-index: 9999 and it still didn\'t work" bugs usually trace back to a stacking-context boundary somewhere above the element, not the number itself.',
    controls: [
      { key: 'zA', label: 'box A z-index', options: opts(['1', '2', '3', '4', '5']) },
      { key: 'zB', label: 'box B z-index', options: opts(['1', '2', '3', '4', '5']) },
      { key: 'zC', label: 'box C z-index', options: opts(['1', '2', '3', '4', '5']) },
    ],
    defaultValues: { zA: '1', zB: '3', zC: '2' },
    buildCss: (v) => `
.demo-stack{position:relative;height:100px;}
.demo-stack-box{position:absolute;width:70px;height:70px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#12161d;font-weight:700;}
.demo-stack-a{left:0;top:14px;background:#e8a33d;z-index:${v.zA};}
.demo-stack-b{left:44px;top:28px;background:#3fa796;z-index:${v.zB};}
.demo-stack-c{left:88px;top:14px;background:#c96a5e;z-index:${v.zC};}`,
    Demo: StackDemo,
  },
  {
    id: 'css-position',
    category: 'Layout Fundamentals',
    topic: 'Position: static, relative, absolute, fixed, sticky',
    explanation: '`static` ignores `top`/`left` entirely — it\'s the only one that does. `relative` offsets from where the element would normally sit. `absolute` removes it from flow and positions against its nearest positioned ancestor. `sticky` behaves like relative until a scroll threshold, then sticks. `fixed` normally pins to the viewport — here it\'s contained inside this demo instead, because the demo wrapper has a `transform` set on it, which is a real, commonly-used trick: any transformed ancestor becomes the containing block for its fixed descendants.',
    controls: [
      { key: 'position', label: 'position', options: opts(['static', 'relative', 'absolute', 'fixed', 'sticky']) },
      { key: 'offset', label: 'top offset', options: opts(['0px', '20px', '40px']) },
    ],
    defaultValues: { position: 'sticky', offset: '0px' },
    buildCss: (v) => `
.demo-pos-scene{position:relative;transform:translateZ(0);}
.demo-pos-port{height:140px;overflow:auto;border:1px solid var(--line);border-radius:8px;position:relative;}
.demo-pos-content{padding:8px;}
.demo-pos-filler{height:46px;background:var(--surface);border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:var(--text-faint);font-family:'IBM Plex Mono',monospace;font-size:11px;}
.demo-pos-item{position:${v.position};top:${v.position === 'static' ? 'auto' : v.offset};left:${v.position === 'absolute' || v.position === 'fixed' ? '10px' : 'auto'};background:#e8a33d;color:#12161d;font-weight:700;padding:10px;border-radius:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;margin-bottom:8px;}`,
    Demo: PositionDemo,
  },
  {
    id: 'css-display',
    category: 'Layout Fundamentals',
    topic: 'Display: block, inline, inline-block, none',
    explanation: '`inline` ignores width/height and flows with surrounding text. `block` forces its own line and respects width/height. `inline-block` gets the best (or worst) of both: respects width/height but stays inline. `none` removes the element from the layout entirely — nothing reserves its space.',
    controls: [{ key: 'display', label: 'display', options: opts(['inline', 'block', 'inline-block', 'none']) }],
    defaultValues: { display: 'inline-block' },
    buildCss: (v) => `
.demo-display-para{font-size:13px;line-height:1.8;color:var(--text-muted);}
.demo-display-item{display:${v.display};width:70px;height:40px;background:#3fa796;color:#12161d;text-align:center;border-radius:6px;margin:2px;font-family:'IBM Plex Mono',monospace;font-size:11px;}`,
    Demo: DisplayDemo,
  },
  {
    id: 'css-overflow',
    category: 'Layout Fundamentals',
    topic: 'Overflow: visible, hidden, scroll, auto',
    explanation: '`visible` lets content spill outside the box (the default). `hidden` clips it silently — no scrollbar, content is just gone. `scroll` always shows a scrollbar, even if the content actually fits. `auto` is almost always the right choice: a scrollbar appears only when content actually overflows.',
    controls: [{ key: 'overflow', label: 'overflow', options: opts(['visible', 'hidden', 'scroll', 'auto']) }],
    defaultValues: { overflow: 'auto' },
    buildCss: (v) => `
.demo-overflow-wrap{padding:8px 0;}
.demo-overflow-box{width:200px;height:70px;border:1px solid var(--line);border-radius:8px;padding:10px;overflow:${v.overflow};background:var(--surface);font-size:12px;line-height:1.5;color:var(--text-muted);}`,
    Demo: OverflowDemo,
  },
  {
    id: 'css-pseudo-elements',
    category: 'Layout Fundamentals',
    topic: '::before / ::after — generated content',
    explanation: 'A pseudo-element injects real, rendered content without touching the HTML — no extra `<span>` needed in the markup. This is how most icon-before-text badges, decorative quote marks, and "required field" asterisks are actually built.',
    controls: [
      { key: 'content', label: '::before content', options: opts(['✓', '★', 'NEW', '•']) },
      { key: 'color', label: 'color', options: [
        { label: 'Teal', value: '#3fa796' },
        { label: 'Amber', value: '#e8a33d' },
        { label: 'Rose', value: '#c96a5e' },
      ] },
    ],
    defaultValues: { content: '✓', color: '#3fa796' },
    buildCss: (v) => `
.demo-pseudo-wrap{padding:8px 0;}
.demo-pseudo-badge{padding:10px 16px;background:var(--surface);border:1px solid var(--line);border-radius:8px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text);}
.demo-pseudo-badge::before{content:"${v.content}";margin-right:8px;color:${v.color};font-weight:700;}`,
    Demo: PseudoElementDemo,
  },
  {
    id: 'css-aspect-ratio',
    category: 'Layout Fundamentals',
    topic: '`aspect-ratio` — no more padding-top hacks',
    explanation: 'Before `aspect-ratio`, keeping a box at a fixed proportion (e.g. a 16:9 video placeholder) meant a `padding-top: 56.25%` hack. Now the ratio is just a direct, readable declaration that holds regardless of the box\'s actual width.',
    controls: [{ key: 'ratio', label: 'aspect-ratio', options: opts(['1 / 1', '16 / 9', '4 / 3', '21 / 9']) }],
    defaultValues: { ratio: '16 / 9' },
    buildCss: (v) => `
.demo-ratio-wrap{padding:8px 0;}
.demo-ratio-box{width:220px;max-width:100%;aspect-ratio:${v.ratio};background:linear-gradient(135deg,#e8a33d,#3fa796);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#12161d;font-weight:700;font-family:'IBM Plex Mono',monospace;font-size:12px;}`,
    Demo: AspectRatioDemo,
  },

  // --- Transitions & Keyframe Animations ---
  {
    id: 'css-transition',
    category: 'Transitions & Keyframe Animations',
    topic: '`transition` — animating a state change',
    explanation: 'A transition animates a property between two states (e.g. normal → :hover) — it needs a trigger and only ever plays once per state change. It\'s the right tool for "this responds when something happens," not for a continuous loop.',
    controls: [
      { key: 'duration', label: 'duration', options: opts(['0.15s', '0.3s', '0.6s', '1s']) },
      { key: 'timingFunction', label: 'timing-function', options: EASING_OPTIONS },
      { key: 'scale', label: 'hover scale', options: opts(['1.05', '1.15', '1.3', '1.5']) },
      { key: 'rotate', label: 'hover rotate', options: opts(['0deg', '6deg', '15deg', '30deg']) },
    ],
    defaultValues: { duration: '0.3s', timingFunction: 'ease', scale: '1.15', rotate: '6deg' },
    buildCss: (v) => `
.demo-hover-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 0;}
.demo-hover-box{width:80px;height:80px;border-radius:12px;background:#e8a33d;transition:transform ${v.duration} ${v.timingFunction}, background ${v.duration} ${v.timingFunction}, border-radius ${v.duration} ${v.timingFunction};cursor:pointer;}
.demo-hover-box:hover{transform:scale(${v.scale}) rotate(${v.rotate});background:#3fa796;border-radius:24px;}`,
    Demo: HoverTransitionDemo,
  },
  {
    id: 'css-keyframes',
    category: 'Transitions & Keyframe Animations',
    topic: '`@keyframes` — self-running loops',
    explanation: 'Unlike a transition, a keyframe animation needs no trigger — it runs continuously the moment the element mounts. Try `steps(8, end)` for the timing function instead of a smooth one — it turns the spin into a ticking, clock-like motion instead of a continuous rotation.',
    controls: [
      { key: 'duration', label: 'duration', options: opts(['0.5s', '1s', '2s', '3s']) },
      { key: 'timingFunction', label: 'timing-function', options: opts(['linear', 'ease-in-out', 'steps(8, end)']) },
      { key: 'direction', label: 'direction', options: opts(['normal', 'reverse']) },
    ],
    defaultValues: { duration: '1s', timingFunction: 'linear', direction: 'normal' },
    buildCss: (v) => `
.demo-spin-wrap{display:flex;justify-content:center;padding:20px 0;}
@keyframes demo-spin-rotate{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.demo-spin-box{width:50px;height:50px;border-radius:10px;border:4px solid var(--line);border-top-color:#e8a33d;animation:demo-spin-rotate ${v.duration} ${v.timingFunction} infinite ${v.direction};}`,
    Demo: KeyframeSpinDemo,
  },
  {
    id: 'css-easing',
    category: 'Transitions & Keyframe Animations',
    topic: 'Easing curves — timing functions compared',
    explanation: 'The same animation feels completely different depending on `animation-timing-function`. Give each track a different curve below and watch them race: `linear` is constant speed, `ease-in-out` starts/ends slow, and a custom `cubic-bezier` can overshoot past the target and settle back — which is what most "bouncy" UI polish is actually built from.',
    controls: [
      { key: 'duration', label: 'duration', options: opts(['1s', '1.8s', '3s']) },
      { key: 'curveA', label: 'track 1 easing', options: EASING_OPTIONS },
      { key: 'curveB', label: 'track 2 easing', options: EASING_OPTIONS },
      { key: 'curveC', label: 'track 3 easing', options: EASING_OPTIONS },
    ],
    defaultValues: { duration: '1.8s', curveA: 'linear', curveB: 'ease-in-out', curveC: 'cubic-bezier(0.68,-0.55,0.27,1.55)' },
    buildCss: (v) => `
.demo-easing-wrap{display:flex;flex-direction:column;gap:10px;padding:8px 0;}
.demo-easing-track{position:relative;height:24px;background:var(--surface);border:1px solid var(--line);border-radius:12px;}
.demo-easing-dot{position:absolute;top:2px;width:18px;height:18px;border-radius:50%;}
@keyframes demo-easing-move{from{left:2px;}to{left:calc(100% - 20px);}}
.demo-easing-linear{animation:demo-easing-move ${v.duration} ${v.curveA} infinite alternate;background:#e8a33d;}
.demo-easing-ease{animation:demo-easing-move ${v.duration} ${v.curveB} infinite alternate;background:#3fa796;}
.demo-easing-bounce{animation:demo-easing-move ${v.duration} ${v.curveC} infinite alternate;background:#c96a5e;}
.demo-easing-caption{font-size:10px;color:var(--text-faint);font-family:'IBM Plex Mono',monospace;}`,
    Demo: EasingRaceDemo,
  },
  {
    id: 'css-perf-props',
    category: 'Transitions & Keyframe Animations',
    topic: 'Animate transform/opacity, not layout properties',
    explanation: 'Animating `transform` and `opacity` runs on the GPU compositor and skips layout and paint entirely — that\'s why they stay smooth even on weaker devices. Animating `width`, `top`, or `margin` instead forces the browser to recompute layout on every frame, the most common cause of janky CSS animations.',
    controls: [
      { key: 'distance', label: 'translate distance', options: opts(['8px', '16px', '32px', '48px']) },
      { key: 'duration', label: 'duration', options: opts(['1.2s', '2.4s', '4s']) },
      { key: 'timingFunction', label: 'timing-function', options: EASING_OPTIONS },
    ],
    defaultValues: { distance: '16px', duration: '2.4s', timingFunction: 'ease-in-out' },
    buildCss: (v) => `
.demo-fade-wrap{display:flex;justify-content:center;padding:16px 0;overflow:hidden;height:70px;}
@keyframes demo-fade-up{0%{opacity:0;transform:translateY(${v.distance});}30%{opacity:1;transform:translateY(0);}80%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(-${v.distance});}}
.demo-fade-card{width:160px;padding:14px;background:var(--surface);border:1px solid var(--line);border-radius:8px;animation:demo-fade-up ${v.duration} ${v.timingFunction} infinite;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--text);text-align:center;}`,
    Demo: FadeInUpDemo,
  },
  {
    id: 'css-fill-mode',
    category: 'Transitions & Keyframe Animations',
    topic: '`animation-fill-mode` — what happens before/after',
    explanation: 'A non-infinite animation snaps back to the element\'s normal CSS the instant it ends — unless `fill-mode` says otherwise. `forwards` keeps the last keyframe\'s styles applied after it finishes; `none` (the default) reverts. Hit replay after switching to see the difference: with `none` the box jumps back to its starting position, with `forwards` it stays put.',
    controls: [{ key: 'fillMode', label: 'animation-fill-mode', options: opts(['none', 'forwards', 'backwards', 'both']) }],
    defaultValues: { fillMode: 'forwards' },
    buildCss: (v) => `
.demo-fill-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;padding:16px 0;}
@keyframes demo-fill-slide{from{transform:translateX(-60px);opacity:0.3;}to{transform:translateX(60px);opacity:1;}}
.demo-fill-box{width:44px;height:44px;border-radius:8px;background:#e8a33d;animation:demo-fill-slide 1.2s ease-out;animation-fill-mode:${v.fillMode};}`,
    Demo: FillModeDemo,
  },
  {
    id: 'css-play-state',
    category: 'Transitions & Keyframe Animations',
    topic: '`animation-play-state` — pause a running animation',
    explanation: 'Switching `animation-play-state` to `paused` freezes the animation exactly where it is, mid-frame — the browser doesn\'t restart it later, it resumes from that exact point when set back to `running`. This is how a lot of "pause on hover" UI patterns work under the hood.',
    controls: [{ key: 'playState', label: 'animation-play-state', options: opts(['running', 'paused']) }],
    defaultValues: { playState: 'running' },
    buildCss: (v) => `
.demo-playstate-wrap{display:flex;justify-content:center;padding:20px 0;}
@keyframes demo-playstate-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.demo-playstate-box{width:50px;height:50px;border-radius:10px;border:4px solid var(--line);border-top-color:#3fa796;animation:demo-playstate-spin 1.5s linear infinite;animation-play-state:${v.playState};}`,
    Demo: PlayStateDemo,
  },
  {
    id: 'css-stagger',
    category: 'Transitions & Keyframe Animations',
    topic: 'Staggered animations with `animation-delay`',
    explanation: 'Giving each sibling a slightly larger `animation-delay` (usually via `:nth-child`) turns one identical animation into a wave — the same trick behind most list-item entrance animations and loading-dot sequences.',
    controls: [
      { key: 'delayStep', label: 'delay step per dot', options: opts(['0.1s', '0.2s', '0.4s']) },
      { key: 'duration', label: 'duration', options: opts(['0.8s', '1.2s', '2s']) },
    ],
    defaultValues: { delayStep: '0.15s', duration: '1.2s' },
    buildCss: (v) => {
      const step = parseFloat(v.delayStep) || 0;
      const rules = [1, 2, 3, 4, 5]
        .map((n) => `.demo-stagger-dot:nth-child(${n}){animation-delay:${(step * (n - 1)).toFixed(2)}s;}`)
        .join('\n');
      return `
.demo-stagger-wrap{display:flex;gap:10px;padding:20px 0;justify-content:center;}
@keyframes demo-stagger-bounce{0%,100%{transform:translateY(0);opacity:0.4;}50%{transform:translateY(-14px);opacity:1;}}
.demo-stagger-dot{width:16px;height:16px;border-radius:50%;background:#3fa796;animation:demo-stagger-bounce ${v.duration} ease-in-out infinite;}
${rules}`;
    },
    Demo: StaggerDemo,
  },
  {
    id: 'css-transition-delay',
    category: 'Transitions & Keyframe Animations',
    topic: '`transition-delay` — waiting before it starts',
    explanation: 'A transition doesn\'t have to start the instant its trigger fires — `transition-delay` inserts a pause first. This is genuinely useful for tooltips (delay before showing, so quick mouse-overs don\'t trigger it) and is easy to confuse with `transition-duration`, which controls how long the transition itself takes, not when it begins.',
    controls: [
      { key: 'delay', label: 'transition-delay', options: opts(['0s', '0.2s', '0.5s', '1s']) },
      { key: 'duration', label: 'transition-duration', options: opts(['0.2s', '0.4s', '0.8s']) },
    ],
    defaultValues: { delay: '0.3s', duration: '0.3s' },
    buildCss: (v) => `
.demo-delay-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 0;}
.demo-delay-box{width:80px;height:80px;border-radius:12px;background:#e8a33d;transition:background ${v.duration} ease ${v.delay};cursor:pointer;}
.demo-delay-box:hover{background:#3fa796;}`,
    Demo: TransitionDelayDemo,
  },

  // --- Transforms & 3D ---
  {
    id: 'css-transform-2d',
    category: 'Transforms & 3D',
    topic: '2D transforms: translate, rotate, scale',
    explanation: 'Transform functions compose in the order they\'re written and don\'t affect surrounding layout at all — a rotated or scaled element never pushes its neighbors around, unlike changing width or margin would.',
    controls: [
      { key: 'translate', label: 'translateX amount', options: opts(['12px', '28px', '48px']) },
      { key: 'rotate', label: 'rotate amount', options: opts(['0deg', '45deg', '90deg', '180deg']) },
      { key: 'scale', label: 'scale amount', options: opts(['1', '1.3', '1.6']) },
      { key: 'duration', label: 'duration', options: opts(['2s', '3.5s', '5s']) },
    ],
    defaultValues: { translate: '28px', rotate: '45deg', scale: '1.3', duration: '3.5s' },
    buildCss: (v) => `
.demo-2d-wrap{display:flex;justify-content:center;padding:20px 0;}
@keyframes demo-2d-cycle{
  0%{transform:translateX(0) rotate(0deg) scale(1);}
  25%{transform:translateX(${v.translate}) rotate(0deg) scale(1);}
  50%{transform:translateX(${v.translate}) rotate(${v.rotate}) scale(1);}
  75%{transform:translateX(${v.translate}) rotate(${v.rotate}) scale(${v.scale});}
  100%{transform:translateX(0) rotate(0deg) scale(1);}
}
.demo-2d-box{width:50px;height:50px;border-radius:8px;background:#3fa796;animation:demo-2d-cycle ${v.duration} ease-in-out infinite;}`,
    Demo: Transform2DDemo,
  },
  {
    id: 'css-transform-origin',
    category: 'Transforms & 3D',
    topic: '`transform-origin` — the pivot point',
    explanation: 'Every transform happens around an origin point, which defaults to the element\'s own center. Change the second box\'s origin below — same `rotate(360deg)` as the first box, visually different result because it\'s pivoting around a different point.',
    controls: [
      { key: 'origin', label: 'box 2 transform-origin', options: opts(['top left', 'top right', 'bottom left', 'bottom right', 'top', 'bottom', 'center']) },
      { key: 'duration', label: 'duration', options: opts(['1.5s', '3s', '5s']) },
    ],
    defaultValues: { origin: 'top left', duration: '3s' },
    buildCss: (v) => `
.demo-origin-wrap{display:flex;gap:32px;justify-content:center;padding:16px 0;}
.demo-origin-item{text-align:center;}
@keyframes demo-origin-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.demo-origin-box{width:50px;height:50px;background:#e8a33d;animation:demo-origin-spin ${v.duration} linear infinite;}
.demo-origin-center{transform-origin:center;}
.demo-origin-corner{transform-origin:${v.origin};}
.demo-origin-label{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--text-faint);margin-top:10px;}`,
    Demo: TransformOriginDemo,
  },
  {
    id: 'css-3d-flip',
    category: 'Transforms & 3D',
    topic: '3D flip card: perspective + rotateY',
    explanation: '`perspective` on the parent gives 3D transforms somewhere to "recede into" — a smaller value exaggerates the 3D depth, a larger value flattens it. `backface-visibility: hidden` hides each face once it rotates past 90°, and `transform-style: preserve-3d` keeps both faces in the same 3D space instead of flattening them.',
    controls: [
      { key: 'perspective', label: 'perspective', options: opts(['300px', '600px', '900px', '1600px']) },
      { key: 'duration', label: 'flip duration', options: opts(['0.3s', '0.6s', '1s']) },
      { key: 'axis', label: 'rotate axis', options: opts(['rotateY', 'rotateX']) },
    ],
    defaultValues: { perspective: '600px', duration: '0.6s', axis: 'rotateY' },
    buildCss: (v) => `
.demo-flip-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 0;perspective:${v.perspective};}
.demo-flip-card{position:relative;width:130px;height:80px;transform-style:preserve-3d;transition:transform ${v.duration} ease;cursor:pointer;}
.demo-flip-card:hover{transform:${v.axis}(180deg);}
.demo-flip-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#12161d;font-weight:700;}
.demo-flip-front{background:#e8a33d;}
.demo-flip-back{background:#3fa796;transform:${v.axis}(180deg);}`,
    Demo: FlipCardDemo,
  },
  {
    id: 'css-combined-transform',
    category: 'Transforms & 3D',
    topic: 'Combining transforms in one keyframe',
    explanation: 'A single `transform` declaration can carry translate, rotate, and scale together — the browser interpolates all three simultaneously, which is how a "bounce and spin" effect is built from one keyframe rule instead of three fighting each other.',
    controls: [
      { key: 'height', label: 'bounce height', options: opts(['16px', '32px', '56px']) },
      { key: 'rotate', label: 'rotate amount', options: opts(['0deg', '180deg', '360deg']) },
      { key: 'scale', label: 'scale amount', options: opts(['1', '1.15', '1.4']) },
      { key: 'duration', label: 'duration', options: opts(['0.8s', '1.2s', '2s']) },
    ],
    defaultValues: { height: '32px', rotate: '180deg', scale: '1.15', duration: '1.2s' },
    buildCss: (v) => `
.demo-combo-wrap{display:flex;justify-content:center;align-items:flex-end;height:90px;padding:0 0 10px;}
@keyframes demo-combo-bounce{
  0%,100%{transform:translateY(0) rotate(0deg) scale(1);}
  50%{transform:translateY(-${v.height}) rotate(${v.rotate}) scale(${v.scale});}
}
.demo-combo-box{width:40px;height:40px;border-radius:10px;background:#c96a5e;animation:demo-combo-bounce ${v.duration} ease-in-out infinite;}`,
    Demo: CombinedTransformDemo,
  },
  {
    id: 'css-skew',
    category: 'Transforms & 3D',
    topic: '`skew()` — slanting an element',
    explanation: '`skewX`/`skewY` shear an element along an axis without rotating it — the classic "parallelogram" button or banner effect. It composes with other transforms just like translate/rotate/scale do.',
    controls: [
      { key: 'skewX', label: 'skewX', options: opts(['0deg', '10deg', '20deg', '-15deg']) },
      { key: 'skewY', label: 'skewY', options: opts(['0deg', '5deg', '10deg', '-8deg']) },
    ],
    defaultValues: { skewX: '15deg', skewY: '0deg' },
    buildCss: (v) => `
.demo-skew-wrap{display:flex;justify-content:center;padding:20px 0;}
.demo-skew-box{width:90px;height:60px;background:#c96a5e;border-radius:6px;transform:skewX(${v.skewX}) skewY(${v.skewY});transition:transform 0.3s ease;}`,
    Demo: SkewDemo,
  },
  {
    id: 'css-perspective-origin',
    category: 'Transforms & 3D',
    topic: '`perspective-origin` — the 3D viewing angle',
    explanation: '`perspective` sets how dramatic the 3D depth looks; `perspective-origin` sets where the "camera" is looking from. Moving it to a corner makes a rotating element look like it\'s pivoting away from that corner instead of straight ahead.',
    controls: [{ key: 'origin', label: 'perspective-origin', options: opts(['center', 'top left', 'top right', 'bottom left', 'bottom right']) }],
    defaultValues: { origin: 'center' },
    buildCss: (v) => `
.demo-porigin-scene{perspective:400px;perspective-origin:${v.origin};display:flex;justify-content:center;padding:24px 0;}
@keyframes demo-porigin-spin{from{transform:rotateY(0deg);}to{transform:rotateY(360deg);}}
.demo-porigin-box{width:70px;height:70px;border-radius:8px;background:#9b7ede;animation:demo-porigin-spin 4s linear infinite;}`,
    Demo: PerspectiveOriginDemo,
  },

  // --- Modern & Advanced CSS ---
  {
    id: 'css-variables',
    category: 'Modern & Advanced CSS',
    topic: 'CSS custom properties (variables)',
    explanation: 'A custom property set on `:root` cascades down and can be read anywhere with `var(--name)`. Pick a new accent below — no class changes, no new stylesheet — and everything referencing it restyles instantly, which is how most theme-switchers actually work under the hood.',
    controls: [
      { key: 'accent', label: '--accent value', options: [
        { label: 'Amber', value: '#e8a33d' },
        { label: 'Teal', value: '#3fa796' },
        { label: 'Rose', value: '#c96a5e' },
        { label: 'Purple', value: '#9b7ede' },
        { label: 'Blue', value: '#5b9bd5' },
      ] },
    ],
    defaultValues: { accent: '#e8a33d' },
    buildCss: (v) => `
.demo-vars-wrap{padding:8px 0;}
:root{--demo-accent:${v.accent};}
.demo-vars-box{padding:16px;border-radius:8px;background:var(--demo-accent);color:#12161d;font-family:'IBM Plex Mono',monospace;font-size:12px;text-align:center;transition:background 0.3s ease;}`,
    Demo: VariablesDemo,
  },
  {
    id: 'css-clamp',
    category: 'Modern & Advanced CSS',
    topic: 'Fluid typography: clamp() + container query units',
    explanation: '`clamp(min, preferred, max)` picks a value that scales but never goes below or above your bounds. Using `cqw` (container query width) instead of `vw` ties the font size to this container specifically — drag the slider to resize the container and watch the text scale, bounded by whatever min/max you pick below.',
    controls: [
      { key: 'min', label: 'clamp() min', options: opts(['10px', '12px', '16px']) },
      { key: 'max', label: 'clamp() max', options: opts(['20px', '28px', '36px']) },
      { key: 'unit', label: 'unit', options: opts(['cqw', 'vw']) },
    ],
    defaultValues: { min: '12px', max: '28px', unit: 'cqw' },
    buildCss: (v) => `
.demo-clamp-frame{container-type:inline-size;border:1px dashed var(--line);border-radius:8px;padding:12px;overflow:hidden;}
.demo-clamp-text{font-size:clamp(${v.min}, 8${v.unit}, ${v.max});font-weight:700;color:#e8a33d;margin:0;white-space:nowrap;}`,
    Demo: ClampDemo,
  },
  {
    id: 'css-has',
    category: 'Modern & Advanced CSS',
    topic: '`:has()` — the "parent selector"',
    explanation: 'CSS couldn\'t style a parent based on its children until `:has()` — this used to require JavaScript toggling a class. Check the box below and the card around it restyles purely through CSS, based on the state of a descendant input.',
    controls: [
      { key: 'color', label: 'checked-state color', options: [
        { label: 'Teal', value: '#3fa796' },
        { label: 'Amber', value: '#e8a33d' },
        { label: 'Rose', value: '#c96a5e' },
        { label: 'Blue', value: '#5b9bd5' },
      ] },
    ],
    defaultValues: { color: '#3fa796' },
    buildCss: (v) => `
.demo-has-card{border:1px solid var(--line);border-radius:8px;padding:14px;display:flex;align-items:center;gap:10px;transition:border-color 0.25s ease, background 0.25s ease;}
.demo-has-card:has(input:checked){border-color:${v.color};background:${withAlpha(v.color, 0.1)};}
.demo-has-label{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text-muted);}
.demo-has-card:has(input:checked) .demo-has-label{color:${v.color};}`,
    Demo: HasSelectorDemo,
  },
  {
    id: 'css-scroll-timeline',
    category: 'Modern & Advanced CSS',
    topic: 'Scroll-driven animation (`animation-timeline: view()`)',
    explanation: '`animation-timeline: view()` ties keyframe progress directly to an element\'s scroll position within its scrollport instead of time — scroll to reveal, no JavaScript listener required. Support: Chrome/Edge as of this writing; Firefox/Safari fall back to items simply being visible without the reveal effect.',
    controls: [
      { key: 'range', label: 'animation-range', options: opts(['entry 0% cover 40%', 'entry 0% cover 100%', 'contain 0% contain 100%']) },
      { key: 'timingFunction', label: 'timing-function', options: opts(['linear', 'ease-out']) },
    ],
    defaultValues: { range: 'entry 0% cover 40%', timingFunction: 'linear' },
    buildCss: (v) => `
.demo-scroll-port{height:110px;overflow-y:auto;border:1px solid var(--line);border-radius:8px;padding:8px;}
.demo-scroll-item{
  height:64px;margin-bottom:10px;border-radius:8px;background:var(--surface-raised);
  display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--text-muted);
  animation:demo-scroll-reveal ${v.timingFunction} both;
  animation-timeline:view();
  animation-range:${v.range};
}
@keyframes demo-scroll-reveal{from{opacity:0.15;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}`,
    Demo: ScrollTimelineDemo,
  },
  {
    id: 'css-supports',
    category: 'Modern & Advanced CSS',
    topic: '`@supports` — real feature detection, in CSS',
    explanation: 'Pick a feature below — the box only turns teal if your actual, current browser supports it, verified live via the real `CSS.supports()` API and a real `@supports` rule in the stylesheet. This isn\'t simulated: if you\'re on a browser that lacks a feature, the box genuinely stays at its fallback style.',
    controls: [{ key: 'feature', label: 'feature to check', options: SUPPORTS_FEATURES.map((f, i) => ({ label: f.label, value: String(i) })) }],
    defaultValues: { feature: '0' },
    buildCss: (v) => {
      const f = SUPPORTS_FEATURES[Number(v.feature)];
      return `
.demo-supports-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px 0;}
.demo-supports-box{width:200px;padding:16px;text-align:center;border-radius:8px;background:rgba(232,163,61,0.2);border:1px solid var(--line);font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--text);}
@supports (${f.property}: ${f.value}) {
  .demo-supports-box{background:rgba(63,167,150,0.25);border-color:#3fa796;color:#3fa796;}
}`;
    },
    Demo: SupportsDemo,
  },
  {
    id: 'css-is-where',
    category: 'Modern & Advanced CSS',
    topic: '`:is()` vs `:where()` — specificity that matters vs zero',
    explanation: '`:is()` takes on the specificity of its most specific argument — it competes normally and can win ties by source order. `:where()` always has zero specificity, no matter what\'s inside it — it will lose to even a single plain class every time. Switch the variant below: with `:is()` the teal text wins; with `:where()` it never does, because a plain `.item` rule elsewhere always beats zero specificity.',
    controls: [{ key: 'variant', label: 'selector', options: opts(['is', 'where']) }],
    defaultValues: { variant: 'is' },
    buildCss: (v) => `
.demo-isw-box{padding:14px;border-radius:8px;background:var(--surface);border:1px solid var(--line);font-family:'IBM Plex Mono',monospace;font-size:12px;}
.item{color:var(--text-muted);}
${v.variant === 'is' ? ':is(.item){color:#3fa796;font-weight:700;}' : ':where(.item){color:#3fa796;font-weight:700;}'}`,
    Demo: IsWhereDemo,
  },
  {
    id: 'css-filter',
    category: 'Modern & Advanced CSS',
    topic: '`filter` — blur, grayscale, brightness, and friends',
    explanation: '`filter` applies a graphical effect to the whole element — including its children — without touching the DOM. Unlike most other properties, filters can be stacked (space-separated) and are GPU-accelerated, same as transform/opacity.',
    controls: [{ key: 'filter', label: 'filter', options: [
      { label: 'none', value: 'none' },
      { label: 'blur(4px)', value: 'blur(4px)' },
      { label: 'grayscale(100%)', value: 'grayscale(100%)' },
      { label: 'brightness(1.6)', value: 'brightness(1.6)' },
      { label: 'contrast(2)', value: 'contrast(2)' },
      { label: 'sepia(0.8)', value: 'sepia(0.8)' },
    ] }],
    defaultValues: { filter: 'blur(4px)' },
    buildCss: (v) => `
.demo-filter-wrap{display:flex;justify-content:center;padding:16px 0;}
.demo-filter-box{width:160px;height:100px;border-radius:8px;background:linear-gradient(135deg,#e8a33d,#3fa796,#c96a5e);filter:${v.filter};transition:filter 0.3s ease;}`,
    Demo: FilterDemo,
  },
  {
    id: 'css-backdrop-filter',
    category: 'Modern & Advanced CSS',
    topic: '`backdrop-filter` — the frosted-glass effect',
    explanation: 'Unlike `filter`, which affects the element itself, `backdrop-filter` blurs/distorts whatever is BEHIND a semi-transparent element — this is the actual mechanism behind every "frosted glass" panel, translucent nav bar, or macOS-style modal backdrop.',
    controls: [{ key: 'blur', label: 'backdrop blur', options: opts(['0px', '4px', '10px', '20px']) }],
    defaultValues: { blur: '10px' },
    buildCss: (v) => `
.demo-backdrop-bg{position:relative;height:130px;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#e8a33d,#3fa796,#c96a5e,#5b9bd5);}
.demo-backdrop-panel{position:absolute;inset:20px;background:rgba(255,255,255,0.1);backdrop-filter:blur(${v.blur});border:1px solid rgba(255,255,255,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:12px;text-shadow:0 1px 3px rgba(0,0,0,0.4);}`,
    Demo: BackdropFilterDemo,
  },
  {
    id: 'css-gradient-text',
    category: 'Modern & Advanced CSS',
    topic: 'Gradient text with `background-clip: text`',
    explanation: 'Setting the text color to `transparent` and clipping a background gradient to the text shape (`background-clip: text`) lets the gradient show through only where the letters are — the gradient itself is a normal `linear-gradient`, nothing text-specific about it.',
    controls: [
      { key: 'angle', label: 'gradient angle', options: opts(['45deg', '90deg', '135deg']) },
      { key: 'pair', label: 'color pair', options: opts(['amber-teal', 'teal-rose', 'rose-purple']) },
    ],
    defaultValues: { angle: '90deg', pair: 'amber-teal' },
    buildCss: (v) => {
      const pairs: Record<string, [string, string]> = {
        'amber-teal': ['#e8a33d', '#3fa796'],
        'teal-rose': ['#3fa796', '#c96a5e'],
        'rose-purple': ['#c96a5e', '#9b7ede'],
      };
      const [a, b] = pairs[v.pair] || pairs['amber-teal'];
      return `
.demo-gradtext-wrap{display:flex;justify-content:center;padding:16px 0;}
.demo-gradtext{font-size:26px;font-weight:800;background:linear-gradient(${v.angle}, ${a}, ${b});-webkit-background-clip:text;background-clip:text;color:transparent;font-family:'IBM Plex Mono',monospace;}`;
    },
    Demo: GradientTextDemo,
  },
  {
    id: 'css-color-mix',
    category: 'Modern & Advanced CSS',
    topic: '`color-mix()` — blending two colors in CSS',
    explanation: 'Before `color-mix()`, blending two colors meant precomputing a hex value in JS/Sass. Now the browser does it natively, live, at render time — genuinely useful for hover states that darken a base color by some percentage without a second hardcoded hex.',
    controls: [
      { key: 'percent', label: 'amount of color A', options: opts(['25%', '50%', '75%']) },
      { key: 'pair', label: 'colors', options: opts(['amber-teal', 'teal-rose', 'rose-blue']) },
    ],
    defaultValues: { percent: '50%', pair: 'amber-teal' },
    buildCss: (v) => {
      const pairs: Record<string, [string, string]> = {
        'amber-teal': ['#e8a33d', '#3fa796'],
        'teal-rose': ['#3fa796', '#c96a5e'],
        'rose-blue': ['#c96a5e', '#5b9bd5'],
      };
      const [a, b] = pairs[v.pair] || pairs['amber-teal'];
      return `
.demo-colormix-wrap{padding:8px 0;}
.demo-colormix-box{width:100%;height:64px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#12161d;font-weight:700;font-family:'IBM Plex Mono',monospace;font-size:12px;background:color-mix(in srgb, ${a} ${v.percent}, ${b});}`;
    },
    Demo: ColorMixDemo,
  },
];

export default function CSSAnimations() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [valuesMap, setValuesMap] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(CSS_CONCEPTS.map((c) => [c.id, c.defaultValues]))
  );

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateValue(id: string, key: string, value: string) {
    setValuesMap((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  function resetValues(id: string, defaults: Record<string, string>) {
    setValuesMap((prev) => ({ ...prev, [id]: defaults }));
  }

  return (
    <div className="panel active">
      <p className="guide-intro">
        CSS is visual — so instead of just reading about it, click any concept below, pick values from the dropdowns,
        and watch the browser genuinely re-render it live. This is real CSS applied to real elements, not a
        screenshot or a simulation — every control below is a real declaration, not a fake slider.
      </p>

      {CATEGORIES.map((category) => (
        <div className="cat-group" key={category}>
          <div className="cat-title">{category}</div>
          <div className="qa-list">
            {CSS_CONCEPTS.filter((c) => c.category === category).map((c) => {
              const isExpanded = expandedIds.has(c.id);
              const Demo = c.Demo;
              const values = valuesMap[c.id];
              const liveCss = c.buildCss(values);
              return (
                <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={c.id}>
                  <div className="qa-question-row tech-card-header" onClick={() => toggleExpanded(c.id)}>
                    <div>
                      <div className="qa-question">{c.topic}</div>
                    </div>
                    <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                  </div>
                  {isExpanded && (
                    <>
                      <p className="tech-explanation">{c.explanation}</p>
                      <div className="css-demo-frame">
                        <Demo css={liveCss} values={values} />
                      </div>
                      <div className="css-controls-grid">
                        {c.controls.map((ctrl) => (
                          <label className="css-control" key={ctrl.key}>
                            <span>{ctrl.label}</span>
                            <select value={values[ctrl.key]} onChange={(e) => updateValue(c.id, ctrl.key, e.target.value)}>
                              {ctrl.options.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      <div className="edit-actions">
                        <button className="ghost-btn" onClick={() => resetValues(c.id, c.defaultValues)}>
                          ↺ Reset to original
                        </button>
                      </div>
                      <CodeBlock code={liveCss.trim()} language="css" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
