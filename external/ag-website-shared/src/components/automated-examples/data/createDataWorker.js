export function createDataWorker() {
    const DEFAULT_UPDATES_PER_MESSAGE = 100;
    const DEFAULT_MESSAGE_FREQUENCY = 200;
    const DEFAULT_MAX_TRADE_COUNT = 1;

    const VALUE_FIELDS = ['current', 'previous', 'gainDx'];

    let hasInitialised = false;
    let currentRecords;
    let updatesPerMessage = DEFAULT_UPDATES_PER_MESSAGE;
    let messageFrequency = DEFAULT_MESSAGE_FREQUENCY;

    const init = (config) => {
        const records = createRecords(config);

        postMessage({
            type: 'setRowData',
            records,
        });

        currentRecords = records;
        updatesPerMessage = config.updatesPerMessage ?? updatesPerMessage;
        messageFrequency = config.messageFrequency ?? messageFrequency;
        hasInitialised = true;
    };

    const pRandom = (() => {
        // From https://stackoverflow.com/a/3062783
        let seed = 123_456_789;
        const m = 2 ** 32;
        const a = 1_103_515_245;
        const c = 12_345;

        return () => {
            seed = (a * seed + c) % m;
            return seed / m;
        };
    })();

    const createRecords = (config) => {
        const categoriesData = config.categories;
        const categories = Object.keys(config.categories);
        const portfolios = config.portfolios;
        const maxTradeCount = config.maxTradeCount ?? DEFAULT_MAX_TRADE_COUNT;
        const records = [];
        let id = 24287;

        categories.forEach((categoryName) => {
            const category = categoriesData[categoryName];
            const { products } = category;
            portfolios.forEach((portfolio) => {
                products.forEach((product) => {
                    const tradeCount = Math.floor(pRandom() * maxTradeCount + 1); // At least 1 trade

                    for (let t = 0; t < tradeCount; t++) {
                        const rowData = createRowData({ id, category: categoryName, product, portfolio });
                        records.push(rowData);
                        id++;
                    }
                });
            });
        });

        return records;
    };

    const createRowData = ({ id, category, product, portfolio }) => {
        const current = Math.floor(pRandom() * 10000) + (pRandom() < 0.45 ? 500 : 19000);
        const previous = current + (pRandom() < 0.5 ? 500 : 19000);
        const gainDx = randomBetween(35000, 1000);
        const dealType = pRandom() < 0.2 ? 'Physical' : 'Financial';

        return {
            id,
            category,
            product,
            previous,
            current,
            gainDx,
            dealType,
            portfolio,
        };
    };

    function randomBetween(min, max) {
        return Math.floor(pRandom() * (max - min + 1)) + min;
    }

    function updateSomeRecords({ recordsToUpdate, updateCount }) {
        const itemsToUpdate = [];
        for (let k = 0; k < updateCount; k++) {
            if (recordsToUpdate.length === 0) {
                continue;
            }
            const indexToUpdate = Math.floor(pRandom() * recordsToUpdate.length);

            const field = VALUE_FIELDS[Math.floor(pRandom() * VALUE_FIELDS.length)];
            recordsToUpdate[indexToUpdate][field] += randomBetween(-8000, 8200);

            itemsToUpdate.push(recordsToUpdate[indexToUpdate]);
        }

        return itemsToUpdate;
    }

    const latestUpdateId = 0;
    let intervalId;
    function startUpdates(thisUpdateId) {
        if (messageFrequency <= 0) {
            return;
        }

        function intervalFunc() {
            const updatedRecords = updateSomeRecords({
                recordsToUpdate: currentRecords,
                updateCount: updatesPerMessage,
            });
            postMessage({
                type: 'updateData',
                records: updatedRecords,
            });
            if (thisUpdateId !== latestUpdateId) {
                clearInterval(intervalId);
            }
        }

        clearInterval(intervalId);
        intervalId = setInterval(intervalFunc, messageFrequency);
    }

    self.addEventListener('message', function ({ data }) {
        const message = data ?? {};
        if (message.type === 'init') {
            init(message.data);
        } else if (message.type === 'start') {
            if (!hasInitialised) {
                return;
            }
            startUpdates(latestUpdateId);
        } else if (message.type === 'stop') {
            clearInterval(intervalId);
        } else if (message.type === 'updateConfig') {
            updatesPerMessage = message.data?.updatesPerMessage ?? updatesPerMessage;
            messageFrequency = message.data?.messageFrequency ?? messageFrequency;
            clearInterval(intervalId);
            startUpdates(latestUpdateId);
        }
    });
}
