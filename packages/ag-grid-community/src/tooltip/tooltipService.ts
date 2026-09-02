import type { HighlightTooltipEventType, IEventEmitter } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { TooltipFeature, TooltipSource } from './tooltipFeature';

/**
 * Grid-level entry point for tooltip registration. Content and positioning rules belong to the source host;
 * this service only owns the common feature lifecycle.
 */
export class TooltipService extends BeanStub implements NamedBean {
    beanName = 'tooltipSvc' as const;

    /** Creates an uninitialised feature for hosts whose element is attached later (ordinary cells). */
    public createTooltip(source: TooltipSource): TooltipFeature | undefined {
        const { beans } = this;
        return beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, source, beans);
    }

    /** Creates a feature which can also be shown when its owner reports keyboard highlight changes. */
    public createHighlightTooltip(
        source: TooltipSource,
        highlightTracker: IEventEmitter<HighlightTooltipEventType>
    ): TooltipFeature | undefined {
        const { beans } = this;
        return beans.registry.createDynamicBean<TooltipFeature>(
            'highlightTooltipFeature',
            false,
            source,
            highlightTracker,
            beans
        );
    }

    /** Replaces and initialises a tooltip owned by an already-attached host. */
    public registerTooltip(
        owner: BeanStub,
        source: TooltipSource,
        current?: TooltipFeature
    ): TooltipFeature | undefined {
        const { beans } = this;
        owner.destroyBean(current, beans.context);
        const feature = this.createTooltip(source);
        return feature ? owner.createBean(feature, beans.context) : undefined;
    }
}
