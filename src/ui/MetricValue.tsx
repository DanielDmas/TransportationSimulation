/**
 * MetricValue — the component-level data-first gate.
 *
 * It accepts a MetricRecord (never a bare number) and renders EITHER a sourced value
 * with a provenance chip OR a neutral "data pending" state. There is no prop by which a
 * caller can push an unsourced number through this component.
 */

import { resolveMetric } from '../contract/validate';
import type { MetricRecord } from '../contract/schema';

export function MetricValue({ record }: { record: MetricRecord }): JSX.Element {
  const resolved = resolveMetric(record);

  if (resolved.status === 'pending') {
    return (
      <span className="metric metric--pending" title={`Intended source: ${resolved.def.intendedSource}`}>
        <span className="metric__value">data pending</span>
        <span className="metric__unit">{resolved.def.unit}</span>
      </span>
    );
  }

  const { value, def } = resolved;
  const provenance =
    `${def.definition}\n` +
    `${value.value} ${def.unit} · ${value.year}\n` +
    `${def.geography}\n` +
    `Source: ${value.source} (tier ${value.tier}) — ${value.methodology}\n` +
    `Confidence: ${value.confidence} · retrieved ${value.retrievedDate}`;

  return (
    <span className="metric metric--sourced" title={provenance}>
      <span className="metric__value">
        {value.value}
        {def.unit.startsWith('%') ? '%' : ''}
      </span>
      {!def.unit.startsWith('%') && <span className="metric__unit">{def.unit}</span>}
      <a className="metric__src" href={value.sourceUrl} target="_blank" rel="noreferrer">
        source
      </a>
    </span>
  );
}
