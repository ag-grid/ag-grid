import { RefObject, useEffect } from 'react';
import { useEffectOnce } from './useEffectOnce';

const useReactCommentEffect = (comment: string, eForCommentRef: RefObject<HTMLElement>) => {
    useEffectOnce( () => {
        const eForComment = eForCommentRef.current!;
        const eParent = eForComment.parentElement;
        if (!eParent) { return; }
        const eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);

        return () => {
            eParent.removeChild(eComment);
        };
    });
};

export default useReactCommentEffect;