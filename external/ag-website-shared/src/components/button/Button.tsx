import type { FunctionComponent, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

const Button: FunctionComponent<Props> = ({ children }) => {
    return <button>{children}</button>;
};

export default Button;
