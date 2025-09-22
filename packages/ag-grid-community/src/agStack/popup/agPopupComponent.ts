import { AgComponentStub } from '../core/agComponentStub';
import type { AgComponent } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPopupComponent } from '../interfaces/iPopupComponent';
import type { IPropertiesService } from '../interfaces/iProperties';

export class AgPopupComponent<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TComponentSelectorType extends string,
    >
    extends AgComponentStub<
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
