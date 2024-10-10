export const CROSS_FILTER_FIELD_POSTFIX = '$$Filter$$';

export const ADDITIVE_EVENTS_ENABLED = false;

export const isMultiSelection = (event: Event) => {
    if (ADDITIVE_EVENTS_ENABLED) {
        const sourceEvent = event;
        return sourceEvent instanceof PointerEvent && (sourceEvent.metaKey || sourceEvent.ctrlKey);
    }
    return false;
};
