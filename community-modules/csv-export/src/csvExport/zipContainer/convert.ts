export const convertTime = (date: Date): number => {
    let time = date.getHours();
    time <<= 6;
    time = time | date.getMinutes();
    time <<= 5;
    time = time | (date.getSeconds() / 2);

    return time;
};

export const convertDate = (date: Date): number => {
    let dt = date.getFullYear() - 1980;
    dt <<= 4;
    dt = dt | (date.getMonth() + 1);
    dt <<= 5;
    dt = dt | date.getDate();

    return dt;
};

export function convertDecToHex(number: number, bytes: number): string {
    let hex = '';

    for (let i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }

    return hex;
}
