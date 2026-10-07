import home from "../assets/icons/dashboard/home-gr.png";
import rack from "../assets/icons/rack/rack-gr.png";
import rackOrange from "../assets/icons/rack/rack-or.png";
import switchIcon from "../assets/icons/devices/switch-gr.png";
import switchOrange from "../assets/icons/devices/switch-or.png";
import hardware from "../assets/icons/devices/hardware-gr.png";
import patchPanel from "../assets/icons/patch-panels/patchpanel-gr.png";
import patchPanelOrange from "../assets/icons/patch-panels/patchpanel-or.png";
import link from "../assets/icons/connections/link-gr.png";
import linkOrange from "../assets/icons/connections/link-or.png";
import port from "../assets/icons/connections/port-gr.png";
import rj45 from "../assets/icons/connections/rj-45-gr.png";
import poe from "../assets/icons/devices/poe-gr.png";

export type IconName =
  | "home" | "rack" | "switch" | "hardware" | "patch-panel"
  | "link" | "port" | "rj45" | "poe";

type IconProps = {
  name: IconName;
  active?: boolean;
  className?: string;
  alt?: string;
};

const icons = {
  home, rack, switch: switchIcon, hardware, "patch-panel": patchPanel,
  link, port, rj45, poe,
} as const;

const activeIcons = {
  rack: rackOrange,
  switch: switchOrange,
  "patch-panel": patchPanelOrange,
  link: linkOrange,
} as const;

export default function Icon({ name, active = false, className = "", alt = "" }: IconProps) {
  const source = active && name in activeIcons
    ? activeIcons[name as keyof typeof activeIcons]
    : icons[name];

  return <img className={"ui-icon " + className} src={source} alt={alt} aria-hidden={!alt} />;
}
