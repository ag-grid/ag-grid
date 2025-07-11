export interface IIconService<TIconName extends string, TParams> {
    createIconNoSpan(iconName: TIconName, params?: TParams): Element | undefined;
}
