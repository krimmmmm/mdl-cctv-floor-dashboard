import React, { useEffect, useRef, useState } from "react";
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
  const [routeName, setRouteName] = useState(route?.name || route?.label || "");

  const { user } = useAuth();
  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mdl_user") || "{}")
      : {};

  const userRole = String(user?.role || savedUser?.role || "customer")
    .trim()
    .toLowerCase();

  const userName = String(user?.username || savedUser?.username || "")
    .trim()
    .toLowerCase();

  const isAdminUser =
    userRole === "admin" ||
    userRole === "newstaff" ||
    userName.includes("admin");

  const isStaffOnlyUser =
    userRole === "staffonly";

  const isStaffUser =
    userRole === "staff" ||
    userName.includes("staff");

  // Admin + Staff can edit Fiber progress/photos/direction.
  const canEditFiber = isAdminUser || isStaffOnlyUser;

  // Delete Fiber route remains Admin only.
  const isAdmin = userRole === "admin" || userRole === "newstaff";

  useEffect(() => {
    setRouteName(route?.name || route?.label || "");
  }, [route?.id, route?.name, route?.label]);

  const resizeImageToDataUrl = (
    file: File,
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.72
  ) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () =>
        reject(reader.error || new Error("Cannot read file"));

      reader.onload = () => {
        const image = new Image();

        image.onerror = () => reject(new Error("Cannot load image"));

        image.onload = () => {
          const scale = Math.min(
            1,
            maxWidth / image.width,
            maxHeight / image.height
          );

          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas is not supported"));
            return;
          }

          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };

        image.src = String(reader.result || "");
      };

      reader.readAsDataURL(file);
    });


  const handleSaveRouteName = () => {
    if (!canEditFiber) return;

    const nextName = routeName.trim();

    if (!nextName) {
      alert("กรุณาระบุชื่อ Route Fiber");
      return;
    }

    onUpdate({
      progress: route.progress || 0,
      progressDirection: route.progressDirection || "start",
      color: route.color || "#ef4444",
      name: nextName,
      label: nextName,
      status: route.status || "active",
      photo1: route.photo1 || "",
      photo2: route.photo2 || "",
      photo3: route.photo3 || "",
      photo4: route.photo4 || "",
    });

    alert("Save Route Name สำเร็จ");
  };

