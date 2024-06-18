import type { FunctionComponent, ReactNode } from 'react';

import { Alert } from './Alert';

interface Props {
    children: ReactNode;
}

const Success: FunctionComponent<Props> = ({ children }) => {
    return <Alert type="success">{children}</Alert>;
};

export default Success;
