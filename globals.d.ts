import type { Map, Marker } from "@maptiler/sdk";

declare global {
  interface Window {
    MapInstance?: Map;
    addressMarker?: Marker;
    stopMarkers?: Marker[];
  }
}

export {};
