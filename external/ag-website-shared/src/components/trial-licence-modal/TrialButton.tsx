import React, { useState } from 'react';

import { TrialLicenceModal } from './TrialLicenceModal';

interface TrialButtonProps {
    id?: string;
    className?: string;
    children: React.ReactNode;
}

export const TrialButton: React.FC<TrialButtonProps> = ({ id = 'request-trial-licence', className, children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button id={id} className={className} onClick={() => setIsModalOpen(true)}>
                {children}
            </button>
            <TrialLicenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default TrialButton;
