import React from 'react';
import {ThemeBuilder} from '../components/ThemeBuilder';
import Seo from './components/SEO';

const ThemeBuilderPage = () => {
    return (
        <>
            <Seo
                title="AG Grid: Theme Builder"
                description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is our fully interactive demo showcasing all of our features and our performance with large datasets."
            />
            <ThemeBuilder />
        </>
    );
};

export default ThemeBuilderPage;
