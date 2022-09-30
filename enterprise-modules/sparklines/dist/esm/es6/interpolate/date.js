export default function (a, b) {
    const date = new Date;
    const msA = +a;
    const msB = +b;
    return function (t) {
        date.setTime(msA * (1 - t) + msB * t);
        return date;
    };
}
