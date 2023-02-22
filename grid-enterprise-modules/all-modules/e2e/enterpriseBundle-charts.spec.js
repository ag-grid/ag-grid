describe('Protractor Demo App', () => {
    it('verify chart canvas appears when rendering a chart', async () => {
        browser.waitForAngularEnabled(false);
        await browser.get('http://localhost:8080/e2e/enterpriseBundle-charts.html');

        const chartButton = await element(by.id('chartRange'));
        chartButton.click();

        const canvasElement = element(by.css('div.ag-dialog canvas'));
        expect(canvasElement.isPresent()).toBeTruthy();
    });
});
