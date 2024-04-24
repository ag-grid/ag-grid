import { useApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import * as Dialog from '@radix-ui/react-dialog';
import classnames from 'classnames';

import styles from './Dialog.module.scss';
import welcomeStyles from './WelcomeModal.module.scss';

export const WelcomeModal = () => {
    const [dismissed, setDismissed] = useApplicationConfigAtom('welcomeModalDismissed');

    return (
        <Dialog.Root
            open={!dismissed}
            onOpenChange={(open) => {
                setDismissed(!open);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <img className={welcomeStyles.lightImage} src="/theme-builder/theme-builder.gif"></img>
                    <img className={welcomeStyles.darkImage} src="/theme-builder/theme-builder-dark.gif"></img>
                    <div className={styles.contentModal}>
                        <Dialog.Title className={styles.title}>Welcome to Theme Builder</Dialog.Title>
                        <Dialog.Description className={styles.description}>
                            Here you can customise your grid's colors, spacing, typography all from one place.
                        </Dialog.Description>
                    </div>
                    <div className={classnames(styles.actions, styles.noSeparator)}>
                        <Dialog.Close className={classnames('button-tertiary', styles.fullWidth)}>
                            Get started
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
