import { parseNumber, trimS } from './arithmetic.js';
export const UNITS = Object.freeze(['cm', 'mm']);
export const BASES = Object.freeze(['r_max', 'r_avg', 'r_min']);
export const UNIT_REFUSAL = 'Choose the unit your radius is in: cm or mm.';
export const BASIS_REFUSAL = 'Choose which radius you typed: r_max, r_avg or r_min. The tool has no default.';
export const SECOND_UNIT_REFUSAL = 'Choose the unit your second radius is in: cm or mm.';
export const SECOND_BASIS_REFUSAL = 'Choose the basis of the second radius: r_max, r_avg or r_min. The tool has no default.';
export const SAME_BASIS_REFUSAL = 'Choose a different basis for the second radius.';
export function declarationRefusal(fieldName) {
    return `Type the ${fieldName}. It goes into the methods sentence.`;
}
export const FIELD = Object.freeze({
    speed: 'rotor speed',
    target: 'target × g',
    rotor: 'rotor name or model',
    tube: 'tube type',
    radius: 'radius',
    radiusUnit: 'radius unit',
    radiusBasis: 'radius basis',
    radius2: 'second radius',
    radius2Unit: 'second radius unit',
    radius2Basis: 'second radius basis',
    source: 'source of the radius',
});
const DIRECTIONS = Object.freeze(['rpm-to-g', 'g-to-rpm']);
const isEmpty = (v) => trimS(v === undefined || v === null ? '' : String(v)) === '';
export function validate(inputs) {
    const direction = inputs.direction === undefined ? 'rpm-to-g' : inputs.direction;
    if (!DIRECTIONS.includes(direction))
        throw new Error(`direction must be one of ${DIRECTIONS.join(', ')}`);
    const forward = direction === 'rpm-to-g';
    const refusals = [];
    const parsed = {};
    const number = (key, text, field) => {
        const r = parseNumber(text === undefined || text === null ? '' : text, field);
        if (r.ok)
            parsed[key] = r;
        else
            refusals.push({ field, code: r.code, text: r.text });
    };
    const declare = (text, field) => {
        if (isEmpty(text))
            refusals.push({ field, code: 'declaration-empty', text: declarationRefusal(field) });
    };
    const chosen = (value, allowed) => allowed.includes(value);
    number('speed', inputs.speed, forward ? FIELD.speed : FIELD.target);
    declare(inputs.rotor, FIELD.rotor);
    declare(inputs.tube, FIELD.tube);
    number('radius', inputs.radius, FIELD.radius);
    if (!chosen(inputs.unit, UNITS)) {
        refusals.push({ field: FIELD.radiusUnit, code: 'unit-unchosen', text: UNIT_REFUSAL });
    }
    const basisChosen = chosen(inputs.basis, BASES);
    if (!basisChosen) {
        refusals.push({ field: FIELD.radiusBasis, code: 'basis-unchosen', text: BASIS_REFUSAL });
    }
    if (forward) {
        const unit2 = chosen(inputs.unit2, UNITS);
        const basis2 = chosen(inputs.basis2, BASES);
        const present = !isEmpty(inputs.radius2) || unit2 || basis2;
        if (present) {
            number('radius2', inputs.radius2, FIELD.radius2);
            if (!unit2)
                refusals.push({ field: FIELD.radius2Unit, code: 'unit-unchosen', text: SECOND_UNIT_REFUSAL });
            if (!basis2) {
                refusals.push({ field: FIELD.radius2Basis, code: 'basis-unchosen', text: SECOND_BASIS_REFUSAL });
            }
            else if (basisChosen && inputs.basis2 === inputs.basis) {
                refusals.push({ field: FIELD.radius2Basis, code: 'same-basis', text: SAME_BASIS_REFUSAL });
            }
        }
    }
    declare(inputs.source, FIELD.source);
    const order = forward
        ? [FIELD.speed, FIELD.rotor, FIELD.tube, FIELD.radius, FIELD.radiusUnit, FIELD.radiusBasis, FIELD.radius2, FIELD.radius2Unit, FIELD.radius2Basis, FIELD.source]
        : [FIELD.target, FIELD.rotor, FIELD.tube, FIELD.radius, FIELD.radiusUnit, FIELD.radiusBasis, FIELD.source];
    refusals.sort((a, b) => order.indexOf(a.field) - order.indexOf(b.field));
    return { status: refusals.length ? 'refused' : 'ok', refusals, parsed: refusals.length ? {} : parsed };
}
