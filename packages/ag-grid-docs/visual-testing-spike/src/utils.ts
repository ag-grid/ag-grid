export const wait = async (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });
