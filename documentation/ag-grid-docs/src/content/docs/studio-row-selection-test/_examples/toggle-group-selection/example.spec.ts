import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const usa = 'row-group-country-United States';
const russia = 'row-group-country-Russia';

test.agExample(import.meta, () => {
    test.eachFramework(
        'clicking a group row whose subtree is the whole selection deselects it',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await agIdFor.autoGroupCell(usa).first().click();
            await expect(agIdFor.rowNode(usa).first()).toHaveClass(/ag-row-selected/);

            await agIdFor.autoGroupCell(usa).first().click();
            await expect(agIdFor.rowNode(usa).first()).not.toHaveClass(/ag-row-selected/);
        }
    );

    test.eachFramework(
        'clicking a group row reduces the selection while another branch is selected',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await agIdFor.autoGroupCell(usa).first().click();
            await agIdFor
                .autoGroupCell(russia)
                .first()
                .click({ modifiers: ['ControlOrMeta'] });
            await expect(agIdFor.rowNode(usa).first()).toHaveClass(/ag-row-selected/);
            await expect(agIdFor.rowNode(russia).first()).toHaveClass(/ag-row-selected/);

            // the clicked subtree is not the whole selection, so the click drops the other branch
            await agIdFor.autoGroupCell(usa).first().click();
            await expect(agIdFor.rowNode(usa).first()).toHaveClass(/ag-row-selected/);
            await expect(agIdFor.rowNode(russia).first()).not.toHaveClass(/ag-row-selected/);

            // now it is, so the same click deselects it
            await agIdFor.autoGroupCell(usa).first().click();
            await expect(agIdFor.rowNode(usa).first()).not.toHaveClass(/ag-row-selected/);
        }
    );
});
