import { CONFIG } from './config.js';
export const ABOUT_HEADING = 'About this calculator';
export const NIST_URL = 'https://physics.nist.gov/cgi-bin/cuu/Value?gn';
export const NIST_LINE = 'Standard gravity: NIST CODATA, "standard acceleration of gravity", 9.806 65 m s⁻², "(exact)", which is 980.665 cm/s²';
export const SOURCES_LINE_2 = 'The constant follows from it: (2π/60)² / 980.665 = 1.118244 × 10⁻⁵ (7 s.f.). 1.118 × 10⁻⁵ is this value rounded to four figures, as rotor charts print it.';
export const ROUNDING_PARAGRAPH = 'Results are rounded once, for display only, with halves rounded up: a × g or rpm value shows as a whole number at 100 or more and to 3 significant figures below 100, the ratio of the two × g values shows to 3 significant figures at any size, and numbers you type are never rounded. The downloaded export keeps the unrounded values (every × g value and the radius in cm in full; a computed rpm and the ratio to 15 significant figures), and each figure on the page is rounded from the full computed value, not from those 15 figures.';
export const WHAT_IT_DOES = 'RPM to g turns a rotor speed in rpm and a rotor radius into relative centrifugal force, written × g, and turns a target × g into the rpm that gives it at that radius. You say which radius you typed and which unit it is in, and the page gives the result as a sentence you can paste into a methods section: the × g, the speed, the rotor, the radius with its basis and source, and the tube. In Learn mode, the page shows the relation, where its constant comes from, and your own result with the published constant and with the exact one.';
export const HOW_TO_USE = Object.freeze([
    'Turn on Learn mode, then click "Load worked example". It fills the form with an example (14,000 rpm, a radius of 8.5 cm, r_max; the rotor, tube and source are placeholders in square brackets). Change the numbers and watch the result and the Learn text change with them.',
    'Choose the direction. "rpm to × g" is for when you know the speed you ran or will run. "× g to rpm" is for when a protocol gives you a target × g and you want the rpm that gives it at the radius you type.',
    'Type the rotor speed in rpm (or the target × g, in the other direction). Type plain digits with at most one decimal point, for example 14000 or 8.5, with no commas or spaces.',
    'Type the rotor name or model as your rotor manual or rotor label gives it. We ask because another lab needs to know the rotor to compare its spin with yours.',
    'Type the tube type. We ask because the tube and any adaptor change where the sample sits, and so the radius; the tool records the tube and does not compute with it. Use the radius your rotor maker gives for that tube or adaptor.',
    'Type the radius and choose its unit, cm or mm. Nothing is pre-selected. Use the figure your rotor maker gives, and read it as a radius, from the centre of the rotor outwards: typing the diameter doubles the × g, or, in the × g to rpm direction, gives an rpm that delivers only half the target × g. A radius in mm is divided by 10 to get cm before the relation is applied (85 mm is 8.5 cm).',
    'Choose the radius basis, r_max, r_avg or r_min. Nothing is pre-selected. r_max runs from the centre of the rotor to the point of the sample furthest from it, usually the bottom of the tube. r_min runs from the centre of the rotor to the point of the sample nearest to it. r_avg is a radius between the two, usually midway; your rotor maker states the value it uses. We ask because at the same speed the bottom of a tube feels more × g than the top, and saying which radius you used makes the number repeatable.',
    'Type the source of the radius, for example "rotor manual". We ask so that a reader can check where the radius came from.',
    'Optional, in the rpm to × g direction only: type a second radius, choose its unit, and choose a basis that differs from the first. You get a × g for each radius, each against its own basis, and the ratio of the two × g values, the first divided by the second. The tool never converts one radius into the other.',
    'Read the result sentence and copy it. In the × g to rpm direction the sentence is followed by "rpm computed for this target."; report the × g, because the rpm is only the setting for this rotor.',
    'Click "Download results (JSON)" to save a record of the inputs, the constant used and the result. The file is made in your browser.',
]);
export const HOW_IT_WORKS_1 = 'Relative centrifugal force is the radius times the square of the angular speed in radians per second, divided by standard gravity. With the speed in rpm (one turn is 2π radians, one minute is 60 seconds) and the radius in cm, this reduces to one constant multiplied by the radius and by the speed squared. The page uses the published constant 1.118 × 10⁻⁵, as rotor charts and protocols print it. Going the other way, the same relation is solved for the speed.';
export const FORMULA_RCF = 'RCF = 1.118 × 10⁻⁵ × r(cm) × rpm²';
export const FORMULA_RPM = 'rpm = √( RCF / (1.118 × 10⁻⁵ × r(cm)) )';
export const CONSTANTS_TABLE = Object.freeze([
    ['Constant', 'Value', 'Why'],
    ['Published constant', '1.118 × 10⁻⁵', 'The value rotor charts and protocols print. The page computes with it, so a result matches them.'],
    ['Standard gravity', '980.665 cm/s²', 'The standard acceleration of gravity, 9.806 65 m s⁻² (see Sources below).'],
    ['Derived constant', '1.118244 × 10⁻⁵', '(2π/60)² / 980.665, to 7 significant figures. Learn mode shows it, and the download shows it labelled "for comparison only, not used". The published constant is 0.022% lower than the exact one.'],
    ['Millimetres to centimetres', 'divide by 10', 'The relation takes the radius in cm; a radius typed in mm is divided by 10 first.'],
]);
export const HOW_IT_WORKS_END = 'Tube type, rotor name and the source of the radius take no part in the arithmetic. They are carried into the result sentence and the download only.';
export const WHY_NOT_SPREADSHEET = Object.freeze([
    'The details that make a × g repeatable are required fields: radius unit, radius basis, rotor, tube and source have no default, and no result appears until each is given. Each refusal names the field in words.',
    'The relation, the published constant and its derivation are printed on the page, and Learn mode shows your result with the published constant and with the derived one.',
    'The result is written as a methods sentence with the radius in the unit you typed, never rounded, so the number can be repeated by someone else.',
    'The same inputs always give the same results. The download records every input as typed, the radius in cm as used, the constants, the unrounded result, the displayed result and the tool version.',
    'Nothing is converted between radius bases. If you type one radius, you get a result for that basis only.',
]);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const p = (s) => `<p>${esc(s)}</p>`;
const ul = (a) => `<ul>${a.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
export function aboutHtml() {
    const [head, ...rows] = CONSTANTS_TABLE;
    const table = `<table><thead><tr>${head.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    return [
        '<h3>What it does</h3>', p(WHAT_IT_DOES),
        '<h3>How to use it</h3>', `<ol>${HOW_TO_USE.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`,
        '<h3>How it works</h3>', p(HOW_IT_WORKS_1), p(FORMULA_RCF), p(FORMULA_RPM), p(ROUNDING_PARAGRAPH), table, p(HOW_IT_WORKS_END),
        '<h3>Sources</h3>',
        `<p>${esc(NIST_LINE)} (${esc(NIST_URL)}).</p>`,
        p(SOURCES_LINE_2),
        '<h3>Why not a spreadsheet?</h3>', ul(WHY_NOT_SPREADSHEET),
        '<h3>What it does not do</h3>', ul(CONFIG.doesNotDo),
    ].join('');
}
