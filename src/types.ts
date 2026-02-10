export type Stop = {
  name: string;
  type: "metro" | "tram";
  lat: number;
  lon: number;
};

export type PlacesResponse = {
  stops: Stop[];
};

export type GeoapifyPlacesResponse = {
  features: {
    properties: {
      name: string;
      lat: number;
      lon: number;
      categories: string[];
    };
  }[];
};

export type DistanceResponse = {
  distance?: string;
  time?: string;
};

export type GeoapifyRoutingResponse = {
  features: {
    properties: {
      mode: string;
      distance: number;
      time: number;
    };
  }[];
};
