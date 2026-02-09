import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
// https://api.geoapify.com/v1/routing?waypoints=52.2976182,21.0375906|52.2940383,21.02720680000001&mode=walk&apiKey=YOUR_API_KEY

const GEOAPIFY_KEY = getSecret("GEOAPIFY_KEY");
const routingApi = "https://api.geoapify.com/v1/routing";

const formatDistance = (distance: number): string => {
  const km = Math.floor(distance / 1000);
  const m = distance % 1000;

  if (km === 0) return `${m}m`;
  if (m === 0) return `${km}km`;
  return `${km}km ${m}m`;
};

const formatTime = (time: number): string => {
  const minutes = Math.round(time / 60);
  return `${minutes} min`;
};

export const GET: APIRoute = async ({ url }) => {
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!(from && to)) {
    return new Response(null, { status: 400 });
  }
  const apiUrl = new URL(routingApi);
  const search = new URLSearchParams({
    apiKey: GEOAPIFY_KEY,
    waypoints: `${from}|${to}`,
    mode: "walk",
  } as Record<string, string>);
  apiUrl.search = search.toString();

  const results = await fetch(apiUrl);
  const data = await results.json();

  const result: { distance?: string; time?: string } = {};
  data.features.forEach(({ properties: { mode, distance, time } }) => {
    if (mode === "walk") {
      result.distance = formatDistance(distance);
      result.time = formatTime(time);

      return;
    }
  });

  return new Response(JSON.stringify(result));
};
