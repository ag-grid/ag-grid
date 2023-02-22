import cheerio from 'cheerio';

it('empty', () => {
});

export const ensureGridApiHasBeenSet = component => {
    return waitForAsyncCondition(() => {
        return component.instance().api !== undefined
    }, 5)
};

export const waitForAsyncCondition = (condition, maxAttempts, attempts=0) => new Promise(function (resolve, reject) {
    (function waitForCondition() {
        // we need to wait for the gridReady event before we can start interacting with the grid
        // in this case we're looking at the api property in our App component, but it could be anything (ie a boolean flag)
        if (condition()) {
            // once our condition has been met we can start the tests
            return resolve();
        }
        attempts++;

        if(attempts >= maxAttempts) {
            reject("Max timeout waiting for condition")
        }

        // not set - wait a bit longer
        setTimeout(waitForCondition, 20);
    })();
});

export const wait = ms => new Promise((r) => setTimeout(r, ms));

export const elementsForSelector = (renderedOutput, selector) => renderedOutput.find(selector);
export const htmlForSelector = (renderedOutput, selector) => elementsForSelector(renderedOutput, selector).map((index, element) => cheerio(element).html());
