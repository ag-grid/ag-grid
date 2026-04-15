import type {
    BeanCollection,
    FindChangedEvent,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
} from 'ag-grid-community';
import { Component, _createElement, _createIconNoSpan, _warn } from 'ag-grid-community';

function createSearchIcon(beans: BeanCollection): HTMLElement | undefined {
    const eIcon = _createIconNoSpan('filter', beans);
    if (!eIcon) {
        return undefined;
    }

    const eIconWrapper = _createElement({
        tag: 'span',
        cls: 'ag-toolbar-input-icon',
        attrs: { 'aria-hidden': 'true' },
    });
    eIconWrapper.appendChild(eIcon);
    return eIconWrapper;
}

function createSearchInput(beans: BeanCollection, label: string): HTMLInputElement {
    const eInput = _createElement({ tag: 'input' }) as HTMLInputElement;
    eInput.type = 'text';
    eInput.className = 'ag-toolbar-input-field';
    eInput.placeholder = `${label}...`;
    eInput.setAttribute('aria-label', label);

    const currentValue = beans.gos.get('findSearchValue');
    if (currentValue) {
        eInput.value = currentValue;
    }

    return eInput;
}

function createMatchCount(): HTMLSpanElement {
    const eMatchCount = _createElement({ tag: 'span' }) as HTMLSpanElement;
    eMatchCount.className = 'ag-toolbar-find-match-count ag-hidden';
    eMatchCount.setAttribute('aria-live', 'polite');
    return eMatchCount;
}

function createNavButton(beans: BeanCollection, iconName: IconName, label: string): HTMLButtonElement {
    const eButton = _createElement({ tag: 'button' }) as HTMLButtonElement;
    eButton.type = 'button';
    eButton.className = 'ag-toolbar-button ag-toolbar-find-button';
    eButton.disabled = true;
    eButton.setAttribute('aria-label', label);
    eButton.setAttribute('title', label);
    const eIcon = _createIconNoSpan(iconName, beans);
    if (eIcon) {
        eButton.appendChild(eIcon);
    }
    return eButton;
}

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

        const eSearchIcon = createSearchIcon(this.beans);
        if (eSearchIcon) {
            eGui.appendChild(eSearchIcon);
        }

        this.eInput = createSearchInput(this.beans, label);
        eGui.appendChild(this.eInput);

        this.eMatchCount = createMatchCount();
        eGui.appendChild(this.eMatchCount);

        this.ePrevButton = createNavButton(
            this.beans,
            'previous',
            localeTextFunc('toolbarFindPreviousMatch', 'Previous Match')
        );
        eGui.appendChild(this.ePrevButton);

        this.eNextButton = createNavButton(this.beans, 'next', localeTextFunc('toolbarFindNextMatch', 'Next Match'));
        eGui.appendChild(this.eNextButton);

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
        if (!this.eInput) {
            return false;
        }
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
