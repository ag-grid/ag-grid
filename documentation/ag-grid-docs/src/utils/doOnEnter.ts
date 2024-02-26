export const doOnEnter = (e: KeyboardEvent, action: Function) => {
    if (e.key === 'Enter') {
        action();
    }
};
