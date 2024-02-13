import type { FunctionComponent, ReactElement } from 'react';

import { Alert } from './Alert';

interface Props {
    children: ReactElement;
}

const Idea: FunctionComponent<Props> = ({ children }) => {
    return <Alert type="idea">{children}</Alert>;
};

export default Idea;
