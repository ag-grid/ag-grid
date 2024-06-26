import { useDarkmode } from '@utils/hooks/useDarkmode';
import { type FunctionComponent } from 'react';

import { InventoryExample } from './InventoryExample';

export const Inventory: FunctionComponent = () => {
    const [isDarkMode] = useDarkmode();

    return <InventoryExample isDarkMode={isDarkMode} />;
};
