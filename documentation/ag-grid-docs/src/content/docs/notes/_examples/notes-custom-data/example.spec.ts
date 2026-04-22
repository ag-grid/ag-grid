import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pre-seeded notes have indicators and custom metadata classes', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/note-type-team/);
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/note-priority-high/);

        await expect(agIdFor.cell('3', 'country')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('3', 'country')).toHaveClass(/note-type-review/);
        await expect(agIdFor.cell('3', 'country')).toHaveClass(/note-priority-medium/);

        await expect(agIdFor.cell('5', 'sport')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('5', 'sport')).toHaveClass(/note-type-personal/);
        await expect(agIdFor.cell('5', 'sport')).toHaveClass(/note-priority-low/);
    });
});
