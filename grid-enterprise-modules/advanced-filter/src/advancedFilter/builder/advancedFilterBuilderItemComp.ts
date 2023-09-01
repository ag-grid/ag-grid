import {
    AutocompleteEntry,
    Autowired,
    Beans,
    Component,
    DragAndDropService,
    DragSource,
    DragSourceType,
    Events,
    FieldPickerValueSelectedEvent,
    FieldValueEvent,
    PostConstruct,
    RefSelector,
    TooltipFeature,
    _
} from "@ag-grid-community/core";
import { AddDropdownComp } from "./addDropdownComp";
import { AdvancedFilterBuilderDragFeature, AdvancedFilterBuilderDragStartedEvent } from "./advancedFilterBuilderDragFeature";
import { ConditionPillWrapperComp } from "./conditionPillWrapperComp";
import {
    AdvancedFilterBuilderAddEvent,
    AdvancedFilterBuilderEvents,
    AdvancedFilterBuilderItem,
    AdvancedFilterBuilderMoveEvent,
    AdvancedFilterBuilderRemoveEvent,
    CreatePillParams
} from "./iAdvancedFilterBuilder";
import { InputPillComp } from "./inputPillComp";
import { JoinPillWrapperComp } from "./joinPillWrapperComp";
import { SelectPillComp } from "./selectPillComp";

export class AdvancedFilterBuilderItemComp extends Component {
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;
    @RefSelector('eItem') private eItem: HTMLElement;
    @RefSelector('eButtons') private eButtons: HTMLElement;
    @RefSelector('eValidation') private eValidation: HTMLElement;
    @RefSelector('eMoveUpButton') private eMoveUpButton: HTMLElement;
    @RefSelector('eMoveDownButton') private eMoveDownButton: HTMLElement;
    @RefSelector('eAddButton') private eAddButton: HTMLElement;
    @RefSelector('eRemoveButton') private eRemoveButton: HTMLElement;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('beans') protected readonly beans: Beans;

    private ePillWrapper: JoinPillWrapperComp | ConditionPillWrapperComp;
    private validationTooltipFeature: TooltipFeature;
    private moveUpDisabled: boolean = false;
    private moveDownDisabled: boolean = false;
    private moveUpTooltipFeature: TooltipFeature;
    private moveDownTooltipFeature: TooltipFeature;

    constructor(private readonly item: AdvancedFilterBuilderItem, private readonly dragFeature: AdvancedFilterBuilderDragFeature) {
        super(/* html */ `
            <div class="ag-advanced-filter-builder-item-wrapper" role="presentation">
                <div ref="eItem" class="ag-advanced-filter-builder-item">
                    <span ref="eDragHandle" class="ag-drag-handle" role="presentation"></span>
                </div>
                <div ref="eButtons" class="ag-advanced-filter-builder-item-buttons">
                    <span ref="eValidation" class="ag-advanced-filter-builder-item-button ag-advanced-filter-builder-invalid" role="presentation"></span>
                    <span ref="eMoveUpButton" class="ag-advanced-filter-builder-item-button" role="presentation"></span>
                    <span ref="eMoveDownButton" class="ag-advanced-filter-builder-item-button" role="presentation"></span>
                    <span ref="eAddButton" class="ag-advanced-filter-builder-item-button" role="presentation"></span>
                    <span ref="eRemoveButton" class="ag-advanced-filter-builder-item-button" role="presentation"></span>
                </div>
            </div>
        `);
    }

