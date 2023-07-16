export default function (a, b) {
    a = +a;
    b = +b;
    return function (t) { return a * (1 - t) + b * t; };
}
