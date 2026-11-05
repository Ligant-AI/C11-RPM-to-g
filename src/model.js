import { rpmFromRcf, radiusToCm, display, unrounded, unroundedGrouped, decimalValue, FIELD_NAMES } from './arithmetic.js';
import { compareRadii } from './comparison.js';
import { sentences } from './sentences.js';
import { validate } from './declarations.js';
import { learnContent } from './learn.js';
import { CONFIG } from './config.js';
export const OUTPUT_UNITS = Object.freeze({ rcf: CONFIG.speedUnitG, rpm: CONFIG.speedUnitRpm, rcf2: CONFIG.speedUnitG, radiusCm: 'cm', ratio: null });
export function speedField(direction) {
    const forward = (direction === undefined ? 'rpm-to-g' : direction) === 'rpm-to-g';
    return forward
        ? { label: FIELD_NAMES[0], unit: OUTPUT_UNITS.rpm }
        : { label: FIELD_NAMES[2], unit: OUTPUT_UNITS.rcf };
}
const radiusOut = (rCm) => ({ unrounded: unrounded(decimalValue(rCm)), display: unroundedGrouped(decimalValue(rCm)) });
export function calculate(inputs, options) {
    const forward = (inputs.direction === undefined ? 'rpm-to-g' : inputs.direction) === 'rpm-to-g';
    const cmp = compareRadii(inputs);
    if (cmp.status !== 'ok') {
        const refused = { status: 'refused', refusals: cmp.refusals, flags: [], outputs: {}, units: {}, sentences: {}, texts: {} };
        if (options && options.learn)
            refused.learn = learnContent(inputs);
        return refused;
    }
    const sen = sentences(inputs);
    const outputs = {};
    const texts = {};
    const flags = [];
    if (forward) {
        const [r1, r2] = cmp.rows;
        outputs.rcf = { unrounded: r1.unrounded, display: r1.display };
        outputs.radiusCm = radiusOut(r1.rCm);
        if (r2) {
            outputs.rcf2 = { unrounded: r2.unrounded, display: r2.display };
            outputs.ratio = { unrounded: cmp.ratio.unrounded, display: cmp.ratio.display };
            if (cmp.orderingFlag) {
                flags.push('RPM-FL-06');
                texts.orderingFlag = cmp.orderingFlag;
            }
        }
    }
    else {
        const v = validateParsed(inputs);
        outputs.rpm = { unrounded: unrounded(v.rpm), display: display(v.rpm) };
        outputs.radiusCm = radiusOut(v.rCm);
        texts.rotorLimitNote = CONFIG.rotorLimitNote;
    }
    const used = Object.keys(outputs);
    const units = {};
    for (const k of used)
        units[k] = OUTPUT_UNITS[k];
    texts.roundingLine = CONFIG.roundingLine;
    texts.constantLine = CONFIG.constantLine;
    const out = {
        status: 'result',
        refusals: [],
        flags,
        outputs,
        units,
        sentences: { methods: sen.sentences.map((s) => s.sentence) },
        texts,
    };
    if (sen.line)
        out.sentences.inverseLine = sen.line;
    if (options && options.learn)
        out.learn = learnContent(inputs);
    return out;
}
function validateParsed(inputs) {
    const res = validate(inputs);
    const rCm = radiusToCm(res.parsed.radius.value, inputs.unit);
    return { rCm, rpm: rpmFromRcf(res.parsed.speed.value, rCm) };
}
