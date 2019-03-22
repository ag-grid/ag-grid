describe('Protractor Demo App', () => {
    it('templated cell values should update on row data changes', async () => {
        /*
        * Tests the issue where templated cells weren't being updated when deltaRowDataMode was set
        */
        browser.get('http://localhost:8080/e2e/angularjs-deltatests.html');

        let templateCell = null, rawCell = null;
        await element.all(by.css('.ag-cell-value')).then(async (elements) => {
            templateCell = await elements[0].getText();
            rawCell = await elements[1].getText();
        });

        expect(templateCell).toEqual('1');
        expect(rawCell).toEqual('1');

        const dbleButton = await element(by.id('updateRowData'));
        dbleButton.click();

        templateCell = null, rawCell = null, clickCell = null;
        await element.all(by.css('.ag-cell-value')).then(async (elements) => {
            templateCell = await elements[0].getText();
            rawCell = await elements[1].getText();
        });

        expect(templateCell).toEqual('2');
        expect(rawCell).toEqual('2');
    });

    it('data updates shouldnt not leave orphaned handlers', async () => {
        /*
        * Tests the issue where templated cells were orphaned when deltaRowDataMode was set
        * This caused issues when you had handlers that were invoked many times (once for each orphan + the current cell)
        */
        browser.get('http://localhost:8080/e2e/angularjs-deltatests.html');

        let clickCell = null;
        await element.all(by.css('.ag-cell-value')).then(async (elements) => {
            clickCell = await elements[2].getText();
        });
        expect(clickCell).toEqual('Click Me 1');

        const dbleButton = await element(by.id('updateRowData'));
        await dbleButton.click();

        // await browser.sleep(10);

        const angularButton = await element(by.id('angularClick'));
        await angularButton.click();

        // await browser.sleep(10);

        await element.all(by.css('.ag-cell-value')).then(async (elements) => {
            clickCell = await elements[2].getText();
        });
        expect(clickCell).toEqual('Click Me 2');
    });
});
