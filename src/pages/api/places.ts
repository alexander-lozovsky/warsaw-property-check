import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

const GEOAPIFY_KEY = getSecret("GEOAPIFY_KEY");
const placesApi = "https://api.geoapify.com/v2/places";

export const GET: APIRoute = async ({ url }) => {
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  if (!(lat && lon)) {
    return new Response(null, { status: 400 });
  }
  const apiUrl = new URL(placesApi);
  const search = new URLSearchParams({
    apiKey: GEOAPIFY_KEY,
    categories: "public_transport.tram,public_transport.subway",
    filter: `circle:${lon},${lat},1000`,
    bias: `proximity:${lon},${lat}`,
    limit: "10",
  } as Record<string, string>);
  apiUrl.search = search.toString();
  const results = await fetch(apiUrl);
  const data = await results.json();

  const places: {
    type: "tram" | "metro";
    name: string;
    lat: number;
    lon: number;
  }[] = [];
  data.features.forEach(
    async ({ properties: { name, lat, lon, categories } }) => {
      if (categories.some((it) => it === "public_transport.tram")) {
        const item = {
          name: name,
          type: "tram" as const,
          lat: lat,
          lon: lon,
        };
        places.push(item);
      }
      if (categories.some((it) => it === "public_transport.subway")) {
        const item = {
          name: name,
          type: "metro" as const,
          lat: lat,
          lon: lon,
        };
        places.push(item);
      }
    },
  );

  return new Response(
    JSON.stringify({
      stops: places,
    }),
  );
};
