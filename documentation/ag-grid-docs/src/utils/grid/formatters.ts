export const toPercentage = ({ value, decimalPlaces = 0 }) => `${parseFloat(value).toFixed(decimalPlaces)}%`;

export const toTime = ({ value, showMs = false }) => {
    const date = new Date(value);
    const hour = date.getHours();
    const min = date.getMinutes().toString().padStart(2, '0');
    const sec = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');

    return showMs ? `${hour}:${min}:${sec}:${ms}` : `${hour}:${min}:${sec}`;
};

export const toCurrency = ({
    value,
    /**
     * Currency locale for `Intl.NumberFormat()`
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
     */
    locale = 'en-US',
    /**
     * Currency code for `options.currency` in `Intl.NumberFormat()`
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
     */
    currency = 'USD',
    /**
     * Maximum fraction digits for `options.maximumFractionDigits` in `Intl.NumberFormat()`
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
     */
    maximumFractionDigits = 2,
}) => {
    const numberFormatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits,
    });
    return numberFormatter.format(value);
};
