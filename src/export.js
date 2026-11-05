import { CONFIG, citationText, toolUrl } from './config.js';
import { validate } from './declarations.js';
import { compareRadii } from './comparison.js';
import { K_EXACT, rcfFromRpm, rpmFromRcf, radiusToCm, display, unrounded, decimalValue } from './arithmetic.js';
import { RELATION, RELATION_INVERSE } from './learn.js';
export const ROUNDING_RULE = 'Computed × g and rpm values are displayed rounded half-up from the exact value: a whole number at 100 or more, otherwise 3 significant figures. A ratio is displayed to 3 significant figures at any size. Typed inputs are never rounded. In this file, every × g value and the radius in cm are exact; a computed rpm and a ratio are rounded half-up to 15 significant figures, and the displayed figures were rounded from the exact value, not from these.';
export const COMPARISON_NOTE = 'for comparison only, not used';
const DIRECTION_TEXT = Object.freeze({ 'rpm-to-g': 'rpm to × g', 'g-to-rpm': '× g to rpm' });
const pad = (n) => String(n).padStart(2, '0');
export function stamp(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}`;
}
export const exportedAtText = (date) => `${stamp(date).slice(0, 13)}:${stamp(date).slice(13)}`;
export const fileNameFor = (date) => `rpm-to-g-${stamp(date)}.json`;
const VALUE_UNITS = Object.freeze({ rcf: '× g', rcf2: '× g', rpm: 'rpm', radiusCm: 'cm', ratio: 'no unit (rcf / rcf2)' });
const withUnit = (o) => {
    const out = {};
    for (const k of Object.keys(o))
        out[k] = VALUE_UNITS[k] ? { ...o[k], unit: VALUE_UNITS[k] } : o[k];
    return out;
};
const hasText = (s) => s !== undefined && s !== null && String(s).trim() !== '';
export function buildExport(inputs, record, exportAt) {
    if (!record || record.status !== 'result')
        return null;
    const forward = (inputs.direction === undefined ? 'rpm-to-g' : inputs.direction) === 'rpm-to-g';
    const inp = {};
    inp[forward ? 'speed' : 'target'] = inputs.speed;
    inp[forward ? 'speedUnit' : 'targetUnit'] = forward ? 'rpm' : '× g';
    inp.radius = { value: inputs.radius, unit: inputs.unit, basis: inputs.basis };
    if (forward && hasText(inputs.radius2))
        inp.radius2 = { value: inputs.radius2, unit: inputs.unit2, basis: inputs.basis2 };
    inp.rotor = inputs.rotor;
    inp.source = inputs.source;
    inp.tube = inputs.tube;
    const radiusCm = { first: record.outputs.radiusCm.unrounded };
    radiusCm.unit = 'cm';
    const cmp = { constant: '1.118244 × 10⁻⁵', note: COMPARISON_NOTE };
    if (forward) {
        const rows = compareRadii(inputs).rows;
        if (rows[1])
            radiusCm.second = unrounded(decimalValue(rows[1].rCm));
        const exact = rows.map((r) => rcfFromRpm(validate(inputs).parsed.speed.value, r.rCm, K_EXACT));
        cmp.rcf = { unrounded: unrounded(exact[0]), display: display(exact[0]), unit: '× g' };
        if (exact[1])
            cmp.rcf2 = { unrounded: unrounded(exact[1]), display: display(exact[1]), unit: '× g' };
    }
    else {
        const res = validate(inputs);
        const v = rpmFromRcf(res.parsed.speed.value, radiusToCm(res.parsed.radius.value, inputs.unit), K_EXACT);
        cmp.rpm = { unrounded: unrounded(v), display: display(v), unit: 'rpm' };
    }
    const out = {
        tool: CONFIG.toolTitle,
        version: CONFIG.version,
        exportedAt: exportAt,
        citation: citationText(),
        url: toolUrl(),
        direction: DIRECTION_TEXT[forward ? 'rpm-to-g' : 'g-to-rpm'],
        inputs: inp,
        radiusCm,
        relation: forward ? RELATION : RELATION_INVERSE,
        constant: '1.118 × 10⁻⁵',
        values: withUnit(record.outputs),
        roundingRule: ROUNDING_RULE,
        methods: record.sentences.methods,
        comparison: cmp,
    };
    if (record.texts && record.texts.roundingLine)
        out.roundingLine = record.texts.roundingLine;
    return JSON.stringify(out, null, 2) + '\n';
}
export function makeExport(inputs, record) {
    const now = new Date();
    const text = buildExport(inputs, record, exportedAtText(now));
    return text === null ? null : { text, fileName: fileNameFor(now) };
}
