import { K_PUBLISHED, K_EXACT, rcfFromRpm, rpmFromRcf, radiusToCm, timesInteger, ratioOf, display, displayRatio, unrounded, unroundedGrouped, decimalValue, } from './arithmetic.js';
import { validate } from './declarations.js';
import { compareRadii } from './comparison.js';
export const HEADINGS = Object.freeze({
    relation: 'The relation',
    derivation: 'Where the constant comes from',
    definitions: 'r_max, r_min and r_avg',
    why: 'Why these details are asked',
    diameter: 'Radius, not diameter',
    ratio: 'The two radii',
});
export const PUBLISHED_LABEL = 'with the published constant, used';
export const EXACT_LABEL = 'with the exact constant, for comparison only, not used';
export const HYPOTHETICAL_LABEL = 'Example with a hypothetical radius (not your numbers)';
export const RELATION = 'RCF = 1.118 × 10⁻⁵ × r(cm) × rpm²';
export const RELATION_INVERSE = 'rpm = √( RCF / (1.118 × 10⁻⁵ × r(cm)) )';
export const DERIVATION = '(2π/60)² / 980.665 = 1.118244 × 10⁻⁵ (7 s.f.)';
export const CONSTANT_LINE = 'The published constant is 0.022% lower than the exact one.';
export const FIGURE = 'Use the figure your rotor maker gives.';
export const DEFINITIONS = Object.freeze([
    'r_max: from the centre of the rotor to the point of the sample furthest from it, usually the bottom of the tube.',
    'r_min: from the centre of the rotor to the point of the sample nearest to it.',
    'r_avg: a radius between the two, usually midway; your rotor maker states the value it uses.',
]);
export const WHY = Object.freeze({
    basis: 'At the same speed, the bottom of a tube feels more × g than the top. Saying which radius you used makes the number repeatable.',
    rotor: 'Another lab needs to know the rotor to compare its spin with yours.',
    source: 'So a reader can check where the radius came from.',
    tube: 'The tube and any adaptor change where the sample sits, and so the radius. The tool records the tube; it does not compute with it. Use the radius your rotor maker gives for this tube or adaptor.',
});
export const REPORT_LINE = 'Report the × g; the rpm is only the setting for this rotor.';
export const DIAMETER_LINE = "Typing the rotor's diameter instead of its radius doubles the × g.";
export const DIAMETER_LINE_INVERSE = "Typing the rotor's diameter instead of its radius gives an rpm that delivers only half the target × g.";
export const WORKED_EXAMPLE = Object.freeze({
    direction: 'rpm-to-g', speed: '14000', radius: '8.5', unit: 'cm', basis: 'r_max',
    rotor: '[example rotor]', tube: '[example tube]', source: '[this worked example]',
});
function hypothetical() {
    const rpm = { n: 14000n, e: 0 };
    const a = rcfFromRpm(rpm, { n: 85n, e: 1 });
    const b = rcfFromRpm(rpm, { n: 60n, e: 1 });
    const rcf = [display(a), display(b)];
    const fold = `${displayRatio(ratioOf(a, b))}-fold`;
    return {
        label: HYPOTHETICAL_LABEL,
        text: `At 14,000 rpm, a radius of 8.5 cm gives ${rcf[0]} × g, and a hypothetical radius of 6.0 cm gives ${rcf[1]} × g. The × g at 8.5 cm is ${fold} that at 6.0 cm, the same as the ratio of the radii, 8.5 / 6.0: × g scales with radius.`,
        speed: '14,000',
        radii: ['8.5', '6.0'],
        rcf,
        ratioDisplay: displayRatio(ratioOf(a, b)),
        fold,
    };
}
function twiceRadius(parsedRadius) {
    const d = { n: parsedRadius.value.n * 2n, e: parsedRadius.value.e };
    return unroundedGrouped(decimalValue(d));
}
export function learnContent(inputs) {
    const forward = (inputs.direction === undefined ? 'rpm-to-g' : inputs.direction) === 'rpm-to-g';
    const res = validate(inputs);
    const ok = res.status === 'ok';
    const content = {
        order: ['relation', 'derivation', 'definitions', 'why', 'diameter', 'hypothetical', 'ratio'],
        relation: { text: forward ? RELATION : RELATION_INVERSE, published: RELATION },
        derivation: { text: DERIVATION, constantLine: CONSTANT_LINE, values: null },
        definitions: { items: DEFINITIONS, figure: FIGURE },
        why: { basis: WHY.basis, rotor: WHY.rotor, source: WHY.source, tube: WHY.tube, reportLine: REPORT_LINE },
        diameter: forward ? DIAMETER_LINE : DIAMETER_LINE_INVERSE,
        conditional: null,
        hypothetical: hypothetical(),
        ratioLine: null,
        workedExample: WORKED_EXAMPLE,
    };
    if (!ok)
        return content;
    const rCm = radiusToCm(res.parsed.radius.value, inputs.unit);
    if (forward) {
        const pub = rcfFromRpm(res.parsed.speed.value, rCm, K_PUBLISHED);
        const exa = rcfFromRpm(res.parsed.speed.value, rCm, K_EXACT);
        content.derivation.values = {
            unit: '× g',
            published: { label: PUBLISHED_LABEL, constant: '1.118 × 10⁻⁵', display: display(pub), unrounded: unrounded(pub) },
            exact: { label: EXACT_LABEL, constant: '1.118244 × 10⁻⁵', display: display(exa), unrounded: unrounded(exa) },
        };
        content.conditional = `Had you typed twice this radius, ${twiceRadius(res.parsed.radius)} ${inputs.unit}, the result would be ${display(timesInteger(pub, 2))} × g.`;
        const cmp = compareRadii(inputs);
        if (cmp.ratio)
            content.ratioLine = cmp.ratio.line;
    }
    else {
        const pub = rpmFromRcf(res.parsed.speed.value, rCm, K_PUBLISHED);
        const exa = rpmFromRcf(res.parsed.speed.value, rCm, K_EXACT);
        content.derivation.values = {
            unit: 'rpm',
            published: { label: PUBLISHED_LABEL, constant: '1.118 × 10⁻⁵', display: display(pub), unrounded: unrounded(pub) },
            exact: { label: EXACT_LABEL, constant: '1.118244 × 10⁻⁵', display: display(exa), unrounded: unrounded(exa) },
        };
    }
    return content;
}
