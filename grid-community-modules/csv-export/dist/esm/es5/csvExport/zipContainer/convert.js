export var convertTime = function (date) {
    var time = date.getHours();
    time <<= 6;
    time = time | date.getMinutes();
    time <<= 5;
    time = time | date.getSeconds() / 2;
    return time;
};
export var convertDate = function (date) {
    var dt = date.getFullYear() - 1980;
    dt <<= 4;
    dt = dt | (date.getMonth() + 1);
    dt <<= 5;
    dt = dt | date.getDate();
    return dt;
};
export function convertDecToHex(number, bytes) {
    var hex = '';
    for (var i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }
    return hex;
}
