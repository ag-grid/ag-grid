import { FAST_TEST_TIMINGS, _debounce, _setDisabled } from 'ag-stack';

import type {
    FindChangedEvent,
    GridInputTextField,
    IInputToolbarItemParams,
    IToolbarItemComp,
    IToolbarItemParams,
} from 'ag-grid-community';
import { AgInputTextField, Component, _createElement } from 'ag-grid-community';

import { createToolbarIconButton, createToolbarInput } from './toolbarItemUtils';

const INPUT_DEBOUNCE_MS = FAST_TEST_TIMINGS ? 0 : 300;

let findInputIdCounter = 0;

function createMatchCount(inputId: string): HTMLLabelElement {
    return _createElement<HTMLLabelElement>({
        tag: 'label',
        cls: 'ag-toolbar-find-match-count',
        attrs: { 'aria-live': 'polite', for: inputId },
    });
}

export class FindToolbarItem extends Component implements IToolbarItemComp {
    private eInputField!: GridInputTextField;
    private eInput!: HTMLInputElement;
    private eMatchCount!: HTMLLabelElement;
    private ePrevButton!: HTMLButtonElement;
    private eNextButton!: HTMLButtonElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input ag-toolbar-find' });
    }

    public init(params: IToolbarItemParams<any, any, IInputToolbarItemParams>): void {
        if (!this.gos.isModuleRegistered('Find')) {
            this.beans.log.error(302, {
                itemName: 'agFindToolbarItem',
                moduleName: 'Find',
                ...this.gos.getModuleErrorParams(),
            });
            this.setDisplayed(false);
            return;
        }

        const localeTextFunc = this.getLocaleTextFunc();
        const label = localeTextFunc('toolbarFind', 'Find');
        const eGui = this.getGui();
        let findSearchValueTimeout: number | undefined;
        const flushFindSearchValue = () =>
            this.gos.updateGridOptions({ options: { findSearchValue: this.eInput.value } });

        this.eInputField = this.createManagedBean<GridInputTextField>(
            new AgInputTextField({
                clearButton: true,
                autoComplete: params.toolbarItemParams?.browserAutoComplete,
                onValueClear: () => {
                    clearTimeout(findSearchValueTimeout);
                    flushFindSearchValue();
                },
            })
        );
        const { eIconWrapper, eInput } = createToolbarInput(this.beans, this.eInputField, {
            label,
            iconName: 'search',
            initialValue: this.gos.get('findSearchValue'),
        });
        const inputId = `ag-toolbar-find-input-${++findInputIdCounter}`;
        eInput.id = inputId;
        if (eIconWrapper) {
            eGui.appendChild(eIconWrapper);
        }
        this.eInput = eInput;
        eGui.appendChild(this.eInputField.getGui());

        this.eMatchCount = createMatchCount(inputId);
        eGui.appendChild(this.eMatchCount);

        this.ePrevButton = createToolbarIconButton(this.beans, {
            iconName: 'previous',
            label: localeTextFunc('toolbarFindPreviousMatch', 'Previous Match'),
            cls: 'ag-toolbar-find-button',
            disabled: true,
        });
        eGui.appendChild(this.ePrevButton);

        this.eNextButton = createToolbarIconButton(this.beans, {
            iconName: 'next',
            label: localeTextFunc('toolbarFindNextMatch', 'Next Match'),
            cls: 'ag-toolbar-find-button',
            disabled: true,
        });
        eGui.appendChild(this.eNextButton);

        const updateFindSearchValueDebounced = _debounce(this, flushFindSearchValue, INPUT_DEBOUNCE_MS);

        this.addManagedElementListeners(this.eInput, {
            input: () => (findSearchValueTimeout = updateFindSearchValueDebounced()),
            keydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Flush pending debounced update so navigation uses the latest typed value.
                    flushFindSearchValue();
                    if (e.shiftKey) {
                        this.beans.findSvc?.previous();
                    } else {
                        this.beans.findSvc?.next();
                    }
                }
            },
        });

        this.addManagedElementListeners(this.ePrevButton, {
            click: () => this.beans.findSvc?.previous(),
        });
        this.addManagedElementListeners(this.eNextButton, {
            click: () => this.beans.findSvc?.next(),
        });

        this.addManagedEventListeners({
            findChanged: (event: FindChangedEvent) => this.onFindChanged(event),
        });

        // An external write (`setGridOption`, a state restore) highlights the matches, so the input must
        // follow. A write from this input is a no-op here: the field already holds that value, so
        // `setValue` bails out.
        this.addManagedPropertyListener('findSearchValue', ({ currentValue }) => {
            clearTimeout(findSearchValueTimeout);
            this.eInputField.setValue(currentValue ?? '', true);
        });

        this.syncMatchState();
    }

    public refresh(params: IToolbarItemParams<any, any, IInputToolbarItemParams>): boolean {
        if (!this.eInput) {
            return false;
        }
        this.eInputField.setAutoComplete(params.toolbarItemParams?.browserAutoComplete);
        this.eInputField.setValue(this.gos.get('findSearchValue'), true);
        this.syncMatchState();
        return true;
    }

    private onFindChanged(event: FindChangedEvent): void {
        this.updateMatchDisplay(event.findSearchValue, event.activeMatch?.numOverall ?? 0, event.totalMatches);
    }

    private syncMatchState(): void {
        const findSvc = this.beans.findSvc;
        const findSearchValue = this.gos.get('findSearchValue');
        const activeIndex = findSvc?.activeMatch?.numOverall ?? 0;
        const totalMatches = findSvc?.totalMatches ?? 0;
        this.updateMatchDisplay(findSearchValue, activeIndex, totalMatches);
    }

    private updateMatchDisplay(findSearchValue: string | undefined, activeIndex: number, totalMatches: number): void {
        const hasSearch = !!findSearchValue?.length;

        this.eMatchCount.textContent = hasSearch ? `${activeIndex}/${totalMatches}` : '';

        const hasMatches = totalMatches > 0;
        _setDisabled(this.ePrevButton, !hasMatches);
        _setDisabled(this.eNextButton, !hasMatches);
    }
}
