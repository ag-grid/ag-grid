// Source: https://www.ons.gov.uk/releases/uklabourmarketfebruary2020
export function getData(): any[] {
    return [
        { type: 'Managers, directors &\nsenior officials', earnings: 954, },
        { type: 'Professional occupations', earnings: 844, },
        { type: 'Associate professional & technical', earnings: 699, },
        { type: 'Skilled trades', earnings: 503, },
        { type: 'Process, plant &\nmachine\noperatives', earnings: 501, },
        { type: 'Administrative & secretarial', earnings: 457, },
        { type: 'Sales & customer services', earnings: 407, },
        { type: 'Elementary occupations', earnings: 380, },
        { type: 'Caring, leisure & other services', earnings: 358, },
    ];
}