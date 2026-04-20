import type {
    BeanCollection,
    FindChangedEvent,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
} from 'ag-grid-community';
import { Component, _createElement, _createIconNoSpan, _setDisabled, _setDisplayed, _warn } from 'ag-grid-community';

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
    const eInput = _createElement<HTMLInputElement>({
        tag: 'input',
        cls: 'ag-toolbar-input-field',
        attrs: {
            type: 'text',
            placeholder: `${label}...`,
            'aria-label': label,
        },
    });

    const currentValue = beans.gos.get('findSearchValue');
    if (currentValue) {
        eInput.value = currentValue;
    }

    return eInput;
}

function createMatchCount(): HTMLSpanElement {
    const eMatchCount = _createElement<HTMLSpanElement>({
        tag: 'span',
        cls: 'ag-toolbar-find-match-count',
        attrs: { 'aria-live': 'polite' },
    });
    _setDisplayed(eMatchCount, false);
    return eMatchCount;
}

function createNavButton(beans: BeanCollection, iconName: IconName, label: string): HTMLButtonElement {
    const eButton = _createElement<HTMLButtonElement>({
        tag: 'button',
        cls: 'ag-toolbar-button ag-toolbar-find-button',
        attrs: {
            type: 'button',
            'aria-label': label,
            title: label,
        },
    });
    _setDisabled(eButton, true);
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
            _warn(302, { itemName: 'find', moduleName: 'Find', ...this.gos.getModuleErrorParams() });
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
            input: () => this.gos.updateGridOptions({ options: { findSearchValue: this.eInput.value } }),
            keydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
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
        _setDisplayed(this.eMatchCount, hasSearch);

        const hasMatches = totalMatches > 0;
        _setDisabled(this.ePrevButton, !hasMatches);
        _setDisabled(this.eNextButton, !hasMatches);
    }
}
