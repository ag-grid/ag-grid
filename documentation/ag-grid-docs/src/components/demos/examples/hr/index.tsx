import { useDarkmode } from '@utils/hooks/useDarkmode';
import { type FunctionComponent } from 'react';

import { HRExample } from './HRExample';

export const HR: FunctionComponent = () => {
    const [isDarkMode] = useDarkmode();

    return <HRExample isDarkMode={isDarkMode} />;
};
