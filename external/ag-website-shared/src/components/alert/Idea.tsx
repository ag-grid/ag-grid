import type { FunctionComponent, ReactNode } from 'react';

import { Alert } from './Alert';

interface Props {
    children: ReactNode;
}

const Idea: FunctionComponent<Props> = ({ children }) => {
    return <Alert type="idea">{children}</Alert>;
};

export default Idea;
