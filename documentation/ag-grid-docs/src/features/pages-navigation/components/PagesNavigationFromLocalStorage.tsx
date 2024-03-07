import type { Framework, MenuSection } from '@ag-grid-types';
import { DEFAULT_FRAMEWORK } from '@constants';
import { useStore } from '@nanostores/react';
import { $internalFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect, useState } from 'react';

import { getFilteredMenuSections } from '../utils/getFilteredMenuSections';
import { PagesNavigation } from './PagesNavigation';

export function PagesNavigationFromLocalStorage({
    allMenuSections,
    pageName,
}: {
    allMenuSections: MenuSection[];
    pageName: string;
}) {
    const internalFramework = useStore($internalFramework);
    const [framework, setFramework] = useState<Framework>(DEFAULT_FRAMEWORK);
    const [menuSections, setMenuSections] = useState<MenuSection[]>(
        getFilteredMenuSections({
            menuSections: allMenuSections,
            framework,
        })
    );

    useEffect(() => {
        const newFramework = getFrameworkFromInternalFramework(internalFramework);

        if (newFramework !== framework) {
            setFramework(newFramework);
            setMenuSections(
                getFilteredMenuSections({
                    menuSections: allMenuSections,
                    framework: newFramework,
                })
            );
        }
    }, [internalFramework]);

    return (
        framework && (
            <PagesNavigation menuSections={menuSections} framework={framework} pageName={pageName}></PagesNavigation>
        )
    );
}
