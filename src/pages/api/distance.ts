import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import type { DistanceResponse, GeoapifyRoutingResponse } from "../../types";

const GEOAPIFY_KEY = getSecret("GEOAPIFY_KEY");
const routingApi = "https://api.geoapify.com/v1/routing";

const formatDistance = (distance: number): string => {
  const km = Math.floor(distance / 1000);
  const m = distance % 1000;

  if (km === 0) return `${m} m`;
  if (m === 0) return `${km} km`;
  return `${km} km ${m} m`;
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
  const data = (await results.json()) as GeoapifyRoutingResponse;

  const result: DistanceResponse = {};
  data.features?.forEach(({ properties: { mode, distance, time } }) => {
    if (mode === "walk") {
      result.distance = formatDistance(distance);
      result.time = formatTime(time);

      return;
    }
  });

  return new Response(JSON.stringify(result));
};
