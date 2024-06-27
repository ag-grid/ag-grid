import type { FunctionComponent, ReactNode } from 'react';

import { Alert } from './Alert';

interface Props {
    children: ReactNode;
}

const Warning: FunctionComponent<Props> = ({ children }) => {
    return <Alert type="warning">{children}</Alert>;
};

export default Warning;
