import { useState } from "react";
import { Device, PatchPanel, Rack } from "../types";

type RackItem = {
  id: string;
  name: string;
  type: "device" | "patch-panel";
  positionU: number | null;
  heightU: number;
};

type RackCanvasProps = {
  rack: Rack;
  devices: Device[];
  patchPanels: PatchPanel[];
  onMoveItem?: (
    id: string,
    type: "device" | "patch-panel",
    positionU: number
  ) => boolean | void;
  onEditItem?: (id: string, type: "device" | "patch-panel") => void;
};

export default function RackCanvas({
  rack,
  devices,
  patchPanels,
  onMoveItem,
  onEditItem,
}: RackCanvasProps) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropU, setDropU] = useState<number | null>(null);

  const items: RackItem[] = [
    ...devices.map((item) => ({
      id: item.id, name: item.name, type: "device" as const,
      positionU: item.positionU, heightU: item.heightU,
    })),
    ...patchPanels.map((item) => ({
      id: item.id, name: item.name, type: "patch-panel" as const,
      positionU: item.positionU, heightU: item.heightU,
    })),
  ];

  const itemAt = (u: number) =>
    items.find((item) =>
      item.positionU !== null &&
      u >= item.positionU &&
      u < item.positionU + item.heightU
    );

  const canPlace = (item: RackItem, positionU: number) => {
    if (positionU < 1 || positionU + item.heightU - 1 > rack.heightU) return false;

    return !items.some((other) => {
      if (other.id === item.id || other.positionU === null) return false;
      const a1 = positionU;
      const a2 = positionU + item.heightU - 1;
      const b1 = other.positionU;
      const b2 = other.positionU + other.heightU - 1;
      return a1 <= b2 && b1 <= a2;
    });
  };

  const handleDragStart = (event: React.DragEvent, item: RackItem) => {
    setDragging(item.id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/netrack-item",
      JSON.stringify({ id: item.id, type: item.type })
    );
  };

  const handleDrop = (event: React.DragEvent, positionU: number) => {
    event.preventDefault();

    const raw = event.dataTransfer.getData("text/netrack-item");
    if (!raw) return;

    const data = JSON.parse(raw) as {
      id: string;
      type: RackItem["type"];
    };

    const item = items.find((candidate) => candidate.id === data.id);

    if (!item || !canPlace(item, positionU)) {
      setDropU(null);
      setDragging(null);
      return;
    }

    onMoveItem?.(data.id, data.type, positionU);
    setDropU(null);
    setDragging(null);
  };

  const rackRows = Array.from(
    { length: rack.heightU },
    (_, index) => rack.heightU - index
  );

  return (
    <div className="rack-canvas">
      <div className="rack-canvas-header">
        <div>
          <span className="rack-canvas-kicker">RACK LAYOUT</span>
          <strong>{rack.name || "SR-01"}</strong>
        </div>
        <span>{rack.heightU}U · {rack.width}" · {rack.depth} mm</span>
      </div>

      <div className="rack-canvas-body">
        <div
          className="rack-canvas-scale"
          style={{ gridTemplateRows: "repeat(" + rack.heightU + ", 1fr)" }}
        >
          {rackRows.map((positionU) => (
            <span key={positionU}>{positionU}</span>
          ))}
        </div>

        <div className="rack-canvas-frame">
          <div className="rack-canvas-rail left" />
          <div className="rack-canvas-rail right" />

          <div
            className="rack-canvas-grid"
            style={{
              "--rack-height": rack.heightU,
              gridTemplateRows: "repeat(" + rack.heightU + ", minmax(0, 1fr))",
            } as React.CSSProperties}
          >
            <div className="rack-canvas-drop-grid">
              {rackRows.map((positionU) => {
                const item = itemAt(positionU);
                const draggingItem = dragging
                  ? items.find((candidate) => candidate.id === dragging)
                  : null;
                const valid = draggingItem
                  ? canPlace(draggingItem, positionU)
                  : false;
                const isDropTarget =
                  dropU === positionU &&
                  draggingItem?.id !== item?.id;

                return (
                  <div
                    key={positionU}
                    className={[
                      "rack-canvas-slot",
                      item ? "occupied" : "",
                      isDropTarget
                        ? valid
                          ? "drop-valid"
                          : "drop-invalid"
                        : "",
                    ].filter(Boolean).join(" ")}
                    style={{ gridRow: rack.heightU - positionU + 1 }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (draggingItem) setDropU(positionU);
                    }}
                    onDrop={(event) => handleDrop(event, positionU)}
                  />
                );
              })}
            </div>

            <div className="rack-canvas-items">
              {items
                .filter((item) => item.positionU !== null)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={"rack-canvas-item " + item.type}
                    style={{
                      gridRow:
                        (rack.heightU - (item.positionU ?? 1) + 1) +
                        " / span " +
                        item.heightU,
                    }}
                    draggable
                    onDragStart={(event) => handleDragStart(event, item)}
                    onDragEnd={() => {
                      setDragging(null);
                      setDropU(null);
                    }}
                    onDoubleClick={() => onEditItem?.(item.id, item.type)}
                    title={
                      item.name +
                      " · " +
                      item.heightU +
                      "U · U" +
                      item.positionU
                    }
                  >
                    <span className="rack-canvas-item-grip">⋮⋮</span>
                    <strong>{item.name}</strong>
                    <small>U{item.positionU} · {item.heightU}U</small>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rack-canvas-hint">
        <span>↕</span>
        Przeciągnij element na wybraną jednostkę U. Podwójne kliknięcie otwiera edycję.
      </div>
    </div>
  );
}
