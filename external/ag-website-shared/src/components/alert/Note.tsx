import type { FunctionComponent, ReactNode } from 'react';

import { Alert } from './Alert';

interface Props {
    children: ReactNode;
}

const Note: FunctionComponent<Props> = ({ children }) => {
    return <Alert type="info">{children}</Alert>;
};

export default Note;
