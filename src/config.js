export const CONFIG = Object.freeze({
    toolTitle: 'RPM to g',
    toolId: 'C11',
    productLine: 'Ligant Bench Tools',
    publisher: 'Ligant',
    legalEntity: 'Ligant AI Incorporated',
    version: '1.0.1',
    slug: 'rpm-to-g',
    publicBase: 'https://benchtools.ligant.ai/',
    repositoryUrl: 'https://github.com/Ligant-AI/C11-RPM-to-g',
    doi: null,
    citationAuthor: 'Modi, A.B.',
    citationYear: '2026',
    tagline: 'Turn a rotor speed (rpm) and radius into relative centrifugal force (× g), or a target × g into the rpm that gives it at that radius.',
    intro: Object.freeze([
        'Relative centrifugal force is the outward pull a sample feels in a spinning rotor, as a multiple of gravity, written × g. It depends on the speed in revolutions per minute (rpm) and on the radius, the distance from the centre of the rotor to the sample: 14,000 rpm gives 18,626 × g at a maximum radius (r_max) of 8.5 cm, but 13,148 × g at an r_max of 6.0 cm. So an rpm alone does not carry over to another rotor; a × g does, when the protocol names which radius it refers to. Use this page to find the rpm that gives a protocol\'s × g on your rotor, or the × g of a spin from its rpm.',
        'We built it so the radius is never left out: no result appears until you type it and say which radius it is, maximum (r_max), minimum (r_min) or average (r_avg), and the result sentence and the download record it. In Learn mode, the page shows the relation, where its constant comes from, and your own result with the published constant and with the exact one. The calculation runs in your browser.',
    ]),
    scopeStatement: 'Turns a rotor speed (rpm) and a rotor radius into relative centrifugal force (× g), and a target × g into the rpm that gives it at that radius. You choose the radius unit, cm or mm, and say which radius you typed (r_max, r_avg or r_min); there is no default for either. In the rpm to × g direction you may enter a second radius with its own basis and unit. The rotor, the source of the radius and the tube are recorded in the sentence; they do not enter the arithmetic. Every step is shown.',
    doesNotDo: Object.freeze([
        'It does not know your rotor. You give the radius and say which radius it is. Use the figure your rotor maker gives.',
        "It does not check your speed or your result against the limits of your rotor, tube or adaptor. Check the rotor manual and your tube maker's rating.",
        'It does not convert one radius into another (r_max, r_avg, r_min).',
        'It does not offer inches.',
        'It does not suggest a speed or a force for any sample or protocol.',
        'It does not replace your rotor manual, your protocol or your own checks.',
    ]),
    roundingLine: 'Rounded for display; the export carries the unrounded value.',
    constantLine: 'Computed with the published constant 1.118 × 10⁻⁵, so the result matches rotor charts and protocols. Learn mode shows where it comes from.',
    rotorLimitNote: "This rpm is not checked against your rotor's maximum speed. Check the rotor manual.",
    speedUnitRpm: 'rpm',
    speedUnitG: '× g',
    disclaimer: 'Research use only. Not qualified for GxP decision-making.',
});
export function citationParts() {
    return {
        lead: `${CONFIG.citationAuthor} (${CONFIG.citationYear}). `,
        title: CONFIG.toolTitle,
        tail: ` (v${CONFIG.version}) [Computer software]. ${CONFIG.legalEntity}. ${CONFIG.publicBase.replace('https://', '')}${CONFIG.slug}/`,
    };
}
export const citationText = () => { const c = citationParts(); return c.lead + c.title + c.tail; };
export const toolUrl = () => `${CONFIG.publicBase}${CONFIG.slug}/`;
