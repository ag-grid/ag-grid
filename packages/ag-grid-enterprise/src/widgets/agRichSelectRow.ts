import type {
    AgPromise,
    BeanCollection,
    ElementParams,
    IRichCellEditorRendererParams,
    ITooltipCtrl,
    Registry,
    RichSelectParams,
    TooltipFeature,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import {
    Component,
    _addGridCommonParams,
    _clearElement,
    _createElement,
    _exists,
    _getEditorRendererDetails,
    _setAriaSelected,
    _shouldDisplayTooltip,
    _toString,
} from 'ag-grid-community';

import type { AgRichSelect } from './agRichSelect';
import { _bindCellRendererToHtmlElement } from './agRichSelect';

const RichSelectRowElement: ElementParams = { tag: 'div', cls: 'ag-rich-select-row', role: 'presentation' };
export class RichSelectRow<TValue> extends Component {
    private userCompFactory: UserComponentFactory;
    private registry: Registry;

    public wireBeans(beans: BeanCollection) {
        this.userCompFactory = beans.userCompFactory;
        this.registry = beans.registry;
    }

    private value: TValue;
    private parsedValue: string | null;
    private tooltipFeature?: TooltipFeature;
    private shouldDisplayTooltip?: () => boolean;

    constructor(private readonly params: RichSelectParams<TValue>) {
        super(RichSelectRowElement);
    }

    public postConstruct(): void {
        this.tooltipFeature = this.createOptionalManagedBean(
            this.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                getGui: () => this.getGui(),
                shouldDisplayTooltip: () => this.shouldDisplayTooltip?.() ?? true,
            } as ITooltipCtrl)
        );
    }

    public setState(value: TValue): void {
        const { params } = this;
        const formattedValue = params.valueFormatter?.(value) ?? '';

        const rendererSuccessful = this.populateWithRenderer(value, formattedValue);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, formattedValue);
        }

        this.value = value;
    }

    public highlightString(matchString: string): void {
        const { parsedValue, params } = this;

        if (params.cellRenderer || !_exists(parsedValue)) {
            return;
        }

        let hasMatch = _exists(matchString);

        if (hasMatch) {
            const index = parsedValue?.toLocaleLowerCase().indexOf(matchString.toLocaleLowerCase());
            if (index >= 0) {
                const highlightEndIndex = index + matchString.length;

                const child = this.getGui().querySelector('span');
                if (child) {
                    _clearElement(child);
                    child.append(
                        // Start part
                        parsedValue.slice(0, index),
                        // Highlighted part wrapped in bold tag
                        _createElement({
                            tag: 'span',
                            cls: 'ag-rich-select-row-text-highlight',
                            children: parsedValue.slice(index, highlightEndIndex),
                        }),
                        // End part
                        parsedValue.slice(highlightEndIndex)
                    );
                }
            } else {
                hasMatch = false;
            }
        }

        if (!hasMatch) {
            this.renderValueWithoutRenderer(parsedValue);
        }
    }

    public updateSelected(selected: boolean): void {
        const eGui = this.getGui();
        _setAriaSelected(eGui.parentElement!, selected);

        this.toggleCss('ag-rich-select-row-selected', selected);
    }

    public getValue(): TValue {
        return this.value;
    }

    public toggleHighlighted(highlighted: boolean): void {
        this.toggleCss('ag-rich-select-row-highlighted', highlighted);
    }

    private populateWithoutRenderer(value: any, valueFormatted: any) {
        const eGui = this.getGui();

        const span = _createElement({ tag: 'span' });
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        const parsedValue = _toString(_exists(valueFormatted) ? valueFormatted : value);
        this.parsedValue = _exists(parsedValue) ? parsedValue : null;

        eGui.appendChild(span);
        this.renderValueWithoutRenderer(parsedValue);
        this.shouldDisplayTooltip = _shouldDisplayTooltip(() => span);
        this.tooltipFeature?.setTooltipAndRefresh(this.parsedValue);
    }

    private renderValueWithoutRenderer(value: string | null): void {
        const span = this.getGui().querySelector('span');
        if (!span) {
            return;
        }
        span.textContent = _exists(value) ? value : '\u00A0';
    }

    private populateWithRenderer(value: TValue, valueFormatted: string): boolean {
        // bad coder here - we are not populating all values of the cellRendererParams
        let cellRendererPromise: AgPromise<any> | undefined;
        let userCompDetails: UserCompDetails | undefined;

        if (this.params.cellRenderer) {
            const richSelect = this.getParentComponent()?.getParentComponent() as AgRichSelect;
            userCompDetails = _getEditorRendererDetails<RichSelectParams, IRichCellEditorRendererParams<TValue>>(
                this.userCompFactory,
                this.params,
                _addGridCommonParams(this.gos, {
                    value,
                    valueFormatted,
                    getValue: () => richSelect?.getValue(),
                    setValue: (value: TValue[] | TValue | null) => {
                        richSelect?.setValue(value, true);
                    },
                    setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                        this.gos.assertModuleRegistered('Tooltip', 3);
                        this.shouldDisplayTooltip = shouldDisplayTooltip;
                        this.tooltipFeature?.setTooltipAndRefresh(value);
                    },
                })
            );
        }

        if (userCompDetails) {
            cellRendererPromise = userCompDetails.newAgStackInstance();
        }

        if (cellRendererPromise) {
            _bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }

        if (cellRendererPromise) {
            cellRendererPromise.then((childComponent) => {
                this.addDestroyFunc(() => {
                    this.destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    }
}
