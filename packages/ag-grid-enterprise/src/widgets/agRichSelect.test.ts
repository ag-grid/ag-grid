import type { RichSelectParams } from 'ag-grid-community';

import { AgPillContainer } from './AgPillContainer';
import { AgRichSelect } from './agRichSelect';

type ComplexValue = { id: number; label: string };

function createRichSelect<TValue>(config?: Partial<RichSelectParams<TValue>>) {
    return new AgRichSelect<TValue>(config as RichSelectParams<TValue>) as AgRichSelect<TValue> & Record<string, any>;
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
        const { config } = richSelect as any;

        expect(config.pickerAriaLabelKey).toBe('ariaLabelRichSelectField');
        expect(config.pickerAriaLabelValue).toBe('Rich Select Field');
        expect(config.pickerType).toBe('ag-list');
        expect(config.valueFormatter('')).toBe('');
    });

    it('announces list state changes through ariaAnnouncementService', () => {
        const richSelect = createRichSelect<string>();
        const announceValue = jest.fn();
        let stateAnnouncementCallback: ((value: string) => void) | undefined;
        const listComponent = {
            setLoadMoreRowsCallback: jest.fn(),
            setStateAnnouncementCallback: jest.fn((callback: (value: string) => void) => {
                stateAnnouncementCallback = callback;
            }),
            setParentComponent: jest.fn(),
        };

        (richSelect as any).ariaAnnounce = { announceValue };
        (richSelect as any).createBean = jest.fn(() => listComponent);
        (richSelect as any).addManagedListeners = jest.fn();
        (richSelect as any).getFocusableElement = jest.fn(() => document.createElement('div'));

        (richSelect as any).createListComponent();
        stateAnnouncementCallback?.('Loading...');
        stateAnnouncementCallback?.('No matches to show');

        expect(announceValue).toHaveBeenNthCalledWith(1, 'Loading...', 'richSelect');
        expect(announceValue).toHaveBeenNthCalledWith(2, 'No matches to show', 'richSelect');
    });

    it('preserves explicit null initial values', () => {
        const richSelect = createRichSelect<string | null>({ value: null });

        expect((richSelect as any).value).toBeNull();
    });

    it('renders empty string as a selected value, not as placeholder', () => {
        const richSelect = createRichSelect<string>({
            value: '',
            placeholder: 'Choose...',
        });
        const eDisplayField = document.createElement('span');
        const tooltipFeature = { setTooltipAndRefresh: jest.fn() };

        (richSelect as any).eDisplayField = eDisplayField;
        (richSelect as any).tooltipFeature = tooltipFeature;
        (richSelect as any).value = '';

        (richSelect as any).renderSelectedValue();

        expect(eDisplayField.classList.contains('ag-display-as-placeholder')).toBe(false);
        expect(eDisplayField.textContent).toBe('');
        expect(tooltipFeature.setTooltipAndRefresh).toHaveBeenCalledWith('');
    });

    it('keeps empty-string input empty for allowTyping even when formatter provides a label', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            valueFormatter: (value) => (value === '' ? '-- SELECT --' : String(value)),
        });
        const setValue = jest.fn();

        (richSelect as any).eInput = { setValue } as any;
        (richSelect as any).value = '';

        (richSelect as any).renderSelectedValue();

        expect(setValue).toHaveBeenCalledWith('', false);
    });

    it('rejects non-array values that cannot be resolved in the list', () => {
        const richSelect = createRichSelect<ComplexValue>();
        const unknown = { id: 10, label: 'ten' };
        const listComponent = {
            getIndicesForValues: jest.fn(() => []),
            selectValue: jest.fn(),
        };
        (richSelect as any).listComponent = listComponent;
        (richSelect as any).renderSelectedValue = jest.fn();

        richSelect.setValue(unknown, false, false, true);

        expect(listComponent.getIndicesForValues).toHaveBeenCalledWith(unknown);
        expect((richSelect as any).value).not.toBe(unknown);
    });

    it('accepts object values when list indices resolve logical equality', () => {
        const richSelect = createRichSelect<ComplexValue>();
        const value = { id: 11, label: 'eleven' };
        const listComponent = {
            getIndicesForValues: jest.fn(() => [1]),
            selectValue: jest.fn(),
        };
        (richSelect as any).listComponent = listComponent;
        (richSelect as any).renderSelectedValue = jest.fn();

        richSelect.setValue(value, false, false, true);

        expect(listComponent.getIndicesForValues).toHaveBeenCalledWith(value);
        expect((richSelect as any).value).toBe(value);
        expect(listComponent.selectValue).toHaveBeenCalledWith(value);
    });

    it('returns scalar values for non-multi-select getValueFromSet', () => {
        const richSelect = createRichSelect<number>({ multiSelect: false });

        expect((richSelect as any).getValueFromSet(new Set<number>([2, 3]))).toBe(2);
        expect((richSelect as any).getValueFromSet(new Set<number>())).toBeNull();
    });

    it('keeps multi-select values in selection order', () => {
        const richSelect = createRichSelect<number>({ multiSelect: true });

        expect((richSelect as any).getValueFromSet(new Set<number>([3, 1, 4]))).toEqual([3, 1, 4]);
    });

    it('keeps selected order stable when list is filtered', () => {
        const richSelect = createRichSelect<string>({ multiSelect: true });

        expect((richSelect as any).getValueFromSet(new Set<string>(['Orange', 'Aqua']))).toEqual(['Orange', 'Aqua']);
    });

    it('preserves object selections in insertion order', () => {
        const selected = { id: 2, label: 'two-selected' };
        const second = { id: 1, label: 'one' };
        const richSelect = createRichSelect<ComplexValue>({ multiSelect: true });

        expect((richSelect as any).getValueFromSet(new Set<ComplexValue>([selected, second]))).toEqual([
            selected,
            second,
        ]);
    });

    it('clears active option aria attributes when filtered search has no matches', () => {
        const richSelect = createRichSelect<string>({ filterList: true });
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-active-option', 'stale-option');
        wrapper.setAttribute('aria-activedescendant', 'stale-option');

        (richSelect as any).eWrapper = wrapper;
        (richSelect as any).listComponent = {
            highlightIndex: jest.fn(),
            ensureIndexVisible: jest.fn(),
        };
        (richSelect as any).searchStrings = ['a'];

        (richSelect as any).highlightListValue([], [], true);

        expect(wrapper.hasAttribute('data-active-option')).toBe(false);
        expect(wrapper.hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('handles async value list rejection by clearing values', async () => {
        const richSelect = createRichSelect<string>();
        const listComponent = { setIsLoading: jest.fn() };
        const setValueListInternal = jest.fn();
        (richSelect as any).listComponent = listComponent;
        (richSelect as any).setValueListInternal = setValueListInternal;

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
        const setValueListInternal = jest.fn();
        (richSelect as any).listComponent = { setIsLoading: jest.fn() };
        (richSelect as any).setValueListInternal = setValueListInternal;

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
            setCurrentList: jest.fn(),
            refresh: jest.fn(),
            getIndicesForValues: jest.fn(() => [0]),
            selectValue: jest.fn(),
        };

        (richSelect as any).listComponent = listComponent;
        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).value = 'A';

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
            setCurrentList: jest.fn(),
            refresh: jest.fn(),
            getIndicesForValues: jest.fn(() => []),
            selectValue: jest.fn(),
        };

        (richSelect as any).listComponent = listComponent;
        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).value = 'Z';

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
            setCurrentList: jest.fn(),
            refresh: jest.fn(),
            getIndicesForValues: jest.fn(() => [0]),
            selectValue: jest.fn(),
        };

        (richSelect as any).listComponent = listComponent;
        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).value = 'A';

        richSelect.setValueList({
            valueList: ['A', 'B'],
            refresh: true,
            isInitial: true,
            scrollToCurrentValue: false,
        });

        expect(listComponent.refresh).toHaveBeenCalledWith(true);
        expect(listComponent.selectValue).not.toHaveBeenCalled();
    });

    it('clears current list immediately while waiting for debounced async search', () => {
        jest.useFakeTimers();
        try {
            const onSearch = jest.fn();
            const richSelect = createRichSelect<string>({
                onSearch,
                searchDebounceDelay: 300,
            });
            const setValueList = jest.spyOn(richSelect, 'setValueList');

            richSelect.searchTextFromString('ab');

            expect(setValueList).toHaveBeenCalledWith({ valueList: undefined, refresh: true });
            expect(onSearch).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it('preserves raw empty-string search entry even when formatter customises empty labels', () => {
        const richSelect = createRichSelect<string>({
            valueFormatter: (value) => (value === '' ? '-- SELECT --' : String(value).toUpperCase()),
        });

        expect((richSelect as any).getSearchStringsFromValues(['', 'open'])).toEqual(['', 'OPEN']);
    });

    it('keeps input value and renders pills when allowTyping and multiSelect are both enabled', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const setValue = jest.fn();
        const setInputPlaceholder = jest.fn();
        const createOrUpdatePillContainer = jest.fn();

        (richSelect as any).eInput = {
            getValue: () => 'typed',
            setInputPlaceholder,
            setValue,
        };
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).value = ['Open'];
        (richSelect as any).createOrUpdatePillContainer = createOrUpdatePillContainer;

        (richSelect as any).renderSelectedValue();

        expect(setValue).toHaveBeenCalledWith('typed', false);
        expect(setInputPlaceholder).toHaveBeenCalledWith('');
        expect(createOrUpdatePillContainer).toHaveBeenCalledWith((richSelect as any).eDisplayField);
    });

    it('shows typing placeholder only when input is empty and there are no selected values', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            placeholder: 'Pick status',
        });
        const setInputPlaceholder = jest.fn();
        const createOrUpdatePillContainer = jest.fn();

        (richSelect as any).eInput = {
            getValue: () => '',
            setInputPlaceholder,
            setValue: jest.fn(),
        };
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).createOrUpdatePillContainer = createOrUpdatePillContainer;

        (richSelect as any).value = [];
        (richSelect as any).renderSelectedValue();
        expect(setInputPlaceholder).toHaveBeenLastCalledWith('Pick status');

        (richSelect as any).value = ['Open'];
        (richSelect as any).renderSelectedValue();
        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');

        (richSelect as any).value = [];
        (richSelect as any).eInput.getValue = () => 'o';
        (richSelect as any).renderSelectedValue();
        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');
    });

    it('updates typing placeholder when multi-select value changes with skipRendering', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            placeholder: 'Pick status',
        });
        const setInputPlaceholder = jest.fn();

        (richSelect as any).value = [];
        (richSelect as any).eInput = {
            getValue: () => '',
            setInputPlaceholder,
        };
        (richSelect as any).listComponent = {
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

        (richSelect as any).pillContainer = { getGui: () => ePillContainer };

        (richSelect as any).scrollTypingMultiSelectPillsToEndOnAdd(0);

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

        (richSelect as any).gos = { get: () => true };
        (richSelect as any).pillContainer = { getGui: () => ePillContainer };

        (richSelect as any).scrollTypingMultiSelectPillsToEndOnAdd(0);

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

        (richSelect as any).pillContainer = { getGui: () => ePillContainer };

        (richSelect as any).scrollTypingMultiSelectPillsToEndOnAdd(1);

        expect(ePillContainer.scrollLeft).toBe(10);
    });

    it('hides typing placeholder when list selection exists even if value is temporarily stale', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            placeholder: 'Pick status',
        });
        const setInputPlaceholder = jest.fn();

        (richSelect as any).value = [];
        (richSelect as any).eInput = {
            getValue: () => '',
            setInputPlaceholder,
        };
        (richSelect as any).listComponent = {
            getSelectedItems: () => new Set<string>(['Open']),
        };

        (richSelect as any).updateTypingMultiSelectPlaceholder();

        expect(setInputPlaceholder).toHaveBeenLastCalledWith('');
    });

    it('does not hijack horizontal arrows when typing input is not at boundary in multi-select mode', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });
        const preventDefault = jest.fn();
        const inputEl = document.createElement('input');
        inputEl.value = 'typed';
        document.body.appendChild(inputEl);
        inputEl.focus();
        inputEl.setSelectionRange(1, 1);
        const pillContainer = {
            onNavigationKeyDown: jest.fn(),
            getGui: () => document.createElement('div'),
        };

        (richSelect as any).pillContainer = pillContainer;
        (richSelect as any).listComponent = { highlightIndex: jest.fn() };
        (richSelect as any).eInput = { getInputElement: () => inputEl };

        (richSelect as any).onKeyDown({
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
        const preventDefault = jest.fn();
        const highlightIndex = jest.fn();

        (richSelect as any).pillContainer = null;
        (richSelect as any).listComponent = { highlightIndex };

        (richSelect as any).onKeyDown({
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
        const onNavigationKeyDown = jest.fn();
        const highlightIndex = jest.fn();

        (richSelect as any).pillContainer = {
            onNavigationKeyDown,
            getGui: () => document.createElement('div'),
        };
        (richSelect as any).listComponent = { highlightIndex };
        (richSelect as any).eInput = { getInputElement: () => inputEl };

        (richSelect as any).onKeyDown({
            key: 'ArrowLeft',
            preventDefault: jest.fn(),
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
        const onNavigationKeyDown = jest.fn();

        (richSelect as any).gos = { get: () => true };
        (richSelect as any).pillContainer = {
            onNavigationKeyDown,
            getGui: () => document.createElement('div'),
        };
        (richSelect as any).listComponent = { highlightIndex: jest.fn() };
        (richSelect as any).eInput = { getInputElement: () => inputEl };

        (richSelect as any).onKeyDown({
            key: 'ArrowRight',
            preventDefault: jest.fn(),
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
        const focusTypingInputAtBoundary = jest.fn();

        (richSelect as any).pillContainer = {
            onNavigationKeyDown: jest.fn(),
            getGui: () => pillGui,
        };
        (richSelect as any).listComponent = { highlightIndex: jest.fn() };
        (richSelect as any).eInput = { getInputElement: () => inputEl };
        (richSelect as any).focusTypingInputAtBoundary = focusTypingInputAtBoundary;

        (richSelect as any).onKeyDown({
            key: 'ArrowRight',
            preventDefault: jest.fn(),
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
        const preventDefault = jest.fn();

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
                preventDefault: jest.fn(),
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
        const focusAfterForwardBoundary = jest.fn();

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
                preventDefault: jest.fn(),
            }
        );

        expect(focusAfterForwardBoundary).toHaveBeenCalled();
        pillGui.remove();
    });

    it('routes pill horizontal key events through the provided callback', () => {
        const onHorizontalArrowKeyDown = jest.fn();
        const fallbackNavigation = jest.fn();
        const stopPropagation = jest.fn();

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
        const toggleListItemSelection = jest.fn();
        const listComponent = {
            getLastItemHovered: () => 'Open',
            toggleListItemSelection,
        };

        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).listComponent = listComponent;
        (richSelect as any).eInput = { getValue: () => 'in-progress search' };

        const preventDefaultWithText = jest.fn();
        (richSelect as any).onKeyDown({
            key: ' ',
            preventDefault: preventDefaultWithText,
            isComposing: false,
        });

        expect(preventDefaultWithText).not.toHaveBeenCalled();
        expect(toggleListItemSelection).not.toHaveBeenCalled();

        (richSelect as any).eInput = { getValue: () => '' };

        const preventDefaultWithoutText = jest.fn();
        (richSelect as any).onKeyDown({
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
        const selectValue = jest.fn();
        const preventDefault = jest.fn();

        (richSelect as any).value = ['Open', 'Closed'];
        (richSelect as any).listComponent = { selectValue };
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).eInput = {
            getInputElement: () => ({ selectionStart: 0, selectionEnd: 0 }),
            getValue: () => '',
            setValue: jest.fn(),
            setInputPlaceholder: jest.fn(),
        };

        (richSelect as any).onKeyDown({
            key: 'Backspace',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(selectValue).toHaveBeenCalledWith(['Open']);
        expect((richSelect as any).value).toEqual(['Open']);
    });

    it('deletes the last selected item on backspace at RTL previous-navigation boundary', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            suppressMultiSelectPillRenderer: true,
        });
        const selectValue = jest.fn();
        const preventDefault = jest.fn();

        (richSelect as any).gos = { get: () => true };
        (richSelect as any).value = ['Open', 'Closed'];
        (richSelect as any).listComponent = { selectValue };
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).eInput = {
            getInputElement: () => ({ value: 'abc', selectionStart: 3, selectionEnd: 3 }),
            getValue: () => 'abc',
            setValue: jest.fn(),
            setInputPlaceholder: jest.fn(),
        };

        (richSelect as any).onKeyDown({
            key: 'Backspace',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).toHaveBeenCalled();
        expect(selectValue).toHaveBeenCalledWith(['Open']);
        expect((richSelect as any).value).toEqual(['Open']);
    });

    it('does not delete selected items on backspace when typing caret is not at start', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
            suppressMultiSelectPillRenderer: true,
        });
        const selectValue = jest.fn();
        const preventDefault = jest.fn();

        (richSelect as any).value = ['Open', 'Closed'];
        (richSelect as any).listComponent = { selectValue };
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).eInput = {
            getInputElement: () => ({ selectionStart: 1, selectionEnd: 1 }),
            getValue: () => 'x',
            setValue: jest.fn(),
            setInputPlaceholder: jest.fn(),
        };

        (richSelect as any).onKeyDown({
            key: 'Backspace',
            preventDefault,
            isComposing: false,
        });

        expect(preventDefault).not.toHaveBeenCalled();
        expect(selectValue).not.toHaveBeenCalled();
        expect((richSelect as any).value).toEqual(['Open', 'Closed']);
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
            setCurrentList: jest.fn(),
            refresh: jest.fn(),
            getIndicesForValues: jest.fn(() => []),
            selectValue: jest.fn((values: string[]) => {
                selectedItems.clear();
                values.forEach((value) => selectedItems.add(value));
            }),
        };

        (richSelect as any).values = ['Aqua', 'Bisque', 'Black'];
        (richSelect as any).value = ['Aqua', 'Bisque'];
        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).listComponent = listComponent;
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).createOrUpdatePillContainer = jest.fn();
        const setInputValue = jest.fn();
        (richSelect as any).eInput = {
            getValue: () => 'Blac',
            setValue: setInputValue,
            setInputPlaceholder: jest.fn(),
        };
        (richSelect as any).hidePicker = jest.fn();
        (richSelect as any).dispatchPickerEventAndHidePicker = jest.fn();

        const preventDefault = jest.fn();
        (richSelect as any).onEnterKeyDown({ preventDefault } as unknown as KeyboardEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect(listComponent.selectValue).toHaveBeenCalledWith(['Aqua', 'Bisque', 'Black']);
        expect((richSelect as any).value).toEqual(['Aqua', 'Bisque', 'Black']);
        expect(setInputValue).toHaveBeenCalledWith('', true);
        expect((richSelect as any).hidePicker).toHaveBeenCalled();
        expect((richSelect as any).dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
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
            setCurrentList: jest.fn(),
            refresh: jest.fn(),
            getIndicesForValues: jest.fn(() => []),
            selectValue: jest.fn((values: string[]) => {
                selectedItems.clear();
                values.forEach((value) => selectedItems.add(value));
            }),
        };

        (richSelect as any).values = ['Aqua', 'Black'];
        (richSelect as any).value = ['Aqua'];
        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).listComponent = listComponent;
        (richSelect as any).eDeselect = document.createElement('span');
        (richSelect as any).eDisplayField = document.createElement('span');
        (richSelect as any).createOrUpdatePillContainer = jest.fn();
        const setInputValue = jest.fn();
        (richSelect as any).eInput = {
            getValue: () => '',
            setValue: setInputValue,
            setInputPlaceholder: jest.fn(),
        };
        (richSelect as any).hidePicker = jest.fn();
        (richSelect as any).dispatchPickerEventAndHidePicker = jest.fn();

        (richSelect as any).onEnterKeyDown({ preventDefault: jest.fn() } as unknown as KeyboardEvent);

        expect(listComponent.selectValue).toHaveBeenCalledWith(['Aqua', 'Black']);
        expect((richSelect as any).value).toEqual(['Aqua', 'Black']);
        expect(setInputValue).toHaveBeenCalledWith('', true);
        expect((richSelect as any).hidePicker).toHaveBeenCalled();
        expect((richSelect as any).dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
    });

    it('does not finish edit on enter in typing multi-select mode when no item is highlighted', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });

        (richSelect as any).isPickerDisplayed = true;
        (richSelect as any).listComponent = {
            getCurrentList: () => ['Open'],
            getLastItemHovered: () => undefined,
            getSelectedItems: () => new Set<string>(),
            selectValue: jest.fn(),
        };
        (richSelect as any).eInput = {
            getValue: () => 'open',
            setInputPlaceholder: jest.fn(),
        };
        (richSelect as any).hidePicker = jest.fn();
        (richSelect as any).dispatchPickerEventAndHidePicker = jest.fn();

        const preventDefault = jest.fn();
        (richSelect as any).onEnterKeyDown({ preventDefault } as unknown as KeyboardEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect((richSelect as any).hidePicker).not.toHaveBeenCalled();
        expect((richSelect as any).dispatchPickerEventAndHidePicker).not.toHaveBeenCalled();
    });

    it('finishes edit on enter when typing multi-select mode has a collapsed list', () => {
        const richSelect = createRichSelect<string>({
            allowTyping: true,
            multiSelect: true,
        });

        (richSelect as any).value = ['Open'];
        (richSelect as any).isPickerDisplayed = false;
        (richSelect as any).dispatchPickerEventAndHidePicker = jest.fn();

        const preventDefault = jest.fn();
        (richSelect as any).onEnterKeyDown({ preventDefault } as unknown as KeyboardEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect((richSelect as any).dispatchPickerEventAndHidePicker).toHaveBeenCalledWith(['Open'], true);
    });
});
