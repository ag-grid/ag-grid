import { AgAbstractComponent } from '../core/agAbstractComponent';
import type { AgBeanCollection } from '../interfaces/agBeanCollection';
import type { AgComponent } from '../interfaces/agComponent';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPopupComponent } from '../interfaces/iPopupComponent';
import type { IPropertiesService } from '../interfaces/iProperties';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgPopupComponent<
    TBeanCollection extends AgBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
    TComponentSelectorType extends string,
>
    extends AgAbstractComponent<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    >
    implements IPopupComponent<any>
{
    public isPopup(): boolean {
        return true;
    }

    override setParentComponent(container: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>) {
        container.addCss('ag-has-popup');
        super.setParentComponent(container);
    }

    public override destroy(): void {
        const parentComp = this.parentComponent;
        const hasParent = parentComp?.isAlive();

        if (hasParent) {
            parentComp!.getGui().classList.remove('ag-has-popup');
        }

        super.destroy();
    }
}
