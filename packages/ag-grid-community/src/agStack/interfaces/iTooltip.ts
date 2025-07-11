export interface BaseTooltipCtrl<TTooltipLocation extends string> {
    getTooltipValue?(): any;
    getGui(): HTMLElement;
    getLocation?(): TTooltipLocation;

    getTooltipShowDelayOverride?(): number;
    getTooltipHideDelayOverride?(): number;
    shouldDisplayTooltip?(): boolean;

    /** Additional params to be passed to the tooltip */
    getAdditionalParams?(): Record<string, any>;
}

export interface ITooltipFeature {
    setTooltipAndRefresh(tooltip: any): void;

    refreshTooltip(clearWithEmptyString?: boolean): void;
}
