const CTC_COMPONENTS = [
  {
    name: 'Basic Salary',
    pct: '35–50% of CTC',
    tax: 'Fully taxable',
    note: 'Base figure PF, gratuity and HRA exemption are all calculated from — a lower basic quietly shrinks all three.',
  },
  {
    name: 'HRA (House Rent Allowance)',
    pct: '~40–50% of basic',
    tax: 'Partly exempt if you pay rent',
    note: 'Exemption = least of: actual HRA, rent paid minus 10% of basic, or 50%/40% of basic (metro/non-metro). No exemption under the new tax regime.',
  },
  {
    name: 'Special / Flexible Allowance',
    pct: 'Balancing figure',
    tax: 'Fully taxable',
    note: 'The lever companies use to hit a target CTC number after every other component is fixed — this is usually where a raise actually lands.',
  },
  {
    name: 'Employer PF Contribution',
    pct: '12% of basic',
    tax: 'Tax-free into your EPF account',
    note: "Counted in CTC but never touches your in-hand pay — it's a real cost to the company, not a real benefit to your monthly cash flow.",
  },
  {
    name: 'Gratuity',
    pct: '~4.81% of basic',
    tax: 'Exempt up to ₹20L lifetime',
    note: 'Set aside in CTC but only paid out after 5 years of continuous service. Leave before that and this portion of your "CTC" simply never existed.',
  },
  {
    name: 'LTA (Leave Travel Allowance)',
    pct: 'Company-defined, often small',
    tax: 'Exempt for actual domestic travel, twice per 4-year block',
    note: 'Needs receipts/proof of travel to claim the exemption — unclaimed LTA is just taxed as regular income.',
  },
  {
    name: 'Meal / Food Allowance',
    pct: '~₹2,200–2,600/month typical',
    tax: 'Exempt up to ~₹50/meal (old regime, via cards like Sodexo/Zeta)',
    note: 'Small, but free money if the company still offers it — some have phased it out under the new-regime default.',
  },
  {
    name: 'Variable / Performance Bonus',
    pct: '10–20% of CTC',
    tax: 'Fully taxable, paid as salary',
    note: 'Not guaranteed. Ask what percentage was actually paid out company-wide in the last 2–3 cycles — the target and the reality are often different numbers.',
  },
];

const REGIME_COMPARISON = [
  {
    aspect: 'Tax slabs',
    old: 'Higher rates, more slabs',
    neu: 'Lower rates, wider slabs (default regime since FY 2023–24)',
  },
  {
    aspect: 'HRA exemption',
    old: 'Available if renting',
    neu: 'Not available',
  },
  {
    aspect: '80C (PF, ELSS, life insurance, etc.)',
    old: 'Up to ₹1.5L deduction',
    neu: 'Not available',
  },
  {
    aspect: '80D (health insurance premium)',
    old: 'Available',
    neu: 'Not available',
  },
  {
    aspect: 'Home loan interest (Sec 24b)',
    old: 'Up to ₹2L deduction (self-occupied)',
    neu: 'Not available',
  },
  {
    aspect: 'NPS employer contribution (80CCD(2))',
    old: 'Available, over and above 80C',
    neu: 'Still available — one of the few old-regime-style perks the new regime keeps',
  },
  {
    aspect: 'Standard deduction',
    old: '₹50,000',
    neu: '₹75,000 (higher, to partly offset lost exemptions)',
  },
];

const EQUITY_COMPARISON = [
  {
    aspect: 'What it is',
    esop: 'Right to buy shares later at a fixed strike price',
    rsu: 'Shares granted outright once they vest — no purchase needed',
  },
  {
    aspect: 'Common at',
    esop: 'Startups, pre-IPO companies',
    rsu: 'Large listed companies (MNCs, post-IPO firms)',
  },
  {
    aspect: 'Value if stock underperforms',
    esop: 'Can be worth ₹0 if strike price is above market price',
    rsu: 'Always worth something — it is a share, not an option on one',
  },
  {
    aspect: 'Tax event',
    esop: 'Perquisite tax on exercise, capital gains on sale',
    rsu: 'Perquisite tax at vesting (on fair market value), capital gains on sale',
  },
  {
    aspect: 'Typical vesting',
    esop: '1-year cliff, then vests over 4 years',
    rsu: '1-year cliff, then vests over 3–4 years',
  },
  {
    aspect: 'Liquidity',
    esop: 'Illiquid until a company exit/IPO/buyback window',
    rsu: 'Liquid immediately if the company is publicly listed',
  },
];

