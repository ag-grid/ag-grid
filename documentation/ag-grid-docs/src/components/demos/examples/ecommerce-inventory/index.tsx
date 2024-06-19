import { useDarkmode } from '@utils/hooks/useDarkmode';
import { type FunctionComponent } from 'react';

import { EcommerceExample } from './components/ecommerce-example/EcommerceExample';

export const EcommerceInventoryExample: FunctionComponent = () => {
    const [isDarkMode] = useDarkmode();

    return <EcommerceExample isDarkMode={isDarkMode} />;
};
