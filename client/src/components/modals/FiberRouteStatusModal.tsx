import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  route: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (changes: any) => void;
  onDelete?: () => void;
}

const FiberRouteStatusModal: React.FC<Props> = ({
  route,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { user } = useAuth();
  const userRole = user?.role || "customer";
  const canEditFiber = userRole === "admin" || userRole === "staff";
  const isAdmin = userRole === "admin";

  if (!isOpen) return null;

  const progress = Number(route.progress || 0);
  const direction = route.progressDirection || "start";

  const [localPhotos, setLocalPhotos] = useState<string[]>([
    route?.photo1 || "",
    route?.photo2 || "",
    route?.photo3 || "",
    route?.photo4 || "",
  ]);

  useEffect(() => {
    if (!route?.id) return;

    setLocalPhotos([
      route.photo1 || "",
      route.photo2 || "",
      route.photo3 || "",
      route.photo4 || "",
    ]);
  }, [
    route?.id,
    route?.photo1,
    route?.photo2,
    route?.photo3,
    route?.photo4,
  ]);

  const photos = localPhotos;

  const filledPhotos = photos.filter(Boolean).length;

  const handlePhotoUpload = (index: number, file: File) => {
    if (!canEditFiber) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const photoData = String(reader.result || "");

      setLocalPhotos((prev) => {
        const next = [...prev];
        next[index] = photoData;

        // Send all photo fields every time.
        // This prevents old uploaded photos from being cleared
        // if the parent update function replaces the route object.
        onUpdate({
          photo1: next[0] || "",
          photo2: next[1] || "",
          photo3: next[2] || "",
          photo4: next[3] || "",
        });

        return next;
      });
    };

    reader.readAsDataURL(file);
  };

  const deletePhoto = (index: number) => {
    if (!canEditFiber) return;

    setLocalPhotos((prev) => {
      const next = [...prev];
      next[index] = "";

      // Send all photo fields every time.
      // This keeps the other existing photos safe.
      onUpdate({
        photo1: next[0] || "",
        photo2: next[1] || "",
        photo3: next[2] || "",
        photo4: next[3] || "",
      });

      return next;
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="w-[620px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">
                {route.name || "Fiber Route"}
              </div>
              <div className="text-red-100 text-sm">
                Fiber Optic Route Progress
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
              <div className="flex justify-between mb-3">
                <span className="font-bold text-gray-700">
                  Installation Progress
                </span>
                <span className="font-black text-green-700 text-xl">
                  {progress}%
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                disabled={!canEditFiber}
                onChange={(e) =>
                  canEditFiber &&
                  onUpdate({
                    progress: Number(e.target.value),
                  })
                }
                className="w-full accent-green-600"
              />

              <div className="mt-3 h-4 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-2 text-sm text-gray-500">
                เส้นสีเขียวจะแสดงเฉพาะระยะตาม % Progress เท่านั้น
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-700 mb-3">
                Progress Direction
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={!canEditFiber}
                  onClick={() =>
                    canEditFiber &&
                    onUpdate({
                      progressDirection: "start",
                    })
                  }
                  className={`px-4 py-3 rounded-xl border font-bold ${
                    direction === "start"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  Start → End
                </button>

                <button
                  disabled={!canEditFiber}
                  onClick={() =>
                    canEditFiber &&
                    onUpdate({
                      progressDirection: "end",
                    })
                  }
                  className={`px-4 py-3 rounded-xl border font-bold ${
                    direction === "end"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  End → Start
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-700">
                  Upload Fiber Photos ({filledPhotos}/4)
                </div>

                {!canEditFiber && (
                  <span className="text-xs font-bold text-gray-500">
                    View only
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50"
                  >
                    {photos[idx] ? (
                      <div className="relative">
                        <button
                          disabled={!canEditFiber}
                          onClick={(e) => {
                            e.stopPropagation();

                            if (canEditFiber) {
                              deletePhoto(idx);
                            }
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white font-bold z-10"
                        >
                          ×
                        </button>

                        <img
                          src={photos[idx]}
                          alt=""
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(String(photos[idx]));
                          }}
                          className="rounded-lg w-full h-36 object-cover border cursor-zoom-in hover:ring-2 hover:ring-red-400"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-500 mb-2">
                          Photo {idx + 1}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          disabled={!canEditFiber}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();

                            const file = e.target.files?.[0];

                            if (file) {
                              handlePhotoUpload(idx, file);
                              e.target.value = "";
                            }
                          }}
                          className="w-full text-sm cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    `Delete ${route.name || "Fiber Route"} ?`
                  );

                  if (!confirmed) return;

                  if (onDelete) {
                    onDelete();
                  }

                  onClose();
                }}
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition"
              >
                Delete Fiber Route
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[999999] bg-black flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 z-[1000000] h-12 w-12 rounded-full bg-white/15 text-white text-2xl font-black hover:bg-white/25"
          >
            ×
          </button>

          <img
            src={previewImage}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[98vw] max-h-[98vh] object-contain"
          />
        </div>
      )}
    </>
  );
};

export default FiberRouteStatusModal;
