import "@maptiler/sdk/dist/maptiler-sdk.css";
import {
  Map as MaptilerMap,
  config,
  MapStyle,
  geocoding,
  type GeocodingSearchResult,
  type GeocodingFeature,
  Marker,
  Popup,
} from "@maptiler/sdk";
import {
  type Component,
  onMount,
  splitProps,
  createSignal,
  Show,
  createEffect,
} from "solid-js";
import { WARSAW_BOUNDS, WARSAW_CENTER_COORDINATES } from "./constants";
import type { DistanceResponse, PlacesResponse } from "../../types";

type Props = {
  mapsApiKey: string;
};
export const Map: Component<Props> = (_props) => {
  let inputRef: HTMLInputElement = null as unknown as HTMLInputElement;
  const [props, rest] = splitProps(_props, ["mapsApiKey"]);
  const [addressResults, setAddressResults] =
    createSignal<GeocodingSearchResult | null>(null);
  const [selectedAddress, setSelectedAddress] =
    createSignal<GeocodingFeature | null>(null);

  const { mapsApiKey } = props;
  config.apiKey = mapsApiKey;
  config.session = false;

  onMount(() => {
    const map = new MaptilerMap({
      container: "map",
      style: MapStyle.STREETS,
      center: [WARSAW_CENTER_COORDINATES.lon, WARSAW_CENTER_COORDINATES.lat],
      zoom: 11,
      maxBounds: WARSAW_BOUNDS,
    });
    window.MapInstance = map;
  });

  const onInputKeydown = async (e: KeyboardEvent) => {
    const value = (e.target as HTMLInputElement)?.value;
    if (value && value.length > 3) {
      const result = await geocoding.forward(value, {
        country: ["pl"],
        types: ["address"],
        bbox: WARSAW_BOUNDS,
      });
      setAddressResults(result);
    } else {
      setAddressResults(null);
    }
  };

  createEffect(async () => {
    const address = selectedAddress();

    window.addressMarker?.remove();
    window.stopMarkers?.forEach((it) => it.remove());

    if (address && window.MapInstance) {
      const popup = new Popup({ offset: 25 }).setText(address.place_name);
      const center = address.center as [number, number];
      const marker = new Marker()
        .setLngLat(center)
        .setPopup(popup)
        .addTo(window.MapInstance);

      window.MapInstance!.setZoom(14);
      window.MapInstance!.setCenter(center);
      window.addressMarker = marker;

      const response = await fetch(
        `/api/places?lat=${center[1]}&lon=${center[0]}`,
      );
      const data = (await response.json()) as PlacesResponse;

      const stopMarkers: Marker[] = [];
      data.stops.forEach(({ name, type, lat, lon }) => {
        const popup = new Popup({ offset: 25 }).setHTML(
          `<div><p>${name}</p></div>`,
        );

        const el = document.createElement("div");
        el.classList.add(type);

        const onClick = async () => {
          const response = await fetch(
            `/api/distance?from=${center[1]},${center[0]}&to=${lat},${lon}`,
          );
          const distance = (await response.json()) as DistanceResponse;
          popup.setHTML(
            `<div><p>${name}</p><p>${distance.distance}</p><p>${distance.time}</p></div>`,
          );
          console.log(distance);
        };
        el.onclick = onClick;

        const marker = new Marker({ element: el })
          .setLngLat([lon, lat])
          .setPopup(popup)
          .addTo(window.MapInstance!);
        stopMarkers.push(marker);
      });
      window.stopMarkers = stopMarkers;
    }
  });

  return (
    <div class="relative">
      <div class="absolute top-1.5 left-3 z-10 bg-white rounded-lg">
        <input
          type="text"
          class="border p-3 w-75 rounded-lg"
          placeholder="Address"
          onKeyUp={onInputKeydown}
          ref={inputRef}
        />
        <Show when={addressResults()?.features.length}>
          <div>
            {addressResults()?.features.map((it) => {
              const onAddressSelect = () => {
                setSelectedAddress(it);
                inputRef.value = it.place_name;
                setAddressResults(null);
              };
              return (
                <button
                  class="block p-3 w-75 hover:underline text-start"
                  onClick={onAddressSelect}
                >
                  {it.place_name}
                </button>
              );
            })}
          </div>
        </Show>
        <div></div>
      </div>
      <div id="map" class="w-screen h-screen" />
    </div>
  );
};
