// hooks/useSwipeableManager.js
import { useRef, useCallback } from "react";

export const useSwipeableManager = () => {
  const currentSwipeableRef = useRef(null);

  const handleSwipeableOpen = useCallback((swipeableRef) => {
    // Cerrar el swipeable anterior si existe
    if (
      currentSwipeableRef.current &&
      currentSwipeableRef.current !== swipeableRef
    ) {
      currentSwipeableRef.current.close();
    }

    // Guardar referencia al swipeable actual
    currentSwipeableRef.current = swipeableRef;
  }, []);

  const closeCurrentSwipeable = useCallback(() => {
    if (currentSwipeableRef.current) {
      currentSwipeableRef.current.close();
      currentSwipeableRef.current = null;
    }
  }, []);

  return {
    handleSwipeableOpen,
    closeCurrentSwipeable,
  };
};
