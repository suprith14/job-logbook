'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import type { DBRecommendation, DBScenarioSet } from '../types';

interface DBType {
  type: string;
  examples: string;
  bestFor: string;
  tradeoff: string;
  consistency: string;
  usedBy: string;
  sampleQuery: string;
}

const DB_TYPES: DBType[] = [
  {
    type: 'Relational (SQL)',
    examples: 'PostgreSQL, MySQL, SQL Server, Oracle',
    bestFor: 'Transactional systems, financial data, anything needing strong consistency and complex relationships across tables.',
    tradeoff: 'Harder to horizontally scale writes past a point; schema changes need migrations, not just "add a field."',
    consistency: 'Strongly consistent (ACID) on a single primary — the classic "CA" corner of CAP, at the cost of partition tolerance without extra sharding work.',
    usedBy: 'Stripe runs financial transaction data on relational databases specifically for the ACID guarantees around money.',
    sampleQuery: 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1; -- debit\nUPDATE accounts SET balance = balance + 100 WHERE id = 2; -- credit\nCOMMIT; -- both rows change together, or neither does',
  },
  {
    type: 'Document',
    examples: 'MongoDB, Couchbase, Firestore',
    bestFor: 'Rapidly evolving product data, content catalogs, anything where different records naturally have different shapes.',
    tradeoff: 'Easy to end up with inconsistent document shapes across your collection without application-level discipline.',
    consistency: 'Single-document writes are atomic; consistency across multiple documents/replicas is tunable and often eventual at scale.',
    usedBy: 'eBay uses MongoDB-style document stores for parts of its product catalog, where item attributes vary wildly by category.',
    sampleQuery: 'db.products.insertOne({\n  name: "Running shoes",\n  attributes: { size: 9, color: "blue" }, // a laptop document would have totally different fields\n});',
  },
  {
    type: 'Key-Value',
    examples: 'Redis, DynamoDB, Memcached',
    bestFor: 'Caching, session storage, rate-limiting counters, feature flags — anything that\'s a simple, extremely fast lookup by key.',
    tradeoff: 'No complex queries or joins — you design around your access patterns upfront, not after the fact.',
    consistency: 'Redis (single-node) is effectively strongly consistent; DynamoDB offers a tunable choice between strong and eventual per read.',
    usedBy: 'Twitter uses Redis heavily to cache timelines; Amazon built DynamoDB in-house for its own cart/session workloads.',
    sampleQuery: 'SET session:abc123 "{\\"userId\\":42}" EX 3600  # expires automatically after 1 hour\nINCR rate:user:42                              # atomic counter, no read-then-write race',
  },
  {
    type: 'Wide-Column / Columnar',
    examples: 'Cassandra, HBase, Bigtable',
    bestFor: 'Huge write volumes distributed across nodes — IoT sensor data, activity logs, anything append-heavy at massive scale.',
    tradeoff: "No ad-hoc queries outside your partition/sort key design; typically eventually consistent, not strongly consistent by default.",
    consistency: 'AP-leaning — availability and partition tolerance prioritized, with tunable consistency levels per query (e.g. QUORUM).',
    usedBy: 'Discord stored years of chat message history on Cassandra (later migrating to ScyllaDB) specifically for this write-heavy pattern.',
    sampleQuery: "INSERT INTO messages (channel_id, message_id, text) VALUES (101, now(), 'hello');\n-- channel_id is the partition key: it decides which node owns this row",
  },
  {
    type: 'Graph',
    examples: 'Neo4j, Amazon Neptune',
    bestFor: 'Social networks, fraud-ring detection, recommendation engines — anything where the relationships ARE the data.',
    tradeoff: "Overkill for data that isn't fundamentally relationship-heavy; smaller talent pool and tooling ecosystem than SQL.",
    consistency: 'Typically strongly consistent on a single instance; distributed graph setups trade some of that for scale.',
    usedBy: "LinkedIn's Economic Graph and similar recommendation systems rely on graph traversal for \"people you may know\"-style features.",
    sampleQuery: 'MATCH (a:Person)-[:FRIENDS_WITH]->(b)-[:FRIENDS_WITH]->(c)\nWHERE a.name = "Alice" AND NOT (a)-[:FRIENDS_WITH]->(c)\nRETURN c.name AS suggestion -- friend-of-a-friend, not yet connected to Alice',
  },
  {
    type: 'Time-Series',
    examples: 'InfluxDB, TimescaleDB, Prometheus',
    bestFor: 'Metrics, monitoring, IoT telemetry, financial tick data — built-in retention and downsampling for timestamped data.',
    tradeoff: 'Not a general-purpose store — awkward for lookups that aren\'t primarily indexed by time.',
    consistency: 'Usually AP — write throughput is prioritized over strict consistency, since a slightly-stale dashboard rarely matters.',
    usedBy: 'Prometheus (paired with Grafana) is the de facto standard for infrastructure metrics across most modern engineering orgs.',
    sampleQuery: "INSERT INTO cpu_metrics (time, host, usage) VALUES (now(), 'server-1', 87.3);\nSELECT time_bucket('5 minutes', time), avg(usage)\nFROM cpu_metrics GROUP BY 1; -- downsampled rollup, not a scan of every raw point",
  },
  {
    type: 'Search Engine',
    examples: 'Elasticsearch, OpenSearch, Algolia',
    bestFor: 'Full-text product/content search, log search, autocomplete — relevance ranking and typo-tolerance a SQL LIKE can\'t match.',
    tradeoff: 'Not your source of truth — usually synced from a primary database; eventually consistent, operationally heavier.',
    consistency: 'Near-real-time, not immediate — a typical refresh interval means a new document is searchable roughly a second later, not instantly.',
    usedBy: "GitHub's code search and most e-commerce search bars run on Elasticsearch/OpenSearch rather than a database's native search.",
    sampleQuery: 'GET /products/_search\n{ "query": { "match": { "name": "running shoes" } } } // relevance-ranked, typo-tolerant',
  },
  {
    type: 'In-Memory / Cache',
    examples: 'Redis, Memcached',
    bestFor: 'A layer in front of a primary database to absorb read load, plus ephemeral data and pub/sub.',
    tradeoff: 'Real data-loss risk if not persisted; another layer whose invalidation/consistency you now have to get right.',
    consistency: 'Only as consistent as your invalidation strategy — cache-aside is eventually consistent with the source of truth by design.',
    usedBy: "Facebook's Memcached deployment is one of the largest in the world, absorbing read traffic that would otherwise hit MySQL directly.",
    sampleQuery: 'const cached = await redis.get(`user:${id}`);\nif (cached) return JSON.parse(cached); // cache hit — database is never touched\nconst user = await db.users.findById(id);\nawait redis.set(`user:${id}`, JSON.stringify(user), \'EX\', 300); // cached for 5 minutes',
  },
  {
    type: 'NewSQL (distributed SQL)',
    examples: 'CockroachDB, Google Spanner, TiDB',
    bestFor: 'Global-scale apps that need SQL semantics AND horizontal scale — multi-region financial or inventory systems.',
    tradeoff: 'More operational complexity than a single-node Postgres; higher latency for strongly-consistent cross-region writes.',
    consistency: 'Strongly consistent (CP) even across regions — the whole point of this category is not trading consistency away for scale.',
    usedBy: "Google's own AdWords billing system runs on Spanner specifically because it needed both global scale and strict consistency.",
    sampleQuery: "-- looks and behaves like ordinary SQL, but rows are automatically sharded/replicated across regions\nINSERT INTO orders (id, region, total) VALUES (gen_random_uuid(), 'us-east', 49.99);",
  },
  {
    type: 'Vector',
    examples: 'Pinecone, Weaviate, pgvector',
    bestFor: 'AI/LLM features — semantic search, RAG, "find similar items" via embeddings and nearest-neighbor search.',
    tradeoff: "Newer, still-maturing tooling — usually paired alongside a primary database rather than replacing one entirely.",
    consistency: 'Varies by product, usually eventual — most vector stores are built as a search layer, not a system of record.',
    usedBy: 'Most retrieval-augmented-generation (RAG) products built on top of LLMs use a vector store like this to fetch relevant context.',
    sampleQuery: "SELECT content FROM documents\nORDER BY embedding <-> '[0.12, 0.87, ...]'::vector -- pgvector: nearest-neighbor by distance, not exact match\nLIMIT 5;",
  },
];

