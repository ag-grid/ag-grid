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

const GROW_CLASS = 'ag-virtual-list-grow-to-content';

/**
 * A list whose rendered rows report `rowWidths`, and whose own box is `boxWidth` wide with a 2px border, so the
 * width the callback receives is `max(rowWidths) + 2`. `draw()` runs one `drawVirtualRows` pass over them.
 */
function createMeasurableList(rowWidths: number[], boxWidth = 500) {
    const { list } = createList<string>();
    const gui = list.getGui() as HTMLElement;

    Object.defineProperty(gui, 'getBoundingClientRect', { value: () => ({ width: boxWidth }), configurable: true });
    Object.defineProperty(gui, 'clientWidth', { value: boxWidth - 2, configurable: true });
    // The ref is wired by postConstruct, which this bare component never runs.
    const eContainer = ((list as any).eContainer = gui.querySelector('.ag-virtual-list-container')!);
    Object.defineProperty(eContainer, 'getBoundingClientRect', {
        value: () => ({ width: boxWidth - 2 }),
        configurable: true,
    });

    (list as any).forEachRenderedRow = (callback: (cmp: any, idx: number) => void) => {
        rowWidths.forEach((width, idx) =>
            callback(
                {
                    getCompId: () => `${idx}`,
                    getValue: () => 'value',
                    toggleHighlighted: vi.fn(),
                    updateSelected: vi.fn(),
                    getGui: () => ({ getBoundingClientRect: () => ({ width }) }),
                },
                idx
            )
        );
    };
    (list as any).refresh = vi.fn();
    (list as any).ensureIndexVisible = vi.fn();
    list.setCurrentList(rowWidths.map((_, idx) => `row-${idx}`));

    const virtualListPrototype = Object.getPrototypeOf(Object.getPrototypeOf(list));
    const drawSpy = vi.spyOn(virtualListPrototype, 'drawVirtualRows').mockImplementation(() => {});

    return {
        list,
        gui,
        draw: () => (list as any).drawVirtualRows(true),
        restore: () => drawSpy.mockRestore(),
    };
}

/**
 * A list whose own width is whatever the callback last asked for, with `inset` of it taken by a scrollbar or
 * a sub-pixel border, so growing it feeds straight back into the next measurement. `clientWidth` rounds, as
 * the real one does. A row is `min-width: 100%`, so it never measures narrower than the container.
 */
function createGrowingList(rowContentWidth: number, getListWidth: () => number, inset: number) {
    const { list } = createList<string>();
    const gui = list.getGui() as HTMLElement;
    const getContainerWidth = () => getListWidth() - inset;

    Object.defineProperty(gui, 'getBoundingClientRect', {
        value: () => ({ width: getListWidth() }),
        configurable: true,
    });
    Object.defineProperty(gui, 'clientWidth', {
        get: () => Math.round(getContainerWidth()),
        configurable: true,
    });
    // The ref is wired by postConstruct, which this bare component never runs.
    const eContainer = ((list as any).eContainer = gui.querySelector('.ag-virtual-list-container')!);
    Object.defineProperty(eContainer, 'getBoundingClientRect', {
        value: () => ({ width: getContainerWidth() }),
        configurable: true,
    });

    // `min-width: 100%` on a row, which is what makes the list's own width part of what it reports.
    (list as any).forEachRenderedRow = (callback: (cmp: any, idx: number) => void) =>
        callback(
            {
                getCompId: () => '0',
                getValue: () => 'value',
                toggleHighlighted: vi.fn(),
                updateSelected: vi.fn(),
                getGui: () => ({
                    getBoundingClientRect: () => ({ width: Math.max(rowContentWidth, getContainerWidth()) }),
                }),
            },
            0
        );
    (list as any).refresh = vi.fn();
    (list as any).ensureIndexVisible = vi.fn();
    list.setCurrentList(['row-0']);

    const virtualListPrototype = Object.getPrototypeOf(Object.getPrototypeOf(list));
    const drawSpy = vi.spyOn(virtualListPrototype, 'drawVirtualRows').mockImplementation(() => {});

    return { list, draw: () => (list as any).drawVirtualRows(true), restore: () => drawSpy.mockRestore() };
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

    it('reports the widest overflowing row plus the width its own border takes', () => {
        const { list, draw, restore } = createMeasurableList([120, 560.4, 90]);
        const reportContentWidth = vi.fn().mockReturnValue(true);

        try {
            list.setContentWidthCallback(reportContentWidth);
            draw();
        } finally {
            restore();
        }

        expect(reportContentWidth).toHaveBeenCalledTimes(1);
        expect(reportContentWidth).toHaveBeenCalledWith(563);
    });

    it('reports nothing while every row fits the width the list already has', () => {
        const { list, draw, restore } = createMeasurableList([120, 180.4, 90]);
        const reportContentWidth = vi.fn().mockReturnValue(true);

        try {
            list.setContentWidthCallback(reportContentWidth);
            draw();
        } finally {
            restore();
        }

        expect(reportContentWidth).not.toHaveBeenCalled();
    });

    /** Drives `grow` passes of the measure-grow-remeasure loop and returns every width asked for. */
    function runGrowthLoop(rowContentWidth: number, inset: number): number[] {
        let listWidth = 200;
        const { list, draw, restore } = createGrowingList(rowContentWidth, () => listWidth, inset);
        const asked: number[] = [];

        try {
            list.setContentWidthCallback((width) => {
                asked.push(width);
                listWidth = width;
                return true;
            });
            for (let i = 0; i < 5; ++i) {
                draw();
            }
        } finally {
            restore();
        }
        return asked;
    }

    it('asks for the room an overflowing row needs once, and stops once it has it', () => {
        // A scrollbar takes 15 of the list's width, so a 260 wide row needs 275 to be seen in full. Growing
        // to it widens the rows too, and that width must not be asked for a second time.
        expect(runGrowthLoop(260, 15)).toEqual([275]);
    });

    it('asks for nothing when only a sub-pixel border separates a row from the width it has', () => {
        // `clientWidth` rounds where the row and the container do not, so comparing against it reads the
        // difference as an overflow and grows by a pixel on every redraw, for ever.
        expect(runGrowthLoop(100, 1.6)).toEqual([]);
    });

    it('lays rows out at their content width only while armed', () => {
        const { list, gui, draw, restore } = createMeasurableList([620]);

        try {
            expect(gui.classList.contains(GROW_CLASS)).toBe(false);

            list.setContentWidthCallback(vi.fn().mockReturnValue(true));
            expect(gui.classList.contains(GROW_CLASS)).toBe(true);

            draw();
            expect(gui.classList.contains(GROW_CLASS)).toBe(true);
        } finally {
            restore();
        }
    });

    it('stops measuring and restores elision once the callback reports no room left', () => {
        const { list, gui, draw, restore } = createMeasurableList([620]);
        const reportContentWidth = vi.fn().mockReturnValue(false);

        try {
            list.setContentWidthCallback(reportContentWidth);
            draw();
            draw();
        } finally {
            restore();
        }

        expect(reportContentWidth).toHaveBeenCalledTimes(1);
        expect(gui.classList.contains(GROW_CLASS)).toBe(false);
    });

    it('stays armed when a draw renders no rows, so a later draw can still measure', () => {
        const { list, gui, draw, restore } = createMeasurableList([]);
        const reportContentWidth = vi.fn().mockReturnValue(false);

        try {
            list.setContentWidthCallback(reportContentWidth);
            draw();
        } finally {
            restore();
        }

        expect(reportContentWidth).not.toHaveBeenCalled();
        expect(gui.classList.contains(GROW_CLASS)).toBe(true);
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
