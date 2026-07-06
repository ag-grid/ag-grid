import { DIALOG_CALLBACKS } from './dialog';

describe('Dialog focus overrides', () => {
    test('tabbing forward out of the dialog forces focus out of the grid in a single tab', () => {
        const gridCtrl = {
            focusNextInnerContainer: vi.fn(() => undefined),
            forceFocusOutOfContainer: vi.fn(),
            isDetailGrid: vi.fn(() => false),
            isFocusInsideGridBody: vi.fn(() => false),
        };
        const beans = { ctrlsSvc: { get: vi.fn(() => gridCtrl) } } as any;

        DIALOG_CALLBACKS.focusNextContainer(beans, false);

        expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
        expect(gridCtrl.forceFocusOutOfContainer).toHaveBeenCalledWith(false);
    });
});
