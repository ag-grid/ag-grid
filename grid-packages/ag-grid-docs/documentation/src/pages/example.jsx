import React from 'react';
import Seo from './components/SEO';
import Example from "../mainPageDemo/Example";

const ExamplePage = () => {
    return (<>
            <Seo title="AG Grid: Cookies Policy"
                 description="This page outlines our policy in relation to the cookies that we collect on our website."/>
            <Example/>
        </>
    )
}

export default ExamplePage;