interface ScenarioRec {
  scenario: string;
  recommended: string;
  why: string;
  whenToReconsider: string;
}

const SCENARIO_RECOMMENDATIONS: ScenarioRec[] = [
  {
    scenario: 'User accounts, orders, payments — needs strong consistency',
    recommended: 'PostgreSQL / MySQL',
    why: 'ACID transactions prevent double-charging or lost orders; mature tooling and joins make reporting straightforward.',
    whenToReconsider: 'Once write throughput genuinely outgrows a single primary — that\'s when read replicas or a NewSQL migration enter the conversation, not before.',
  },
  {
    scenario: 'Session storage / rate limiting',
    recommended: 'Redis',
    why: 'Sub-millisecond reads/writes, built-in TTL/expiry, and atomic increment operations designed exactly for this.',
    whenToReconsider: 'If session data must survive a cache restart/eviction, pair it with a persisted fallback rather than trusting Redis alone.',
  },
  {
    scenario: 'Product catalog with attributes that vary a lot by category',
    recommended: 'MongoDB (or Postgres with JSONB)',
    why: 'Schema flexibility avoids constant migrations as product attributes vary — a "shoe" and a "laptop" don\'t share fields.',
    whenToReconsider: 'If you need atomic transactions across multiple documents (e.g. bundle pricing), verify your setup actually supports that — don\'t assume it does.',
  },
  {
    scenario: 'Full-text search with typo-tolerance and filters',
    recommended: 'Elasticsearch / OpenSearch / Algolia',
    why: "A purpose-built inverted index and relevance ranking that a SQL LIKE '%query%' can't match at any real scale.",
    whenToReconsider: 'If results must be instantly consistent with the primary database the moment it changes, budget explicitly for that sync lag.',
  },
  {
    scenario: 'IoT sensor data / app metrics at massive write volume',
    recommended: 'Cassandra or a time-series DB (InfluxDB/TimescaleDB)',
    why: 'Designed for high-throughput timestamped writes distributed across nodes, with automatic retention and downsampling.',
    whenToReconsider: 'Watch retention costs closely — raw, un-downsampled high-cardinality data gets expensive fast if nobody\'s pruning it.',
  },
  {
    scenario: 'Social graph, friend recommendations, fraud ring detection',
    recommended: 'Neo4j (graph database)',
    why: 'Relationship traversal — friends-of-friends, shortest path — is native and fast; painfully slow as recursive SQL joins.',
    whenToReconsider: 'If most of your actual queries are simple single-hop lookups, not multi-hop traversals, you may be solving a problem you don\'t have yet.',
  },
  {
    scenario: 'Global multi-region app needing strong consistency at scale',
    recommended: 'CockroachDB / Google Spanner',
    why: 'SQL semantics with horizontal scale and multi-region consistency, without hand-rolling your own sharding logic.',
    whenToReconsider: 'Don\'t reach for this until you have actual multi-region WRITE traffic — multi-region reads alone are solved more simply with read replicas.',
  },
  {
    scenario: '"Find similar items/documents" via AI embeddings',
    recommended: 'A vector database (Pinecone, pgvector)',
    why: "Nearest-neighbor search over embeddings isn't something a standard relational index is built to do efficiently.",
    whenToReconsider: 'Keep it as a sidecar to your primary database, not your only copy of the data — most vector stores aren\'t built to be a system of record.',
  },
  {
    scenario: 'Real-time leaderboard / live counters',
    recommended: 'Redis (sorted sets)',
    why: 'Atomic increments and ranked range reads at sub-millisecond latency — exactly what a sorted set is designed for.',
    whenToReconsider: 'If the leaderboard must survive a cache flush, persist a periodic snapshot to your primary database as a backstop.',
  },
  {
    scenario: 'Analytics/reporting over huge historical datasets',
    recommended: 'A columnar warehouse (BigQuery, Snowflake, ClickHouse)',
    why: 'Column-oriented storage makes aggregate queries over billions of rows fast — not meant for single-row transactional lookups.',
    whenToReconsider: 'Never point live application request traffic at the warehouse directly — it\'s optimized for big scans, not point lookups under load.',
  },
  {
    scenario: 'Simple MVP / early-stage startup, unsure of future scale',
    recommended: 'PostgreSQL',
    why: 'The reasonable default unless you have a specific reason not to — flexible enough (JSONB) for semi-structured needs, huge ecosystem.',
    whenToReconsider: 'Only once you hit a genuine, measured scaling problem — not a hypothetical one — is it worth reconsidering.',
  },
  {
    scenario: 'Shopping cart / inventory with high read-write concurrency',
    recommended: 'Redis (hot path) + PostgreSQL (source of truth)',
    why: 'A common hybrid: a fast cache absorbs the hot-path traffic while the relational store stays the durable, consistent record.',
    whenToReconsider: 'The classic failure mode is letting the cache silently drift from the source of truth — invalidate explicitly, don\'t just rely on a TTL.',
  },
];

