import { getIsDev } from '@utils/env';

interface Params {
    message: string;
    /**
     * Don't print out a console warning if not in dev environment
     */
    skipWarning?: boolean;
}

export function throwDevWarning({ message, skipWarning }: Params) {
    if (getIsDev()) {
        throw new Error(message);
    } else {
        if (!skipWarning) {
            console.warn(message);
        }
    }
}
