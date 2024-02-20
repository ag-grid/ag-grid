"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDecToHex = exports.convertDate = exports.convertTime = void 0;
const convertTime = (date) => {
    let time = date.getHours();
    time <<= 6;
    time = time | date.getMinutes();
    time <<= 5;
    time = time | date.getSeconds() / 2;
    return time;
};
exports.convertTime = convertTime;
const convertDate = (date) => {
    let dt = date.getFullYear() - 1980;
    dt <<= 4;
    dt = dt | (date.getMonth() + 1);
    dt <<= 5;
    dt = dt | date.getDate();
    return dt;
};
exports.convertDate = convertDate;
function convertDecToHex(number, bytes) {
    let hex = '';
    for (let i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }
    return hex;
}
exports.convertDecToHex = convertDecToHex;
