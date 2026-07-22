/**
 * CI gate: fail the build if the registry or verdict catalog is structurally invalid.
 * Run via `npm run validate:registry`.
 */

import { REGISTRY, VERDICTS } from '../src/contract/registry/index';
import { validateRegistry, validateVerdicts } from '../src/contract/validate';

const registryIssues = validateRegistry(REGISTRY);
const verdictIssues = validateVerdicts(VERDICTS, REGISTRY);
const all = [...registryIssues, ...verdictIssues];

if (all.length > 0) {
  console.error(`Registry validation FAILED with ${all.length} issue(s):`);
  for (const i of all) console.error(`  - [${i.metricId}] ${i.problem}`);
  process.exit(1);
}

const sourced = REGISTRY.filter((r) => r.value !== 'PENDING').length;
console.log(
  `Registry OK: ${REGISTRY.length} metrics (${sourced} sourced, ${REGISTRY.length - sourced} pending), ` +
    `${VERDICTS.length} verdicts well-formed.`,
);
