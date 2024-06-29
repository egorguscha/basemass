import { useState, useEffect } from "react";
import { getPlanetFeatures } from "@/services/planet/planetFeatures";

const usePlanetFeatures = (mintHash, collectionId) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [planetFeatures, setPlanetFeatures] = useState(null);

  useEffect(() => {
    if (!mintHash || !collectionId) return;

    const planetFeatures = getPlanetFeatures(mintHash, collectionId);
    setPlanetFeatures(planetFeatures);
    setIsLoaded(true);
  }, [mintHash, collectionId]);

  return { isLoaded, planetFeatures };
};

export default usePlanetFeatures;
