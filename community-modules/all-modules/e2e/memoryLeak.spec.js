describe('Protractor Demo App', () => {
    it('rowNode in cell renderer', async () => {
        await browser.get('http://localhost:8080/e2e/angularjs.rowNode.html');

        let rawCell = null;
        await element.all(by.css('.ag-cell-value')).then(async (elements) => {
            rawCell = await elements[0].getText();
        });

        expect(rawCell).toEqual('Not Selected');

        const selectNodeButton = await element(by.id('selectNode'));
        selectNodeButton.click();

        rawCell = null;
        await element.all(by.css('.ag-cell-value')).then(async (elements) => {
            rawCell = await elements[0].getText();
        });

        expect(rawCell).toEqual('Selected');
    });
});
