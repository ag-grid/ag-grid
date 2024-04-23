import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import styles from './Dialog.module.scss';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={styles.overlay} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(({ children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref} className={styles.content} {...props}>
            {children}
            <DialogClose className={styles.closeButton}>
                <button className="button-tertiary">Get started</button>
            </DialogClose>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ ...props }) => <div className={styles.header} {...props} />;
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ ...props }) => <div className={styles.footer} {...props} />;
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef(({ ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={styles.title} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={styles.description} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
