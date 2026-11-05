import '@ligant/bench-chrome/chrome.css';
import { renderHeader, renderFooter, bindCopy } from '@ligant/bench-chrome';
import { CONFIG, citationParts } from './config.js';
import { calculate, speedField } from './model.js';
import { refusalsByInput, refusalHtml, resultHtml, learnHtml } from './render.js';
import { makeExport } from './export.js';
import { WORKED_EXAMPLE } from './learn.js';
import { aboutHtml } from './about.js';
import { injectJsonLd } from './seo.js';
document.getElementById('site-header').innerHTML = renderHeader({ path: `/${CONFIG.slug}/`, title: CONFIG.toolTitle, description: CONFIG.intro });
const footer = document.getElementById('site-footer');
footer.innerHTML = renderFooter({
    repoUrl: CONFIG.repositoryUrl,
    citations: [citationParts()],
    citationFootnote: 'References are given as text rather than links, so the page itself sends no visit to a publisher.',
    disclaimer: CONFIG.disclaimer,
});
bindCopy(footer);
document.getElementById('about-body').innerHTML = aboutHtml();
injectJsonLd(document);
const IDS = ['direction', 'speed', 'rotor', 'tube', 'radius', 'unit', 'basis', 'radius2', 'unit2', 'basis2', 'source'];
const el = (id) => document.getElementById(id);
function read() {
    const v = {};
    for (const id of IDS)
        v[id] = el(id).value;
    return v;
}
function update() {
    const inputs = read();
    const forward = inputs.direction === 'rpm-to-g';
    el('second-radius').hidden = !forward;
    const record = calculate(inputs);
    const by = refusalsByInput(record);
    for (const id of IDS) {
        const slot = el(`err-${id}`);
        const shown = touched ? by[id] : undefined;
        if (slot)
            slot.innerHTML = refusalHtml(shown);
        el(id).setAttribute('aria-invalid', shown ? 'true' : 'false');
    }
    const field = speedField(inputs.direction);
    el('speed-label').textContent = field.label;
    el('speed-unit').textContent = field.unit;
    el('result').innerHTML = resultHtml(record);
    el('export-json').hidden = record.status !== 'result';
    const on = el('learn-toggle').checked;
    el('learn').hidden = !on;
    el('load-example').hidden = !on;
    const learn = on ? calculate(inputs, { learn: true }).learn : null;
    el('learn').innerHTML = on ? learnHtml(learn) : '';
    el('diameter-note').hidden = !on;
    el('diameter-note').textContent = on ? learn.diameter : '';
}
let touched = false;
el('export-json').addEventListener('click', () => {
    const inputs = read();
    const made = makeExport(inputs, calculate(inputs));
    if (!made)
        return;
    const blob = new Blob([made.text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = made.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});
el('learn-toggle').addEventListener('change', update);
el('load-example').addEventListener('click', () => {
    const ex = WORKED_EXAMPLE;
    el('direction').value = ex.direction;
    lastDirection = ex.direction;
    for (const k of ['speed', 'radius', 'unit', 'basis', 'rotor', 'tube', 'source'])
        el(k).value = ex[k];
    for (const k of ['radius2', 'unit2', 'basis2'])
        el(k).value = '';
    touched = true;
    update();
});
let lastDirection = el('direction').value;
document.getElementById('form').addEventListener('input', (e) => {
    touched = true;
    if (e.target.id === 'direction' && e.target.value !== lastDirection) {
        el('speed').value = '';
        lastDirection = e.target.value;
    }
    update();
});
el('direction').value = 'rpm-to-g';
for (const id of ['unit', 'basis', 'unit2', 'basis2'])
    el(id).value = '';
update();
