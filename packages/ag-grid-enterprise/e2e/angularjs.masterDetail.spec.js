describe('Protractor Demo App', () => {
    it('detail grid angularjs binding work - double child grid values', async () => {
        await browser.get('http://localhost:8080/e2e/angularjs-masterDetail.html');

        let rawCell = null;
        await element.all(by.css('div[ref=eDetailGrid] .ag-cell-value')).then(async (elements) => {
            rawCell = await elements[0].getText();
        });

        expect(rawCell).toEqual('10');

        const dbleButton = await element(by.id('ngButton'));
        dbleButton.click();

        rawCell = null;
        await element.all(by.css('div[ref=eDetailGrid] .ag-cell-value')).then(async (elements) => {
            rawCell = await elements[0].getText();
        });

        expect(rawCell).toEqual('20');
    });
});
