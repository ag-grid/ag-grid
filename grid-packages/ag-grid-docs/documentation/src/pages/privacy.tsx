import React from 'react';
import PrivacyPage from './components/Privacy';
import SEO from './components/SEO';

const Privacy = () => {
    return (
        <>
            <SEO title="AG Grid: Privacy Policy"
                 description="We take your privacy very seriously at AG Grid. This page outlines our privacy policy which we have updated in light of GDPR."/>
            <PrivacyPage />
        </>
    )
}

export default Privacy;
