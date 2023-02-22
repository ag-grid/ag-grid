export default function (a: number, b: number): (t: number) => number {
    a = +a;
    b = +b;
    return (t) => a * (1 - t) + b * t;
}
