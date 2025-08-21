import { useRef, useCallback } from "react";

export function useSwipeableManager() {
  const openSwipeableRef = useRef(null);

  // Callback a ser llamado cuando un Swipeable se abre
  // Recibe la referencia del swipeable (ref object, no la instancia directa)
  const handleSwipeableOpen = useCallback((swipeableRef) => {
    // Cerrar el swipeable anterior si existe y es diferente
    if (
      openSwipeableRef.current &&
      openSwipeableRef.current !== swipeableRef.current
    ) {
      try {
        openSwipeableRef.current.close();
      } catch (error) {
        console.warn("Error closing previous swipeable:", error);
      }
    }

    // Guardar la referencia actual del swipeable (la instancia, no el ref)
    openSwipeableRef.current = swipeableRef.current;
  }, []);

  // Callback para cerrar explícitamente el swipeable actualmente abierto
  const closeCurrentSwipeable = useCallback(() => {
    if (openSwipeableRef.current) {
      try {
        // Verificar que el método close existe antes de llamarlo
        if (typeof openSwipeableRef.current.close === "function") {
          openSwipeableRef.current.close();
        }
      } catch (error) {
        console.warn("Error closing swipeable:", error);
      } finally {
        // Resetear la referencia después de cerrar
        openSwipeableRef.current = null;
      }
    }
  }, []);

  return {
    handleSwipeableOpen,
    closeCurrentSwipeable,
  };
}
