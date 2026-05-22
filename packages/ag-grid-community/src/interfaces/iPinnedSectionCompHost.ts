/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPinnedSectionCompHost {
    mountComp(eGui: HTMLElement): void;
    unmountComp(eGui: HTMLElement): void;
}
