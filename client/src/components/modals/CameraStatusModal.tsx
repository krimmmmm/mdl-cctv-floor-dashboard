import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useFloorPlan } from "@/contexts/FloorPlanContext";

interface CameraStatusModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  camera: any;
  onEditPosition?: () => void;
  onUpdate?: () => void;
}

const CameraStatusModal = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  camera,
  onEditPosition,
  onUpdate,
}: CameraStatusModalProps) => {
  const {
    updateCameraStatus,
    updateCameraRotation,
    updateCameraField,
    updateCameraInstallationStatus,
  } = useFloorPlan();

  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const modalOpen = isOpen ?? open ?? false;

  if (!modalOpen || !camera) return null;

  const closeModal = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const photos = [
    { url: camera.photo1, field: "photo1" },
    { url: camera.photo2, field: "photo2" },
    { url: camera.photo3, field: "photo3" },
    { url: camera.photo4, field: "photo4" },
  ].filter((item) => item.url);

  const wiringProgress = Number(camera.wiringUTPProgress || 0);
  const wallProgress = Number(camera.wallMountingProgress || 0);
  const domeProgress = Number(camera.domeCameraProgress || 0);

  const progress = Math.round(
    (wiringProgress + wallProgress + domeProgress) / 3
  );

  const refreshAfterChange = async () => {
    if (onUpdate) await onUpdate();
    window.location.reload();
  };

 const updateStep = async (
  field: string,
  value: boolean
) => {
  updateCameraField(camera.id, field, value);

  const next = {
    wiringUTP:
      field === "wiringUTP"
        ? value
        : camera.wiringUTP,

    wallMountingInstalled:
      field === "wallMountingInstalled"
        ? value
        : camera.wallMountingInstalled,

    domeCameraInstalled:
      field === "domeCameraInstalled"
        ? value
        : camera.domeCameraInstalled,
  };

  // sync progress auto
  if (field === "wiringUTP") {
    updateCameraField(
      camera.id,
      "wiringUTPProgress",
      value ? 100 : 0
    );
  }

  if (field === "wallMountingInstalled") {
    updateCameraField(
      camera.id,
      "wallMountingProgress",
      value ? 100 : 0
    );
  }

  if (field === "domeCameraInstalled") {
    updateCameraField(
      camera.id,
      "domeCameraProgress",
      value ? 100 : 0
    );
  }

  const nextProgress = {
    wiring:
      field === "wiringUTP"
        ? value
          ? 100
          : 0
        : Number(camera.wiringUTPProgress || 0),

    wall:
      field === "wallMountingInstalled"
        ? value
          ? 100
          : 0
        : Number(camera.wallMountingProgress || 0),

    dome:
      field === "domeCameraInstalled"
        ? value
          ? 100
          : 0
        : Number(camera.domeCameraProgress || 0),
  };

  const totalProgress = Math.round(
    (
      nextProgress.wiring +
      nextProgress.wall +
      nextProgress.dome
    ) / 3
  );

  if (totalProgress <= 0) {
    updateCameraInstallationStatus(
      camera.id,
      "not_started"
    );
  } else if (totalProgress >= 100) {
    updateCameraInstallationStatus(
      camera.id,
      "completed"
    );
  } else {
    updateCameraInstallationStatus(
      camera.id,
      "in_progress"
    );
  }
};

const updateStepProgress = async (
  field: string,
  value: number
) => {
  const safeValue = Math.min(
    100,
    Math.max(0, Number(value || 0))
  );

  updateCameraField(camera.id, field, safeValue);

  // auto sync checkbox
  if (field === "wiringUTPProgress") {
    updateCameraField(
      camera.id,
      "wiringUTP",
      safeValue >= 100
    );
  }

  if (field === "wallMountingProgress") {
    updateCameraField(
      camera.id,
      "wallMountingInstalled",
      safeValue >= 100
    );
  }

  if (field === "domeCameraProgress") {
    updateCameraField(
      camera.id,
      "domeCameraInstalled",
      safeValue >= 100
    );
  }

  const nextProgress = {
    wiring:
      field === "wiringUTPProgress"
        ? safeValue
        : Number(camera.wiringUTPProgress || 0),

    wall:
      field === "wallMountingProgress"
        ? safeValue
        : Number(camera.wallMountingProgress || 0),

    dome:
      field === "domeCameraProgress"
        ? safeValue
        : Number(camera.domeCameraProgress || 0),
  };

  const totalProgress = Math.round(
    (
      nextProgress.wiring +
      nextProgress.wall +
      nextProgress.dome
    ) / 3
  );

  // STATUS LOGIC ใหม่
  if (totalProgress <= 0) {
    updateCameraInstallationStatus(
      camera.id,
      "not_started"
    );
  } else if (totalProgress >= 100) {
    updateCameraInstallationStatus(
      camera.id,
      "completed"
    );
  } else {
    updateCameraInstallationStatus(
      camera.id,
      "in_progress"
    );
  }
};

  updateCameraField(camera.id, field, safeValue);

  const nextProgress = {
    wiringUTPProgress:
      field === "wiringUTPProgress"
        ? safeValue
        : Number(camera.wiringUTPProgress || 0),

    wallMountingProgress:
      field === "wallMountingProgress"
        ? safeValue
        : Number(camera.wallMountingProgress || 0),

    domeCameraProgress:
      field === "domeCameraProgress"
        ? safeValue
        : Number(camera.domeCameraProgress || 0),
  };

  const totalProgress = Math.round(
    (
      nextProgress.wiringUTPProgress +
      nextProgress.wallMountingProgress +
      nextProgress.domeCameraProgress
    ) / 3
  );

  if (totalProgress <= 0) {
    updateCameraInstallationStatus(
      camera.id,
      "not_started"
    );
  } else if (totalProgress >= 100) {
    updateCameraInstallationStatus(
      camera.id,
      "completed"
    );
  } else {
    updateCameraInstallationStatus(
      camera.id,
      "in_progress"
    );
  }
};

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !camera?.id) return;

      if (photos.length >= 4) {
        alert("Upload ได้สูงสุด 4 รูป");
        return;
      }

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = camera.id + "-" + Date.now() + "." + fileExt;

      const { error: uploadError } = await supabase.storage
        .from("camera-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("camera-photos")
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;

      let updateField = "photo1";
      if (!camera.photo1) updateField = "photo1";
      else if (!camera.photo2) updateField = "photo2";
      else if (!camera.photo3) updateField = "photo3";
      else if (!camera.photo4) updateField = "photo4";

      const { error: updateError } = await supabase
        .from("cameras")
        .update({ [updateField]: photoUrl })
        .eq("id", camera.id);

      if (updateError) {
        alert(updateError.message);
        return;
      }

      await refreshAfterChange();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (fieldName: string) => {
    const ok = confirm("ต้องการลบรูปนี้ใช่หรือไม่?");
    if (!ok) return;

    const { error } = await supabase
      .from("cameras")
      .update({ [fieldName]: null })
      .eq("id", camera.id);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshAfterChange();
  };

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>{camera.name || "Camera"}</h2>

          <div style={styles.typeBox}>
            <b>Type:</b>{" "}
            {camera.type === "type2"
              ? "Replacement (Type 2)"
              : "New Installation (Type 1)"}
          </div>

          <div style={styles.statusBox}>
            Installation Status: {camera.installationStatus || "not_started"}
          </div>

          <div style={styles.sectionLabel}>Installation Steps</div>

          <StepCard
            checked={Boolean(camera.wiringUTP)}
            progress={wiringProgress}
            title="Wiring UTP"
            subTitle="Install UTP cable"
            onChange={(value) => updateStep("wiringUTP", value)}
            onProgressChange={(value) =>
              updateStepProgress("wiringUTPProgress", value)
            }
          />

          <StepCard
            checked={Boolean(camera.wallMountingInstalled)}
            progress={wallProgress}
            title="Install Wall Mounting"
            subTitle="Mount the bracket on wall"
            onChange={(value) => updateStep("wallMountingInstalled", value)}
            onProgressChange={(value) =>
              updateStepProgress("wallMountingProgress", value)
            }
          />

          <StepCard
            checked={Boolean(camera.domeCameraInstalled)}
            progress={domeProgress}
            title="Install Dome Camera"
            subTitle="Install the dome camera unit"
            onChange={(value) => updateStep("domeCameraInstalled", value)}
            onProgressChange={(value) =>
              updateStepProgress("domeCameraProgress", value)
            }
          />

          <div style={styles.progressBox}>
            <div style={styles.progressHeader}>
              <b>Progress การติดตั้งรวม</b>
              <span style={styles.badge}>
                {camera.installationStatus === "completed"
                  ? "Completed"
                  : camera.installationStatus === "in_progress"
                  ? "In Progress"
                  : "Not Started"}
              </span>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: String(progress) + "%",
                }}
              />
            </div>

            <div style={styles.progressText}>{progress}%</div>

            <div style={styles.averageText}>
              คำนวณอัตโนมัติจากค่าเฉลี่ย step progress
            </div>

            <div style={styles.progressDetail}>
              <ProgressRow label="Wiring UTP" value={wiringProgress} />
              <ProgressRow label="Wall Mounting" value={wallProgress} />
              <ProgressRow label="Dome Camera" value={domeProgress} />
            </div>
          </div>

          <div style={styles.twoCol}>
            <div style={styles.currentStatusBox}>
              <div style={styles.currentStatusText}>
                Current Status: {camera.status || "offline"}
              </div>

              <div style={styles.buttonRow}>
                <button
                  style={styles.whiteButton}
                  onClick={() => updateCameraStatus(camera.id, "online")}
                >
                  Mark as Online
                </button>

                <button
                  style={styles.blueButton}
                  onClick={() => updateCameraStatus(camera.id, "idle")}
                >
                  Mark as Idle
                </button>
              </div>
            </div>
          </div>

          <div style={styles.rotationBox}>
            <div style={styles.rotationTitle}>
              Camera Direction (Rotation)
            </div>

            <input
              type="range"
              min="0"
              max="360"
              value={camera.rotation || 0}
              onChange={(e) =>
                updateCameraRotation(camera.id, Number(e.target.value))
              }
              style={{ width: "100%" }}
            />

            <div style={styles.rotationValue}>{camera.rotation || 0}°</div>

            <div style={styles.rotationHint}>
              0° = Right, 90° = Down, 180° = Left, 270° = Up
            </div>
          </div>

          <div style={styles.photoSection}>
            <div style={styles.photoHeader}>
              <b>▧ รูปหน้างาน ({photos.length}/4)</b>

              {photos.length < 4 && (
                <label style={styles.uploadButton}>
                  {uploading ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            {photos.length > 0 ? (
              <div style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div key={index} style={styles.photoWrap}>
                    <button
                      onClick={() => handleDeletePhoto(photo.field)}
                      style={styles.deleteButton}
                    >
                      ×
                    </button>

                    <img
                      src={photo.url}
                      alt={"photo-" + index}
                      onClick={() => setPreviewImage(photo.url)}
                      style={styles.photo}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyPhoto}>ยังไม่มีรูปหน้างาน</div>
            )}
          </div>

          <div style={styles.footer}>
            <button style={styles.footerButton} onClick={onEditPosition}>
              Edit Position
            </button>

            <button style={styles.footerButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          style={styles.previewOverlay}
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="preview" style={styles.previewImage} />
        </div>
      )}
    </>
  );
};

