describe('Basic Tests of UMD Bundle', function () {
    it('Visit Simple Bundle Test With React Cell Renderer', function () {
        cy.visit('./cypress/integration/funcRendererWithNan.html');

        cy.get('.ag-react-container').should('have.length', 2);
        cy.get('.ag-react-container').then(rows => {
            expect(rows[0].innerText).to.equal("NaN");
            expect(rows[1].innerText).to.equal("10");
        });
    })
});
