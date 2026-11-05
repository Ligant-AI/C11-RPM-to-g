import { HEADINGS } from './learn.js';
export const EMPTY_RESULT = 'The result appears here when the form is complete.';
export const OUTPUT_LABELS = Object.freeze({
    rcf: 'relative centrifugal force',
    rcf2: 'relative centrifugal force, second radius',
    ratio: 'ratio of the two × g values (radius / second radius)',
    rpm: 'computed rpm',
    radiusCm: 'radius used',
});
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
export const FIELD_IDS = Object.freeze({
    'rotor speed': 'speed',
    'target × g': 'speed',
    'rotor name or model': 'rotor',
    'tube type': 'tube',
    radius: 'radius',
    'radius unit': 'unit',
    'radius basis': 'basis',
    'second radius': 'radius2',
    'second radius unit': 'unit2',
    'second radius basis': 'basis2',
    'source of the radius': 'source',
});
export function refusalsByInput(record) {
    const by = {};
    for (const r of record.refusals || []) {
        const id = FIELD_IDS[r.field];
        (by[id] = by[id] || []).push(r.text);
    }
    return by;
}
export function refusalHtml(texts) {
    return (texts || []).map((t) => `<p class="refusal" role="alert">${esc(t)}</p>`).join('');
}
export function learnHtml(learn) {
    if (!learn)
        return '';
    const p = (t) => `<p>${esc(t)}</p>`;
    const h = (k) => `<h3>${esc(HEADINGS[k])}</h3>`;
    const parts = [];
    parts.push(`<section data-learn="relation">${h('relation')}${p(learn.relation.text)}</section>`);
    const v = learn.derivation.values;
    const vals = v
        ? `<dl class="outputs"><div class="out-row"><dt>${esc(v.published.label)}</dt><dd><span class="num">${esc(v.published.display)}</span> <span class="unit">${esc(v.unit)}</span> <span class="unit">(${esc(v.published.constant)})</span></dd></div><div class="out-row"><dt>${esc(v.exact.label)}</dt><dd><span class="num">${esc(v.exact.display)}</span> <span class="unit">${esc(v.unit)}</span> <span class="unit">(${esc(v.exact.constant)})</span></dd></div></dl>`
        : '';
    parts.push(`<section data-learn="derivation">${h('derivation')}${p(learn.derivation.text)}${vals}${p(learn.derivation.constantLine)}</section>`);
    parts.push(`<section data-learn="definitions">${h('definitions')}${learn.definitions.items.map(p).join('')}${p(learn.definitions.figure)}</section>`);
    const w = learn.why;
    parts.push(`<section data-learn="why">${h('why')}${[w.basis, w.rotor, w.source, w.tube, w.reportLine].map(p).join('')}</section>`);
    parts.push(`<section data-learn="diameter">${h('diameter')}${p(learn.diameter)}${learn.conditional ? p(learn.conditional) : ''}</section>`);
    const y = learn.hypothetical;
    parts.push(`<section data-learn="hypothetical"><h3>${esc(y.label)}</h3>${p(y.text)}</section>`);
    if (learn.ratioLine)
        parts.push(`<section data-learn="ratio">${h('ratio')}${p(learn.ratioLine)}</section>`);
    return parts.join('');
}
const OUTPUT_ORDER = ['rcf', 'rcf2', 'ratio', 'rpm', 'radiusCm'];
export function resultHtml(record) {
    if (record.status !== 'result')
        return `<p class="hint">${esc(EMPTY_RESULT)}</p>`;
    const rows = OUTPUT_ORDER.filter((k) => record.outputs[k]).map((k) => {
        const o = record.outputs[k];
        const unit = record.units[k];
        return `<div class="out-row" data-output="${esc(k)}"><dt>${esc(OUTPUT_LABELS[k])}</dt><dd><span class="num">${esc(o.display)}</span>${unit ? ` <span class="unit">${esc(unit)}</span>` : ''}</dd></div>`;
    });
    const flag = record.texts && record.texts.orderingFlag ? `<p class="flag" role="status">${esc(record.texts.orderingFlag)}</p>` : '';
    const sentences = (record.sentences.methods || []).map((s) => `<p class="sentence">${esc(s)}</p>`).join('');
    const line = record.sentences.inverseLine ? `<p class="sentence">${esc(record.sentences.inverseLine)}</p>` : '';
    const rotorNote = record.texts && record.texts.rotorLimitNote ? `<p class="sentence">${esc(record.texts.rotorLimitNote)}</p>` : '';
    const rounding = record.texts && record.texts.roundingLine ? `<p class="rounding">${esc(record.texts.roundingLine)}</p>` : '';
    const constant = record.texts && record.texts.constantLine ? `<p class="constant-line">${esc(record.texts.constantLine)}</p>` : '';
    return `<dl class="outputs">${rows.join('')}</dl>${rounding}${constant}${flag}${sentences}${line}${rotorNote}`;
}