    @PostConstruct
    private postConstruct(): void {
        const { filterModel, level, showMove } = this.item;

        const isJoin = filterModel!.filterType === 'join';
        this.ePillWrapper = this.createManagedBean(isJoin ? new JoinPillWrapperComp() : new ConditionPillWrapperComp());
        this.ePillWrapper.init({ item: this.item, createPill: (params: CreatePillParams) => this.createPill(params) });
        this.eItem.appendChild(this.ePillWrapper.getGui());
        
        if (level === 0) {
            _.setDisplayed(this.eDragHandle, false);
            _.setDisplayed(this.eButtons, false);
        } else {
            this.addCssClass(`ag-advanced-filter-builder-indent-${level}`);

            this.eDragHandle.appendChild(_.createIconNoSpan('advancedFilterBuilderDrag', this.gridOptionsService)!);
            this.setupValidation();
            this.setupMoveButtons(showMove);
            this.setupAddButton();
            this.setupRemoveButton();

            this.setupDragging();
        }

        this.addManagedListener(this.ePillWrapper, AdvancedFilterBuilderEvents.VALUE_CHANGED_EVENT, () => this.dispatchEvent({
            type: AdvancedFilterBuilderEvents.VALUE_CHANGED_EVENT
        }));
        this.addManagedListener(this.ePillWrapper, AdvancedFilterBuilderEvents.VALID_CHANGED_EVENT, () => this.updateValidity());
    }

    public setState(params: {
        disableMoveUp?: boolean;
        disableMoveDown?: boolean;
    }): void {
        if (this.item.level === 0) { return; }
        const { disableMoveUp, disableMoveDown } = params;
        this.moveUpDisabled = !!disableMoveUp;
        this.moveDownDisabled = !!disableMoveDown;
        this.eMoveUpButton.classList.toggle('ag-advanced-filter-builder-item-button-disabled', disableMoveUp);
        this.eMoveDownButton.classList.toggle('ag-advanced-filter-builder-item-button-disabled', disableMoveDown);
        this.moveUpTooltipFeature.refreshToolTip();
        this.moveDownTooltipFeature.refreshToolTip();
    }

    private setupValidation(): void {
        this.eValidation.appendChild(_.createIconNoSpan('advancedFilterBuilderInvalid', this.gridOptionsService)!);
        this.validationTooltipFeature = this.createManagedBean(new TooltipFeature({
            getGui: () => this.eValidation,
            getLocation: () => 'advancedFilter',
            getTooltipValue: () => this.ePillWrapper.getValidationMessage(),
            getTooltipShowDelayOverride: () => 1000
        }, this.beans));
        this.validationTooltipFeature.setComp(this.eValidation);
        this.updateValidity();
    }

    private setupAddButton(): void {
        const eAddButton = this.createManagedBean(new AddDropdownComp({
            pickerAriaLabelKey: 'TODO aria',
            pickerAriaLabelValue: 'TODO aria',
            pickerType: 'ag-list',
            valueList: [{
                key: 'join',
                displayValue: 'Add Join'
            }, {
                key: 'condition',
                displayValue: 'Add Condition'
            }],
            valueFormatter: (value: AutocompleteEntry) =>
                    value == null ? null : value.displayValue ?? value.key,
            pickerIcon: 'advancedFilterBuilderAdd',
            maxPickerWidth: '120px'
        }));
        this.addManagedListener(
            eAddButton,
            Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            ({ value }: FieldPickerValueSelectedEvent) => this.dispatchEvent<AdvancedFilterBuilderAddEvent>({
                type: AdvancedFilterBuilderEvents.ADD_EVENT,
                item: this.item,
                isJoin: value.key === 'join'
            })
        );
        this.eAddButton.appendChild(eAddButton.getGui());
        const tooltipFeature = this.createManagedBean(new TooltipFeature({
            getGui: () => this.eAddButton,
            getLocation: () => 'advancedFilter',
            getTooltipValue: () => 'Add Join or Condition'
        }, this.beans));
        tooltipFeature.setComp(this.eAddButton);
    }

    private setupRemoveButton(): void {
        this.eRemoveButton.appendChild(_.createIconNoSpan('advancedFilterBuilderRemove', this.gridOptionsService)!);
        this.addManagedListener(this.eRemoveButton, 'click', (event: MouseEvent) => {
            event.stopPropagation();
            this.dispatchEvent<AdvancedFilterBuilderRemoveEvent>({
                type: AdvancedFilterBuilderEvents.REMOVE_EVENT,
                item: this.item
            });
        });
        const tooltipFeature = this.createManagedBean(new TooltipFeature({
            getGui: () => this.eRemoveButton,
            getLocation: () => 'advancedFilter',
            getTooltipValue: () => 'Remove'
        }, this.beans));
        tooltipFeature.setComp(this.eRemoveButton);
    }

