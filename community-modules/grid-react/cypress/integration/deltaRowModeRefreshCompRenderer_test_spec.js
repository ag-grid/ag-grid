describe('Basic Tests of UMD Bundle', function () {
    it('Visit Simple Bundle Test With React Cell Renderer', function () {
        cy.visit('./cypress/integration/deltaRowModeRefreshCompRenderer.html');

        // we check the values here to determine if the rendered rows are correct, but we're also
        // implicitly checking the console log for errors (see support/commands.js and plugins/index.js)

        cy.get('.ag-react-container').should('to.have.length.greaterThan', 5);
        cy.get('.ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("Data 100");
        });

        cy.get('#addNewRow').click();
        cy.get('.ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("New Data 101");
        });

        cy.get('#modifyRow').click()
        cy.get('.ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("New Data 101*");
        });

        cy.get('#addNewRow').click();
        cy.get('.ag-react-container').then(rows => {
            expect(rows[1].innerText).to.equal("New Data 101*");
        });
    })
});
