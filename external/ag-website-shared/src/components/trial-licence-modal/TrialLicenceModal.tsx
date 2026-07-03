import { Icon } from '@ag-website-shared/components/icon/Icon';
import { TrialLicenceForm } from '@ag-website-shared/components/trial-licence-form/TrialLicenceForm';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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

    // Use portal to render at document body level, escaping any stacking contexts
    const modalContent = (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true">
                <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                    <Icon name="cross" />
                </button>
                <div className={styles.content}>
                    <h2 className={styles.title}>Request a Trial Licence</h2>
                    <p className={styles.description}>
                        Start a free two-week Enterprise Bundle trial to remove the watermark and console errors
                    </p>
                    <div className={styles.formContainer}>
                        <TrialLicenceForm />
                    </div>
                </div>
            </div>
        </div>
    );

    // Check for SSR - document.body may not exist during server-side rendering
    if (typeof document === 'undefined') return null;

    return createPortal(modalContent, document.body);
};

export default TrialLicenceModal;
