import { RefObject, useEffect } from 'react';

export const reactCommentEffect = (comment: string, eForCommentRef: RefObject<HTMLElement>) => {

    useEffect(() => {
        return reactComment(comment, eForCommentRef);
    }, []);
};

export const reactComment = (comment: string, eForCommentRef: RefObject<HTMLElement>) => {
    const eForComment = eForCommentRef.current!;
    const eParent = eForComment.parentElement;
    if (!eParent) { return; }
    const eComment = document.createComment(comment);
    eParent.insertBefore(eComment, eForComment);
    return () => {
        eParent.removeChild(eComment);
    };
}