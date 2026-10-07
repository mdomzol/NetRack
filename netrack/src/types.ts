export type DeviceType =
  | "switch"
  | "router"
  | "server"
  | "firewall"
  | "other";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  ports: number;
  heightU: number;
  positionU: number | null;
};

export type DeviceModel = {
  id: string;
  manufacturer: string;
  model: string;
  type: DeviceType;
  ports: number;
  heightU: number;
};

export type Rack = {
  name: string;
  manufacturer: string;
  model: string;
  heightU: number;
  width: number;
  depth: number;
  location: string;
};

export type PatchPanelPort = {
  id: string;
  number: number;
  label: string;
  status: "free" | "connected";
};

export type ConnectionEndpoint =
  | {
      kind: "device";
      deviceId: string;
      port: number;
    }
  | {
      kind: "patch-panel";
      patchPanelId: string;
      portId: string;
    };

export type Connection = {
  id: string;
  from: ConnectionEndpoint;
  to: ConnectionEndpoint;
};

export type PatchPanel = {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  type: string;
  ports: number;
  heightU: number;
  positionU: number | null;
  portList: PatchPanelPort[];
};

export type ProjectDraft = {
  name: string;
  location: string;
  description: string;
  rack: Rack;
  devices: Device[];
  patchPanels: PatchPanel[];
  connections: Connection[];
};
