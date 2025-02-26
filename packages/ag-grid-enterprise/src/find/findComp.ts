import type { AgInputTextField, FindChangedEvent, IconName } from 'ag-grid-community';
import { AgInputTextFieldSelector, KeyCode, _createIconNoSpan, _makeNull, _setAriaLabel } from 'ag-grid-community';
import { Component, RefPlaceholder } from 'ag-grid-community';

export class FindComp extends Component {
    private readonly eFindInput: AgInputTextField = RefPlaceholder;
    private readonly eMatches: HTMLElement = RefPlaceholder;
    private readonly ePrevious: HTMLElement = RefPlaceholder;
    private readonly eNext: HTMLElement = RefPlaceholder;
    private readonly eClear: HTMLElement = RefPlaceholder;

    private readonly close: () => void;

    constructor(params: { close: () => void }) {
        super(
            /* html */ `
            <div style="position: absolute; display: flex; padding: 8px; background-color: var(--ag-header-background-color);">
                <ag-input-text-field data-ref="eFindInput"></ag-input-text-field>
                <span data-ref="eMatches" style="min-width: 50px;"></span>
                <button data-ref="ePrevious" class="ag-button ag-standard-button"></button>
                <button data-ref="eNext" class="ag-button ag-standard-button"></button>
                <button data-ref="eClear" class="ag-button ag-standard-button"></button>
            </div>
        `,
            [AgInputTextFieldSelector]
        );
        this.close = params.close;
    }

    public postConstruct() {
        this.addManagedElementListeners(this.eFindInput.getInputElement(), {
            keydown: this.onKeydown.bind(this),
        });

        this.eFindInput.onValueChange((value) => {
            this.gos.updateGridOptions({
                options: {
                    findSearchValue: _makeNull(value) ?? undefined,
                },
                source: 'find' as any,
            });
        });

        this.setupButtons();

        this.addManagedEventListeners({ findChanged: this.onFindChanged.bind(this) });
    }

    private onKeydown(event: KeyboardEvent): void {
        if (event.key === KeyCode.ENTER) {
            event.preventDefault();
            const findSvc = this.beans.findSvc!;
            const backwards = event.shiftKey;
            if (backwards) {
                findSvc.previous();
            } else {
                findSvc.next();
            }
        }
    }

    private setupButtons(): void {
        const { beans, ePrevious, eNext, eClear, eFindInput } = this;
        const findSvc = beans.findSvc!;
        const localeTextFunc = this.getLocaleTextFunc();

        const setupButton = (
            eButton: HTMLElement,
            icon: IconName,
            action: () => void,
            ariaLabel: string,
            ariaLabelDefault: string
        ) => {
            eButton.appendChild(_createIconNoSpan(icon, beans)!);
            this.addManagedElementListeners(eButton, {
                click: action,
            });
            _setAriaLabel(eButton, localeTextFunc(ariaLabel, ariaLabelDefault));
        };

        setupButton(ePrevious, 'findPrevious', () => findSvc.previous(), 'findPrevious', 'Find Previous Match');
        setupButton(eNext, 'findNext', () => findSvc.next(), 'findNext', 'Find Next Match');
        setupButton(
            eClear,
            'findClear',
            () => {
                eFindInput.setValue(undefined);
                this.close();
            },
            'findClear',
            'Clear Active Match'
        );
    }

    private onFindChanged(event: FindChangedEvent): void {
        const { activeMatch, totalMatches } = event;
        const activeMatchNum = activeMatch?.numOverall ?? 0;
        this.eMatches.textContent = `${activeMatchNum}/${totalMatches}`;
    }
}
