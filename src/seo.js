import { CONFIG } from './config.js';
export const CANONICAL = `${CONFIG.publicBase}${CONFIG.slug}/`;
export const SOFTWARE_VERSION = '1.0.0';
export const FEATURE_LIST = Object.freeze([
    'Relative centrifugal force (× g) from rotor speed in rpm and radius in cm or mm',
    'The rpm that gives a target × g at a stated radius',
    'Radius basis (r_max, r_avg or r_min), rotor, tube type and source of the radius recorded in a methods sentence',
    'Optional second radius in the rpm to × g direction, with its own unit and basis, giving both results and their ratio',
    'Download of the inputs, constants and results as a JSON file made in the browser',
]);
export const FAQ = Object.freeze([
    { q: 'How do I convert rpm to × g?', a: 'Use RCF = 1.118 × 10⁻⁵ × r(cm) × rpm², where r is the rotor radius in cm. For example, 14,000 rpm at a radius of 8.5 cm (r_max) gives 18,626 × g. On the page, choose "rpm to × g", type the rotor speed, the radius and its unit (cm or mm), say which radius you typed, and name the rotor, the tube and the source of the radius. The result is written as a methods sentence.' },
    { q: 'How do I find the rpm for a target × g?', a: 'Choose "× g to rpm", type the target × g, and give the radius, its unit and basis, the rotor, the tube and the source of the radius, as in the other direction. The tool solves the same relation for the speed: rpm = √( RCF / (1.118 × 10⁻⁵ × r(cm)) ). For example, a target of 18,626 × g (typed 18626) at 8.5 cm (r_max) gives 14,000 rpm. Report the × g; the rpm is only the setting for this rotor.' },
    { q: 'Which radius do I use: r_max, r_avg or r_min?', a: 'Use the figure your rotor maker gives, and say which radius it is. r_max runs from the centre of the rotor to the point of the sample furthest from it, usually the bottom of the tube. r_min runs from the centre of the rotor to the point of the sample nearest to it. r_avg is a radius between the two, usually midway. At the same speed the bottom of a tube feels more × g than the top, so naming the basis makes the number repeatable. The tool has no default and never converts one basis into another.' },
    { q: 'Is it the radius or the diameter?', a: 'The radius, measured from the centre of the rotor. Typing the diameter instead doubles the × g; in the × g to rpm direction it gives an rpm that delivers only half the target × g. If your manual gives the radius in mm, choose mm and the tool divides by 10 to get cm.' },
]);
export function softwareApplication(description) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `Ligant · ${CONFIG.toolTitle}`,
        url: CANONICAL,
        description,
        applicationCategory: 'ScientificApplication',
        operatingSystem: 'Any (runs in a web browser)',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0' },
        license: `${CANONICAL}LICENSE`,
        softwareVersion: SOFTWARE_VERSION,
        featureList: [...FEATURE_LIST],
    };
}
export function faqPage() {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    };
}
export function structuredData(description) {
    return [softwareApplication(description), faqPage()];
}
export function injectJsonLd(doc) {
    const description = doc.querySelector('meta[name="description"]').getAttribute('content');
    for (const o of structuredData(description)) {
        const s = doc.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(o).replace(/</g, '\\u003c');
        doc.head.appendChild(s);
    }
}
