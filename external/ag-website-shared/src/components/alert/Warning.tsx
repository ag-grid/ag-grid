import type { FunctionComponent, ReactElement } from 'react';

import { Alert } from './Alert';

interface Props {
    children: ReactElement;
}

const Warning: FunctionComponent<Props> = ({ children }) => {
    return <Alert type="warning">{children}</Alert>;
};

export default Warning;
