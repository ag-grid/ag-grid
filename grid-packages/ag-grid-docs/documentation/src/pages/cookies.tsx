import React from 'react';
import CookiesPage from './components/Cookies';
import SEO from './components/SEO';

const Cookies = (props: any) => {
    return (
        <>
            <SEO title="AG Grid: Cookies Policy"
                 description="This page outlines our policy in relation to the cookies that we collect on our website."/>
            <CookiesPage/>
        </>
    )
}

export default Cookies;
