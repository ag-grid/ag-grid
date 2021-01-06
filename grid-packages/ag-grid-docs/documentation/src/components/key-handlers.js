export const doOnEnter = (e, action) => {
    if (e.key && e.key === 'Enter') {
        action();
    }
};