    private setupMoveButtons(showMove?: boolean): void {
        if (showMove) {
            this.eMoveUpButton.appendChild(_.createIconNoSpan('advancedFilterBuilderMoveUp', this.gridOptionsService)!);
            this.addManagedListener(this.eMoveUpButton, 'click', (event: MouseEvent) => {
                event.stopPropagation();
                this.dispatchEvent<AdvancedFilterBuilderMoveEvent>({
                    type: AdvancedFilterBuilderEvents.MOVE_EVENT,
                    item: this.item,
                    backwards: true
                });
            });
            this.moveUpTooltipFeature = this.createManagedBean(new TooltipFeature({
                getGui: () => this.eMoveUpButton,
                getLocation: () => 'advancedFilter',
                getTooltipValue: () => this.moveUpDisabled ? null : 'Move Up'
            }, this.beans));
            this.moveUpTooltipFeature.setComp(this.eMoveUpButton);

            this.eMoveDownButton.appendChild(_.createIconNoSpan('advancedFilterBuilderMoveDown', this.gridOptionsService)!);
            this.addManagedListener(this.eMoveDownButton, 'click', (event: MouseEvent) => {
                event.stopPropagation();
                this.dispatchEvent<AdvancedFilterBuilderMoveEvent>({
                    type: AdvancedFilterBuilderEvents.MOVE_EVENT,
                    item: this.item,
                    backwards: false
                });
            });
            this.moveDownTooltipFeature = this.createManagedBean(new TooltipFeature({
                getGui: () => this.eMoveDownButton,
                getLocation: () => 'advancedFilter',
                getTooltipValue: () => this.moveDownDisabled ? null : 'Move Down'
            }, this.beans));
            this.moveDownTooltipFeature.setComp(this.eMoveDownButton);
        } else {
            _.setDisplayed(this.eMoveUpButton, false);
            _.setDisplayed(this.eMoveDownButton, false);
        }
    }

    private updateValidity(): void {
        _.setVisible(this.eValidation, !this.item.valid);
        this.validationTooltipFeature.refreshToolTip();
    }

    private createPill(params: CreatePillParams): SelectPillComp | InputPillComp {
        const { key, displayValue, cssClass, update } = params;
        const onUpdated = (key: string) => {
            update(key);
            this.dispatchEvent({
                type: AdvancedFilterBuilderEvents.VALUE_CHANGED_EVENT
            });
        };
        if (params.isSelect) {
            const comp = this.createBean(new SelectPillComp({
                pickerAriaLabelKey: 'TODO aria',
                pickerAriaLabelValue: 'TODO aria',
                pickerType: 'ag-list',
                value: {
                    key,
                    displayValue
                },
                valueFormatter: (value: AutocompleteEntry) =>
                    value == null ? null : value.displayValue ?? value.key,
                maxPickerWidth: '100px'
            }, params.getEditorParams, cssClass));
            this.addManagedListener(
                comp,
                Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
                ({ value }: FieldPickerValueSelectedEvent) => onUpdated(value.key)
            );
            return comp;
        } else {
            const comp = this.createBean(new InputPillComp({
                value: displayValue,
                cssClass,
                isNumber: params.baseCellDataType === 'number'
            }));
            this.addManagedListener(
                comp,
                Events.EVENT_FIELD_VALUE_CHANGED,
                ({ value }: FieldValueEvent) => onUpdated(value)
            );
            return comp;
        }
    }

    private setupDragging(): void {
        const dragSource: DragSource = {
            type: DragSourceType.AdvancedFilterBuilder,
            eElement: this.eDragHandle,
            dragItemName: () => this.ePillWrapper.getDragName(),
            defaultIconName: DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: () => ({}),
            onDragStarted: () => this.dragFeature.dispatchEvent<AdvancedFilterBuilderDragStartedEvent>({
                type: AdvancedFilterBuilderDragFeature.DRAG_STARTED_EVENT,
                item: this.item
            }),
            onDragStopped: () => this.dragFeature.dispatchEvent({
                type: AdvancedFilterBuilderDragFeature.DRAG_ENDED_EVENT
            })
        };

        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
}
