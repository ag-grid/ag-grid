export default function (a: Date | number, b: Date | number): (t: number) => Date {
    const date = new Date;
    const msA = +a;
    const msB = +b - msA;
    return function (t: number) {
        date.setTime(msA + msB * t);
        return date;
    };
}
