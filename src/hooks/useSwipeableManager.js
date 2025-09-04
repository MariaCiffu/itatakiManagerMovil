// hooks/useSwipeableManager.js
import { useRef, useCallback } from "react";

export const useSwipeableManager = () => {
  const currentSwipeableRef = useRef(null);

  const handleSwipeableOpen = useCallback((swipeableRef) => {
    // Cerrar el swipeable anterior si existe y tiene el método close
    if (
      currentSwipeableRef.current &&
      currentSwipeableRef.current !== swipeableRef &&
      currentSwipeableRef.current.current && // Verificar que existe la referencia
      typeof currentSwipeableRef.current.current.close === "function" // Verificar que tiene el método close
    ) {
      currentSwipeableRef.current.current.close();
    }

    // Guardar referencia al swipeable actual
    currentSwipeableRef.current = swipeableRef;
  }, []);

  const closeCurrentSwipeable = useCallback(() => {
    if (
      currentSwipeableRef.current &&
      currentSwipeableRef.current.current && // Verificar que existe la referencia
      typeof currentSwipeableRef.current.current.close === "function" // Verificar que tiene el método close
    ) {
      currentSwipeableRef.current.current.close();
      currentSwipeableRef.current = null;
    }
  }, []);

  return {
    handleSwipeableOpen,
    closeCurrentSwipeable,
  };
};