const BENEFITS_TO_ASK = [
  {
    title: 'Health insurance — sum insured and who it covers',
    detail:
      'Ask the exact sum insured (₹3L–10L+ range), whether parents are included or cost extra, co-pay clauses, room-rent capping, and whether pre-existing conditions have a waiting period on the group policy.',
  },
  {
    title: 'Joining / sign-on bonus clawback',
    detail:
      'A one-time bonus often comes with a payback clause if you leave within 6–12 months. Ask for the exact clawback period and whether it is prorated.',
  },
  {
    title: 'Notice period buyout',
    detail:
      'If switching jobs, ask whether the new employer buys out your remaining notice period, and whether that is a company policy or negotiated case-by-case.',
  },
  {
    title: 'Appraisal cycle eligibility',
    detail:
      'Some companies exclude you from that year’s review if you join after a cutoff date (e.g. within 3 months of the cycle). Ask explicitly so a "first review in 12 months" promise isn’t actually 18.',
  },
  {
    title: 'Relocation support',
    detail: 'A lump sum or reimbursement for moving cities — rarely offered unless asked for directly.',
  },
  {
    title: 'Remote / hybrid flexibility',
    detail: 'Get the actual policy in writing (days per week, core hours) rather than a verbal "we’re flexible."',
  },
  {
    title: 'Learning & development budget',
    detail: 'Certification or course reimbursement — a real perk at senior levels, easy to forget to ask about.',
  },
  {
    title: 'Probation and confirmation terms',
    detail: 'Length of probation, and what specifically triggers confirmation — some benefits (bonus eligibility, ESOP grant date) only start after confirmation.',
  },
];

const HR_CHECKLIST = [
  'Can you give me the fixed vs. variable split, not just the total CTC number?',
  'What percentage of variable pay was actually paid out company-wide in the last two cycles?',
  'Is the joining bonus subject to a clawback, and for how long?',
  'What’s the ESOP/RSU vesting schedule, and — if options — the strike price?',
  'Does the health cover include parents, and is there a co-pay?',
  'When is the next appraisal cycle, and am I eligible this year given my joining date?',
  'What will my realistic in-hand pay be after PF, professional tax, and income tax?',
  'Is there a payback clause on the signing bonus or relocation support if I leave early?',
];

export default function CompGuide() {
  return (
    <div className="panel active">
      <p className="guide-intro">
        Reference notes on how Indian corporate compensation is actually structured — useful for reading an offer
        letter or a CTC breakup sheet without the headline number doing all the talking.
      </p>

      <div className="cat-group">
        <div className="cat-title">CTC components — what's actually inside the number</div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Typical share</th>
                <th>Tax treatment</th>
                <th>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              {CTC_COMPONENTS.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.pct}</td>
                  <td>{c.tax}</td>
                  <td>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cat-group">
        <div className="cat-title">Old vs. new tax regime</div>
        <p className="guide-subnote">
          The new regime is the default unless you actively opt into the old one at the start of the financial year.
          Rates and limits shift most budgets — verify current figures before filing, this is the structure, not this
          year's exact numbers.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Old regime</th>
                <th>New regime</th>
              </tr>
            </thead>
            <tbody>
              {REGIME_COMPARISON.map((r) => (
                <tr key={r.aspect}>
                  <td>{r.aspect}</td>
                  <td>{r.old}</td>
                  <td>{r.neu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cat-group">
        <div className="cat-title">Equity: ESOPs vs. RSUs</div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>ESOPs</th>
                <th>RSUs</th>
              </tr>
            </thead>
            <tbody>
              {EQUITY_COMPARISON.map((e) => (
                <tr key={e.aspect}>
                  <td>{e.aspect}</td>
                  <td>{e.esop}</td>
                  <td>{e.rsu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cat-group">
        <div className="cat-title">Benefits worth asking about</div>
        <div className="guide-list">
          {BENEFITS_TO_ASK.map((b) => (
            <div className="guide-item" key={b.title}>
              <div className="guide-item-title">{b.title}</div>
              <div className="guide-item-detail">{b.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cat-group">
        <div className="cat-title">Questions to ask HR before you sign</div>
        <ul className="guide-checklist">
          {HR_CHECKLIST.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
