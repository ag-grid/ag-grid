import React from 'react';
import AboutPage from './components/About';
import SEO from './components/SEO';

const About = () => {
    return (
        <>
            <SEO title="Our Mission, Our Principles and Our Team at AG Grid"
                 description="AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is the story of AG Grid and explains our mission, where we came from and who we are."/>
            <AboutPage />
        </>
    )
}

export default About;
