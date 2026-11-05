import { validate } from './declarations.js';
import { rcfFromRpm, radiusToCm, ratioOf, display, displayRatio, unrounded, unroundedGrouped } from './arithmetic.js';
const RANK = Object.freeze({ r_min: 0, r_avg: 1, r_max: 2 });
export function orderingFlagText(smallerBasis, largerBasis) {
    return `As typed, ${smallerBasis} is not smaller than ${largerBasis}. Check the rotor manual.`;
}
export function ratioLine(rcf1, rcf2, ratio) {
    return `${rcf1} / ${rcf2} = ${ratio}, the same as the ratio of the radii: × g scales with radius.`;
}
function cmpDecimal(a, b) {
    const l = a.n * 10n ** BigInt(b.e);
    const r = b.n * 10n ** BigInt(a.e);
    return l < r ? -1 : l > r ? 1 : 0;
}
export function orderingFlag(basis1, rCm1, basis2, rCm2) {
    const firstIsSmaller = RANK[basis1] < RANK[basis2];
    const [smallerBasis, smallerCm, largerBasis, largerCm] = firstIsSmaller
        ? [basis1, rCm1, basis2, rCm2]
        : [basis2, rCm2, basis1, rCm1];
    return cmpDecimal(smallerCm, largerCm) >= 0 ? orderingFlagText(smallerBasis, largerBasis) : null;
}
function row(basis, parsedRadius, unit, speed) {
    const rCm = radiusToCm(parsedRadius.value, unit);
    const rcf = rcfFromRpm(speed.value, rCm);
    return {
        basis,
        typed: parsedRadius.typed,
        unit,
        rCm,
        rcf,
        unrounded: unrounded(rcf),
        display: display(rcf),
        operand: unroundedGrouped(rcf),
    };
}
export function compareRadii(inputs) {
    const res = validate(inputs);
    const empty = { rows: [], ratio: null, orderingFlag: null };
    if (res.status !== 'ok')
        return { status: 'refused', refusals: res.refusals, ...empty };
    const forward = (inputs.direction === undefined ? 'rpm-to-g' : inputs.direction) === 'rpm-to-g';
    if (!forward)
        return { status: 'ok', refusals: [], ...empty };
    const row1 = row(inputs.basis, res.parsed.radius, inputs.unit, res.parsed.speed);
    if (!res.parsed.radius2)
        return { status: 'ok', refusals: [], rows: [row1], ratio: null, orderingFlag: null };
    const row2 = row(inputs.basis2, res.parsed.radius2, inputs.unit2, res.parsed.speed);
    const exact = ratioOf(row1.rcf, row2.rcf);
    const ratio = { unrounded: unrounded(exact), display: displayRatio(exact) };
    ratio.line = ratioLine(row1.operand, row2.operand, ratio.display);
    return {
        status: 'ok',
        refusals: [],
        rows: [row1, row2],
        ratio,
        orderingFlag: orderingFlag(row1.basis, row1.rCm, row2.basis, row2.rCm),
    };
}
