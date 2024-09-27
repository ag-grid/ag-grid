export const data = [
    {
        product: 'Palm Oil',
        portfolio: 'Aggressive',
        book: 'GL-62472',
        tradeId: 0,
        current: 23558,
        previous: 27014,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Aggressive',
        book: 'GL-62472',
        tradeId: 1,
        current: 92080,
        previous: 97460,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Hybrid',
        book: 'GL-62473',
        tradeId: 2,
        current: 1352,
        previous: 5835,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Hybrid',
        book: 'GL-62473',
        tradeId: 3,
        current: 87685,
        previous: 91535,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Defensive',
        book: 'GL-62474',
        tradeId: 4,
        current: 25263,
        previous: 26374,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Defensive',
        book: 'GL-62474',
        tradeId: 5,
        current: 65201,
        previous: 69745,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Income',
        book: 'GL-62475',
        tradeId: 6,
        current: 48405,
        previous: 50367,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Income',
        book: 'GL-62475',
        tradeId: 7,
        current: 65361,
        previous: 64564,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Speculative',
        book: 'GL-62476',
        tradeId: 8,
        current: 94747,
        previous: 94067,
    },
    {
        product: 'Palm Oil',
        portfolio: 'Speculative',
        book: 'GL-62476',
        tradeId: 9,
        current: 28967,
        previous: 32447,
    },
];

let currentServerRecordId = data.length;
export function createRowOnServer(portfolio, product, book) {
    const groupDidExist = data.some((record) => record.portfolio === 'Aggressive');
    const newRecord = {
        tradeId: ++currentServerRecordId,
        portfolio: portfolio,
        product: product,
        book: book,
        current: 0,
        previous: 0,
    };
    data.push(newRecord);

    return {
        success: true,
        newGroupCreated: !groupDidExist,
        newRecord: newRecord,
    };
}
