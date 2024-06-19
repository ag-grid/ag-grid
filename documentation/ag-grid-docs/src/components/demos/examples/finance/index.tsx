import { useDarkmode } from '@utils/hooks/useDarkmode';
import { type FunctionComponent } from 'react';

import FinanceExample from './FinanceExample';

export const Finance: FunctionComponent = () => {
    const [isDarkMode] = useDarkmode();

    return <FinanceExample isDarkMode={isDarkMode} />;
};
