describe('Basic Tests of UMD Bundle', function () {
    it('Visit Simple Bundle Test With React Cell Renderer', function () {
        cy.visit('./cypress/integration/umd_index.html');

        cy.wait(50)

        cy.get('.ag-cell-value').should('to.have.length.greaterThan', 5); // 5 is a bit arbitrary - should be around 20 or so

        // id column - first row should be 10
        cy.get('.ag-cell-value').then(rows => {
            expect(rows[0].innerText).to.equal("10");
        });

        // framework column - first row should be Data 10
        cy.get('.ag-cell-value .ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("Data 10");
        })
    })
});
