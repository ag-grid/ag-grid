import type { MenuSection } from '@ag-grid-types';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
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
    const framework = useFrameworkFromStore();
    const [menuSections, setMenuSections] = useState<MenuSection[]>(
        getFilteredMenuSections({
            menuSections: allMenuSections,
            framework,
        })
    );

    useEffect(() => {
        setMenuSections(
            getFilteredMenuSections({
                menuSections: allMenuSections,
                framework,
            })
        );
    }, [framework]);

    return <PagesNavigation menuSections={menuSections} framework={framework} pageName={pageName}></PagesNavigation>;
}