const StepCard = ({
  checked,
  progress,
  title,
  subTitle,
  onChange,
  onProgressChange,
}: {
  checked: boolean;
  progress: number;
  title: string;
  subTitle: string;
  onChange: (value: boolean) => void;
  onProgressChange: (value: number) => void;
}) => {
  return (
    <div style={styles.stepCard}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={styles.checkbox}
      />

      <div style={{ flex: 1 }}>
        <div style={styles.stepTitle}>{title}</div>
        <div style={styles.stepSubTitle}>{subTitle}</div>
      </div>

      <div style={styles.checkMark}>{checked ? "✓" : ""}</div>

      <div style={styles.progressInputWrap}>
        <input
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) =>
            onProgressChange(
              Math.min(100, Math.max(0, Number(e.target.value)))
            )
          }
          style={styles.progressInput}
        />

        <span style={styles.percentText}>%</span>
      </div>
    </div>
  );
};

const ProgressRow = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => {
  return (
    <div style={styles.progressRow}>
      <span>{label}</span>

      <div style={styles.smallProgressTrack}>
        <div
          style={{
            ...styles.smallProgressFill,
            width: String(value) + "%",
          }}
        />
      </div>

      <b>{value}%</b>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
  },
  modal: {
    width: "760px",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#030303",
    color: "#fff",
    borderRadius: "16px",
    border: "1px solid #2563eb",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "12px",
  },
  typeBox: {
    background: "#fff",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: "12px",
    width: "240px",
    marginBottom: "16px",
  },
  statusBox: {
    background: "#fff7bf",
    color: "#8a4b00",
    padding: "14px 16px",
    borderRadius: "12px",
    fontWeight: 700,
    marginBottom: "18px",
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
  },
  stepCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "12px",
    background: "#020202",
  },
  checkbox: {
    width: "18px",
    height: "18px",
  },
  stepTitle: {
    fontWeight: 700,
    fontSize: "17px",
  },
  stepSubTitle: {
    fontSize: "13px",
    color: "#64748b",
  },
  checkMark: {
    color: "#00ff66",
    fontSize: "22px",
    width: "26px",
    textAlign: "center",
  },
  progressInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  progressInput: {
    width: "78px",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "18px",
  },
  percentText: {
    color: "#94a3b8",
    fontWeight: 700,
    fontSize: "18px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
    marginTop: "16px",
  },
  progressBox: {
    background: "#ecfdf3",
    color: "#111",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "22px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#00843d",
    fontSize: "22px",
  },
  badge: {
    background: "#fff1a8",
    color: "#b45309",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "18px",
    fontWeight: 700,
  },
  progressTrack: {
    height: "20px",
    background: "#e5e7eb",
    borderRadius: "999px",
    marginTop: "18px",
  },
  progressFill: {
    height: "20px",
    background: "#d68a00",
    borderRadius: "999px",
  },
  progressText: {
    textAlign: "center",
    fontSize: "48px",
    fontWeight: 800,
    color: "#d68a00",
    marginTop: "20px",
  },
  averageText: {
    color: "#64748b",
    textAlign: "center",
    fontSize: "18px",
    marginBottom: "16px",
  },
  progressDetail: {
    borderTop: "1px solid #bbf7d0",
    paddingTop: "14px",
  },
  progressRow: {
    display: "grid",
    gridTemplateColumns: "1fr 140px 54px",
    alignItems: "center",
    gap: "12px",
    color: "#64748b",
    fontSize: "18px",
    marginBottom: "8px",
  },
  smallProgressTrack: {
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "999px",
  },
  smallProgressFill: {
    height: "10px",
    background: "#d68a00",
    borderRadius: "999px",
  },
  currentStatusBox: {
    background: "#eff6ff",
    color: "#111",
    borderRadius: "12px",
    padding: "14px",
  },
  currentStatusText: {
    color: "#64748b",
    marginBottom: "14px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
  },
  whiteButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#94a3b8",
    fontWeight: 700,
  },
  blueButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
  },
  rotationBox: {
    background: "#fffbea",
    color: "#111",
    borderRadius: "12px",
    padding: "14px",
    marginTop: "16px",
  },
  rotationTitle: {
    color: "#64748b",
    fontWeight: 700,
    marginBottom: "10px",
  },
  rotationValue: {
    fontWeight: 800,
    marginTop: "8px",
  },
  rotationHint: {
    fontSize: "11px",
    color: "#64748b",
  },
  photoSection: {
    borderTop: "1px solid #1f2937",
    marginTop: "22px",
    paddingTop: "14px",
  },
  photoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadButton: {
    background: "#2563eb",
    color: "#fff",
    padding: "9px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "16px",
  },
  photoWrap: {
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "12px",
    cursor: "pointer",
    border: "1px solid #333",
  },
  deleteButton: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    zIndex: 10,
  },
  emptyPhoto: {
    color: "#64748b",
    textAlign: "center",
    padding: "32px",
  },
  footer: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  footerButton: {
    flex: 1,
    background: "#111",
    color: "#fff",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "12px",
    cursor: "pointer",
  },
  previewOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.95)",
    zIndex: 10000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  previewImage: {
    maxWidth: "95vw",
    maxHeight: "95vh",
    objectFit: "contain",
  },
};

export default CameraStatusModal;
