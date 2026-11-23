import type { DecisionPageSite } from './types';

export type DecisionPageCtaAction = 'get-started' | 'demo' | 'trial' | 'pricing';
export type DecisionPageCtaPlacement = 'hero' | 'get-started' | 'pricing' | 'choose-if';

/**
 * Attributes for a decision page CTA. The id follows `{product}-{action}-{placement}` and the
 * same parts are exposed as `data-cta-*` attributes, so a Tag Manager trigger can match on
 * either without depending on the copy. The class adds the page's Plausible tagged event.
 */
export function ctaAttributes({
    site,
    analyticsPrefix,
    action,
    placement,
}: {
    site: Pick<DecisionPageSite, 'productKey'>;
    analyticsPrefix: string;
    action: DecisionPageCtaAction;
    placement: DecisionPageCtaPlacement;
}) {
    return {
        /** Spread onto the link element. */
        attributes: {
            id: `${site.productKey}-${action}-${placement}`,
            'data-cta-product': site.productKey,
            'data-cta-action': action,
            'data-cta-placement': placement,
        },
        analyticsClass: `plausible-event-name=${analyticsPrefix}-${action}-${placement}`,
    };
}
