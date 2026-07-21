import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export type FileLoadResult = { success: true; content: string } | { success: false; error: string };

export function loadFile(file: File): Promise<FileLoadResult> {
    return new Promise((resolve) => {
        if (file.size > MAX_FILE_SIZE) {
            resolve({
                success: false,
                error: `File too large (${(file.size / 1024).toFixed(0)}KB). Maximum size is 1MB.`,
            });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                resolve({ success: true, content });
            } else {
                resolve({ success: false, error: 'Failed to read file' });
            }
        };
        reader.onerror = () => {
            resolve({ success: false, error: 'Failed to read file' });
        };
        reader.readAsText(file);
    });
}

type DropZoneCallbacks = {
    onDraggingChange: (isDragging: boolean) => void;
    onFileDrop: (file: File) => void;
};

export function useFileDropZone(targetRef: RefObject<HTMLElement | null>, callbacks: DropZoneCallbacks): void {
    const dragCounter = useRef(0);
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;

    useEffect(() => {
        const element = targetRef.current;
        if (!element) {
            return;
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current++;
            if (dragCounter.current === 1) {
                callbacksRef.current.onDraggingChange(true);
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current--;
            if (dragCounter.current === 0) {
                callbacksRef.current.onDraggingChange(false);
            }
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current = 0;
            callbacksRef.current.onDraggingChange(false);
            const file = e.dataTransfer?.files[0];
            if (file) {
                callbacksRef.current.onFileDrop(file);
            }
        };

        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);

        return () => {
            element.removeEventListener('dragover', handleDragOver);
            element.removeEventListener('dragenter', handleDragEnter);
            element.removeEventListener('dragleave', handleDragLeave);
            element.removeEventListener('drop', handleDrop);
        };
    }, [targetRef]);
}
