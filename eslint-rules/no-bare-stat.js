/**
 * Custom ESLint rule: no-bare-stat.
 *
 * Layer 3 of the data-first gate. Flags a bare numeric literal rendered directly in JSX
 * — e.g. `<td>{25}</td>` or a text node that is just "25%". Real statistics must flow
 * through <MetricValue> (which reads from a resolved, sourced registry record), so a
 * hardcoded number in the view is almost always an un-sourced claim sneaking in.
 *
 * Allowed: member/most expressions (`{value.value}`), and small structural literals
 * 0 and 1. The type system is the primary guarantee; this catches view-layer slips.
 */

const ALLOWED_NUMBERS = new Set([0, 1, -1]);
const PURE_NUMBER_TEXT = /^\s*-?\d+(?:[.,]\d+)?\s*%?\s*$/;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow bare numeric statistics in JSX; route them through MetricValue.' },
    schema: [],
    messages: {
      bareLiteral:
        'Bare numeric literal in JSX. Statistics must come from a sourced registry record via <MetricValue>, not a hardcoded number.',
      bareText:
        'JSX text is a bare number/percentage. Statistics must come from a sourced registry record via <MetricValue>.',
    },
  },
  create(context) {
    return {
      JSXExpressionContainer(node) {
        const expr = node.expression;
        if (expr && expr.type === 'Literal' && typeof expr.value === 'number') {
          if (!ALLOWED_NUMBERS.has(expr.value)) {
            context.report({ node: expr, messageId: 'bareLiteral' });
          }
        }
      },
      JSXText(node) {
        if (PURE_NUMBER_TEXT.test(node.value) && /\d/.test(node.value)) {
          context.report({ node, messageId: 'bareText' });
        }
      },
    };
  },
};
