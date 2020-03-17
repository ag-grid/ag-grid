export default function (a, b) {
    var date = new Date;
    var msA = +a;
    var msB = +b - msA;
    return function (t) {
        date.setTime(msA + msB * t);
        return date;
    };
}
