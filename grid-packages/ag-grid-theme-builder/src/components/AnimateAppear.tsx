import { styled } from '@mui/joy';
import { MutableRefObject, ReactElement, useLayoutEffect, useRef, useState } from 'react';

export type AnimateAppearProps = {
  children: ReactElement | null | false;
};

export const AnimateAppear = ({ children: childrenFromProps }: AnimateAppearProps) => {
  const [renderedChildren, setRenderedChildren] = useState(childrenFromProps);
  const hasRenderedChildren = !!renderedChildren;
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<Timeout>();
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (childrenFromProps) {
      setRenderedChildren(childrenFromProps);
    } else {
      // children removed, animate from current height to zero
      animateOpenOrClosed(container, timeoutRef, false, () => setRenderedChildren(null));
    }
  }, [childrenFromProps]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (hasRenderedChildren) {
      // children initially added, animate from zero height to full
      container.style.height = '0';
      animateOpenOrClosed(container, timeoutRef, true);
    }
  }, [hasRenderedChildren]);
  return <>{renderedChildren && <Container ref={containerRef}>{renderedChildren}</Container>}</>;
};

const animateOpenOrClosed = (
  container: HTMLDivElement | null,
  timeoutRef: MutableRefObject<Timeout | undefined>,
  open: boolean,
  onComplete?: () => void,
) => {
  if (!container) return;
  const currentHeight = container.offsetHeight;
  container.style.transition = 'none';
  container.style.overflow = 'hidden';
  let targetHeight = 0;
  if (open) {
    container.style.height = '0';
    targetHeight = open ? container.scrollHeight : 0;
  }
  container.style.height = currentHeight + 'px';
  requestAnimationFrame(() => {
    container.style.transition = '';
    container.style.height = targetHeight + 'px';
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (open) {
        container.style.height = '';
        container.style.overflow = '';
      }
      onComplete?.();
    }, ANIMATION_MS);
  });
};

const ANIMATION_MS = 400;

const Container = styled('div')`
  transition: height ${ANIMATION_MS}ms ease-in-out;
`;

type Timeout = ReturnType<typeof setTimeout>;
