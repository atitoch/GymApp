import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente que resetea el scroll al inicio de la página
 * cada vez que cambia la ruta
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

