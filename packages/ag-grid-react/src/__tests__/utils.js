it('empty', () => {
});

export const ensureGridApiHasBeenSet = component => new Promise(function (resolve, reject) {
    (function waitForGridReady() {
        // we need to wait for the gridReady event before we can start interacting with the grid
        // in this case we're looking at the api property in our App component, but it could be anything (ie a boolean flag)
        if (component.instance().api) {

            // once our condition has been met we can start the tests
            return resolve();
        }

        // not set - wait a bit longer
        setTimeout(waitForGridReady, 10);
    })();
});
