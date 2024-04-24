import { useApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import styled from '@emotion/styled';
import * as Dialog from '@radix-ui/react-dialog';

import styles from './WelcomeModal.module.scss';

export const WelcomeModal = () => {
    const [dismissed, setDismissed] = useApplicationConfigAtom('welcomeModalDismissed');
    if (dismissed) return null;
    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (!open) setDismissed(true);
            }}
            defaultOpen
        >
            <Dialog.Portal>
                <StyledOverlay className={styles.overlay} />
                <StyledContent>
                    <img className={styles.lightImage} src="/theme-builder/theme-builder.gif"></img>
                    <img className={styles.darkImage} src="/theme-builder/theme-builder-dark.gif"></img>
                    <div className="contentModal"></div>
                    <div className="contentModal">
                        <StyledTitle>Welcome to Theme Builder</StyledTitle>
                        <StyledDescription>
                            Here you can customise your grid’s colors, spacing, typography all from one place.
                        </StyledDescription>
                        <StyledClose>Get started</StyledClose>
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

    .contentModal {
        padding: 24px;
        padding-top: 0px;
    }
`;

const StyledTitle = styled(Dialog.Title)`
    margin: 0;
    font-size: var(--text-fs-lg);
    margin-bottom: 8px;
    color: var(--color-text-secondary);
`;

const StyledDescription = styled(Dialog.Description)`
    margin: 10px 0 20px;
    color: var(--mauve-11);
    font-size: 15px;
    line-height: 1.5;
`;

/* TODO - move or export and use classed button styles */
const StyledClose = styled(Dialog.Close)`
    background-color: var(--color-button-tertiary-bg);
    color: var(--color-button-tertiary-fg);
    border: 1px solid var(--color-button-tertiary-border);
    width: 100%;
    &:hover,
    &.hover {
        background-color: var(--color-button-tertiary-bg-hover);
        color: var(--color-button-tertiary-fg);
    }

    &:focus-visible,
    &.focus {
        box-shadow:
            0 0 0 $spacing-size-1 var(--color-button-primary-shadow-focus),
            var(--shadow-xs);
    }
`;
