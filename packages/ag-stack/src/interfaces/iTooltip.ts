/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ITooltipFeature {
    setTooltipAndRefresh(tooltip: any): void;

    refreshTooltip(clearWithEmptyString?: boolean): void;

    attemptToShowTooltip(): void;

    attemptToHideTooltip(): void;

    destroy(): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface TooltipCtrl<TLocation extends string, TParams> {
    getTooltipValue?(): any;
    getGui(): HTMLElement;
    getLocation?(): TLocation | 'UNKNOWN';

    getTooltipShowDelayOverride?(): number;
    getTooltipSwitchShowDelayOverride?(): number;
    getTooltipHideDelayOverride?(): number;
    shouldDisplayTooltip?(): boolean;

    /** Additional params to be passed to the tooltip */
    getAdditionalParams?(): TParams;
}
