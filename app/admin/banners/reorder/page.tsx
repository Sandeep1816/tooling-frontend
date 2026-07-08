"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useMutation, useQuery } from "@/lib/apollo/hooks";
import { BANNER_PLACEMENTS } from "@/lib/bannerPlacements";
import {
  ADMIN_BANNERS_QUERY,
  REORDER_BANNERS_MUTATION,
} from "@/lib/graphql/operations";

type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  placement: string;
  status: string;
  position: number;
};

export default function BannerReorderPage() {
  const [placement, setPlacement] = useState("HOME_MIDDLE");
  const [localBanners, setLocalBanners] = useState<Banner[] | null>(null);

  const { data, loading } = useQuery(ADMIN_BANNERS_QUERY);
  const [reorderBanners] = useMutation(REORDER_BANNERS_MUTATION);

  const banners = useMemo(() => {
    if (localBanners !== null) return localBanners;

    const all = (data?.adminBanners ?? []) as Banner[];
    return all
      .filter((b) => b.placement === placement)
      .sort((a, b) => a.position - b.position);
  }, [data, placement, localBanners]);

  const onPlacementChange = (value: string) => {
    setPlacement(value);
    setLocalBanners(null);
  };

  const onDragEnd = async (result: {
    destination?: { index: number } | null;
    source: { index: number };
  }) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setLocalBanners(items);

    try {
      await reorderBanners({
        variables: {
          updates: items.map((b, index) => ({
            id: b.id,
            position: index,
          })),
        },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reorder failed");
      setLocalBanners(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Reorder Advertisement Banners
      </h1>

      <select
        value={placement}
        onChange={(e) => onPlacementChange(e.target.value)}
        className="border p-2 mb-6"
      >
        {BANNER_PLACEMENTS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading banners…</p>
      ) : banners.length === 0 ? (
        <p>No banners for this placement</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="banners">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {banners.map((b, index) => (
                  <Draggable
                    key={b.id}
                    draggableId={b.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-4 border p-3 rounded bg-white cursor-move"
                      >
                        <span className="font-bold w-6">
                          {index + 1}
                        </span>

                        <div className="relative w-24 h-14">
                          <Image
                            src={b.imageUrl}
                            alt={b.title || "Banner"}
                            fill
                            className="object-cover rounded"
                            sizes="96px"
                          />
                        </div>

                        <div>
                          <p className="font-medium">{b.title}</p>
                          <p className="text-sm text-gray-500">
                            {b.status}
                          </p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
