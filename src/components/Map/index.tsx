import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Map as MaptilerMap, config, MapStyle } from "@maptiler/sdk";
import { type Component, onMount, splitProps } from "solid-js";
import { WARSAW_CENTER_COORDINATES } from "./constants";

type Props = {
  mapsApiKey: string;
};
export const Map: Component<Props> = (_props) => {
  const [props, rest] = splitProps(_props, ["mapsApiKey"]);
  const { mapsApiKey } = props;
  config.apiKey = mapsApiKey;

  onMount(() => {
    const map = new MaptilerMap({
      container: "map", // container's id or the HTML element to render the map
      style: MapStyle.STREETS,
      center: [WARSAW_CENTER_COORDINATES.lon, WARSAW_CENTER_COORDINATES.lat],
      zoom: 11,
    });
  });
  return (
    <div>
      <div id="map" class="w-screen h-screen" />
    </div>
  );
};
