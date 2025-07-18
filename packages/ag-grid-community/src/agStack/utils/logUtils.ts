const AG_ERROR_MAP = {
    107: ({ key, value }: { key: string; value: unknown }) =>
        `Invalid value for theme param ${key} - ${value}` as const,
    104: ({ value, param }: { value: number; param: string }) =>
        `Numeric value ${value} passed to ${param} param will be interpreted as ${value} seconds. If this is intentional use "${value}s" to silence this warning.` as const,
    240: ({ theme }: { theme: any }) =>
        `theme grid option must be a Theming API theme object or the string "legacy", received: ${theme}` as const,
    259: ({ part }: { part: any }) =>
        `the argument to theme.withPart must be a Theming API part object, received: ${part}` as const,
};

type AgErrorMap = typeof AG_ERROR_MAP;

export type AgErrorId = keyof AgErrorMap;

type AgErrorValue<TId extends AgErrorId | null> = TId extends AgErrorId ? AgErrorMap[TId] : never;
export type AgGetErrorParams<TId extends AgErrorId> =
    AgErrorValue<TId> extends (params: infer P) => any ? (P extends Record<string, any> ? P : undefined) : never;

export function _agError<
    TId extends keyof AgErrorMap,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = AgErrorMap[TId],
>(...args: undefined extends AgGetErrorParams<TId> ? [id: TId] : [id: TId, params: AgGetErrorParams<TId>]): void {
    args;
    // TODO
}

/** Used for messages before the ValidationService has been created */
export function _agLogPreInitErr<
    TId extends AgErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = AgErrorMap[TId],
>(id: TId, args: AgGetErrorParams<TId>, defaultMessage: string) {
    id;
    args;
    defaultMessage;
    // TODO
}
