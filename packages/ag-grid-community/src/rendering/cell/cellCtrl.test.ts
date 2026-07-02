import type { Mock } from 'vitest';

import type { BeanCollection } from '../../context/context';
import type { EditModelService } from '../../edit/editModelService';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { IFormulaService } from '../../interfaces/formulas';
import { CellCtrl } from './cellCtrl';

describe('CellCtrl', () => {
    const createCellCtrl = (params?: { editing?: boolean; formulaError?: boolean; cellValidationError?: boolean }) => {
        const { editing = false, formulaError = false, cellValidationError = false } = params ?? {};
        const ctrl = Object.create(CellCtrl.prototype) as CellCtrl;

        (ctrl as unknown as { column: AgColumn }).column = {} as AgColumn;
        (ctrl as unknown as { rowNode: RowNode }).rowNode = {} as RowNode;
        (ctrl as unknown as { editSvc: { isEditing: Mock } }).editSvc = {
            isEditing: vi.fn(() => editing),
        };
        (ctrl as unknown as { beans: Partial<BeanCollection> }).beans = {
            formula: {
                active: true,
                getFormulaError: vi.fn(() => (formulaError ? new Error('Formula error') : null)),
            } as unknown as IFormulaService,
            editModelSvc: {
                getCellValidationModel: () => ({
                    hasCellValidation: vi.fn(() => cellValidationError),
                }),
            } as unknown as EditModelService,
        };

        return ctrl;
    };

    it.each([
        ['editing', { editing: true }],
        ['formula errors', { formulaError: true }],
        ['cell validation errors', { cellValidationError: true }],
    ])('suppresses note hover when the cell has %s', (_reason, params) => {
        const ctrl = createCellCtrl(params);

        expect(ctrl.isNoteHoverSuppressed()).toBe(true);
    });

    it('does not suppress note hover when the cell is not editing and has no errors', () => {
        const ctrl = createCellCtrl();

        expect(ctrl.isNoteHoverSuppressed()).toBe(false);
    });
});
