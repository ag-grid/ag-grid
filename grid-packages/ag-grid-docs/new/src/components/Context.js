import React, { useState } from "react";

const defaultContextValue = {
    exampleImportType: 'modules'
};

const { Provider, Consumer } = React.createContext(defaultContextValue);

const GlobalContextProvider = ({ children }) => {
    const [context, setContext] = useState(defaultContextValue);

    const updateGlobalContext = updatedContext => {
        setContext({
            ...context,
            ...updatedContext
        });
    };

    return <Provider value={{ ...context, updateGlobalContext }}>{children}</Provider>;
};

export { Consumer as default, GlobalContextProvider };