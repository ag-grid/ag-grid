export default function (a, b) {
    var date = new Date();
    var msA = +a;
    var msB = +b;
    return function (t) {
        date.setTime(msA * (1 - t) + msB * t);
        return date;
    };
}
