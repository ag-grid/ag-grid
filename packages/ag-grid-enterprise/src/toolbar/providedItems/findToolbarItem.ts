import { _addManagedElementListeners, _debounce, _getActiveDomElement, _setDisabled } from 'ag-stack';

import type {
    AgColumn,
    FindChangedEvent,
    FindMatch,
    GridInputTextField,
    IInputToolbarItemParams,
    IToolbarItemComp,
    IToolbarItemParams,
} from 'ag-grid-community';
import { AgInputTextField, Component, _createElement, _getAbsoluteRowIndex } from 'ag-grid-community';

import { INPUT_DEBOUNCE_MS, createToolbarIconButton, createToolbarInput } from './toolbarItemUtils';

let findInputIdCounter = 0;

function createMatchCount(inputId: string): HTMLLabelElement {
    return _createElement<HTMLLabelElement>({
        tag: 'label',
        cls: 'ag-toolbar-find-match-count',
        attrs: { for: inputId },
    });
}

export class FindToolbarItem extends Component implements IToolbarItemComp {
    private eInputField!: GridInputTextField;
    private eInput!: HTMLInputElement;
    private eMatchCount!: HTMLLabelElement;
    private ePrevButton!: HTMLButtonElement;
    private eNextButton!: HTMLButtonElement;
    private lastAnnouncement = '';

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
        let findSearchValueTimeout: ReturnType<typeof setTimeout> | undefined;
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

        _addManagedElementListeners(this, this.eInput, {
            input: () => (findSearchValueTimeout = updateFindSearchValueDebounced()),
            keydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Flush pending debounced update so navigation uses the latest typed value.
                    flushFindSearchValue();
                    this.navigate(e.shiftKey);
                }
            },
        });

        _addManagedElementListeners(this, this.ePrevButton, {
            click: () => this.navigate(true),
        });
        _addManagedElementListeners(this, this.eNextButton, {
            click: () => this.navigate(false),
        });

        this.addManagedEventListeners({
            findChanged: (event: FindChangedEvent) => this.onFindChanged(event),
        });

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

    public override destroy(): void {
        this.beans.ariaAnnounce?.cancelAnnouncement('find');
        super.destroy();
    }

    private navigate(backwards: boolean): void {
        const findSvc = this.beans.findSvc;
        if (!findSvc) {
            return;
        }
        // Re-announce even when navigation wraps back onto the same match.
        this.lastAnnouncement = '';
        if (backwards) {
            findSvc.previous();
        } else {
            findSvc.next();
        }
    }

    private onFindChanged(event: FindChangedEvent): void {
        const { findSearchValue, activeMatch, totalMatches } = event;
        this.updateMatchDisplay(findSearchValue, activeMatch?.numOverall ?? 0, totalMatches);
        // A count without a current match is only spoken to the user typing in the Find box, not on load.
        const announce = !!activeMatch || _getActiveDomElement(this.beans) === this.eInput;
        this.updateAnnouncement(this.getAnnouncement(findSearchValue, activeMatch, totalMatches), announce);
    }

    private syncMatchState(): void {
        const findSvc = this.beans.findSvc;
        const findSearchValue = this.gos.get('findSearchValue');
        const activeMatch = findSvc?.activeMatch;
        const totalMatches = findSvc?.totalMatches ?? 0;
        this.updateMatchDisplay(findSearchValue, activeMatch?.numOverall ?? 0, totalMatches);
        this.updateAnnouncement(this.getAnnouncement(findSearchValue, activeMatch, totalMatches), false);
    }

    private updateMatchDisplay(findSearchValue: string | undefined, activeIndex: number, totalMatches: number): void {
        const hasSearch = !!findSearchValue?.length;

        this.eMatchCount.textContent = hasSearch ? `${activeIndex}/${totalMatches}` : '';

        const hasMatches = totalMatches > 0;
        _setDisabled(this.ePrevButton, !hasMatches);
        _setDisabled(this.eNextButton, !hasMatches);
    }

    private updateAnnouncement(announcement: string, announce: boolean): void {
        const ariaAnnounce = this.beans.ariaAnnounce;
        if (!announcement || !announce) {
            ariaAnnounce?.cancelAnnouncement('find');
        } else if (announcement !== this.lastAnnouncement) {
            ariaAnnounce?.announceValue(announcement, 'find');
        }
        this.lastAnnouncement = announcement;
    }

    private getAnnouncement(
        findSearchValue: string | undefined,
        activeMatch: FindMatch | undefined,
        totalMatches: number
    ): string {
        if (!findSearchValue?.length) {
            return '';
        }
        const counterText = `${activeMatch?.numOverall ?? 0}/${totalMatches}`;
        const rowIndex = activeMatch?.node.rowIndex;
        if (!activeMatch || rowIndex == null) {
            return counterText;
        }
        const { beans } = this;
        const row = _getAbsoluteRowIndex(beans, { rowIndex, rowPinned: activeMatch.node.rowPinned ?? null }) + 1;
        const { numOverall, column } = activeMatch;
        const columnName = column ? beans.colNames.getDisplayNameForColumn(column as AgColumn, 'header') : null;
        const localeTextFunc = this.getLocaleTextFunc();
        if (!columnName) {
            return localeTextFunc('ariaFindActiveMatchRow', `Match ${numOverall} of ${totalMatches}, row ${row}`, [
                String(numOverall),
                String(totalMatches),
                String(row),
            ]);
        }
        return localeTextFunc(
            'ariaFindActiveMatch',
            `Match ${numOverall} of ${totalMatches}, ${columnName}, row ${row}`,
            [String(numOverall), String(totalMatches), columnName, String(row)]
        );
    }
}
