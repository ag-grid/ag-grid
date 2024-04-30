import * as Dialog from '@radix-ui/react-dialog';

import styles from './Dialog.module.scss';

interface Props {
    showDialog: boolean;
    setShowDialog: (show: boolean) => void;
    onSuccess: () => void;
}

export const ResetChangesModal = ({ showDialog, setShowDialog, onSuccess }: Props) => {
    return (
        <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.contentModal}>
                        <Dialog.Title className={styles.title}>Are you sure you want to reset?</Dialog.Title>
                        <Dialog.Description className={styles.description}>
                            Applying a preset will reset changes you've made to the theme. Changes will be lost.
                        </Dialog.Description>
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
                            Reset
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