interface DatabaseGuideProps {
  dbScenarioSets: DBScenarioSet[];
  setDbScenarioSets: Dispatch<SetStateAction<DBScenarioSet[]>>;
  isAdmin: boolean;
}

export default function DatabaseGuide({ dbScenarioSets, setDbScenarioSets, isAdmin }: DatabaseGuideProps) {
  const [scenario, setScenario] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedRecs, setGeneratedRecs] = useState<DBRecommendation[] | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleIn(setFn: Dispatch<SetStateAction<Set<string>>>, key: string) {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function generate() {
    const s = scenario.trim();
    if (!s || !isAdmin) return;
    setGenerating(true);
    setGenerateError('');
    setGeneratedRecs(null);
    try {
      const res = await fetch('/api/db-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: s }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGenerateError(data.error || 'Something went wrong. Try again.');
        return;
      }
      setGeneratedRecs(data.recommendations || []);
    } catch (err) {
      setGenerateError('Network error — try again.');
    } finally {
      setGenerating(false);
    }
  }

  function saveGenerated() {
    if (!generatedRecs || !isAdmin) return;
    setDbScenarioSets((prev) => [
      { id: `db${Date.now()}${Math.random()}`, scenario: scenario.trim(), recommendations: generatedRecs },
      ...prev,
    ]);
    setGeneratedRecs(null);
    setScenario('');
  }

  function discardGenerated() {
    setGeneratedRecs(null);
    setGenerateError('');
  }

  function deleteSet(id: string) {
    if (!isAdmin) return;
    setDbScenarioSets((prev) => prev.filter((s) => s.id !== id));
  }

  function renderRecCard(r: DBRecommendation, i: number, key: string | number) {
    return (
      <div className="qa-card" key={key}>
        <span className="qa-category-tag">{i === 0 ? 'Best fit' : 'Alternative'}</span>
        <div className="qa-question">{r.name}</div>
        <p className="tech-explanation">{r.why}</p>
        <div className="qa-answer qa-wrong">
          <span className="qa-tag">Tradeoff</span>
          <span>{r.tradeoffs}</span>
        </div>
        {r.usedBy && (
          <div className="qa-answer qa-right">
            <span className="qa-tag">Used by</span>
            <span>{r.usedBy}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel active">
      <p className="guide-intro">
        A quick-decision reference for database choice — what the major categories are actually good at, a
        scenario-by-scenario cheat sheet for production decisions, and a spot to ask about any scenario of your own.
        Click any row for the deeper detail: consistency model, who actually runs it in production, and a sample
        query.
      </p>

      <div className="cat-group">
        <div className="cat-title">Types of databases</div>
        <div className="qa-list">
          {DB_TYPES.map((d) => {
            const isExpanded = expandedTypes.has(d.type);
            return (
              <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={d.type}>
                <div className="qa-question-row tech-card-header" onClick={() => toggleIn(setExpandedTypes, d.type)}>
                  <div>
                    <span className="qa-category-tag">{d.examples}</span>
                    <div className="qa-question">{d.type}</div>
                    <p className="tech-explanation">{d.bestFor}</p>
                  </div>
                  <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                </div>
                {isExpanded && (
                  <>
                    <div className="qa-answer qa-wrong">
                      <span className="qa-tag">Tradeoff</span>
                      <span>{d.tradeoff}</span>
                    </div>
                    <div className="qa-answer qa-right">
                      <span className="qa-tag">Consistency model</span>
                      <span>{d.consistency}</span>
                    </div>
                    <div className="qa-answer qa-right">
                      <span className="qa-tag">Used by</span>
                      <span>{d.usedBy}</span>
                    </div>
                    <CodeBlock code={d.sampleQuery} language="javascript" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="cat-group">
        <div className="cat-title">Which is best — production scenarios</div>
        <div className="qa-list">
          {SCENARIO_RECOMMENDATIONS.map((s) => {
            const isExpanded = expandedScenarios.has(s.scenario);
            return (
              <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={s.scenario}>
                <div className="qa-question-row tech-card-header" onClick={() => toggleIn(setExpandedScenarios, s.scenario)}>
                  <div>
                    <span className="qa-category-tag">{s.recommended}</span>
                    <div className="qa-question">{s.scenario}</div>
                  </div>
                  <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                </div>
                {isExpanded && (
                  <>
                    <div className="qa-answer qa-right">
                      <span className="qa-tag">Why</span>
                      <span>{s.why}</span>
                    </div>
                    <div className="qa-answer qa-wrong">
                      <span className="qa-tag">When to reconsider</span>
                      <span>{s.whenToReconsider}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin && (
        <div className="add-form qa-form" style={{ marginBottom: 24 }}>
          <div className="cat-title">✦ Recommend a database for my scenario</div>
          <textarea
            className="qa-textarea"
            rows={2}
            placeholder='Describe your scenario, e.g. "storing chat messages for a real-time messaging app with millions of users"'
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
          <button className="add-concept-btn" onClick={generate} disabled={generating || !scenario.trim()}>
            {generating ? 'Generating…' : '✦ Recommend a database'}
          </button>

          {generateError && <div className="discover-error">{generateError}</div>}

          {generatedRecs && (
            <div className="suggestions-panel">
              <div className="cat-title">{scenario} — review before saving</div>
              <div className="qa-list">{generatedRecs.map((r, i) => renderRecCard(r, i, i))}</div>
              <div className="edit-actions">
                <button onClick={saveGenerated}>+ Save this recommendation</button>
                <button className="ghost-btn" onClick={discardGenerated}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {dbScenarioSets.length > 0 && (
        <div className="qa-list">
          {dbScenarioSets.map((set) => {
            const isExpanded = expandedIds.has(set.id);
            return (
              <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={set.id}>
                <div className="qa-question-row tech-card-header" onClick={() => toggleIn(setExpandedIds, set.id)}>
                  <div>
                    <span className="qa-category-tag">{set.recommendations.length} options</span>
                    <div className="qa-question">{set.scenario}</div>
                  </div>
                  <div className="tech-card-header-right">
                    {isAdmin && (
                      <div className="qa-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="del-btn" onClick={() => deleteSet(set.id)} title="Delete">
                          ✕
                        </button>
                      </div>
                    )}
                    <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="qa-list" style={{ marginTop: 8 }}>
                    {set.recommendations.map((r, i) => renderRecCard(r, i, i))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
