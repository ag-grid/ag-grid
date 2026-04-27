import type { RichSelectParams } from 'ag-grid-community';

import { AgRichSelectList } from './agRichSelectList';

type ComplexValue = { id: number; label: string };

function createList<TValue>(params?: Partial<RichSelectParams<TValue>>) {
    const wrapper = document.createElement('div');
    const list = new AgRichSelectList<TValue>(
        {
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'ag-list',
            ...(params as any),
        },
        wrapper,
        () => ''
    ) as AgRichSelectList<TValue> & Record<string, any>;

    return { list, wrapper };
}

describe('AgRichSelectList', () => {
    it('clears active option attributes when highlight is removed', () => {
        const { list, wrapper } = createList<string>();
        wrapper.setAttribute('data-active-option', 'option-1');
        wrapper.setAttribute('aria-activedescendant', 'option-1');
        list.setCurrentList(['a', 'b']);

        list.highlightIndex(-1);

        expect(wrapper.hasAttribute('data-active-option')).toBe(false);
        expect(wrapper.hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('finds indices for mixed primitive and complex values', () => {
        const { list } = createList<ComplexValue | number>({
            valueFormatter: ((value: ComplexValue | number) =>
                typeof value === 'number' ? `n-${value}` : `id-${value.id}`) as any,
        });
        const objectInList = { id: 2, label: 'two' };
        list.setCurrentList([1, objectInList, 3]);

        const indices = list.getIndicesForValues([1, { id: 2, label: 'two (copy)' }, 4] as any);

        expect(indices).toEqual([0, 1]);
    });

    it('matches primitive current values against complex list items via formatted text', () => {
        const { list } = createList<ComplexValue>({
            valueFormatter: ((value: ComplexValue) => value.label) as any,
        });
        const pink = { id: 1, label: 'Pink' };
        const blue = { id: 2, label: 'Blue' };
        list.setCurrentList([pink, blue]);

        expect(list.getIndicesForValues('Pink' as any)).toEqual([0]);
    });

    it('matches selected complex objects by reference first, then formatter', () => {
        const { list } = createList<ComplexValue>({
            valueFormatter: ((value: ComplexValue) => `id-${value.id}`) as any,
        });
        const selectedByReference = { id: 1, label: 'one' };
        const selectedByFormatter = { id: 2, label: 'two' };

        list.setCurrentList([selectedByReference, selectedByFormatter]);
        (list as any).selectedItems.add(selectedByReference);
        (list as any).selectedItems.add(selectedByFormatter);

        expect((list as any).findItemInSelected(selectedByReference)).toBe(selectedByReference);
        expect((list as any).findItemInSelected({ id: 2, label: 'two-copy' })).toBe(selectedByFormatter);
    });

    it('keeps highlight state when selected rows render after selection', () => {
        const { list, wrapper } = createList<string>();
        list.setCurrentList(['Pink', 'Blue']);

        let rendered = false;
        const row = {
            getCompId: () => '123',
            getValue: () => 'Pink',
            toggleHighlighted: vi.fn(),
            updateSelected: vi.fn(),
        };

        (list as any).forEachRenderedRow = (callback: (cmp: any, idx: number) => void) => {
            if (rendered) {
                callback(row, 0);
            }
        };
        (list as any).refresh = vi.fn();
        (list as any).ensureIndexVisible = vi.fn();

        list.selectValue('Pink');
        expect(row.toggleHighlighted).not.toHaveBeenCalled();

        const virtualListPrototype = Object.getPrototypeOf(Object.getPrototypeOf(list));
        const drawVirtualRowsSpy = vi.spyOn(virtualListPrototype, 'drawVirtualRows').mockImplementation(() => {});
        try {
            rendered = true;
            (list as any).drawVirtualRows(true);

            expect(row.toggleHighlighted).toHaveBeenCalledWith(true);
            expect(wrapper.getAttribute('data-active-option')).toBe('ag-rich-select-row-123');
        } finally {
            drawVirtualRowsSpy.mockRestore();
        }
    });

    it('clamps mouse-derived row index to zero for positions above the list', () => {
        const { list } = createList<string>();
        const gui = list.getGui() as HTMLElement;

        Object.defineProperty(gui, 'getBoundingClientRect', {
            value: () => ({ top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 }),
        });
        (list as any).model = { getRowCount: () => 5 };
        (list as any).getRowHeight = () => 20;

        const row = (list as any).getRowForMouseEvent({ clientY: 50 } as MouseEvent);

        expect(row).toBe(0);
    });

    it('does not require valueFormatter for object index lookup by reference', () => {
        const { list } = createList<ComplexValue>();
        const objectValue = { id: 5, label: 'five' };
        list.setCurrentList([objectValue]);

        expect(() => list.getIndicesForValues(objectValue)).not.toThrow();
        expect(list.getIndicesForValues(objectValue)).toEqual([0]);
    });

    it('finds null entries when using null as the current-value sentinel', () => {
        const { list } = createList<string | null>();
        list.setCurrentList(['Open', null, 'Closed']);

        expect(list.getIndicesForValues(null)).toEqual([1]);
    });

    it('does not match null sentinel to empty-string options', () => {
        const { list } = createList<string | null>();
        list.setCurrentList(['', 'Open', 'Closed']);

        expect(list.getIndicesForValues(null)).toEqual([]);
    });

    it('requests more rows when viewport is close to the end', () => {
        const { list } = createList<string>();
        const callback = vi.fn();
        const gui = list.getGui() as HTMLElement;

        Object.defineProperty(gui, 'clientHeight', { value: 100, configurable: true });
        Object.defineProperty(gui, 'scrollHeight', { value: 700, configurable: true });
        Object.defineProperty(gui, 'scrollTop', { value: 560, configurable: true });

        (list as any).getRowHeight = () => 20;
        list.setCurrentList(new Array(40).fill('value'));
        list.setLoadMoreRowsCallback(callback, 2);

        (list as any).onGuiScroll();

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith('down');
    });

    it('requests previous rows when viewport is close to the start', () => {
        const { list } = createList<string>();
        const callback = vi.fn();
        const gui = list.getGui() as HTMLElement;

        Object.defineProperty(gui, 'clientHeight', { value: 100, configurable: true });
        Object.defineProperty(gui, 'scrollHeight', { value: 700, configurable: true });
        Object.defineProperty(gui, 'scrollTop', { value: 20, configurable: true });

        (list as any).getRowHeight = () => 20;
        list.setCurrentList(new Array(40).fill('value'));
        list.setLoadMoreRowsCallback(callback, 2);

        (list as any).onGuiScroll();

        expect(callback).toHaveBeenCalledWith('up');
    });

    it('requests previous rows from layout checks when there is no vertical overflow', () => {
        const { list } = createList<string>();
        const callback = vi.fn();
        const gui = list.getGui() as HTMLElement;

        Object.defineProperty(gui, 'clientHeight', { value: 200, configurable: true });
        Object.defineProperty(gui, 'scrollHeight', { value: 200, configurable: true });
        Object.defineProperty(gui, 'scrollTop', { value: 0, configurable: true });

        (list as any).getRowHeight = () => 20;
        list.setCurrentList(new Array(5).fill('value'));
        list.setLoadMoreRowsCallback(callback, 2);

        expect(callback).toHaveBeenCalledWith('up');
    });

    it('allows requesting more rows even when the current list is empty', () => {
        const { list } = createList<string>();
        const callback = vi.fn();
        const gui = list.getGui() as HTMLElement;

        Object.defineProperty(gui, 'clientHeight', { value: 100, configurable: true });
        Object.defineProperty(gui, 'scrollHeight', { value: 100, configurable: true });
        Object.defineProperty(gui, 'scrollTop', { value: 0, configurable: true });

        (list as any).getRowHeight = () => 20;
        list.setCurrentList([]);
        list.setLoadMoreRowsCallback(callback, 2);

        (list as any).onGuiScroll();

        expect(callback).toHaveBeenCalled();
    });

    it('announces loading and no-matches state transitions', () => {
        const { list } = createList<string>({ allowNoResultsCopy: true });
        const announce = vi.fn();

        (list as any).loadingLabel = 'Loading...';
        (list as any).noMatchesLabel = 'No matches to show';
        list.setStateAnnouncementCallback(announce);

        list.setIsLoading();
        list.setCurrentList([]);

        expect(announce).toHaveBeenNthCalledWith(1, 'Loading...');
        expect(announce).toHaveBeenNthCalledWith(2, 'No matches to show');
    });
});
