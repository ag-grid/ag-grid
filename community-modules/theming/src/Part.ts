import type { CoreParams } from './styles/core/core-css';
import type { Feature } from './theme-types';
import { type CssFragment } from './theme-types';

export type Part<TParams = unknown> = {
    readonly id: string;
    readonly feature: string;
    readonly variant: string;
    readonly defaults: Partial<TParams>;
    readonly css: ReadonlyArray<CssFragment>;

    /**
     * Provide new values for theme params. You may only provide values for
     * params provided by the part's dependencies.
     */
    withParams(defaults: Partial<TParams>): Part<TParams>;

    /**
     * Create a new theme part with additional params. Unlike `withParams`,
     * this can be used to declare that this param adds support for new params
     * not already in the parts dependencies
     */
    withAdditionalParams<TAdditionalParams>(defaults: TAdditionalParams): Part<TParams & TAdditionalParams>;

    /**
     * Provide a new fragment of CSS source code.
     */
    withCSS(css: CssFragment): Part<TParams>;

    /**
     * Create a new part variant copying data from this part
     */
    createVariant(variant: string): Part<TParams>;
};

export type CreatePartArgs = {
    feature: Feature;
    variant: string;
};

export const createPart = ({ feature, variant }: CreatePartArgs): Part<CoreParams> =>
    /*#__PURE__*/ new PartImpl(feature, variant);

class PartImpl<TParams = unknown> implements Part<TParams> {
    constructor(
        readonly feature: string,
        readonly variant: string,
        readonly defaults: Partial<TParams> = {},
        readonly css: ReadonlyArray<CssFragment> = []
    ) {}

    get id(): string {
        return this.feature ? `${this.feature}/${this.variant}` : this.variant;
    }

    withParams(params: Partial<TParams>): Part<TParams> {
        const newParams: any = { ...this.defaults };
        for (const [name, value] of Object.entries(params)) {
            if (value != null) {
                newParams[name] = value;
            }
        }
        return new PartImpl(this.feature, this.variant, newParams, this.css);
    }

    withAdditionalParams<TAdditionalParams>(defaults: TAdditionalParams): Part<TParams & TAdditionalParams> {
        return this.withParams(defaults as any) as any;
    }

    withCSS(css: CssFragment): Part<TParams> {
        return new PartImpl(this.feature, this.variant, this.defaults, this.css.concat(css));
    }

    createVariant(variant: string): Part<TParams> {
        return new PartImpl(this.feature, variant, this.defaults, this.css);
    }
}
