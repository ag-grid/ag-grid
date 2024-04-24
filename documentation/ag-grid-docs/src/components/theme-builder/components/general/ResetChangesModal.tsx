import { useApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import styled from '@emotion/styled';
import * as Dialog from '@radix-ui/react-dialog';

import styles from './ResetChangesModal.module.scss';

interface Props {
    showDialog: boolean;
    setShowDialog: (show: boolean) => void;
    onSuccess: () => void;
}

export const ResetChangesModal = ({ showDialog, setShowDialog, onSuccess }: Props) => {
    return (
        <Dialog.Root open={showDialog} onOpenChange={setShowDialog} defaultOpen>
            <Dialog.Portal>
                <StyledOverlay className={styles.overlay} />
                <StyledContent>
                    <div className={styles.contentModal}>
                        <StyledTitle>Are you sure you want to reset?</StyledTitle>
                        <StyledDescription>
                            Applying a preset will reset changes you've made to the theme. Changes will be lost.
                        </StyledDescription>
                    </div>
                    <div className={styles.actions}>
                        <Dialog.Close className="button-tertiary">Cancel</Dialog.Close>
                        <button
                            className="button-primary"
                            onClick={() => {
                                onSuccess();
                                setShowDialog(false);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </StyledContent>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

const StyledOverlay = styled(Dialog.Overlay)`
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 0.8;
        }
    }

    background-color: color-mix(in srgb, var(--color-black), var(--color-black) 45%);
    z-index: 1000;
    position: fixed;
    inset: 0;
    opacity: 0.8;
    animation: fadeIn 300ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
    @keyframes scaleFadeInUp {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    animation: scaleFadeInUp 200ms cubic-bezier(0.4, 0, 1, 1);

    background-color: var(--color-bg-primary);
    border-radius: 12px;
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 456px;
    max-height: 85vh;
    z-index: 1000;
    &:focus {
        outline: none;
    }
    overflow: hidden;
`;

const StyledTitle = styled(Dialog.Title)`
    margin: 0;
    font-size: var(--text-fs-lg);
    margin-bottom: 8px;
    color: var(--color-text-secondary);
`;

const StyledDescription = styled(Dialog.Description)`
    margin: 10px 0 0;
    color: var(--mauve-11);
    font-size: 15px;
    line-height: 1.5;
`;
