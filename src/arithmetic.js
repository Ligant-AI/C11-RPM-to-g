export const K_PUBLISHED = Object.freeze({ n: 1118n, e: 8 });
export const K_EXACT = Object.freeze({ n: 1118244n, e: 11 });
export const SEPARATOR_TEXT = 'Type the number without commas or spaces, for example 14000 or 8.5. (Results are shown with commas; remove them if you copy one back.)';
export const FIELD_NAMES = Object.freeze(['rotor speed', 'radius', 'target × g', 'second radius']);
export function refusalText(code, field) {
    switch (code) {
        case 'blank':
            return `Type the ${field}.`;
        case 'separator':
            return SEPARATOR_TEXT;
        case 'zero-or-negative':
            return `The ${field} must be greater than zero.`;
        case 'plain-number':
            return `Type the ${field} as a plain number, for example 14000 or 8.5.`;
        default:
            throw new Error(`unknown refusal code: ${code}`);
    }
}
const S_CODEPOINTS = [0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20, 0xa0, 0x2007, 0x2009, 0x202f, 0xfeff];
const S_SET = new Set(S_CODEPOINTS.map((c) => String.fromCharCode(c)));
export function trimS(text) {
    let a = 0;
    let b = text.length;
    while (a < b && S_SET.has(text[a]))
        a++;
    while (b > a && S_SET.has(text[b - 1]))
        b--;
    return text.slice(a, b);
}
function hasSeparator(trimmed) {
    if (trimmed.includes(','))
        return true;
    for (const ch of trimmed)
        if (S_SET.has(ch))
            return true;
    return false;
}
const PLAIN = /^([0-9]*)(?:\.([0-9]*))?$/;
function plainParts(s) {
    const m = PLAIN.exec(s);
    if (!m)
        return null;
    const int = m[1];
    const frac = m[2] === undefined ? '' : m[2];
    if (int.length + frac.length === 0)
        return null;
    return { int, frac };
}
function refuse(code, field) {
    return { ok: false, code, field, text: refusalText(code, field) };
}
export function groupThousands(intDigits) {
    if (intDigits.length < 4)
        return intDigits;
    let out = '';
    const first = intDigits.length % 3;
    if (first)
        out = intDigits.slice(0, first);
    for (let i = first; i < intDigits.length; i += 3) {
        out += (out ? ',' : '') + intDigits.slice(i, i + 3);
    }
    return out;
}
function typedDisplay({ int, frac }) {
    let i = int.replace(/^0+/, '');
    if (i === '')
        i = '0';
    const f = frac === '' ? '' : `.${frac}`;
    return groupThousands(i) + f;
}
export function parseNumber(text, field) {
    const t = trimS(String(text));
    if (t === '')
        return refuse('blank', field);
    if (hasSeparator(t))
        return refuse('separator', field);
    if (t[0] === '-') {
        return plainParts(t.slice(1)) ? refuse('zero-or-negative', field) : refuse('plain-number', field);
    }
    const parts = plainParts(t);
    if (!parts)
        return refuse('plain-number', field);
    const n = BigInt(parts.int + parts.frac || '0');
    if (n === 0n)
        return refuse('zero-or-negative', field);
    return { ok: true, value: { n, e: parts.frac.length }, typed: typedDisplay(parts) };
}
export function radiusToCm(value, unit) {
    if (unit === 'cm')
        return { n: value.n, e: value.e };
    if (unit === 'mm')
        return { n: value.n, e: value.e + 1 };
    throw new Error(`unit must be "cm" or "mm": ${unit}`);
}
const pow10 = (k) => 10n ** BigInt(k);
function isqrt(n) {
    if (n < 2n)
        return n;
    let x = 1n << BigInt((n.toString(2).length + 1) >> 1);
    for (;;) {
        const y = (x + n / x) >> 1n;
        if (y >= x)
            return x;
        x = y;
    }
}
export function rcfFromRpm(rpm, rCm, k = K_PUBLISHED) {
    return {
        kind: 'ratio',
        carried: false,
        P: k.n * rCm.n * rpm.n * rpm.n,
        Q: pow10(k.e + rCm.e + 2 * rpm.e),
    };
}
export function rpmFromRcf(target, rCm, k = K_PUBLISHED) {
    return {
        kind: 'sqrt',
        carried: true,
        P: target.n * pow10(k.e + rCm.e),
        Q: k.n * rCm.n * pow10(target.e),
    };
}
export function timesInteger(v, m) {
    return { ...v, P: v.P * BigInt(m) };
}
export function ratioOf(a, b) {
    return { kind: 'ratio', carried: true, P: a.P * b.Q, Q: a.Q * b.P };
}
function cmpPow10(P, Q, k) {
    const l = k >= 0 ? P : P * pow10(-k);
    const r = k >= 0 ? Q * pow10(k) : Q;
    return l < r ? -1 : l > r ? 1 : 0;
}
function cmpValuePow10(v, k) {
    return v.kind === 'sqrt' ? cmpPow10(v.P, v.Q, 2 * k) : cmpPow10(v.P, v.Q, k);
}
function decade(v) {
    let d = v.P.toString().length - v.Q.toString().length;
    if (v.kind === 'sqrt')
        d = Math.trunc(d / 2);
    while (cmpValuePow10(v, d) >= 0)
        d++;
    while (cmpValuePow10(v, d - 1) < 0)
        d--;
    return d;
}
function roundAt(v, s) {
    if (v.kind === 'ratio') {
        const P = s >= 0 ? v.P * pow10(s) : v.P;
        const Q = s >= 0 ? v.Q : v.Q * pow10(-s);
        return (2n * P + Q) / (2n * Q);
    }
    const P = s >= 0 ? v.P * pow10(2 * s) : v.P;
    const Q = s >= 0 ? v.Q : v.Q * pow10(-2 * s);
    const m = isqrt(P / Q);
    const up = 4n * P >= (2n * m + 1n) * (2n * m + 1n) * Q;
    return up ? m + 1n : m;
}
function plain(n, s) {
    let digits = n.toString();
    if (s <= 0)
        return digits === '0' ? '0' : digits + '0'.repeat(-s);
    if (digits.length <= s)
        digits = '0'.repeat(s - digits.length + 1) + digits;
    return `${digits.slice(0, digits.length - s)}.${digits.slice(digits.length - s)}`;
}
function stripZeros(str) {
    return str.includes('.') ? str.replace(/\.?0+$/, '') : str;
}
function roundSig(v, sig) {
    const d = decade(v);
    let s = sig - d;
    let n = roundAt(v, s);
    if (n === pow10(sig)) {
        n /= 10n;
        s -= 1;
    }
    return { n, s };
}
export function unrounded(v) {
    if (!v.carried) {
        const m = v.Q.toString().length - 1;
        return stripZeros(plain(v.P, m));
    }
    const { n, s } = roundSig(v, 15);
    return stripZeros(plain(n, s));
}
function groupString(str) {
    const [i, f] = str.split('.');
    return groupThousands(i) + (f === undefined ? '' : `.${f}`);
}
export function display(v) {
    if (cmpValuePow10(v, 2) >= 0)
        return groupString(plain(roundAt(v, 0), 0));
    const { n, s } = roundSig(v, 3);
    return groupString(plain(n, s));
}
export function displayRatio(v) {
    const { n, s } = roundSig(v, 3);
    return groupString(plain(n, s));
}
export function decimalValue(d) {
    return { kind: 'ratio', carried: false, P: d.n, Q: pow10(d.e) };
}
export function unroundedGrouped(v) {
    return groupString(unrounded(v));
}