if (!isOpen) return null;

  const progress = Number(route.progress || 0);
  const direction = route.progressDirection || "start";

  const getRoutePhotos = () => {
    return [
      route?.photo1 || "",
      route?.photo2 || "",
      route?.photo3 || "",
      route?.photo4 || "",
    ];
  };

  const [localPhotos, setLocalPhotos] = useState<string[]>(getRoutePhotos);

  const lastRouteIdRef = useRef<string | null>(route?.id || null);
  const pendingLocalPhotosRef = useRef<string[] | null>(null);
  const pendingClearTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!route?.id) return;

    const incomingPhotos = [
      route.photo1 || "",
      route.photo2 || "",
      route.photo3 || "",
      route.photo4 || "",
    ];

    const isRouteChanged = lastRouteIdRef.current !== route.id;

    if (isRouteChanged) {
      lastRouteIdRef.current = route.id;
      pendingLocalPhotosRef.current = null;

      setLocalPhotos(incomingPhotos);
      return;
    }

    setLocalPhotos((prev) => {
      const pendingPhotos = pendingLocalPhotosRef.current;

      // During upload/delete, Supabase realtime can briefly return a route object
      // with empty/old photo fields. Keep the local modal photos so they do not
      // disappear until the confirmed realtime payload arrives.
      if (pendingPhotos) {
        const incomingMatchesPending = incomingPhotos.every(
          (photo, index) => photo === pendingPhotos[index]
        );

        if (incomingMatchesPending) {
          pendingLocalPhotosRef.current = null;
          return incomingPhotos;
        }

        return pendingPhotos;
      }

      const hasIncomingPhotos = incomingPhotos.some(Boolean);
      const hasCurrentPhotos = prev.some(Boolean);

      // Do not overwrite existing modal photos with a transient all-empty payload.
      if (!hasIncomingPhotos && hasCurrentPhotos) {
        return prev;
      }

      // Merge slot-by-slot so old uploaded photos are not removed while uploading
      // another slot.
      return incomingPhotos.map((photo, index) => photo || prev[index] || "");
    });
  }, [
    route?.id,
    route?.photo1,
    route?.photo2,
    route?.photo3,
    route?.photo4,
  ]);

  useEffect(() => {
    return () => {
      if (pendingClearTimerRef.current) {
        window.clearTimeout(pendingClearTimerRef.current);
      }
    };
  }, []);

  const photos = localPhotos;

  const filledPhotos = photos.filter(Boolean).length;

  const handlePhotoUpload = async (index: number, file: File) => {
    if (!canEditFiber) return;

    try {
      const photoData = await resizeImageToDataUrl(file);

      setLocalPhotos((prev) => {
        const next = [...prev];
        next[index] = photoData;

        pendingLocalPhotosRef.current = next;

        if (pendingClearTimerRef.current) {
          window.clearTimeout(pendingClearTimerRef.current);
        }

        pendingClearTimerRef.current = window.setTimeout(() => {
          pendingLocalPhotosRef.current = null;
        }, 5000);

        // Do NOT write Fiber Route photos to localStorage.
        // Base64 images can exceed browser storage quota and cause a white screen.
        onUpdate({
          progress: route.progress || 0,
          progressDirection: route.progressDirection || "start",
          color: route.color || "#ef4444",
          name: route.name || route.label || "Fiber Route",
          label: route.label || route.name || "Fiber Route",
          status: route.status || "active",
          photo1: next[0] || "",
          photo2: next[1] || "",
          photo3: next[2] || "",
          photo4: next[3] || "",
        });

        return next;
      });
    } catch (error: any) {
      console.error("Upload fiber photo error:", error);
      alert(error?.message || "ไม่สามารถ Upload รูป Fiber Route ได้");
    }
  };

  const deletePhoto = (index: number) => {
    if (!canEditFiber) return;

    setLocalPhotos((prev) => {
      const next = [...prev];
      next[index] = "";

      pendingLocalPhotosRef.current = next;

      if (pendingClearTimerRef.current) {
        window.clearTimeout(pendingClearTimerRef.current);
      }

      pendingClearTimerRef.current = window.setTimeout(() => {
        pendingLocalPhotosRef.current = null;
      }, 5000);

      // Send all photo fields every time.
      // This keeps the other existing photos safe.
      onUpdate({
          progress: route.progress || 0,
        progressDirection: route.progressDirection || "start",
        color: route.color || "#ef4444",
        name: route.name || route.label || "Fiber Route",
        label: route.label || route.name || "Fiber Route",
        status: route.status || "active",
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
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">
              <div className="text-xs font-bold text-gray-500 mb-1">
                Route ID (Read Only)
              </div>

              <div className="font-semibold text-gray-800 mb-3 break-all">
                {route.id}
              </div>

              <div className="text-xs font-bold text-gray-500 mb-1">
                Route Name
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={routeName}
                  disabled={!canEditFiber}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-semibold disabled:bg-gray-100"
                />

                <button
                  type="button"
                  disabled={!canEditFiber}
                  onClick={handleSaveRouteName}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold disabled:bg-gray-400"
                >
                  Save Name
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                แก้เฉพาะชื่อ Route Fiber เท่านั้น ไม่กระทบเส้นทาง Progress รูป และพิกัด
              </div>
            </div>

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
                                  name: route.name || route.label || "Fiber Route",
                    label: route.label || route.name || "Fiber Route",
                    progress: Number(e.target.value),
                    progressDirection: route.progressDirection || "start",
                    color: route.color || "#ef4444",
                    status: route.status || "active",
                    photo1: route.photo1 || "",
                    photo2: route.photo2 || "",
                    photo3: route.photo3 || "",
                    photo4: route.photo4 || "",
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
                                      name: route.name || route.label || "Fiber Route",
                      label: route.label || route.name || "Fiber Route",
                      progress: route.progress || 0,
                      progressDirection: "start",
                      color: route.color || "#ef4444",
                      status: route.status || "active",
                      photo1: route.photo1 || "",
                      photo2: route.photo2 || "",
                      photo3: route.photo3 || "",
                      photo4: route.photo4 || "",
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
                                      name: route.name || route.label || "Fiber Route",
                      label: route.label || route.name || "Fiber Route",
                      progress: route.progress || 0,
                      progressDirection: "end",
                      color: route.color || "#ef4444",
                      status: route.status || "active",
                      photo1: route.photo1 || "",
                      photo2: route.photo2 || "",
                      photo3: route.photo3 || "",
                      photo4: route.photo4 || "",
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
