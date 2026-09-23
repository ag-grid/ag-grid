/**
 * Behaviour enabled for internal consumers only, so it is not public API. Name each flag after the behaviour, so it
 * can become a public option or the default without a rename, and say on each what is planned for it.
 */
export interface InternalFeatureFlags {
    /**
     * Clicking the row that is the whole selection deselects it rather than re-selecting it.
     *
     * On in AG Studio. Planned to become the default behaviour in a major, which removes the flag.
     */
    clickToggleSelection?: boolean;
}

export type InternalFeatureFlag = keyof InternalFeatureFlags;

export interface IInternalFeatureFlagsBean {
    readonly flags: Readonly<InternalFeatureFlags>;
}
