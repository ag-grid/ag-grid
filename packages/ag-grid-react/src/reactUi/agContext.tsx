import React from 'react';


export const AgContext = React.createContext<{
    modules: {
        moduleName: string;
        version: string;
        enterprise?: boolean;
    }[], licenseKey?: string
}>({ modules: [] });

