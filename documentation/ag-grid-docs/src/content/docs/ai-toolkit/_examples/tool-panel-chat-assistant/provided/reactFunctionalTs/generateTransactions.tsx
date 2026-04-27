/**
 * Generates an array of mock financial transaction data for testing and demonstration purposes.
 */

export interface ITransaction {
    transactionDate: Date;
    amount: number;
    currency: string;
    category: string;
    merchant: string;
    status: boolean;
    country: string;
}

const countries = ['GB', 'IE', 'FR', 'DE', 'ES', 'NL', 'US'];
const countryCurrencyMap: Record<string, string> = {
    GB: 'GBP',
    IE: 'EUR',
    FR: 'EUR',
    DE: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    US: 'USD',
};

const statuses: { value: boolean; w: number }[] = [
    { value: true, w: 75 },
    { value: false, w: 25 },
];

const categories: { value: string; w: number; merchants: string[] }[] = [
    { value: 'Groceries', w: 14, merchants: ['Tesco', "Sainsbury's", 'Aldi', 'Lidl', 'Waitrose'] },
    { value: 'Rent', w: 6, merchants: ['Landlord Ltd', 'Lettings Co'] },
    { value: 'Utilities', w: 8, merchants: ['British Gas', 'Octopus Energy', 'Thames Water'] },
    { value: 'Dining', w: 10, merchants: ['Pret', "Nando's", 'PizzaExpress', 'Local Cafe'] },
    { value: 'Transport', w: 10, merchants: ['TfL', 'Uber', 'Bolt', 'National Rail'] },
    { value: 'Shopping', w: 12, merchants: ['Amazon', 'John Lewis', 'Argos', 'ASOS'] },
    { value: 'Travel', w: 6, merchants: ['easyJet', 'British Airways', 'Booking.com', 'Trainline'] },
    { value: 'Health', w: 5, merchants: ['Boots', 'NHS', 'Bupa'] },
    { value: 'Salary', w: 6, merchants: ['Acme Corp Payroll', 'Globex Payroll'] },
    { value: 'Transfers', w: 8, merchants: ['Internal Transfer', 'External Transfer'] },
    { value: 'Insurance', w: 5, merchants: ['Aviva', 'AXA', 'Direct Line'] },
    { value: 'Entertainment', w: 10, merchants: ['Netflix', 'Spotify', 'Cinema', 'Steam'] },
];

export function generateTransactions({ count = 10000, seed = 1 } = {}): ITransaction[] {
    // --- seeded RNG (Mulberry32) for repeatable demos ---
    function mulberry32(a: number) {
        return function () {
            let t = (a += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const rand = mulberry32(seed);
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const weightedPick = <T,>(items: { value: T; w: number }[]): T => {
        const total = items.reduce((s, x) => s + x.w, 0);
        let r = rand() * total;
        for (const it of items) {
            r -= it.w;
            if (r <= 0) return it.value;
        }
        return items[items.length - 1].value;
    };

    // Generate random date between startDate and endDate
    const year = new Date().getFullYear() - 1;
    const start = new Date(year, 0, 1).getTime(); // Jan 1, previous year
    const end = new Date(year, 11, 31).getTime(); // Dec 31, previous year
    const randomDate = () => new Date(start + Math.floor(rand() * (end - start)));

    // Amount model by category (simple but plausible)
    function amountForCategory(cat: string): number {
        const round2 = (x: number): number => {
            return Math.round(x * 100) / 100;
        };

        switch (cat) {
            case 'Rent':
                return round2(600 + rand() * 1600);
            case 'Utilities':
                return round2(30 + rand() * 220);
            case 'Groceries':
                return round2(10 + rand() * 180);
            case 'Dining':
                return round2(6 + rand() * 90);
            case 'Transport':
                return round2(2 + rand() * 120);
            case 'Shopping':
                return round2(8 + rand() * 450);
            case 'Travel':
                return round2(30 + rand() * 900);
            case 'Insurance':
                return round2(20 + rand() * 300);
            case 'Entertainment':
                return round2(5 + rand() * 80);
            case 'Health':
                return round2(5 + rand() * 250);
            case 'Salary':
                return round2(1800 + rand() * 3500);
            case 'Transfers':
                return round2(20 + rand() * 2000);
            default:
                return round2(5 + rand() * 200);
        }
    }

    const rows: ITransaction[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const catObj = weightedPick(categories.map((c) => ({ value: c, w: c.w })));
        const category = catObj.value;
        const merchant = pick(catObj.merchants);
        const txnDate = randomDate();
        const status = weightedPick(statuses);
        const country = pick(countries);
        const currency = countryCurrencyMap[country];
        const magnitude = amountForCategory(category);
        const amount = rand() < 0.5 ? -magnitude : magnitude;

        rows[i] = {
            transactionDate: txnDate,
            amount,
            currency,
            category,
            merchant,
            status,
            country,
        };
    }

    return rows;
}
