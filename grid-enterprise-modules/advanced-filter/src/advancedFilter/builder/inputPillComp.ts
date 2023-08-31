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
        this.renderValue();

        this.ePill.addEventListener('click', (event: MouseEvent) => {
            event.preventDefault();
            this.showEditor();
        });
    }

    private showEditor(): void {
        if (this.eEditor) { return; }
        _.setDisplayed(this.ePill, false);
        this.eEditor = this.createBean(this.params.isNumber ? new AgInputNumberField() : new AgInputTextField());
        this.eEditor.setValue(this.value);
        const eEditorGui = this.eEditor.getGui();
        eEditorGui.addEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case KeyCode.ENTER:
                    event.preventDefault();
                    const value = this.eEditor!.getValue() ?? '';
                    this.dispatchEvent<WithoutGridCommon<FieldValueEvent>>({
                        type: Events.EVENT_FIELD_VALUE_CHANGED,
                        value
                    })
                    this.value = value;
                    this.renderValue();
                    this.hideEditor();
                    break;
                case KeyCode.ESCAPE:
                    event.preventDefault();
                    event.stopPropagation();
                    this.hideEditor();
                    break;
            }
        });
        eEditorGui.addEventListener('focusout', () => {
            this.hideEditor();
        })
        this.getGui().appendChild(eEditorGui);
        this.eEditor.getFocusableElement().focus();
    }

    private hideEditor(): void {
        if (!this.eEditor) { return; }
        _.removeFromParent(this.eEditor.getGui());
        this.destroyBean(this.eEditor);
        _.setDisplayed(this.ePill, true);
        this.eEditor = undefined;
    }

    private renderValue(): void {
        this.ePill.innerText = this.value;
    }
}