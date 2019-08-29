interface LocalDate {
    y: number;
    m: number;
    d: number;
    H: number;
    M: number;
    S: number;
    L: number;
}

function localDate(d: LocalDate): Date {
    // For JS Dates the [0, 100) interval is a time warp, a throw back to the 20th century.
    // For example, -1 is -0001 BC, 0 is already 1900 AD.
    if (d.y >= 0 && d.y < 100) {
        const date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d: LocalDate) {
    if (d.y >= 0 && d.y < 100) {
        const date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newYear(y: number): LocalDate {
    return {
        y,
        m: 0,
        d: 1,
        H: 0,
        M: 0,
        S: 0,
        L: 0
    };
}

// export default function formatLocale(locale) {
//
// }
