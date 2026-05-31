import React from "react";

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
  if (!isOpen) return null;

  const progress = Number(route.progress || 0);

  const direction =
    route.progressDirection || "start";

  const photos = [
    route.photo1,
    route.photo2,
    route.photo3,
    route.photo4,
  ];

  const handlePhotoUpload = (
    index: number,
    file: File
  ) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      onUpdate({
        [`photo${index + 1}`]:
          reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">

      <div className="w-[580px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">

        {/* Header */}
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">

          <div>
            <div className="text-2xl font-bold">
              {route.name}
            </div>

            <div className="text-red-100 text-sm">
              Fiber Route Status
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Progress */}
          <div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">
                Progress
              </span>

              <span className="font-bold text-green-600">
                {progress}%
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) =>
                onUpdate({
                  progress: Number(
                    e.target.value
                  ),
                })
              }
              className="w-full accent-green-600"
            />

          </div>

          {/* Direction */}
          <div>

            <div className="font-semibold text-gray-700 mb-3">
              Progress Direction
            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  onUpdate({
                    progressDirection:
                      "start",
                  })
                }
                className={`px-4 py-2 rounded-xl border font-semibold ${
                  direction === "start"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                Start → End
              </button>

              <button
                onClick={() =>
                  onUpdate({
                    progressDirection:
                      "end",
                  })
                }
                className={`px-4 py-2 rounded-xl border font-semibold ${
                  direction === "end"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                End → Start
              </button>

            </div>

          </div>

          {/* Upload */}
          <div>

            <div className="font-semibold text-gray-700 mb-3">
              Upload Photos
            </div>

            <div className="grid grid-cols-2 gap-4">

              {[0,1,2,3].map((idx) => (
                <div
                  key={idx}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50"
                >

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (file) {
                        handlePhotoUpload(
                          idx,
                          file
                        );
                      }
                    }}
                    className="w-full text-sm"
                  />

                  {photos[idx] && (
                    <img
                      src={photos[idx]}
                      alt=""
                      className="mt-3 rounded-lg w-full h-32 object-cover border"
                    />
                  )}

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default FiberRouteStatusModal;
