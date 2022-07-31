export default function (a, b) {
    a = +a;
    b = +b;
    return (t) => a * (1 - t) + b * t;
}
