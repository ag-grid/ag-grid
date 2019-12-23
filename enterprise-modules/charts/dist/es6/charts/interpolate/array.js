import value from "./value";
export default function (a, b) {
    var nb = b ? b.length : 0;
    var na = a ? Math.min(nb, a.length) : 0;
    var x = new Array(na);
    var c = new Array(nb);
    var i;
    for (i = 0; i < na; ++i) {
        x[i] = value(a[i], b[i]);
    }
    for (; i < nb; ++i) {
        c[i] = b[i];
    }
    return function (t) {
        for (i = 0; i < na; ++i) {
            c[i] = x[i](t);
        }
        return c;
    };
}
