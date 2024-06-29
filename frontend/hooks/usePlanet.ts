import { useState, useEffect } from "react";
import PlanetRender from "@/services/planet/PlanetRender";

const usePlanet = (mintHash, collectionId, planetCanvasRef) => {
  const [isPlanetLoaded, setIsPlanetLoaded] = useState(false);

  useEffect(() => {
    if (!mintHash || !collectionId) return;

    const planet = new PlanetRender(mintHash, collectionId, planetCanvasRef);
    planet.initAnimation();

    setIsPlanetLoaded(true);

    return () => planet.stopAnimation();
  }, [mintHash, collectionId]);

  return { isPlanetLoaded };
};

export default usePlanet;
