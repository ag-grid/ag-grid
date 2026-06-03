/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IIconService<TIconName extends string, TParams> {
    readonly beanName: 'iconSvc';

    createIconNoSpan(iconName: TIconName, params?: TParams): Element | undefined;
}
