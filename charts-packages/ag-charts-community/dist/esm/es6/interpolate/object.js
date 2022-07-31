import value from './value';
export default function (a, b) {
    const i = {};
    const c = {};
    let k;
    if (a === null || typeof a !== 'object') {
        a = {};
    }
    if (b === null || typeof b !== 'object') {
        b = {};
    }
    for (k in b) {
        if (k in a) {
            i[k] = value(a[k], b[k]);
        }
        else {
            c[k] = b[k];
        }
    }
    return (t) => {
        for (k in i) {
            c[k] = i[k](t);
        }
        return c;
    };
}
