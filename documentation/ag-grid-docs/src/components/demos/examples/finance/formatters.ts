export const toPercentage = ({ value, decimalPlaces = 0 }: { value: number; decimalPlaces?: number }): string =>
    `${parseFloat(value.toString()).toFixed(decimalPlaces)}%`;

export const toTime = ({ value, showMs = false }: { value: number | string; showMs?: boolean }): string => {
    const date = new Date(value);
    const hour = date.getHours();
    const min = date.getMinutes().toString().padStart(2, '0');
    const sec = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');

    return showMs ? `${hour}:${min}:${sec}:${ms}` : `${hour}:${min}:${sec}`;
};

export const toCurrency = ({
    value,
    locale = 'en-US',
    currency = 'USD',
    maximumFractionDigits = 2,
}: {
    value: number;
    locale?: string;
    currency?: string;
    maximumFractionDigits?: number;
}): string => {
    const numberFormatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits,
    });
    return numberFormatter.format(value);
};
