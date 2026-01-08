// synthetic-transactions.ts
// Usage:
//   const rows = generateTransactions({ count: 50000, seed: 42 });

export interface ITransaction {
    transaction_id: string;
    account_id: string;
    account_type: string;
    transaction_date: string;
    settlement_date: string | null;
    amount: number;
    signed_amount: number;
    currency: string;
    type: string;
    category: string;
    merchant: string;
    status: string;
    country: string;
    month: string;
    year: number;
}

export function generateTransactions({
    count = 10000,
    seed = 1,
    startDate = '2024-01-01',
    endDate = '2025-12-31',
    accountCount = 200,
    defaultCurrency = 'GBP',
} = {}): ITransaction[] {
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
    const pad = (n: number) => String(n).padStart(2, '0');

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const randomDate = () => new Date(start + Math.floor(rand() * (end - start)));

    // --- dimensions geared for NL → grid operations ---
    const countries = ['GB', 'IE', 'FR', 'DE', 'ES', 'NL', 'US'];
    const currencies: { value: string; w: number }[] = [
        { value: 'GBP', w: 60 },
        { value: 'EUR', w: 25 },
        { value: 'USD', w: 15 },
    ];

    const statuses: { value: string; w: number }[] = [
        { value: 'Completed', w: 75 },
        { value: 'Failed', w: 25 },
    ];

    const categories: { value: string; w: number; merchants: string[] }[] = [
        { value: 'Groceries', w: 14, merchants: ['Tesco', "Sainsbury's", 'Aldi', 'Lidl', 'Waitrose'] },
        { value: 'Rent', w: 6, merchants: ['Landlord Ltd', 'Lettings Co'] },
        { value: 'Utilities', w: 8, merchants: ['British Gas', 'Octopus Energy', 'Thames Water'] },
        { value: 'Dining', w: 10, merchants: ["Pret", "Nando's", 'PizzaExpress', 'Local Cafe'] },
        { value: 'Transport', w: 10, merchants: ['TfL', 'Uber', 'Bolt', 'National Rail'] },
        { value: 'Shopping', w: 12, merchants: ['Amazon', 'John Lewis', 'Argos', 'ASOS'] },
        { value: 'Travel', w: 6, merchants: ['easyJet', 'British Airways', 'Booking.com', 'Trainline'] },
        { value: 'Health', w: 5, merchants: ['Boots', 'NHS', 'Bupa'] },
        { value: 'Salary', w: 6, merchants: ['Acme Corp Payroll', 'Globex Payroll'] },
        { value: 'Transfers', w: 8, merchants: ['Internal Transfer', 'External Transfer'] },
        { value: 'Insurance', w: 5, merchants: ['Aviva', 'AXA', 'Direct Line'] },
        { value: 'Entertainment', w: 10, merchants: ['Netflix', 'Spotify', 'Cinema', 'Steam'] },
    ];

    const accountTypes: { value: string; w: number }[] = [
        { value: 'Checking', w: 55 },
        { value: 'Savings', w: 30 },
        { value: 'Credit Card', w: 15 },
    ];

    // Pre-generate accounts so grouping by account is meaningful
    const accounts = Array.from({ length: accountCount }, (_, i) => {
        const type = weightedPick(accountTypes);
        const id = `${String(i + 1).padStart(4, '0')}`;
        return { account_id: id, account_type: type };
    });

    // Amount model by category (simple but plausible)
    function amountForCategory(cat: string): number {
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

    function round2(x: number): number {
        return Math.round(x * 100) / 100;
    }

    // Decide debit/credit biased by category
    function typeForCategory(cat: string): string {
        if (cat === 'Salary') return 'Credit';
        if (cat === 'Transfers') return rand() < 0.5 ? 'Debit' : 'Credit';
        return 'Debit';
    }

    const rows: ITransaction[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const acct = pick(accounts);

        const catObj = weightedPick(categories.map((c) => ({ value: c, w: c.w })));
        const category = catObj.value;
        const merchant = pick(catObj.merchants);

        const txnDate = randomDate();
        const isoDate = txnDate.toISOString();
        const year = txnDate.getUTCFullYear();
        const month = `${year}-${pad(txnDate.getUTCMonth() + 1)}`;

        const txnType = typeForCategory(category);
        const currency = weightedPick(currencies);
        const status = weightedPick(statuses);
        const country = pick(countries);

        const magnitude = amountForCategory(category);

        // signed_amount: Debit negative, Credit positive (nice for SUMs)
        const signed_amount = txnType === 'Debit' ? -magnitude : magnitude;

        // settlement: 0–2 days after transaction, but Failed has none
        const settlement_date =
            status === 'Failed' ? null : new Date(txnDate.getTime() + Math.floor(rand() * 3) * 86400000).toISOString();

        rows[i] = {
            transaction_id: `TX-${String(i + 1).padStart(4, '0')}`,
            account_id: acct.account_id,
            account_type: acct.account_type,

            transaction_date: isoDate,
            settlement_date,

            // measures
            amount: magnitude,
            signed_amount,

            // dimensions
            currency: currency ?? defaultCurrency,
            type: txnType,
            category,
            merchant,
            status,
            country,

            // derived bucket fields for grouping/pivoting
            month,
            year,
        };
    }

    return rows;
}
