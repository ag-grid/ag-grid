import { RefObject, useEffect } from 'react';

const useReactCommentEffect = (comment: string, eForCommentRef: RefObject<HTMLElement>) => {
    useEffect(() => {
        const eForComment = eForCommentRef.current!;
        const eParent = eForComment.parentElement;
        if (!eParent) { return; }
        const eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);
        return () => {
            eParent.removeChild(eComment);
        };
    }, []);
};

export default useReactCommentEffect;