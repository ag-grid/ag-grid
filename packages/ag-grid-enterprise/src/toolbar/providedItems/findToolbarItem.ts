import type { FindChangedEvent, IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _createElement, _createIconNoSpan, _warn } from 'ag-grid-community';

export class FindToolbarItem extends Component implements IToolbarItemComp {
    private eInput!: HTMLInputElement;
    private eMatchCount!: HTMLSpanElement;
    private ePrevButton!: HTMLButtonElement;
    private eNextButton!: HTMLButtonElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input ag-toolbar-find' });
    }

    public init(_params: IToolbarItemParams): void {
        if (!this.gos.isModuleRegistered('Find')) {
            _warn(303, { itemName: 'find', moduleName: 'Find' });
            this.setDisplayed(false);
            return;
        }

        const localeTextFunc = this.getLocaleTextFunc();
        const label = localeTextFunc('toolbarFind', 'Find');
        const eGui = this.getGui();

        const eIcon = _createIconNoSpan('filter', this.beans);
        if (eIcon) {
            const eIconWrapper = _createElement({
                tag: 'span',
                cls: 'ag-toolbar-input-icon',
                attrs: { 'aria-hidden': 'true' },
            });
            eIconWrapper.appendChild(eIcon);
            eGui.appendChild(eIconWrapper);
        }

        this.eInput = _createElement({ tag: 'input' });
        this.eInput.type = 'text';
        this.eInput.className = 'ag-toolbar-input-field';
        this.eInput.placeholder = `${label}...`;
        this.eInput.setAttribute('aria-label', label);

        const currentValue = this.gos.get('findSearchValue');
        if (currentValue) {
            this.eInput.value = currentValue;
        }

        this.addManagedElementListeners(this.eInput, {
            input: () => this.beans.gridApi.setGridOption('findSearchValue', this.eInput.value),
            keydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.beans.gridApi.findPrevious();
                    } else {
                        this.beans.gridApi.findNext();
                    }
                }
            },
        });

        eGui.appendChild(this.eInput);

        // Match count label
        this.eMatchCount = _createElement({ tag: 'span' }) as HTMLSpanElement;
        this.eMatchCount.className = 'ag-toolbar-find-match-count ag-hidden';
        this.eMatchCount.setAttribute('aria-live', 'polite');
        eGui.appendChild(this.eMatchCount);

        // Previous match button
        const prevLabel = localeTextFunc('toolbarFindPreviousMatch', 'Previous Match');
        this.ePrevButton = _createElement({ tag: 'button' }) as HTMLButtonElement;
        this.ePrevButton.type = 'button';
        this.ePrevButton.className = 'ag-toolbar-button ag-toolbar-find-button';
        this.ePrevButton.disabled = true;
        this.ePrevButton.setAttribute('aria-label', prevLabel);
        this.ePrevButton.setAttribute('title', prevLabel);
        const ePrevIcon = _createIconNoSpan('previous', this.beans);
        if (ePrevIcon) {
            this.ePrevButton.appendChild(ePrevIcon);
        }
        eGui.appendChild(this.ePrevButton);

        // Next match button
        const nextLabel = localeTextFunc('toolbarFindNextMatch', 'Next Match');
        this.eNextButton = _createElement({ tag: 'button' }) as HTMLButtonElement;
        this.eNextButton.type = 'button';
        this.eNextButton.className = 'ag-toolbar-button ag-toolbar-find-button';
        this.eNextButton.disabled = true;
        this.eNextButton.setAttribute('aria-label', nextLabel);
        this.eNextButton.setAttribute('title', nextLabel);
        const eNextIcon = _createIconNoSpan('next', this.beans);
        if (eNextIcon) {
            this.eNextButton.appendChild(eNextIcon);
        }
        eGui.appendChild(this.eNextButton);

        this.addManagedElementListeners(this.ePrevButton, {
            click: () => this.beans.gridApi.findPrevious(),
        });
        this.addManagedElementListeners(this.eNextButton, {
            click: () => this.beans.gridApi.findNext(),
        });

        this.addManagedEventListeners({
            findChanged: (event: FindChangedEvent) => this.onFindChanged(event),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        this.eInput.value = this.gos.get('findSearchValue') ?? '';
        this.syncMatchState();
        return true;
    }

    private onFindChanged(event: FindChangedEvent): void {
        const { activeMatch, totalMatches, findSearchValue } = event;
        const hasSearch = !!findSearchValue?.length;

        if (hasSearch) {
            this.eMatchCount.textContent = `${activeMatch?.numOverall ?? 0}/${totalMatches}`;
            this.eMatchCount.classList.remove('ag-hidden');
        } else {
            this.eMatchCount.textContent = '';
            this.eMatchCount.classList.add('ag-hidden');
        }

        const hasMatches = totalMatches > 0;
        this.ePrevButton.disabled = !hasMatches;
        this.eNextButton.disabled = !hasMatches;
    }

    private syncMatchState(): void {
        const findSvc = this.beans.findSvc;
        const findSearchValue = this.gos.get('findSearchValue');
        const hasSearch = !!findSearchValue?.length;

        if (hasSearch && findSvc) {
            this.eMatchCount.textContent = `${findSvc.activeMatch?.numOverall ?? 0}/${findSvc.totalMatches}`;
            this.eMatchCount.classList.remove('ag-hidden');
            this.ePrevButton.disabled = findSvc.totalMatches === 0;
            this.eNextButton.disabled = findSvc.totalMatches === 0;
        } else {
            this.eMatchCount.textContent = '';
            this.eMatchCount.classList.add('ag-hidden');
            this.ePrevButton.disabled = true;
            this.eNextButton.disabled = true;
        }
    }
}
