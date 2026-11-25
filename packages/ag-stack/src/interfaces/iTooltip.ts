/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ITooltipFeature {
    setTooltipAndRefresh(tooltip: any): void;

    refreshTooltip(clearWithEmptyString?: boolean): void;

    attemptToShowTooltip(): void;

    attemptToHideTooltip(): void;

    destroy(): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipDetails<TLocation extends string> {
    value?: any;
    location?: TLocation;
    params?: object;
    /** Native titles can defer layout-dependent content until the source is hovered. */
    requiresTruncation?: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipCtrl<TLocation extends string, TDetails extends TooltipDetails<TLocation>> {
    /** Identifies an opt-in built-in control tooltip. Ordinary tooltip sources leave this unset. */
    control?: string;
    getTooltip?(): TDetails;
    getGui(): HTMLElement;
    /** The grid-rendered text whose truncation controls a text preview. */
    getTextElement?(): HTMLElement | undefined;
    /** The container receiving keyboard focus when it is outside the pointer source. */
    getFocusElement?(): HTMLElement;
    /** The accessible owner when keyboard focus is managed outside the tooltip source. */
    getAriaElement?(): HTMLElement;
    getTooltipAccessibleName?(): string | null | undefined;
    getLocation?(): TLocation | 'UNKNOWN';

    getTooltipShowDelayOverride?(): number;
    getTooltipSwitchShowDelayOverride?(): number;
    getTooltipHideDelayOverride?(): number;
    shouldDisplayTooltip?(tooltip: TDetails): boolean;
    /**
     * Whether focus within the source should trigger the tooltip, e.g. excluding hover-driven focus in menus.
     * Checked synchronously on focusin, before scheduling tooltip display.
     */
    shouldDisplayTooltipOnFocus?(): boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type ComponentTooltipSource = Omit<TooltipCtrl<string, TooltipDetails<string>>, 'getGui'> & {
    getGui?(): HTMLElement;
};
