import { AgPickerField } from "./agPickerField";
import { IAgLabel } from "./agAbstractLabel";
import { ListOption, AgList } from "./agList";
import { _ } from "../utils";
import { Autowired, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";

type AgSelectConfig = ListOption & IAgLabel;

export class AgSelect extends AgPickerField<HTMLSelectElement, string> {

    protected displayTag = 'div';
    protected className = 'ag-select';
    protected pickerIcon = 'smallDown';
    protected listComponent: AgList;
    private hideList: (event?: any) => void;

    @Autowired('popupService') private popupService: PopupService;

    constructor(config?: AgSelectConfig) {
        super();
        this.setTemplate(this.TEMPLATE.replace(/%displayField%/g, this.displayTag));
    }

    @PostConstruct
    public init(): void {
        this.listComponent = new AgList();
        this.getContext().wireBean(this.listComponent);
    }

    protected showPicker() {
        if (this.displayedPicker) {
            this.displayedPicker = false;
            return;
        }

        const listGui = this.listComponent.getGui();
        const listComponentListener = this.addDestroyableEventListener(this.listComponent, 'changeValue', () => {

        });

        this.hideList = this.popupService.addPopup(true, listGui, true, () => {
            this.hideList = null;
            listComponentListener();
        });

        _.setElementWidth(listGui, _.getAbsoluteWidth(this.getGui()));
        listGui.style.position = 'absolute';

        this.popupService.positionPopupUnderComponent({
            type: 'ag-list',
            eventSource: this.getGui(),
            ePopup: listGui
        });
    }

    public addOptions(options: ListOption[]): this {
        options.forEach((option) => this.addOption(option));

        return this;
    }

    public addOption(option: ListOption): this {
        this.listComponent.addOption(option);

        return this;
    }

    public setValue(value: string, silent?: boolean): this {
        if (this.value === value) { return; }

        this.listComponent.setValue(value, true);

        const newValue = this.listComponent.getValue();

        if (newValue === this.getValue()) { return; }

        this.eDisplayField.innerHTML = this.listComponent.getDisplayValue();

        return super.setValue(value, silent);
    }

    public destroy(): void {
        super.destroy();

        if (this.hideList) {
            this.hideList();
        }
    }
}