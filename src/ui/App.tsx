/**
 * App shell — the comparison explorer (minimal, gate-proving version).
 *
 * Every figure flows through <MetricValue>, so with an empty registry the whole app
 * honestly shows "data pending" and every verdict shows "no verdict — waiting on data".
 * When SOURCED_VALUES is populated, values and verdicts light up with no UI changes.
 */

import { useExplorer } from '../app/store';
import { DIMENSIONS, type Dimension } from '../contract/schema';
import { DIMENSION_LABELS, indicatorsForDimension } from '../compare/dimensions';
import { REGISTRY, VERDICTS } from '../contract/registry';
import { ACTIVE_CITIES } from '../contract/registry/geography';
import { MetricValue } from './MetricValue';
import { evaluateVerdict } from '../compare/verdict';
import { templatedExplainer } from '../explain/templated';

function cityLabel(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

function IndicatorRow({ indicatorId }: { indicatorId: string }): JSX.Element {
  const records = ACTIVE_CITIES.map(
    (city) => REGISTRY.find((r) => r.city === city && r.indicatorId === indicatorId)!,
  );
  return (
    <tr>
      <th scope="row">{records[0]!.definition}</th>
      {records.map((r) => (
        <td key={r.city}>
          <MetricValue record={r} />
        </td>
      ))}
    </tr>
  );
}

function VerdictPanel({ dimension }: { dimension: Dimension }): JSX.Element {
  const verdicts = VERDICTS.filter((v) => v.dimension === dimension);
  if (verdicts.length === 0) {
    return <p className="muted">This dimension is descriptive — shown as differences, never as a verdict.</p>;
  }
  return (
    <ul className="verdicts">
      {verdicts.map((v) => {
        const result = evaluateVerdict(v, REGISTRY);
        const ex = templatedExplainer.explainVerdict(result);
        return (
          <li key={v.verdictId} className={`verdict verdict--${result.status}`}>
            <strong>{ex.headline}</strong>
            <p>{ex.detail}</p>
            <ul className="caveats">
              {ex.caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

export function App(): JSX.Element {
  const { dimension, setDimension } = useExplorer();
  const indicators = indicatorsForDimension(dimension);

  return (
    <main className="app">
      <header>
        <h1>Car Contrast Lab</h1>
        <p className="tagline">
          How cities move — Prague · Vienna · Amsterdam. Evidence-led: every number and every
          verdict traces to a source, or shows as pending.
        </p>
      </header>

      <nav className="dimensions" aria-label="Comparison dimensions">
        {DIMENSIONS.map((d) => (
          <button
            key={d}
            className={d === dimension ? 'active' : ''}
            onClick={() => setDimension(d)}
          >
            {DIMENSION_LABELS[d]}
          </button>
        ))}
      </nav>

      <section aria-label="Indicators">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Indicator</th>
              {ACTIVE_CITIES.map((c) => (
                <th scope="col" key={c}>
                  {cityLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indicators.map((i) => (
              <IndicatorRow key={i.indicatorId} indicatorId={i.indicatorId} />
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="What is better, and why">
        <h2>What is better, and why</h2>
        <VerdictPanel dimension={dimension} />
      </section>

      <footer>
        <p className="muted">
          Data-first gate active: with an unpopulated registry, all figures read “data pending”
          and all verdicts are withheld. See docs/DATA_LINKS.md.
        </p>
      </footer>
    </main>
  );
}
