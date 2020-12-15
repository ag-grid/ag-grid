export default function (a: number, b: number): (t: number) => number {
    const d = b - a;
    a = +a;
    return t => t === 1 ? +b : a + d * t;
}
