export const DATA_MARKET_SHARE = [
    { os: 'Android', share: 56.9, satisfaction: 10 },
    { os: 'iOS', share: 22.5, satisfaction: 12 },
    { os: 'BlackBerry', share: 6.8, satisfaction: 9 },
    { os: 'Symbian', share: 8.5, satisfaction: 8 },
    { os: 'Bada', share: 2.6, satisfaction: 7 },
    { os: 'Windows', share: 1.9, satisfaction: 6 },
];

const count = 50;
export const DATA_MANY_LONG_LABELS = Array.from({ length: count }).map((_, i) => {
    return {
        value: count - i,
        label: `Very very long label ${i + 1}`,
    };
});
