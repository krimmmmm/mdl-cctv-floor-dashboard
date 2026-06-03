import React, { useMemo, useState } from "react";
import { Cabinet } from "@/lib/floorPlanData";
import { useFloorPlan } from "@/contexts/FloorPlanContext";
import { useAuth } from "@/contexts/AuthContext";

interface CabinetStatusModalProps {
  cabinet: Cabinet;
  isOpen: boolean;
  onClose: () => void;
  onEditPosition?: () => void;
}

const CabinetStatusModal: React.FC<CabinetStatusModalProps> = ({
  cabinet,
  isOpen,
  onClose,
  onEditPosition,
}) => {
  const {
    updateCabinetStatus,
    updateCabinetField,
    updateCabinetInstallationStatus,
    updateCabinetPhotos,
    deleteCabinet,
  } = useFloorPlan();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
    userName.includes("admin");

  const isStaffUser =
    userRole === "staff" ||
    userName.includes("staff");

  // Admin + Staff can edit progress/photos/status/urgent.
  const canEditProgress = userRole !== "customer";

  // Move/Delete equipment remains Admin only.
  const canManageLayout = userRole === "admin";

  const canToggleUrgent = userRole !== "customer";

if (!isOpen || !cabinet) return null;

  const steps = [
    {
      key: "installCabinet",
      title: "INSTALL CABINET",
      desc: "Cabinet installed",
      progressKey: "installCabinetProgress",
      progress: Number((cabinet as any).installCabinetProgress || 0),
      checked: Boolean((cabinet as any).installCabinet),
    },
    {
      key: "acPower",
      title: "AC POWER",
      desc: "Power supply installed",
      progressKey: "acPowerProgress",
      progress: Number((cabinet as any).acPowerProgress || 0),
      checked: Boolean((cabinet as any).acPower),
    },
    {
      key: "utp",
      title: "UTP",
      desc: "Network cable installed",
      progressKey: "utpProgress",
      progress: Number((cabinet as any).utpProgress || 0),
      checked: Boolean((cabinet as any).utp),
    },
    {
      key: "poeSwitch",
      title: "POE SWITCH",
      desc: "Switch installed",
      progressKey: "poeSwitchProgress",
      progress: Number((cabinet as any).poeSwitchProgress || 0),
      checked: Boolean((cabinet as any).poeSwitch),
    },
    {
      key: "fiberOptic",
      title: "FIBER OPTIC",
      desc: "Fiber optic connected",
      progressKey: "fiberOpticProgress",
      progress: Number((cabinet as any).fiberOpticProgress || 0),
      checked: Boolean((cabinet as any).fiberOptic),
    },
    {
      key: "ready",
      title: "READY",
      desc: "Cabinet ready for use",
      progressKey: "readyProgress",
      progress: Number((cabinet as any).readyProgress || 0),
      checked: Boolean((cabinet as any).ready),
    },
  ];

  const totalProgress = useMemo(() => {
    return Math.round(
      steps.reduce((sum, item) => sum + item.progress, 0) / steps.length
    );
  }, [cabinet]);

  const computedStatus =
    totalProgress <= 0
      ? "not_started"
      : totalProgress >= 100
      ? "completed"
      : "in_progress";

  const statusText =
    computedStatus === "completed"
      ? "Completed"
      : computedStatus === "in_progress"
      ? "In Progress"
      : "Not Started";

  const syncStatus = (progressValue: number) => {
    const nextStatus =
      progressValue <= 0
        ? "not_started"
        : progressValue >= 100
        ? "completed"
        : "in_progress";

    updateCabinetInstallationStatus(cabinet.id, nextStatus);
  };

  const updateStepProgress = (
    progressKey: string,
    stepKey: string,
    value: number
  ) => {
    if (!canEditProgress) return;
    const safeValue = Math.min(100, Math.max(0, Number(value || 0)));

    updateCabinetField(cabinet.id, progressKey, safeValue);
    updateCabinetField(cabinet.id, stepKey, safeValue > 0);

    const nextSteps = steps.map((step) =>
      step.progressKey === progressKey ? { ...step, progress: safeValue } : step
    );

    const nextTotal = Math.round(
      nextSteps.reduce((sum, item) => sum + item.progress, 0) / nextSteps.length
    );

    syncStatus(nextTotal);
  };

  const updateStepCheck = (
    stepKey: string,
    progressKey: string,
    checked: boolean
  ) => {
    if (!canEditProgress) return;
    updateCabinetField(cabinet.id, stepKey, checked);
    updateCabinetField(cabinet.id, progressKey, checked ? 100 : 0);

    const nextSteps = steps.map((step) =>
      step.key === stepKey ? { ...step, progress: checked ? 100 : 0 } : step
    );

    const nextTotal = Math.round(
      nextSteps.reduce((sum, item) => sum + item.progress, 0) / nextSteps.length
    );

    syncStatus(nextTotal);
  };

  const photos = [
    (cabinet as any).photo1,
    (cabinet as any).photo2,
    (cabinet as any).photo3,
    (cabinet as any).photo4,
  ].filter(Boolean);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditProgress) return;
    const files = e.target.files;
    if (!files) return;

    const currentPhotos = [
      (cabinet as any).photo1 || "",
      (cabinet as any).photo2 || "",
      (cabinet as any).photo3 || "",
      (cabinet as any).photo4 || "",
    ].filter(Boolean);

    const remaining = 4 - currentPhotos.length;
    const selectedFiles = Array.from(files).slice(0, remaining);

    const newPhotos: string[] = [];

    for (const file of selectedFiles) {
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          newPhotos.push(reader.result as string);
          resolve();
        };

        reader.readAsDataURL(file);
      });
    }

    updateCabinetPhotos(cabinet.id, [...currentPhotos, ...newPhotos]);
  };

  const deletePhoto = (index: number) => {
    if (!canEditProgress) return;
    const nextPhotos = [
      (cabinet as any).photo1 || "",
      (cabinet as any).photo2 || "",
      (cabinet as any).photo3 || "",
      (cabinet as any).photo4 || "",
    ];

    nextPhotos[index] = "";
    updateCabinetPhotos(cabinet.id, nextPhotos);
  };

  const handleDeleteCabinet = async () => {
    if (!canManageLayout) return;

    const ok = confirm(
      `ยืนยันการลบ ${cabinet.name || "Cabinet"} ใช่หรือไม่?`
    );

    if (!ok) return;

    const success = await deleteCabinet(cabinet.id);

    if (success !== false) {
      onClose();
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h2 style={styles.title}>{cabinet.name}</h2>

          <div style={styles.typeBox}>
            <b>Type:</b> CCTV OUTDOOR STEEL CABINET
          </div>

          <div style={styles.statusBox}>
            Installation Status: {statusText}
          </div>

          <label style={styles.urgentBox}>
            <input
              type="checkbox"
              checked={Boolean((cabinet as any).isUrgent)}
              disabled={!canToggleUrgent}
              onChange={(e) =>
                canToggleUrgent && updateCabinetField(cabinet.id, "isUrgent", e.target.checked)
              }
            />
            🚨 งานเร่งด่วน (Urgent Work)
          </label>

          <div style={styles.sectionLabel}>Installation Steps</div>

          {steps.map((step) => (
            <div key={step.key} style={styles.stepCard}>
              <input
                type="checkbox"
                checked={step.checked}
                disabled={!canEditProgress}
                onChange={(e) =>
                  updateStepCheck(step.key, step.progressKey, e.target.checked)
                }
                style={styles.checkbox}
              />

              <div style={{ flex: 1 }}>
                <div style={styles.stepTitle}>{step.title}</div>
                <div style={styles.stepSub}>{step.desc}</div>
              </div>

              <div style={styles.checkMark}>
                {step.progress >= 100 ? "✓" : step.progress > 0 ? "◔" : ""}
              </div>

              <input
                type="number"
                min={0}
                max={100}
                value={step.progress}
                disabled={!canEditProgress}
                onChange={(e) =>
                  updateStepProgress(
                    step.progressKey,
                    step.key,
                    Number(e.target.value)
                  )
                }
                style={styles.progressInput}
              />

              <span style={styles.percent}>%</span>
            </div>
          ))}

          <div style={styles.progressBox}>
            <div style={styles.progressHeader}>
              <b>Progress การติดตั้งรวม</b>
              <span style={styles.badge}>{statusText}</span>
            </div>

            <div style={styles.track}>
              <div
                style={{
                  ...styles.fill,
                  width: `${totalProgress}%`,
                }}
              />
            </div>

            <div style={styles.progressText}>{totalProgress}%</div>

            <div style={styles.averageText}>
              คำนวณอัตโนมัติจากค่าเฉลี่ย step progress
            </div>
          </div>

          <div style={styles.photoSection}>
            <div style={styles.photoHeader}>
              <b>▧ รูปหน้างาน Cabinet ({photos.length}/4)</b>

              {canEditProgress && photos.length < 4 && (
                <label style={styles.uploadButton}>
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onClick={(e) => e.stopPropagation()}
                    multiple
                    onChange={handlePhotoUpload}
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
                      style={styles.deleteButton}
                      disabled={!canEditProgress}
                      onClick={() => canEditProgress && deletePhoto(index)}
                    >
                      ×
                    </button>

                    <img
                      src={photo}
                      style={styles.photo}
                      onClick={() => setPreviewImage(photo)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyPhoto}>ยังไม่มีรูปหน้างาน</div>
            )}
          </div>

          <div style={styles.statusPanel}>
            <b>Current Status:</b> {cabinet.status || "offline"}

            <div style={styles.buttonRow}>
              <button
                style={styles.onlineButton}
                disabled={!canEditProgress}
                onClick={() => canEditProgress && updateCabinetStatus(cabinet.id, "online")}
              >
                Mark as Online
              </button>

              <button
                style={styles.idleButton}
                disabled={!canEditProgress}
                onClick={() => canEditProgress && updateCabinetStatus(cabinet.id, "idle")}
              >
                Mark as Idle
              </button>
            </div>
          </div>

          <div style={styles.footer}>
            <button style={styles.footerButton} disabled={!canManageLayout}
              onClick={canManageLayout ? onEditPosition : undefined}>
              {canManageLayout ? "Edit Position" : "Position Locked"}
            </button>

            {canManageLayout && (
              <button style={styles.deleteEquipmentButton} onClick={handleDeleteCabinet}>
                Delete Cabinet
              </button>
            )}

            <button style={styles.footerButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} style={styles.previewImage} />
        </div>
      )}
    </>
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
    paddingTop: 35,
  },
  modal: {
    width: 760,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#030303",
    color: "#fff",
    borderRadius: 16,
    border: "1px solid #2563eb",
    padding: 24,
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 18,
  },
  typeBox: {
    background: "#fff",
    color: "#111",
    padding: "12px 16px",
    borderRadius: 12,
    width: 330,
    marginBottom: 16,
  },
  statusBox: {
    background: "#fff7bf",
    color: "#8a4b00",
    padding: "14px 16px",
    borderRadius: 12,
    fontWeight: 800,
    marginBottom: 16,
  },
  urgentBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#ffe4f4",
    color: "#c2185b",
    border: "2px solid #ff4db8",
    borderRadius: 12,
    padding: 14,
    fontWeight: 800,
    marginBottom: 18,
  },
  sectionLabel: {
    color: "#94a3b8",
    marginBottom: 8,
  },
  stepCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    background: "#020202",
  },
  checkbox: {
    width: 18,
    height: 18,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 800,
  },
  stepSub: {
    fontSize: 13,
    color: "#64748b",
  },
  checkMark: {
    color: "#00ff66",
    fontSize: 22,
    width: 26,
    textAlign: "center",
  },
  progressInput: {
    width: 78,
    padding: 8,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    textAlign: "center",
    fontWeight: 800,
    fontSize: 18,
  },
  percent: {
    color: "#94a3b8",
    fontWeight: 800,
  },
  progressBox: {
    background: "#ecfdf3",
    color: "#111",
    borderRadius: 12,
    padding: 20,
    marginTop: 22,
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#00843d",
    fontSize: 22,
  },
  badge: {
    background: "#fff1a8",
    color: "#b45309",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 800,
  },
  track: {
    height: 20,
    background: "#e5e7eb",
    borderRadius: 999,
    marginTop: 18,
  },
  fill: {
    height: 20,
    background: "#d68a00",
    borderRadius: 999,
  },
  progressText: {
    textAlign: "center",
    fontSize: 48,
    fontWeight: 900,
    color: "#d68a00",
    marginTop: 20,
  },
  averageText: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 16,
  },
  photoSection: {
    borderTop: "1px solid #1f2937",
    marginTop: 22,
    paddingTop: 14,
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
    borderRadius: 8,
    cursor: "default",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },
  photoWrap: {
    position: "relative",
  },
  photo: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 12,
    cursor: "default",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 900,
    cursor: "default",
  },
  emptyPhoto: {
    color: "#64748b",
    textAlign: "center",
    padding: 32,
  },
  statusPanel: {
    background: "#eff6ff",
    color: "#111",
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
  onlineButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 800,
  },
  idleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    fontWeight: 800,
  },
  footer: {
    display: "flex",
    gap: 12,
    marginTop: 20,
  },
  footerButton: {
    flex: 1,
    background: "#111",
    color: "#fff",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: 12,
    cursor: "default",
  },
  previewOverlay: {
    position: "fixed",
    inset: 0,
    background: "#000",
    zIndex: 999999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "default",
  },
  previewImage: {
    maxWidth: "98vw",
    maxHeight: "98vh",
    objectFit: "contain",
    borderRadius: "12px",
    boxShadow: "0 0 42px rgba(0,0,0,0.6)",
  },
};

export default CabinetStatusModal;
