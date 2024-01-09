import { $darkmode, setDarkmode } from '@stores/darkmodeStore';

import { useStoreSsr } from './useStoreSsr';

export const useDarkmode = () => {
    const darkmode = useStoreSsr<boolean | undefined>($darkmode, undefined);

    return [darkmode, setDarkmode] as const;
};
