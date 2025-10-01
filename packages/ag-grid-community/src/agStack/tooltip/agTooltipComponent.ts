import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IComponent } from '../interfaces/iComponent';
import type { IPropertiesService } from '../interfaces/iProperties';
import { AgPopupComponent } from '../popup/agPopupComponent';
import { _toString } from '../utils/string';
import type { BaseTooltipParams } from './baseTooltipStateManager';

export class AgTooltipComponent<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TComponentSelectorType extends string,
        TTooltipParams extends BaseTooltipParams<TLocation>,
        TLocation extends string,
    >
    extends AgPopupComponent<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    >
    implements IComponent<TTooltipParams>
{
    constructor() {
        super({ tag: 'div', cls: 'ag-tooltip' });
    }

    // will need to type params
    public init(params: TTooltipParams): void {
        const { value } = params;
        const eGui = this.getGui();

        eGui.textContent = _toString(value) as string;
        const locationKebabCase = params.location.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
        eGui.classList.add(`ag-${locationKebabCase}-tooltip`);
    }
}
