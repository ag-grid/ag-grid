import {navigate} from 'gatsby';
import React, {useEffect} from 'react';

const HomePage = (pageContext) => {
    useEffect(() => {
        navigate(pageContext.uri + '/getting-started/');
    }, []);

    return (<></>);
};

export default HomePage;
