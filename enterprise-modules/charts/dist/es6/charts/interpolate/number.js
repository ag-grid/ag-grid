export default function (a, b) {
    a = +a;
    b -= a;
    return function (t) { return a + b * t; };
}
