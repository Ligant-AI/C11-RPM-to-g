import { trimS, radiusToCm, rpmFromRcf, display } from './arithmetic.js';
import { compareRadii } from './comparison.js';
import { validate } from './declarations.js';
export const INVERSE_LINE = 'rpm computed for this target.';
export function methodsSentence({ rcf, rpm, rotor, basis, radius, unit, source, tube }) {
    return `${rcf} × g at ${rpm} rpm (rotor ${rotor}; ${basis} = ${radius} ${unit}, from ${source}; tube: ${tube})`;
}
export function inverseSentence({ target, rpm, rotor, basis, radius, unit, source, tube }) {
    return methodsSentence({ rcf: target, rpm, rotor, basis, radius, unit, source, tube });
}
const declared = (inputs) => ({
    rotor: trimS(String(inputs.rotor)),
    source: trimS(String(inputs.source)),
    tube: trimS(String(inputs.tube)),
});
export function sentences(inputs) {
    const direction = inputs.direction === undefined ? 'rpm-to-g' : inputs.direction;
    const res = validate(inputs);
    if (res.status !== 'ok')
        return { status: 'refused', refusals: res.refusals, sentences: [], line: null };
    const text = declared(inputs);
    if (direction === 'rpm-to-g') {
        const cmp = compareRadii(inputs);
        return {
            status: 'ok',
            refusals: [],
            sentences: cmp.rows.map((r) => ({
                basis: r.basis,
                sentence: methodsSentence({
                    rcf: r.display,
                    rpm: res.parsed.speed.typed,
                    ...text,
                    basis: r.basis,
                    radius: r.typed,
                    unit: r.unit,
                }),
            })),
            line: null,
        };
    }
    const rCm = radiusToCm(res.parsed.radius.value, inputs.unit);
    const rpm = rpmFromRcf(res.parsed.speed.value, rCm);
    return {
        status: 'ok',
        refusals: [],
        sentences: [
            {
                basis: inputs.basis,
                sentence: inverseSentence({
                    target: res.parsed.speed.typed,
                    rpm: display(rpm),
                    ...text,
                    basis: inputs.basis,
                    radius: res.parsed.radius.typed,
                    unit: inputs.unit,
                }),
            },
        ],
        line: INVERSE_LINE,
    };
}
