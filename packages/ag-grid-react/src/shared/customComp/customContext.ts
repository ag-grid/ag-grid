import { createContext } from 'react';

type CustomContextParams<M> = {
    setMethods: (methods: M) => void;
};

export const CustomContext = createContext<CustomContextParams<any>>({
    setMethods: () => {},
});
