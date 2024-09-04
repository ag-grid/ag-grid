import type { CoreParams } from './styles/core/core-css';
import type { Feature } from './theme-types';
import { type CssFragment } from './theme-types';

export type Part<TParams = unknown> = {
    readonly id: string;
    readonly feature: string | undefined;
    readonly variant: string;
    readonly dependencies: readonly Part<unknown>[];
    readonly defaults: Partial<TParams>;
    readonly css: ReadonlyArray<CssFragment>;

    /**
     * Add one or more dependent part. The part will replace any existing part
     * of the same feature
     */
    usePart<TPartParams>(part: Part<TPartParams>): Part<TParams & TPartParams>;

    /**
     * Provide new values for theme params. You may only provide values for
     * params provided by the part's dependencies.
     */
    overrideParams(defaults: Partial<TParams>): Part<TParams>;

    /**
     * Provide a new fragment of CSS source code.
     */
    addCss(css: CssFragment): Part<TParams>;

    /**
     * Create a new part variant copying data from this part
     */
    createVariant(variant: string): Part<TParams>;

    /**
     * Create a new theme part with additional params. Unlike `overrideParams`,
     * this can be used to declare that this param adds support for new params
     * not already in the parts dependencies
     */
    addParams<TAdditionalParams>(defaults: TAdditionalParams): Part<TParams & TAdditionalParams>;
};

export type CreatePartArgs = {
    feature?: Feature;
    variant: string;
};

export const createPart = ({ feature, variant }: CreatePartArgs): Part<CoreParams> =>
    /*#__PURE__*/ new PartImpl(feature, variant);

class PartImpl<TParams = unknown> implements Part<TParams> {
    constructor(
        readonly feature: string | undefined,
        readonly variant: string,
        readonly dependencies: readonly Part[] = [],
        readonly defaults: Partial<TParams> = {},
        readonly css: ReadonlyArray<CssFragment> = []
    ) {}

    get id(): string {
        return this.feature ? `${this.feature}/${this.variant}` : this.variant;
    }

    usePart<TPartParams>(part: Part<TPartParams>): Part<TParams & TPartParams> {
        return new PartImpl<TParams & TPartParams>(
            this.feature,
            this.variant,
            this.dependencies.concat(part as any),
            this.defaults as TParams & TPartParams,
            this.css
        );
    }

    overrideParams(params: Partial<TParams>): Part<TParams> {
        const newParams: any = { ...this.defaults };
        for (const [name, value] of Object.entries(params)) {
            if (value != null) {
                newParams[name] = value;
            }
        }
        return new PartImpl(this.feature, this.variant, this.dependencies, newParams, this.css);
    }

    addParams<TAdditionalParams>(defaults: TAdditionalParams): Part<TParams & TAdditionalParams> {
        return this.overrideParams(defaults as any) as any;
    }

    addCss(css: CssFragment): Part<TParams> {
        return new PartImpl(this.feature, this.variant, this.dependencies, this.defaults, this.css.concat(css));
    }

    createVariant(variant: string): Part<TParams> {
        return new PartImpl(this.feature, variant, this.dependencies, this.defaults, this.css);
    }
}
