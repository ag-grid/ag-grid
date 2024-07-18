export interface SetFilterConfig {
    values: { value: string | null; text: string }[];
    disabled?: boolean;
    applyOnChange: boolean;
}
