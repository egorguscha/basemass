import { useChainManager } from "@/hooks/useChainManager";
import { useQuery } from "@tanstack/react-query";
import { DEMO_PLANET } from "../constants";

const fetchPlanets = async (isAuthLoaded, address) => {
  // if (!isAuthLoaded) {
  //   throw new Error("Auth has not yet finished loading");
  // }

  if (!address) return [DEMO_PLANET];

  const graphqlQuery = {
    query: `
            query($filters: ObjktFilter) {
                user(id: "${address}") {
                    objkts(filters: $filters) {
                        id,
                        name
                        generationHash
                        issuer {
                            id
                        }
                    }
                }
            }
        `,
    variables: { filters: { issuer_in: [3808, 25858] } },
  };

  const planetsAvailable = fetch("https://api.fxhash.xyz/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(graphqlQuery),
  })
    .then((res) => res.json())
    .then((res) => {
      const planetsOwned = res.data?.user?.objkts;

      if (!planetsOwned || planetsOwned.length === 0) {
        return [DEMO_PLANET];
      }

      const formattedPlanets = planetsOwned.map((planet) => ({
        tokenId: planet.id,
        genHash: planet.generationHash,
        collectionId: planet.issuer.id,
        name: planet.name,
      }));

      return formattedPlanets;
    });

  return planetsAvailable;
};

const usePlanets = () => {
  const { address } = useChainManager();

  return useQuery({
    queryKey: ["planets", address],
    queryFn: () => fetchPlanets(true, address),
    // The query will not execute until the `isAuthLoaded` is true
    // enabled: !!isAuthLoaded,
    // New data on key change will be swapped without the loading state
    keepPreviousData: true,
  });
};

export default usePlanets;
