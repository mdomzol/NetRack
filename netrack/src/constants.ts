import { DeviceModel, DevicePortDefinition } from "./types";

const rj45 = (count: number): DevicePortDefinition[] => Array.from({ length: count }, (_, index) => ({ number: index + 1, type: "rj45" as const }));
const sfp = (count: number, start: number, type: "sfp" | "sfp+" = "sfp"): DevicePortDefinition[] => Array.from({ length: count }, (_, index) => ({ number: start + index, type }));
const layout = (rj45Count: number, sfpCount = 0, sfpStart = rj45Count + 1, sfpType: "sfp" | "sfp+" = "sfp") => [...rj45(rj45Count), ...sfp(sfpCount, sfpStart, sfpType)];

export const DEVICE_MODELS: DeviceModel[] = [
  {
    id: "dlink-dgs-3100-48",
    manufacturer: "D-Link",
    model: "DGS-3100-48",
    type: "switch",
    ports: 48,
    portLayout: layout(48, 4, 49),
    heightU: 1,
  },
  {
    id: "dlink-dgs-1210-28",
    manufacturer: "D-Link",
    model: "DGS-1210-28",
    type: "switch",
    ports: 28,
    portLayout: layout(24, 4, 25),
    heightU: 1,
  },
  {
    id: "mikrotik-ccr2004",
    manufacturer: "MikroTik",
    model: "CCR2004-16G-2S+",
    type: "router",
    ports: 18,
    portLayout: layout(16, 2, 17, "sfp+"),
    heightU: 1,
  },
  {
    id: "zyxel-gs1900-10hp",
    manufacturer: "ZyXEL",
    model: "GS1900-10HP",
    type: "switch",
    ports: 10,
    portLayout: layout(8, 2, 9),
    heightU: 1,
  },
  {
    id: "zyxel-gs1900-24",
    manufacturer: "ZyXEL",
    model: "GS1900-24",
    type: "switch",
    ports: 24,
    portLayout: layout(24),
    heightU: 1,
  },
  {
    id: "zyxel-gs1900-24hp",
    manufacturer: "ZyXEL",
    model: "GS1900-24HP",
    type: "switch",
    ports: 24,
    portLayout: layout(24, 2, 25),
    heightU: 1,
  },
  {
    id: "tp-link-sg3428",
    manufacturer: "TP-Link",
    model: "SG3428",
    type: "switch",
    ports: 28,
    portLayout: layout(24, 4, 25),
    heightU: 1,
  },
  {
    id: "tp-link-sg3428mp",
    manufacturer: "TP-Link",
    model: "SG3428MP",
    type: "switch",
    ports: 28,
    portLayout: layout(24, 4, 25),
    heightU: 1,
  },
  {
    id: "tp-link-sg3452",
    manufacturer: "TP-Link",
    model: "SG3452",
    type: "switch",
    ports: 52,
    portLayout: layout(48, 4, 49),
    heightU: 1,
  },
  {
    id: "tp-link-sg3452p",
    manufacturer: "TP-Link",
    model: "SG3452P",
    type: "switch",
    ports: 52,
    portLayout: layout(48, 4, 49),
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