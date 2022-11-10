// taken from http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
let seed = 123456789;
const m = Math.pow(2, 32);
const a = 1103515245;
const c = 12345;

const IS_SSR = typeof window === "undefined"

export const pseudoRandom = () => {
    seed = (a * seed + c) % m;
    return seed / m;
};

export const booleanCleaner = (value) => {
    if (value === "true" || value === true || value === 1) {
        return true;
    }

    if (value === "false" || value === false || value === 0) {
        return false;
    }
    return null;
};

export const axisLabelFormatter = (params) => {
    const value = params.value;

    if (isNaN(value)) {
        return value;
    }

    const absolute = Math.abs(value);
    let standardised = '';

    if (absolute < 1e3) {
        standardised = absolute;
    }
    if (absolute >= 1e3 && absolute < 1e6) {
        standardised = '$' + +(absolute / 1e3).toFixed(1) + 'K';
    }
    if (absolute >= 1e6 && absolute < 1e9) {
        standardised = '$' + +(absolute / 1e6).toFixed(1) + 'M';
    }
    if (absolute >= 1e9 && absolute < 1e12) {
        standardised = '$' + +(absolute / 1e9).toFixed(1) + 'B';
    }
    if (absolute >= 1e12) standardised = '$' + +(absolute / 1e12).toFixed(1) + 'T';

    return `${value < 0 ? '-' + standardised : standardised}`;
};
export const formatThousands = value => value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

export const currencyFormatter = (params) => {
    if (params.value === null || params.value === undefined) {
        return null;
    }

    if (isNaN(params.value)) {
        return 'NaN';
    }

    // if we are doing 'count', then we do not show pound sign
    if (params.node.group && params.column.aggFunc === 'count') {
        return params.value;
    }

    let result = '$' + formatThousands(Math.floor(Math.abs(params.value)));

    if (params.value < 0) {
        result = '(' + result + ')';
    }

    return result;

};

// the moving animation looks crap on IE, firefox and safari, so we turn it off in the demo for them
export const suppressColumnMoveAnimation = () => {
    if (IS_SSR) {
        return false;
    }
    const isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    const isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    return isFirefox || isSafari;
};

export const sharedNumberParser = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    return parseFloat(value);
};

export const numberParser = (params) => {
    return sharedNumberParser(params.newValue);
};

export const booleanComparator = (value1, value2) => {
    const value1Cleaned = booleanCleaner(value1);
    const value2Cleaned = booleanCleaner(value2);
    const value1Ordinal = value1Cleaned === true ? 0 : (value1Cleaned === false ? 1 : 2);
    const value2Ordinal = value2Cleaned === true ? 0 : (value2Cleaned === false ? 1 : 2);
    return value1Ordinal - value2Ordinal;
};

