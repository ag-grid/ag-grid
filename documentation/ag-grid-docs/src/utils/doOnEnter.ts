export const doOnEnter = (e: KeyboardEvent, action: (...args: any[]) => any) => {
    if (e.key === 'Enter') {
        action();
    }
};
