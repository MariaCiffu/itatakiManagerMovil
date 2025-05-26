import { useRef, useCallback } from 'react';

export function useSwipeableManager() {
  const openSwipeableRef = useRef(null);

  // Callback a ser llamado cuando un Swipeable se abre
  // Se encarga de cerrar el swipeable previamente abierto si es diferente al actual
  const handleSwipeableOpen = useCallback((swipeableInstance) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== swipeableInstance) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = swipeableInstance;
  }, []);

  // Callback para cerrar explícitamente el swipeable actualmente abierto
  const closeCurrentSwipeable = useCallback(() => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null; // Resetear la referencia después de cerrar
    }
  }, []);

  return {
    handleSwipeableOpen,
    closeCurrentSwipeable,
    // No es necesario exponer openSwipeableRef directamente si el hook maneja todo.
    // La pantalla pasará handleSwipeableOpen a cada PlayerCard.
  };
}