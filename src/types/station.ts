export type SpaceStationData = {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isHome?: boolean;
};

export type StationProximityState = {
  near: boolean;
  station: SpaceStationData | null;
  distance: number;
};
