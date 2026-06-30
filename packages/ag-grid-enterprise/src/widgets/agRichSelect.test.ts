import type { RichSelectParams } from 'ag-grid-community';

import { AgPillContainer } from './AgPillContainer';
import { AgRichSelect } from './agRichSelect';

type ComplexValue = { id: number; label: string };

function createRichSelect<TValue>(config?: Partial<RichSelectParams<TValue>>): any {
    return new AgRichSelect<TValue>(config as RichSelectParams<TValue>);
}

const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('AgRichSelect', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('applies required picker defaults when config is partial', () => {
        const richSelect = createRichSelect<string>();
        const { config } = richSelect;

        expect(config.pickerAriaLabelKey).toBe('ariaLabelRichSelectField');
        expect(config.pickerAriaLabelValue).toBe('Rich Select Field');
        expect(config.pickerType).toBe('ag-list');
        expect(config.valueFormatter('')).toBe('');
    });

    it('announces list state changes through ariaAnnouncementService', () => {
        const richSelect = createRichSelect<string>();
        const announceValue = vi.fn();
        let stateAnnouncementCallback: ((value: string) => void) | undefined;
        const listComponent = {
            setLoadMoreRowsCallback: vi.fn(),
            setStateAnnouncementCallback: vi.fn((callback: (value: string) => void) => {
                stateAnnouncementCallback = callback;
            }),
            setParentComponent: vi.fn(),
        };

        richSelect.ariaAnnounce = { announceValue };
        richSelect.createBean = vi.fn(() => listComponent);
        richSelect.addManagedListeners = vi.fn();
        richSelect.getFocusableElement = vi.fn(() => document.createElement('div'));

        richSelect.createListComponent();
        stateAnnouncementCallback?.('Loading...');
        stateAnnouncementCallback?.('No matches to show');

        expect(announceValue).toHaveBeenNthCalledWith(1, 'Loading...', 'richSelect');
        expect(announceValue).toHaveBeenNthCalledWith(2, 'No matches to show', 'richSelect');
    });

    it('preserves explicit null initial values', () => {
        const richSelect = createRichSelect<string | null>({ value: null });

        expect(richSelect.value).toBeNull();
    });

    it('renders empty string as a selected value, not as placeholder', () => {
        const richSelect = createRichSelect<string>({
            value: '',
            placeholder: 'Choose...',
        });
        const eDisplayField = document.createElement('span');
        const tooltipFeature = { setTooltipAndRefresh: vi.fn() };

        richSelect.eDisplayField = eDisplayField;
        richSelect.tooltipFeature = tooltipFeature;
        richSelect.value = '';

        richSelect.renderSelectedValue();

        expect(eDisplayField.classList.contains('ag-display-as-placeholder')).toBe(false);
        expect(eDisplayField.textContent).toBe('');
        expect(tooltipFeature.setTooltipAndRefresh).toHaveBeenCalledWith('');
    });

    it('keeps empty-string input empty for allowTyping even when formatter provides a label', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            valueFormatter: (value) => (value === '' ? '-- SELECT --' : String(value)),
        });
        const setValue = vi.fn();

        richSelect.eInput = { setValue } as any;
        richSelect.value = '';

        richSelect.renderSelectedValue();

        expect(setValue).toHaveBeenCalledWith('', false);
    });

    it('rejects non-array values that cannot be resolved in the list', () => {
        const richSelect = createRichSelect<ComplexValue>();
        const unknown = { id: 10, label: 'ten' };
        const listComponent = {
            getIndicesForValues: vi.fn(() => []),
            selectValue: vi.fn(),
        };
        richSelect.listComponent = listComponent;
        richSelect.renderSelectedValue = vi.fn();

        richSelect.setValue(unknown, false, false, true);

        expect(listComponent.getIndicesForValues).toHaveBeenCalledWith(unknown);
        expect(richSelect.value).not.toBe(unknown);
    });

    it('accepts object values when list indices resolve logical equality', () => {
        const richSelect = createRichSelect<ComplexValue>();
        const value = { id: 11, label: 'eleven' };
        const listComponent = {
            getIndicesForValues: vi.fn(() => [1]),
            selectValue: vi.fn(),
        };
        richSelect.listComponent = listComponent;
        richSelect.renderSelectedValue = vi.fn();

        richSelect.setValue(value, false, false, true);

        expect(listComponent.getIndicesForValues).toHaveBeenCalledWith(value);
        expect(richSelect.value).toBe(value);
        expect(listComponent.selectValue).toHaveBeenCalledWith(value);
    });

    it('returns scalar values for non-multi-select getValueFromSet', () => {
        const richSelect = createRichSelect<number>({ multiSelect: false });

        expect(richSelect.getValueFromSet(new Set<number>([2, 3]))).toBe(2);
        expect(richSelect.getValueFromSet(new Set<number>())).toBeNull();
    });

    it('keeps multi-select values in selection order', () => {
        const richSelect = createRichSelect<number>({ multiSelect: true });

        expect(richSelect.getValueFromSet(new Set<number>([3, 1, 4]))).toEqual([3, 1, 4]);
    });

    it('preserves object selections in insertion order', () => {
        const selected = { id: 2, label: 'two-selected' };
        const second = { id: 1, label: 'one' };
        const richSelect = createRichSelect<ComplexValue>({ multiSelect: true });

        expect(richSelect.getValueFromSet(new Set<ComplexValue>([selected, second]))).toEqual([selected, second]);
    });

    it('clears active option aria attributes when filtered search has no matches', () => {
        const richSelect = createRichSelect<string>({ filterList: true });
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-active-option', 'stale-option');
        wrapper.setAttribute('aria-activedescendant', 'stale-option');

        richSelect.eWrapper = wrapper;
        richSelect.listComponent = {
            highlightIndex: vi.fn(),
            ensureIndexVisible: vi.fn(),
        };
        richSelect.searchStrings = ['a'];

        richSelect.highlightListValue([], [], true);

        expect(wrapper.hasAttribute('data-active-option')).toBe(false);
        expect(wrapper.hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('handles async value list rejection by clearing values', async () => {
        const richSelect = createRichSelect<string>();
        const listComponent = { setIsLoading: vi.fn() };
        const setValueListInternal = vi.fn();
        richSelect.listComponent = listComponent;
        richSelect.setValueListInternal = setValueListInternal;

        richSelect.setValueList({
            valueList: Promise.reject(new Error('failed')),
            refresh: true,
        });
        await flushMicrotasks();

        expect(listComponent.setIsLoading).toHaveBeenCalled();
        expect(setValueListInternal).toHaveBeenCalledWith({
            valueList: [],
            refresh: true,
        });
    });

    it('ignores async value list responses that resolve to undefined', async () => {
        const richSelect = createRichSelect<string>();
        const setValueListInternal = vi.fn();
        richSelect.listComponent = { setIsLoading: vi.fn() };
        richSelect.setValueListInternal = setValueListInternal;

        richSelect.setValueList({
            valueList: Promise.resolve(undefined),
            refresh: true,
        });
        await flushMicrotasks();

        expect(setValueListInternal).not.toHaveBeenCalled();
    });

    it('selects current value on refresh when list values are present and picker is displayed', () => {
        const richSelect = createRichSelect<string>();
        const listComponent = {
            setCurrentList: vi.fn(),
            refresh: vi.fn(),
            getIndicesForValues: vi.fn(() => [0]),
            selectValue: vi.fn(),
        };

        richSelect.listComponent = listComponent;
        richSelect.isPickerDisplayed = true;
        richSelect.value = 'A';

        richSelect.setValueList({
            valueList: ['A', 'B'],
            refresh: true,
            isInitial: true,
        });

        expect(listComponent.refresh).toHaveBeenCalledWith(true);
        expect(listComponent.selectValue).toHaveBeenCalledWith('A');
    });

    it('does not select current value on refresh when current page does not contain it', () => {
        const richSelect = createRichSelect<string>();
        const listComponent = {
            setCurrentList: vi.fn(),
            refresh: vi.fn(),
            getIndicesForValues: vi.fn(() => []),
            selectValue: vi.fn(),
        };

        richSelect.listComponent = listComponent;
        richSelect.isPickerDisplayed = true;
        richSelect.value = 'Z';

        richSelect.setValueList({
            valueList: ['A', 'B'],
            refresh: true,
            isInitial: true,
        });

        expect(listComponent.refresh).toHaveBeenCalledWith(true);
        expect(listComponent.selectValue).not.toHaveBeenCalled();
    });

    it('does not auto-select current value when refresh opts out of scroll-to-current behaviour', () => {
        const richSelect = createRichSelect<string>();
        const listComponent = {
            setCurrentList: vi.fn(),
            refresh: vi.fn(),
            getIndicesForValues: vi.fn(() => [0]),
            selectValue: vi.fn(),
        };

        richSelect.listComponent = listComponent;
        richSelect.isPickerDisplayed = true;
        richSelect.value = 'A';

        richSelect.setValueList({
            valueList: ['A', 'B'],
            refresh: true,
            isInitial: true,
            scrollToCurrentValue: false,
        });

        expect(listComponent.refresh).toHaveBeenCalledWith(true);
        expect(listComponent.selectValue).not.toHaveBeenCalled();
    });

    it('preserves viewport continuity when async paging prepends rows', () => {
        const richSelect = createRichSelect<string>();
        const listComponent = {
            getScrollTop: vi.fn(() => 500),
            offsetHoveredIndexOnPrependedRows: vi.fn(),
            setCurrentList: vi.fn(),
            restoreScrollOnPrependedRows: vi.fn(),
            refresh: vi.fn(),
            getIndicesForValues: vi.fn(() => []),
            selectValue: vi.fn(),
        };

        richSelect.listComponent = listComponent;
        richSelect.isPickerDisplayed = true;
        richSelect.value = 'Language 19254';

        richSelect.setValueList({
            valueList: ['Language 19154', 'Language 19155'],
            refresh: true,
            isInitial: true,
            prependedRowCount: 100,
        });

        expect(listComponent.getScrollTop).toHaveBeenCalled();
        expect(listComponent.offsetHoveredIndexOnPrependedRows).toHaveBeenCalledWith(100);
        expect(listComponent.restoreScrollOnPrependedRows).toHaveBeenCalledWith(500, 100);
    });

    it('clears current list immediately while waiting for debounced async search', () => {
        vi.useFakeTimers();
        try {
            const onSearch = vi.fn();
            const richSelect = createRichSelect<string>({
                onSearch,
                searchDebounceDelay: 300,
            });
            const setValueList = vi.spyOn(richSelect, 'setValueList');

            richSelect.searchTextFromString('ab');

            expect(setValueList).toHaveBeenCalledWith({ valueList: undefined, refresh: true });
            expect(onSearch).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it('preserves raw empty-string search entry even when formatter customises empty labels', () => {
        const richSelect = createRichSelect<string>({
            valueFormatter: (value) => (value === '' ? '-- SELECT --' : String(value).toUpperCase()),
        });

        expect(richSelect.getSearchStringsFromValues(['', 'open'])).toEqual(['', 'OPEN']);
    });

    it('keeps input value and renders pills when allowTyping and multiSelect are both enabled', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const setValue = vi.fn();
        const setInputPlaceholder = vi.fn();
        const createOrUpdatePillContainer = vi.fn();

        richSelect.eInput = {
            getValue: () => 'typed',
            setInputPlaceholder,
            setValue,
        };
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.value = ['Open'];
        richSelect.createOrUpdatePillContainer = createOrUpdatePillContainer;

        richSelect.renderSelectedValue();

        expect(setValue).toHaveBeenCalledWith('typed', false);
        expect(setInputPlaceholder).toHaveBeenCalledWith('');
        expect(createOrUpdatePillContainer).toHaveBeenCalledWith(richSelect.eDisplayField);
    });

    it('shows typing placeholder only when input is empty and there are no selected values', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            placeholder: 'Pick status',
        });
        const setInputPlaceholder = vi.fn();
        const createOrUpdatePillContainer = vi.fn();

        richSelect.eInput = {
            getValue: () => '',
            setInputPlaceholder,
            setValue: vi.fn(),
        };
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.createOrUpdatePillContainer = createOrUpdatePillContainer;

        richSelect.value = [];
        richSelect.renderSelectedValue();
        expect(setInputPlaceholder).toHaveBeenLastCalledWith('Pick status');

        richSelect.value = ['Open'];
        richSelect.renderSelectedValue();
        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');

        richSelect.value = [];
        richSelect.eInput.getValue = () => 'o';
        richSelect.renderSelectedValue();
        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');
    });

    it('updates typing placeholder when multi-select value changes with skipRendering', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            placeholder: 'Pick status',
        });
        const setInputPlaceholder = vi.fn();

        richSelect.value = [];
        richSelect.eInput = {
            getValue: () => '',
            setInputPlaceholder,
        };
        richSelect.listComponent = {
            getSelectedItems: () => new Set<string>(),
        };

        richSelect.setValue(['Open'], false, true, true);

        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');
    });

    it('scrolls typing multi-select pills to the end when a value is added', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const ePillContainer = document.createElement('div');
        Object.defineProperty(ePillContainer, 'scrollWidth', { value: 123, configurable: true });
        Object.defineProperty(ePillContainer, 'clientWidth', { value: 0, configurable: true });
        ePillContainer.scrollLeft = 0;
        ePillContainer.appendChild(document.createElement('span'));

        richSelect.pillContainer = { getGui: () => ePillContainer };

        richSelect.scrollTypingMultiSelectPillsToEndOnAdd(0);

        expect(ePillContainer.scrollLeft).toBe(123);
    });

    it('scrolls typing multi-select pills to the RTL end when a value is added', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const ePillContainer = document.createElement('div');
        Object.defineProperty(ePillContainer, 'scrollWidth', { value: 200, configurable: true });
        Object.defineProperty(ePillContainer, 'clientWidth', { value: 80, configurable: true });
        ePillContainer.scrollLeft = 0;
        ePillContainer.appendChild(document.createElement('span'));

        richSelect.gos = { get: () => true };
        richSelect.pillContainer = { getGui: () => ePillContainer };

        richSelect.scrollTypingMultiSelectPillsToEndOnAdd(0);

        expect(ePillContainer.scrollLeft).toBe(-200);
    });

    it('does not scroll typing multi-select pills when value count does not increase', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const ePillContainer = document.createElement('div');
        Object.defineProperty(ePillContainer, 'scrollWidth', { value: 200, configurable: true });
        ePillContainer.scrollLeft = 10;
        ePillContainer.appendChild(document.createElement('span'));

        richSelect.pillContainer = { getGui: () => ePillContainer };

        richSelect.scrollTypingMultiSelectPillsToEndOnAdd(1);

        expect(ePillContainer.scrollLeft).toBe(10);
    });

    it('hides typing placeholder when list selection exists even if value is temporarily stale', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            placeholder: 'Pick status',
        });
        const setInputPlaceholder = vi.fn();

        richSelect.value = [];
        richSelect.eInput = {
            getValue: () => '',
            setInputPlaceholder,
        };
        richSelect.listComponent = {
            getSelectedItems: () => new Set<string>(['Open']),
        };

        richSelect.updateTypingMultiSelectPlaceholder();

        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');
    });

    it('does not hijack horizontal arrows when typing input is not at boundary in multi-select mode', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const preventDefault = vi.fn();
        const inputEl = document.createElement('input');
        inputEl.value = 'typed';
        document.body.appendChild(inputEl);
        inputEl.focus();
        inputEl.setSelectionRange(1, 1);
        const pillContainer = {
            onNavigationKeyDown: vi.fn(),
            getGui: () => document.createElement('div'),
        };

        richSelect.pillContainer = pillContainer;
        richSelect.listComponent = { highlightIndex: vi.fn() };
        richSelect.eInput = { getInputElement: () => inputEl };

        richSelect.onKeyDown({
            key: 'ArrowLeft',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).not.toHaveBeenCalled();
        expect(pillContainer.onNavigationKeyDown).not.toHaveBeenCalled();
        inputEl.remove();
    });

    it('consumes horizontal arrows in non-typing mode even when no pill container exists', () => {
        const richSelect = createRichSelect<string>({ allowTyping: false, multiSelect: false });
        const preventDefault = vi.fn();
        const highlightIndex = vi.fn();

        richSelect.pillContainer = null;
        richSelect.listComponent = { highlightIndex };

        richSelect.onKeyDown({
            key: 'ArrowLeft',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(highlightIndex).toHaveBeenCalledWith(-1);
    });

    it('navigates from typing input to pills when moving backward from input boundary', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const inputEl = document.createElement('input');
        inputEl.value = 'typed';
        document.body.appendChild(inputEl);
        inputEl.focus();
        inputEl.setSelectionRange(0, 0);
        const onNavigationKeyDown = vi.fn();
        const highlightIndex = vi.fn();

        richSelect.pillContainer = {
            onNavigationKeyDown,
            getGui: () => document.createElement('div'),
        };
        richSelect.listComponent = { highlightIndex };
        richSelect.eInput = { getInputElement: () => inputEl };

        richSelect.onKeyDown({
            key: 'ArrowLeft',
            preventDefault: vi.fn(),
            isComposing: false,
        });

        expect(highlightIndex).toHaveBeenCalledWith(-1);
        expect(onNavigationKeyDown).toHaveBeenCalled();
        inputEl.remove();
    });

    it('uses RTL direction when navigating from typing input to pills', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const inputEl = document.createElement('input');
        inputEl.value = 'typed';
        document.body.appendChild(inputEl);
        inputEl.focus();
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
        const onNavigationKeyDown = vi.fn();

        richSelect.gos = { get: () => true };
        richSelect.pillContainer = {
            onNavigationKeyDown,
            getGui: () => document.createElement('div'),
        };
        richSelect.listComponent = { highlightIndex: vi.fn() };
        richSelect.eInput = { getInputElement: () => inputEl };

        richSelect.onKeyDown({
            key: 'ArrowRight',
            preventDefault: vi.fn(),
            isComposing: false,
        });

        expect(onNavigationKeyDown).toHaveBeenCalled();
        inputEl.remove();
    });

    it('moves focus back to input when moving forward from the last pill in typing mode', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const inputEl = document.createElement('input');
        inputEl.value = 'typed';
        const pillGui = document.createElement('div');
        const focusedPill = document.createElement('button');
        focusedPill.type = 'button';
        pillGui.appendChild(focusedPill);
        document.body.appendChild(inputEl);
        document.body.appendChild(pillGui);
        focusedPill.focus();
        const focusTypingInputAtBoundary = vi.fn();

        richSelect.pillContainer = {
            onNavigationKeyDown: vi.fn(),
            getGui: () => pillGui,
        };
        richSelect.listComponent = { highlightIndex: vi.fn() };
        richSelect.eInput = { getInputElement: () => inputEl };
        richSelect.focusTypingInputAtBoundary = focusTypingInputAtBoundary;

        richSelect.onKeyDown({
            key: 'ArrowRight',
            preventDefault: vi.fn(),
            isComposing: false,
        });

        expect(focusTypingInputAtBoundary).toHaveBeenCalled();
        inputEl.remove();
        pillGui.remove();
    });

    it('does not wrap focus from first pill to last when navigating backwards', () => {
        const pillGui = document.createElement('div');
        const firstPill = document.createElement('button');
        const secondPill = document.createElement('button');
        pillGui.appendChild(firstPill);
        pillGui.appendChild(secondPill);
        document.body.appendChild(pillGui);
        firstPill.focus();
        const preventDefault = vi.fn();

        (AgPillContainer.prototype as any).onNavigationKeyDown.call(
            {
                gos: { get: () => false },
                pills: [{}, {}],
                beans: { eRootDiv: document.body },
                getGui: () => pillGui,
            },
            {
                key: 'ArrowLeft',
                preventDefault,
            }
        );

        expect(preventDefault).toHaveBeenCalled();
        expect(document.activeElement).toBe(firstPill);
        pillGui.remove();
    });

    it('navigates between pills when active element is inside a pill', () => {
        const pillGui = document.createElement('div');
        const firstPill = document.createElement('div');
        const secondPill = document.createElement('div');
        const firstInner = document.createElement('span');
        const secondInner = document.createElement('span');
        firstPill.tabIndex = 0;
        secondPill.tabIndex = 0;
        firstInner.tabIndex = -1;
        secondInner.tabIndex = -1;
        // JSDOM elements are often "not visible" to AG Grid's focus utility unless this is mocked.
        (firstPill as any).checkVisibility = () => true;
        (secondPill as any).checkVisibility = () => true;
        (firstInner as any).checkVisibility = () => true;
        (secondInner as any).checkVisibility = () => true;
        firstPill.appendChild(firstInner);
        secondPill.appendChild(secondInner);
        pillGui.appendChild(firstPill);
        pillGui.appendChild(secondPill);
        document.body.appendChild(pillGui);
        secondInner.focus();

        (AgPillContainer.prototype as any).onNavigationKeyDown.call(
            {
                gos: { get: () => false },
                pills: [{}, {}],
                beans: { eRootDiv: document.body },
                getGui: () => pillGui,
            },
            {
                key: 'ArrowLeft',
                preventDefault: vi.fn(),
            }
        );

        expect(firstPill.contains(document.activeElement)).toBe(true);
        pillGui.remove();
    });

    it('invokes forward-boundary callback when navigating forward from last pill', () => {
        const pillGui = document.createElement('div');
        const firstPill = document.createElement('button');
        const lastPill = document.createElement('button');
        pillGui.appendChild(firstPill);
        pillGui.appendChild(lastPill);
        document.body.appendChild(pillGui);
        lastPill.focus();
        const focusAfterForwardBoundary = vi.fn();

        (AgPillContainer.prototype as any).onNavigationKeyDown.call(
            {
                gos: { get: () => false },
                params: { focusAfterForwardBoundary },
                pills: [{}, {}],
                beans: { eRootDiv: document.body },
                getGui: () => pillGui,
            },
            {
                key: 'ArrowRight',
                preventDefault: vi.fn(),
            }
        );

        expect(focusAfterForwardBoundary).toHaveBeenCalled();
        pillGui.remove();
    });

    it('routes pill horizontal key events through the provided callback', () => {
        const onHorizontalArrowKeyDown = vi.fn();
        const fallbackNavigation = vi.fn();
        const stopPropagation = vi.fn();

        (AgPillContainer.prototype as any).onPillKeyDown.call(
            {
                params: { onHorizontalArrowKeyDown },
                onNavigationKeyDown: fallbackNavigation,
            },
            {
                key: 'ArrowLeft',
                stopPropagation,
            }
        );

        expect(stopPropagation).toHaveBeenCalled();
        expect(onHorizontalArrowKeyDown).toHaveBeenCalled();
        expect(fallbackNavigation).not.toHaveBeenCalled();
    });

    it('toggles multi-selection with space only when typing input is empty', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const toggleListItemSelection = vi.fn();
        const listComponent = {
            getLastItemHovered: () => 'Open',
            toggleListItemSelection,
        };

        richSelect.isPickerDisplayed = true;
        richSelect.listComponent = listComponent;
        richSelect.eInput = { getValue: () => 'in-progress search' };

        const preventDefaultWithText = vi.fn();
        richSelect.onKeyDown({
            key: ' ',
            preventDefault: preventDefaultWithText,
            isComposing: false,
        });

        expect(preventDefaultWithText).not.toHaveBeenCalled();
        expect(toggleListItemSelection).not.toHaveBeenCalled();

        richSelect.eInput = { getValue: () => '' };

        const preventDefaultWithoutText = vi.fn();
        richSelect.onKeyDown({
            key: ' ',
            preventDefault: preventDefaultWithoutText,
            isComposing: false,
        });

        expect(preventDefaultWithoutText).toHaveBeenCalled();
        expect(toggleListItemSelection).toHaveBeenCalledWith('Open');
    });

    it('deletes the last selected item on backspace when typing caret is at start', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            suppressMultiSelectPillRenderer: true,
        });
        const selectValue = vi.fn();
        const preventDefault = vi.fn();

        richSelect.value = ['Open', 'Closed'];
        richSelect.listComponent = { selectValue };
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.eInput = {
            getInputElement: () => ({ selectionStart: 0, selectionEnd: 0 }),
            getValue: () => '',
            setValue: vi.fn(),
            setInputPlaceholder: vi.fn(),
        };

        richSelect.onKeyDown({
            key: 'Backspace',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(selectValue).toHaveBeenCalledWith(['Open']);
        expect(richSelect.value).toEqual(['Open']);
    });

    it('deletes the last selected item on backspace at RTL previous-navigation boundary', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            suppressMultiSelectPillRenderer: true,
        });
        const selectValue = vi.fn();
        const preventDefault = vi.fn();

        richSelect.gos = { get: () => true };
        richSelect.value = ['Open', 'Closed'];
        richSelect.listComponent = { selectValue };
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.eInput = {
            getInputElement: () => ({ value: 'abc', selectionStart: 3, selectionEnd: 3 }),
            getValue: () => 'abc',
            setValue: vi.fn(),
            setInputPlaceholder: vi.fn(),
        };

        richSelect.onKeyDown({
            key: 'Backspace',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(selectValue).toHaveBeenCalledWith(['Open']);
        expect(richSelect.value).toEqual(['Open']);
    });

    it('does not delete selected items on backspace when typing caret is not at start', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            suppressMultiSelectPillRenderer: true,
        });
        const selectValue = vi.fn();
        const preventDefault = vi.fn();

        richSelect.value = ['Open', 'Closed'];
        richSelect.listComponent = { selectValue };
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.eInput = {
            getInputElement: () => ({ selectionStart: 1, selectionEnd: 1 }),
            getValue: () => 'x',
            setValue: vi.fn(),
            setInputPlaceholder: vi.fn(),
        };

        richSelect.onKeyDown({
            key: 'Backspace',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).not.toHaveBeenCalled();
        expect(selectValue).not.toHaveBeenCalled();
        expect(richSelect.value).toEqual(['Open', 'Closed']);
    });

    it('selects highlighted item on enter in typing multi-select mode without finishing edit', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            filterList: true,
        });
        const selectedItems = new Set<string>(['Aqua', 'Bisque']);
        const listComponent = {
            getCurrentList: () => ['Black'],
            getLastItemHovered: () => 'Black',
            getSelectedItems: () => selectedItems,
            setCurrentList: vi.fn(),
            refresh: vi.fn(),
            getIndicesForValues: vi.fn(() => []),
            selectValue: vi.fn((values: string[]) => {
                selectedItems.clear();
                values.forEach((value) => selectedItems.add(value));
            }),
        };

        richSelect.values = ['Aqua', 'Bisque', 'Black'];
        richSelect.value = ['Aqua', 'Bisque'];
        richSelect.isPickerDisplayed = true;
        richSelect.listComponent = listComponent;
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.createOrUpdatePillContainer = vi.fn();
        const setInputValue = vi.fn();
        richSelect.eInput = {
            getValue: () => 'Blac',
            setValue: setInputValue,
            setInputPlaceholder: vi.fn(),
        };
        richSelect.hidePicker = vi.fn();
        richSelect.dispatchPickerEventAndHidePicker = vi.fn();

        const preventDefault = vi.fn();
        richSelect.onEnterKeyDown({ preventDefault } as unknown as KeyboardEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect(listComponent.selectValue).toHaveBeenCalledWith(['Aqua', 'Bisque', 'Black']);
        expect(richSelect.value).toEqual(['Aqua', 'Bisque', 'Black']);
        expect(setInputValue).toHaveBeenCalledWith('', true);
        expect(richSelect.hidePicker).toHaveBeenCalled();
        expect(richSelect.dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
    });

    it('selects highlighted item on enter in typing multi-select mode even when input is empty', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const selectedItems = new Set<string>(['Aqua']);
        const listComponent = {
            getCurrentList: () => ['Black'],
            getLastItemHovered: () => 'Black',
            getSelectedItems: () => selectedItems,
            setCurrentList: vi.fn(),
            refresh: vi.fn(),
            getIndicesForValues: vi.fn(() => []),
            selectValue: vi.fn((values: string[]) => {
                selectedItems.clear();
                values.forEach((value) => selectedItems.add(value));
            }),
        };

        richSelect.values = ['Aqua', 'Black'];
        richSelect.value = ['Aqua'];
        richSelect.isPickerDisplayed = true;
        richSelect.listComponent = listComponent;
        richSelect.eDeselect = document.createElement('span');
        richSelect.eDisplayField = document.createElement('span');
        richSelect.createOrUpdatePillContainer = vi.fn();
        const setInputValue = vi.fn();
        richSelect.eInput = {
            getValue: () => '',
            setValue: setInputValue,
            setInputPlaceholder: vi.fn(),
        };
        richSelect.hidePicker = vi.fn();
        richSelect.dispatchPickerEventAndHidePicker = vi.fn();

        richSelect.onEnterKeyDown({ preventDefault: vi.fn() } as unknown as KeyboardEvent);

        expect(listComponent.selectValue).toHaveBeenCalledWith(['Aqua', 'Black']);
        expect(richSelect.value).toEqual(['Aqua', 'Black']);
        expect(setInputValue).toHaveBeenCalledWith('', true);
        expect(richSelect.hidePicker).toHaveBeenCalled();
        expect(richSelect.dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
    });

    it('reopens the picker when typing resumes in collapsed typing multi-select mode', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const showPicker = vi.fn();

        richSelect.isPickerDisplayed = false;
        richSelect.showPicker = showPicker;

        richSelect.openPickerOnTypingIfNeeded('D');
        richSelect.openPickerOnTypingIfNeeded('');

        expect(showPicker).toHaveBeenCalledTimes(1);
    });

    it('resets typing state and closes picker when selecting from list in typing multi-select mode', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const setValue = vi.fn();
        const resetTypingMultiSelectSearchState = vi.fn();
        const hidePicker = vi.fn();
        const dispatchPickerEventAndHidePicker = vi.fn();

        richSelect.setValue = setValue;
        richSelect.resetTypingMultiSelectSearchState = resetTypingMultiSelectSearchState;
        richSelect.hidePicker = hidePicker;
        richSelect.dispatchPickerEventAndHidePicker = dispatchPickerEventAndHidePicker;

        richSelect.onListValueSelected(new Set<string>(['DarkBlue']), false);

        expect(setValue).toHaveBeenCalledWith(['DarkBlue'], false, true);
        expect(resetTypingMultiSelectSearchState).toHaveBeenCalled();
        expect(hidePicker).toHaveBeenCalled();
        expect(dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
    });

    it('does not finish edit on enter in typing multi-select mode when no item is highlighted', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });

        richSelect.isPickerDisplayed = true;
        richSelect.listComponent = {
            getCurrentList: () => ['Open'],
            getLastItemHovered: () => undefined,
            getSelectedItems: () => new Set<string>(),
            selectValue: vi.fn(),
        };
        richSelect.eInput = {
            getValue: () => 'open',
            setInputPlaceholder: vi.fn(),
        };
        richSelect.hidePicker = vi.fn();
        richSelect.dispatchPickerEventAndHidePicker = vi.fn();

        const preventDefault = vi.fn();
        richSelect.onEnterKeyDown({ preventDefault } as unknown as KeyboardEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect(richSelect.hidePicker).not.toHaveBeenCalled();
        expect(richSelect.dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
    });

    it('finishes edit on enter when typing multi-select mode has a collapsed list', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });

        richSelect.value = ['Open'];
        richSelect.isPickerDisplayed = false;
        richSelect.dispatchPickerEventAndHidePicker = vi.fn();

        const preventDefault = vi.fn();
        richSelect.onEnterKeyDown({ preventDefault } as unknown as KeyboardEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect(richSelect.dispatchPickerEventAndHidePicker).toHaveBeenCalledWith(['Open'], true);
    });
});
