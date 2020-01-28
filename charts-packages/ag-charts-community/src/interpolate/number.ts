export default function (a: number, b: number): (t: number) => number {
    a = +a;
    b -= a;
    return t => a + b * t;
}
