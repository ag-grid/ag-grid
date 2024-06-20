import { useDarkmode } from '@utils/hooks/useDarkmode';
import { type FunctionComponent } from 'react';

import { HRExample } from './components/hr-example/HRExample';

export const HRManagementExample: FunctionComponent = () => {
    const [isDarkMode] = useDarkmode();

    return <HRExample isDarkMode={isDarkMode} />;
};
