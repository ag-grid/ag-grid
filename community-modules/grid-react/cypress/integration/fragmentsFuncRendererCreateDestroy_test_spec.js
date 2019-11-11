describe('Basic Tests of UMD Bundle', function () {
    it('Visit Simple Bundle Test With React Cell Renderer', function () {
        cy.visit('./cypress/integration/fragmentsFuncRendererCreateDestroy.html');

        // we check the values here to determine if the rendered rows are correct, but we're also
        // implicitly checking the console log for errors (see support/commands.js and plugins/index.js)

        cy.get('.ag-react-container').should('to.have.length.greaterThan', 5);
        cy.get('.ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("0");  // Cube Column
        });

        cy.get('#scrollToBottom').click();
        cy.get('.ag-react-container').should('to.have.length.greaterThan', 5);
        cy.get('.ag-react-container').then(rows => {
            // although 1000000 will be visible, previous rows will be visible too - 729000 is the first rendered row now
            expect(rows[0].innerText).to.equal("729000");  // Cube Column
        });

        cy.get('#scrollToTop').click()
        cy.get('.ag-react-container').should('to.have.length.greaterThan', 5);
        cy.get('.ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("0");  // Cube Column
        });
    })
});
