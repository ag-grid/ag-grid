import {
    AgInputNumberField,
    AgInputTextField,
    Component,
    Events,
    FieldValueEvent,
    KeyCode,
    PostConstruct,
    RefSelector,
    WithoutGridCommon,
    _
} from "@ag-grid-community/core";

export class InputPillComp extends Component {
    @RefSelector('ePill') private ePill: HTMLElement;

    private eEditor: AgInputTextField | undefined;
    private value: string;

    constructor(private readonly params: { value: string, cssClass: string, isNumber?: boolean }) {
        super(/* html */ `
            <div class="ag-advanced-filter-builder-pill-wrapper" role="presentation">
                <div ref="ePill" class="ag-advanced-filter-builder-pill"></div>
            </div>
        `);
        this.value = params.value;
    }

    @PostConstruct
    private postConstruct(): void {
        this.ePill.classList.add(this.params.cssClass);
        this.activateTabIndex([this.ePill]);
        this.renderValue();

        this.addManagedListener(this.ePill, 'click', (event: MouseEvent) => {
            event.preventDefault();
            this.showEditor();
        });
        this.addManagedListener(this.ePill, 'keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case KeyCode.ENTER:
                    event.preventDefault();
                    _.stopPropagationForAgGrid(event);
                    this.showEditor();
                    break;
            }
        });
        this.addDestroyFunc(() => this.destroyBean(this.eEditor));
    }

    public getFocusableElement(): HTMLElement {
        return this.ePill;
    }

    private showEditor(): void {
        if (this.eEditor) { return; }
        _.setDisplayed(this.ePill, false);
        this.eEditor = this.createBean(this.params.isNumber ? new AgInputNumberField() : new AgInputTextField());
        this.eEditor.setValue(this.value);
        const eEditorGui = this.eEditor.getGui();
        this.eEditor.addManagedListener(eEditorGui, 'keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case KeyCode.ENTER:
                    event.preventDefault();
                    _.stopPropagationForAgGrid(event);
                    this.updateValue(true);
                    break;
                case KeyCode.ESCAPE:
                    event.preventDefault();
                    _.stopPropagationForAgGrid(event);
                    this.hideEditor(true);
                    break;
            }
        });
        this.eEditor.addManagedListener(eEditorGui, 'focusout', () => {
            this.updateValue(false);
        });
        this.getGui().appendChild(eEditorGui);
        this.eEditor.getFocusableElement().focus();
    }

    private hideEditor(keepFocus: boolean): void {
        const { eEditor } = this;
        if (!eEditor) { return; }
        this.eEditor = undefined;
        this.getGui().removeChild(eEditor.getGui());
        this.destroyBean(eEditor);
        _.setDisplayed(this.ePill, true);
        if (keepFocus) {
            this.ePill.focus();
        }
    }

    private renderValue(): void {
        this.ePill.innerText = this.value;
    }

    private updateValue(keepFocus: boolean): void {
        if (!this.eEditor) { return; }
        const value = this.eEditor!.getValue() ?? '';
        this.dispatchEvent<WithoutGridCommon<FieldValueEvent>>({
            type: Events.EVENT_FIELD_VALUE_CHANGED,
            value
        })
        this.value = value;
        this.renderValue();
        this.hideEditor(keepFocus);
    }
}