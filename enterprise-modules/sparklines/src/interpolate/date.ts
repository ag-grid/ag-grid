export default function(a: Date | number, b: Date | number): (t: number) => Date {
    const date = new Date;
    const msA = +a;
    const msB = +b;
    return function(t: number) {
        date.setTime(msA * (1 - t) + msB * t);
        return date;
    };
}
