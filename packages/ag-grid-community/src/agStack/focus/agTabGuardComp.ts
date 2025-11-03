import { AgComponentStub } from '../core/agComponentStub';
import type { AgComponent, AgComponentEvent } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { StopPropagationCallbacks } from './agManagedFocusFeature';
import type { AgTabGuardParams } from './agTabGuardFeature';
import { AgTabGuardFeature } from './agTabGuardFeature';

export class AgTabGuardComp<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TLocalEventType extends string = AgComponentEvent,
> extends AgComponentStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TLocalEventType
> {
    protected tabGuardFeature: AgTabGuardFeature<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService
    >;

    protected initialiseTabGuard(params: AgTabGuardParams, stopPropagationCallbacks?: StopPropagationCallbacks) {
        this.tabGuardFeature = this.createManagedBean(new AgTabGuardFeature(this, stopPropagationCallbacks));
        this.tabGuardFeature.initialiseTabGuard(params);
    }

    public forceFocusOutOfContainer(up: boolean = false): void {
        this.tabGuardFeature.forceFocusOutOfContainer(up);
    }

    public override appendChild(
        newChild: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | HTMLElement,
        container?: HTMLElement | undefined
    ): void {
        this.tabGuardFeature.appendChild(super.appendChild.bind(this), newChild, container);
    }
}
