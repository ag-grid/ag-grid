import { Icon } from '@ag-website-shared/components/icon/Icon';
import { TrialLicenceForm } from '@ag-website-shared/components/trial-licence-form/TrialLicenceForm';
import React, { useEffect, useRef } from 'react';

import styles from './TrialLicenceModal.module.scss';

interface TrialLicenceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TrialLicenceModal: React.FC<TrialLicenceModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle click outside modal
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true">
                <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                    <Icon name="cross" />
                </button>
                <div className={styles.content}>
                    <h2 className={styles.title}>Request a Trial Licence</h2>
                    <p className={styles.description}>
                        Get a free two-week Enterprise Bundle trial licence. This will remove the watermark and console
                        errors during your evaluation.
                    </p>
                    <div className={styles.formContainer}>
                        <TrialLicenceForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrialLicenceModal;
