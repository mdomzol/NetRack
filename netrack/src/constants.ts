import { DeviceModel } from "./types";

export const DEVICE_MODELS: DeviceModel[] = [
  {
    id: "dlink-dgs-3100-48",
    manufacturer: "D-Link",
    model: "DGS-3100-48",
    type: "switch",
    ports: 48,
    heightU: 1,
  },
  {
    id: "dlink-dgs-1210-28",
    manufacturer: "D-Link",
    model: "DGS-1210-28",
    type: "switch",
    ports: 28,
    heightU: 1,
  },
  {
    id: "mikrotik-ccr2004",
    manufacturer: "MikroTik",
    model: "CCR2004-16G-2S+",
    type: "router",
    ports: 18,
    heightU: 1,
  },
];

import { ProjectDraft } from "./types";

export const createEmptyProject = (): ProjectDraft => ({
  name: "",
  location: "",
  description: "",

  rack: {
    name: "SR-01",
    manufacturer: "",
    model: "",
    heightU: 42,
    width: 19,
    depth: 800,
    location: "",
  },

  devices: [],
  patchPanels: [],
  connections: [],
});