// Source: https://www.gov.uk/government/statistical-data-sets/museums-and-galleries-monthly-visits
let year = new Date().getFullYear() - 11;
export function getData(): any[] {
    return [
        { year: `${year++}`, visitors: 40973087 },
        { year: `${year++}`, visitors: 42998338 },
        { year: `${year++}`, visitors: 44934839 },
        { year: `${year++}`, visitors: 46636720 },
        { year: `${year++}`, visitors: 48772922 },
        { year: `${year++}`, visitors: 50800193 },
        { year: `${year++}`, visitors: 48023342 },
        { year: `${year++}`, visitors: 47271912 },
        { year: `${year++}`, visitors: 47155093 },
        { year: `${year++}`, visitors: 49441678 },
        { year: `${year++}`, visitors: 50368190 },
    ];
}