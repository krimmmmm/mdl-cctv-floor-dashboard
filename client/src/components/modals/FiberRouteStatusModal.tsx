import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  route: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (changes: any) => void;
}

const FiberRouteStatusModal: React.FC<Props> = ({
  route,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const userRole = user?.role || "customer";
  const canEditFiber = userRole === "admin" || userRole === "staff";

  if (!isOpen) return null;

  const progress = Number(route.progress || 0);
  const direction = route.progressDirection || "start";

  const photos = [
    route.photo1 || "",
    route.photo2 || "",
    route.photo3 || "",
    route.photo4 || "",
  ];

  const filledPhotos = photos.filter(Boolean).length;

  const handlePhotoUpload = (index: number, file: File) => {
    if (!canEditFiber) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      onUpdate({
        [`photo${index + 1}`]: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  const deletePhoto = (index: number) => {
    if (!canEditFiber) return;

    onUpdate({
      [`photo${index + 1}`]: "",
    });
  };

  return (
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
            <div className="text-xl font-bold">{route.name || "Fiber Route"}</div>
            <div className="text-red-100 text-sm">Fiber Optic Route Progress</div>
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
              <span className="font-bold text-gray-700">Installation Progress</span>
              <span className="font-black text-green-700 text-xl">{progress}%</span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              disabled={!canEditFiber}
              onChange={(e) => canEditFiber && onUpdate({ progress: Number(e.target.value) })}
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
            <div className="font-bold text-gray-700 mb-3">Progress Direction</div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!canEditFiber}
                onClick={() => canEditFiber && onUpdate({ progressDirection: "start" })}
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
                onClick={() => canEditFiber && onUpdate({ progressDirection: "end" })}
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
                        onClick={() => canEditFiber && deletePhoto(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white font-bold"
                      >
                        ×
                      </button>

                      <img
                        src={photos[idx]}
                        alt=""
                        className="rounded-lg w-full h-36 object-cover border"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-500 mb-2">Photo {idx + 1}</div>

                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canEditFiber}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(idx, file);
                        }}
                        className="w-full text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiberRouteStatusModal;
