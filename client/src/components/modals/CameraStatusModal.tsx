import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CameraStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: any;
  onUpdate?: () => void;
}

const CameraStatusModal = ({
  isOpen,
  onClose,
  camera,
  onUpdate,
}: CameraStatusModalProps) => {
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];

      if (!file || !camera?.id) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();

      const fileName =
        camera.id + "-" + Date.now() + "." + fileExt;

      const { error: uploadError } = await supabase.storage
        .from("camera-photos")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("camera-photos")
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("cameras")
        .update({
          photo1: photoUrl,
        })
        .eq("id", camera.id);

      if (updateError) {
        alert(updateError.message);
        return;
      }

      alert("Upload success");

      if (onUpdate) {
  await onUpdate();
}

window.location.reload();

    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const photos = [
    camera?.photo1,
    camera?.photo2,
    camera?.photo3,
    camera?.photo4,
  ].filter(Boolean);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "700px",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#000",
          color: "#fff",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #333",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Camera Status
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>
            รูปหน้างาน ({photos.length}/4)
          </h3>

          <label>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleUpload}
              disabled={uploading}
            />

            <div
              style={{
                background: "#2563eb",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {uploading
                ? "Uploading..."
                : "Upload Photo"}
            </div>
          </label>
        </div>

        {photos.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={"photo-" + index}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "1px solid #333",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              padding: "60px 0",
            }}
          >
            ยังไม่มีรูปหน้างาน
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
            }}
          >
            Edit Position
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraStatusModal;
