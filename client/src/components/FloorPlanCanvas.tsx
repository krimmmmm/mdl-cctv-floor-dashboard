import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Rack, Cabinet, FiberRoute } from '@/lib/floorPlanData';
import CameraMarker from './equipment/CameraMarker';
import RackMarker from './equipment/RackMarker';
import CabinetMarker from './equipment/CabinetMarker';
import FiberRouteMarker from './equipment/FiberRouteMarker';
import CameraStatusModal from './modals/CameraStatusModal';
import RackStatusModal from './modals/RackStatusModal';
import CabinetStatusModal from './modals/CabinetStatusModal';
import FiberRouteStatusModal from './modals/FiberRouteStatusModal';
import PositionConfirmationModal from './modals/PositionConfirmationModal';

type SelectedItem =
  | { type: 'camera'; id: string }
  | { type: 'rack'; id: string }
  | { type: 'cabinet'; id: string }
  | null;

type CanvasMode = 'normal' | 'draw_fiber';

type Props = {
  readOnly?: boolean;
  canManageLayout?: boolean;
  canManageFiber?: boolean;
  canEditProgress?: boolean;
};

const FloorPlanCanvas: React.FC<Props> = ({
  readOnly = false,
  canManageLayout = false,
  canManageFiber = false,
  canEditProgress = false,
}) => {
  const [, setLocation] = useLocation();
  const floorPlan = useFloorPlan();
  const { user } = useAuth();

  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mdl_user") || "{}")
      : {};

  const userRole = String(user?.role || savedUser?.role || "")
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

  // Admin + staffonly can draw/edit Fiber routes.
  const effectiveCanManageFiber =
    canManageFiber || isAdminUser || isStaffOnlyUser;

  // Layout / move / delete can still follow Admin-equivalent logic.
  const effectiveCanManageLayout =
    canManageLayout || isAdminUser;

  // Equipment Control add/remove count must be real Admin only.
  // Home.tsx sends canManageLayout=true only for role === "admin".
  const effectiveCanManageEquipmentControl =
    canManageLayout;

  // Progress / Status / Photo / Fiber work can be edited by Admin + staffonly.
  const effectiveCanEditProgress =
    canEditProgress || isAdminUser || isStaffOnlyUser;

  const {
    cameras,
    racks,
    cabinets,
    fiberRoutes,
    updateCameraPosition,
    updateRackPosition,
    updateCabinetPosition,
    addActivityLog,
    addFiberRoute,
    updateFiberRoute,
    deleteFiberRoute,
  } = floorPlan;

  const setCameraCountByType = floorPlan.setCameraCountByType;
  const setRackCountByType = floorPlan.setRackCountByType;
  const setRackCount = floorPlan.setRackCount;
  const setCabinetCount = floorPlan.setCabinetCount;

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [cameraType1Count, setCameraType1Count] = useState(0);
  const [cameraType2Count, setCameraType2Count] = useState(0);
  const [rackType1Count, setRackType1Count] = useState(0);
  const [rackType2Count, setRackType2Count] = useState(0);
  const [cabinetCountInput, setCabinetCountInput] = useState(0);

  const [floorPlanScaleInput, setFloorPlanScaleInput] = useState(1);
  const [floorPlanOffsetXInput, setFloorPlanOffsetXInput] = useState(0);
  const [floorPlanOffsetYInput, setFloorPlanOffsetYInput] = useState(0);
  const [isSavingAlignment, setIsSavingAlignment] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMovingEquipment, setIsMovingEquipment] = useState(false);
  const [draggedItem, setDraggedItem] = useState<SelectedItem>(null);
  const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({
  x: 0,
  y: 0,
});
  const [showPositionModal, setShowPositionModal] = useState(false);

  const svgRef = React.useRef<SVGSVGElement>(null);

  const resetView = useCallback(() => {
    setZoom(0.9);
    setPan({ x: 40, y: 20 });
    setCanvasMode('normal');
    setDrawingPoints([]);
    setCursorPos(null);
    setSelectedFiberId(null);
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    const handleReset = () => resetView();

    window.addEventListener('resetFloorPlanView', handleReset);

    return () => {
      window.removeEventListener('resetFloorPlanView', handleReset);
    };
  }, [resetView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focus =
      params.get('focus') ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("mdl_focus_equipment")
        : null);
    const resetViewParam = params.get('resetView');

    if (resetViewParam) {
      resetView();
      setLocation('/floorplan', { replace: true });
      return;
    }

    if (!focus) return;

    const [type, id] = focus.split(':');
    if (!type || !id) return;

    if (type === 'fiber') {
      const fiber = (fiberRoutes || []).find((route) => route.id === id);
      const firstPoint = fiber?.points?.[0];

      if (!fiber || !firstPoint) return;

      setSelectedFiberId(id);
      setSelectedItem(null);

      const focusZoom = 2.2;

      const svgRect = svgRef.current?.getBoundingClientRect();

      const centerX =
        svgRect?.width
          ? svgRect.width / 2
          : 700;

      const centerY =
        svgRect?.height
          ? svgRect.height / 2
          : 350;

      const realX =
        firstPoint.x * (floorPlanScaleInput || 1) +
        (floorPlanOffsetXInput || 0);

      const realY =
        firstPoint.y * (floorPlanScaleInput || 1) +
        (floorPlanOffsetYInput || 0);

      setZoom(focusZoom);

      setPan({
        x: centerX - realX * focusZoom,
        y: centerY - realY * focusZoom,
      });

      sessionStorage.removeItem("mdl_focus_equipment");
    }

    let target: any = null;

    if (type === 'camera') {
      target = (cameras || []).find((c) => c.id === id);

      if (target) {
        setSelectedItem({
          type: 'camera',
          id,
        });

        setSelectedFiberId(null);
      }
    }

    if (type === 'rack') {
      target = (racks || []).find((r) => r.id === id);

      if (target) {
        setSelectedItem({
          type: 'rack',
          id,
        });

        setSelectedFiberId(null);
      }
    }

    if (type === 'cabinet') {
      target = (cabinets || []).find((c) => c.id === id);

      if (target) {
        setSelectedItem({
          type: 'cabinet',
          id,
        });

        setSelectedFiberId(null);
      }
    }

    if (!target) return;

    const focusZoom = 2.2;

    const svgRect = svgRef.current?.getBoundingClientRect();

    const centerX =
      svgRect?.width
        ? svgRect.width / 2
        : 700;

    const centerY =
      svgRect?.height
        ? svgRect.height / 2
        : 350;

    const realX =
      target.x * (floorPlanScaleInput || 1) +
      (floorPlanOffsetXInput || 0);

    const realY =
      target.y * (floorPlanScaleInput || 1) +
      (floorPlanOffsetYInput || 0);

    setZoom(focusZoom);

    setPan({
      x: centerX - realX * focusZoom,
      y: centerY - realY * focusZoom,
    });

    sessionStorage.removeItem("mdl_focus_equipment");
  }, [
    cameras,
    racks,
    cabinets,
    fiberRoutes,
    floorPlanScaleInput,
    floorPlanOffsetXInput,
    floorPlanOffsetYInput,
    setLocation,
    resetView,
  ]);

  const [canvasMode, setCanvasMode] = useState<CanvasMode>('normal');
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedFiberId, setSelectedFiberId] = useState<string | null>(null);

  const screenToSvg = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) {
        return { x: 0, y: 0 };
      }

      const rect = svgRef.current.getBoundingClientRect();

      /*
        Important:
        The SVG itself is transformed by CSS:
          translate(pan.x, pan.y) scale(zoom)

        getBoundingClientRect() already includes that CSS transform.
        So do NOT subtract pan or divide pan again here.
        Map the click position directly from the transformed screen rectangle
        back into the SVG viewBox coordinate system.
      */
      const svgX =
        ((clientX - rect.left) / rect.width) * 1400;

      const svgY =
        ((clientY - rect.top) / rect.height) * 900;

      return {
        x: Math.max(0, Math.min(1400, svgX)),
        y: Math.max(0, Math.min(900, svgY)),
      };
    },
    []
  );

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta));
    setZoom(newZoom);
  };

  const placeMovingEquipment = () => {
    if (!isMovingEquipment || !draggedItem) return false;

    setIsMovingEquipment(false);
    setShowPositionModal(true);

    return true;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!effectiveCanManageLayout && !(effectiveCanManageFiber && canvasMode === 'draw_fiber')) {
      if (e.button === 0 || e.button === 2) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }

      return;
    }

    if (canvasMode === 'draw_fiber') {
      if (e.detail === 2) return;

      if (e.button === 0) {
        e.preventDefault();
        const pos = screenToSvg(e.clientX, e.clientY);
        setDrawingPoints((prev) => [...prev, pos]);
      }

      if (e.button === 2) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }

      return;
    }

    if (e.button === 0 && placeMovingEquipment()) {
      e.preventDefault();
      return;
    }

    if (e.button === 0 && !isMovingEquipment) {
      const target = e.target as SVGElement;
      const tagName = target.tagName.toLowerCase();

      if (tagName === 'svg' || tagName === 'rect' || tagName === 'image' || tagName === 'text') {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        setSelectedFiberId(null);
      }
    }

    if (e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && (e.buttons === 1 || e.buttons === 2)) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }

    if (isMovingEquipment && draggedItem && svgRef.current) {
  const pos = screenToSvg(e.clientX, e.clientY);
  setTempPosition({
  x: pos.x - dragOffset.x,
  y: pos.y - dragOffset.y,
});
}

    if (canvasMode === 'draw_fiber') {
      const pos = screenToSvg(e.clientX, e.clientY);
      setCursorPos(pos);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!effectiveCanManageFiber) return;
    if (canvasMode !== 'draw_fiber') return;
    e.preventDefault();
    if ((drawingPoints || []).length < 2) return;

    const routeId = `fiber_${Date.now()}`;
    const routeNum = (fiberRoutes || []).length + 1;
    const finalPoints = [...(drawingPoints || [])];

    const newRoute: FiberRoute = {
      id: routeId,
      name: `Fiber Route ${routeNum}`,
      points: finalPoints,
      status: 'idle',
      color: '#ff0000',
    } as FiberRoute;

    addFiberRoute(newRoute);

    setTimeout(() => {
      setDrawingPoints([]);
      setCursorPos(null);
      setCanvasMode('normal');
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const isTypingInField =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        Boolean(target?.isContentEditable);

      /*
        Important:
        When typing in Route Name / Equipment Name fields,
        Backspace and Delete must edit the text only.
        Do not let the global Floor Plan shortcut delete the selected Fiber Route.
      */
      if (isTypingInField) {
        return;
      }

      if (!effectiveCanManageFiber) {
        if (e.key === 'Escape') {
          setDrawingPoints([]);
          setCursorPos(null);
          setCanvasMode('normal');
          setSelectedFiberId(null);
        }

        return;
      }

      if (e.key === 'Escape') {
        if (canvasMode === 'draw_fiber') {
          setDrawingPoints([]);
          setCursorPos(null);
          setCanvasMode('normal');
        }
        if (selectedFiberId) setSelectedFiberId(null);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFiberId) {
          deleteFiberRoute(selectedFiberId);
          setSelectedFiberId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasMode, selectedFiberId, deleteFiberRoute, effectiveCanManageFiber]);

  useEffect(() => {
    setCameraType1Count((cameras || []).filter((c) => c.type === 'type1').length);
    setCameraType2Count((cameras || []).filter((c) => c.type === 'type2').length);
  }, [cameras]);

  useEffect(() => {
    setRackType1Count((racks || []).filter((r) => r.type === 'type1').length);
    setRackType2Count((racks || []).filter((r) => r.type === 'type2').length);
  }, [racks]);

  useEffect(() => {
    setCabinetCountInput((cabinets || []).length);
  }, [cabinets]);

  useEffect(() => {
    setFloorPlanScaleInput(Number(floorPlan.floorPlanScale || 1));
    setFloorPlanOffsetXInput(Number(floorPlan.floorPlanOffsetX || 0));
    setFloorPlanOffsetYInput(Number(floorPlan.floorPlanOffsetY || 0));
  }, [
    floorPlan.floorPlanScale,
    floorPlan.floorPlanOffsetX,
    floorPlan.floorPlanOffsetY,
  ]);

  const handleSaveFloorPlanAlignment = async () => {
    if (!effectiveCanManageEquipmentControl) return;
    if (typeof floorPlan.updateFloorPlanAlignment !== "function") {
      alert("ระบบ Save Floor Plan Alignment ยังไม่พร้อม");
      return;
    }

    setIsSavingAlignment(true);

    const success = await floorPlan.updateFloorPlanAlignment(
      floorPlanScaleInput,
      floorPlanOffsetXInput,
      floorPlanOffsetYInput
    );

    setIsSavingAlignment(false);

    if (success) {
      alert("Save Floor Plan Alignment สำเร็จ");
    }
  };

  const handleResetFloorPlanAlignment = async () => {
    if (!effectiveCanManageEquipmentControl) return;
    if (typeof floorPlan.resetFloorPlanAlignment !== "function") {
      alert("ระบบ Reset Floor Plan Alignment ยังไม่พร้อม");
      return;
    }

    setIsSavingAlignment(true);
    const success = await floorPlan.resetFloorPlanAlignment();
    setIsSavingAlignment(false);

    if (success) {
      setFloorPlanScaleInput(1);
      setFloorPlanOffsetXInput(0);
      setFloorPlanOffsetYInput(0);
      alert("Reset Floor Plan Alignment สำเร็จ");
    }
  };

  const adjustFloorPlanScale = (delta: number) => {
    const nextValue = Number((Number(floorPlanScaleInput || 1) + delta).toFixed(2));
    setFloorPlanScaleInput(Math.max(0.2, Math.min(3, nextValue)));
  };

  const adjustFloorPlanOffsetX = (delta: number) => {
    setFloorPlanOffsetXInput(Math.round(Number(floorPlanOffsetXInput || 0) + delta));
  };

  const adjustFloorPlanOffsetY = (delta: number) => {
    setFloorPlanOffsetYInput(Math.round(Number(floorPlanOffsetYInput || 0) + delta));
  };

  const handleCameraTypeCountChange = (cameraType: string, value: number) => {
    if (!effectiveCanManageEquipmentControl) return;
    const safeValue = Math.max(0, value);
    if (cameraType === 'type1') setCameraType1Count(safeValue);
    else setCameraType2Count(safeValue);
    if (typeof setCameraCountByType === 'function') setCameraCountByType(cameraType, safeValue);
  };

  const handleRackTypeCountChange = (rackType: string, value: number) => {
    if (!effectiveCanManageEquipmentControl) return;
    const safeValue = Math.max(0, value);
    if (rackType === 'type1') setRackType1Count(safeValue);
    else setRackType2Count(safeValue);

    if (typeof setRackCountByType === 'function') {
      setRackCountByType(rackType, safeValue);
      return;
    }

    if (typeof setRackCount === 'function') {
      const total = rackType === 'type1' ? safeValue + rackType2Count : rackType1Count + safeValue;
      setRackCount(total);
      return;
    }

    alert('ยังไม่ได้สร้างระบบ Rack Count ใน FloorPlanContext');
  };

  const handleCabinetCountChange = (value: number) => {
    if (!effectiveCanManageEquipmentControl) return;
    const safeValue = Math.max(0, value);
    setCabinetCountInput(safeValue);
    if (typeof setCabinetCount === 'function') setCabinetCount(safeValue);
    else alert('ยังไม่ได้สร้างระบบ Cabinet Count ใน FloorPlanContext');
  };

  const handleCameraClick = (camera: Camera) => {
    if (canvasMode === 'draw_fiber') return;
    setSelectedItem({ type: 'camera', id: camera.id });
    setSelectedFiberId(null);
  };

  const handleRackClick = (rack: Rack) => {
    if (canvasMode === 'draw_fiber') return;
    setSelectedItem({ type: 'rack', id: rack.id });
    setSelectedFiberId(null);
  };

  const handleCabinetClick = (cabinet: Cabinet) => {
    if (canvasMode === 'draw_fiber') return;
    setSelectedItem({ type: 'cabinet', id: cabinet.id });
    setSelectedFiberId(null);
  };

  const handleFiberClick = (routeId: string) => {
    if (!effectiveCanManageFiber) return;
    if (canvasMode === 'draw_fiber') return;
    setSelectedFiberId((prev) => (prev === routeId ? null : routeId));
    setSelectedItem(null);
  };

  const startMovingEquipment = (
  e?: React.MouseEvent
) => {
  if (!effectiveCanManageLayout) return;
  if (!selectedItem) return;

  setIsDragging(false);
  setIsMovingEquipment(true);
  setDraggedItem(selectedItem);

  let itemX = 0;
  let itemY = 0;

  if (selectedItem.type === 'camera') {
    const camera = (cameras || []).find(
      (c) => c.id === selectedItem.id
    );

    if (camera) {
      itemX = camera.x;
      itemY = camera.y;

      setTempPosition({
        x: camera.x,
        y: camera.y,
      });
    }
  }

  if (selectedItem.type === 'rack') {
    const rack = (racks || []).find(
      (r) => r.id === selectedItem.id
    );

    if (rack) {
      itemX = rack.x;
      itemY = rack.y;

      setTempPosition({
        x: rack.x,
        y: rack.y,
      });
    }
  }

  if (selectedItem.type === 'cabinet') {
    const cabinet = (cabinets || []).find(
      (c) => c.id === selectedItem.id
    );

    if (cabinet) {
      itemX = cabinet.x;
      itemY = cabinet.y;

      setTempPosition({
        x: cabinet.x,
        y: cabinet.y,
      });
    }
  }

  if (e) {
    const mousePos = screenToSvg(
      e.clientX,
      e.clientY
    );

    setDragOffset({
      x: mousePos.x - itemX,
      y: mousePos.y - itemY,
    });
  } else {
    setDragOffset({
      x: 0,
      y: 0,
    });
  }
};

  const confirmPosition = () => {
    if (!effectiveCanManageLayout) return;
    if (!draggedItem) return;

    const newX = Math.round(tempPosition.x);
    const newY = Math.round(tempPosition.y);

    if (draggedItem.type === 'camera') {
      const camera = (cameras || []).find((c) => c.id === draggedItem.id);
      updateCameraPosition(draggedItem.id, newX, newY);
      if (camera) {
        addActivityLog({
          userId: 'Current User',
          action: `${camera.name} position moved to (${newX}, ${newY})`,
          equipmentId: camera.id,
          equipmentName: camera.name,
          equipmentType: 'camera',
          changeType: 'position',
          oldValue: `(${camera.x}, ${camera.y})`,
          newValue: `(${newX}, ${newY})`,
        });
      }
    }

    if (draggedItem.type === 'rack') {
      const rack = (racks || []).find((r) => r.id === draggedItem.id);
      updateRackPosition(draggedItem.id, newX, newY);
      if (rack) {
        addActivityLog({
          userId: 'Current User',
          action: `${rack.name} position moved to (${newX}, ${newY})`,
          equipmentId: rack.id,
          equipmentName: rack.name,
          equipmentType: 'rack',
          changeType: 'position',
          oldValue: `(${rack.x}, ${rack.y})`,
          newValue: `(${newX}, ${newY})`,
        });
      }
    }

    if (draggedItem.type === 'cabinet') {
      const cabinet = (cabinets || []).find((c) => c.id === draggedItem.id);
      updateCabinetPosition(draggedItem.id, newX, newY);
      if (cabinet) {
        addActivityLog({
          userId: 'Current User',
          action: `${cabinet.name} position moved to (${newX}, ${newY})`,
          equipmentId: cabinet.id,
          equipmentName: cabinet.name,
          equipmentType: 'cabinet',
          changeType: 'position',
          oldValue: `(${cabinet.x}, ${cabinet.y})`,
          newValue: `(${newX}, ${newY})`,
        });
      }
    }

    setShowPositionModal(false);
    setDraggedItem(null);
    setSelectedItem(null);
  };

  const cancelPositionChange = () => {
    setShowPositionModal(false);
    setDraggedItem(null);
  };

  const handlePositionChange = (x: number, y: number) => {
    if (!effectiveCanManageLayout) return;
    setTempPosition({ x, y });
  };

  const selectedCamera = selectedItem?.type === 'camera' ? (cameras || []).find((c) => c.id === selectedItem.id) : null;
  const selectedRack = selectedItem?.type === 'rack' ? (racks || []).find((r) => r.id === selectedItem.id) : null;
  const selectedCabinet = selectedItem?.type === 'cabinet' ? (cabinets || []).find((c) => c.id === selectedItem.id) : null;
  const selectedFiberRoute = selectedFiberId ? (fiberRoutes || []).find((r) => r.id === selectedFiberId) : null;

  const getOldPosition = () => {
    if (!draggedItem) return { x: 0, y: 0 };
    if (draggedItem.type === 'camera') {
      const camera = (cameras || []).find((c) => c.id === draggedItem.id);
      return { x: camera?.x || 0, y: camera?.y || 0 };
    }
    if (draggedItem.type === 'rack') {
      const rack = (racks || []).find((r) => r.id === draggedItem.id);
      return { x: rack?.x || 0, y: rack?.y || 0 };
    }
    const cabinet = (cabinets || []).find((c) => c.id === draggedItem.id);
    return { x: cabinet?.x || 0, y: cabinet?.y || 0 };
  };

  const oldPosition = getOldPosition();

  const previewPath = (() => {
    if (canvasMode !== 'draw_fiber' || (drawingPoints || []).length === 0 || !cursorPos) return null;
    const pts = [...(drawingPoints || []), cursorPos];
    return pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  })();

  return (
    <div
      className="relative w-full h-full bg-gray-50 overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    >
      {effectiveCanManageEquipmentControl && (
        <div className="absolute top-4 left-4 z-30 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-80">
          <div className="text-xl font-bold text-gray-800 mb-5">Equipment Control</div>

        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Camera Type 1 (New)</span>
            <span className="text-red-600 font-bold">{(cameras || []).filter((c) => c.type === 'type1').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleCameraTypeCountChange('type1', cameraType1Count - 1); }} className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xl font-bold">-</button>
            <input type="number" min={0} value={cameraType1Count} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => handleCameraTypeCountChange('type1', Number(e.target.value))} className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-bold" />
            <button onClick={(e) => { e.stopPropagation(); handleCameraTypeCountChange('type1', cameraType1Count + 1); }} className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xl font-bold">+</button>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Camera Type 2 (Replace)</span>
            <span className="text-blue-600 font-bold">{(cameras || []).filter((c) => c.type === 'type2').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleCameraTypeCountChange('type2', cameraType2Count - 1); }} className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xl font-bold">-</button>
            <input type="number" min={0} value={cameraType2Count} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => handleCameraTypeCountChange('type2', Number(e.target.value))} className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-bold" />
            <button onClick={(e) => { e.stopPropagation(); handleCameraTypeCountChange('type2', cameraType2Count + 1); }} className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xl font-bold">+</button>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Rack Type 1 - New RACK</span>
            <span className="text-green-600 font-bold">{(racks || []).filter((r) => r.type === 'type1').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleRackTypeCountChange('type1', rackType1Count - 1); }} className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xl font-bold">-</button>
            <input type="number" min={0} value={rackType1Count} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => handleRackTypeCountChange('type1', Number(e.target.value))} className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-bold" />
            <button onClick={(e) => { e.stopPropagation(); handleRackTypeCountChange('type1', rackType1Count + 1); }} className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xl font-bold">+</button>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Rack Type 2 - Old RACK (Existing)</span>
            <span className="text-blue-600 font-bold">{(racks || []).filter((r) => r.type === 'type2').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleRackTypeCountChange('type2', rackType2Count - 1); }} className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xl font-bold">-</button>
            <input type="number" min={0} value={rackType2Count} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => handleRackTypeCountChange('type2', Number(e.target.value))} className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-bold" />
            <button onClick={(e) => { e.stopPropagation(); handleRackTypeCountChange('type2', rackType2Count + 1); }} className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xl font-bold">+</button>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Cabinets</span>
            <span className="text-purple-600 font-bold">{(cabinets || []).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleCabinetCountChange(cabinetCountInput - 1); }} className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xl font-bold">-</button>
            <input type="number" min={0} value={cabinetCountInput} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => handleCabinetCountChange(Number(e.target.value))} className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-bold" />
            <button onClick={(e) => { e.stopPropagation(); handleCabinetCountChange(cabinetCountInput + 1); }} className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xl font-bold">+</button>
          </div>
        </div>
        </div>
      )}

      {effectiveCanManageEquipmentControl && (
        <div className="absolute top-4 right-4 z-30 bg-white rounded-2xl shadow-2xl border border-purple-200 p-4 w-80">
          <div className="text-lg font-black text-gray-800 mb-3">
            Floor Plan Alignment
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-gray-600">Scale</span>
                <span className="text-xs font-black text-purple-700">
                  {Number(floorPlanScaleInput || 1).toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustFloorPlanScale(-0.05);
                  }}
                  className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-lg font-black"
                >
                  -
                </button>

                <input
                  type="number"
                  step="0.01"
                  min="0.2"
                  max="3"
                  value={floorPlanScaleInput}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setFloorPlanScaleInput(
                      Math.max(0.2, Math.min(3, Number(e.target.value || 1)))
                    )
                  }
                  className="flex-1 border-2 border-purple-200 rounded-lg px-3 py-2 text-center text-sm font-black"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustFloorPlanScale(0.05);
                  }}
                  className="w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-lg font-black"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-gray-600">Offset X</span>
                <span className="text-xs font-black text-purple-700">
                  {floorPlanOffsetXInput}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustFloorPlanOffsetX(-10);
                  }}
                  className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-lg font-black"
                >
                  -
                </button>

                <input
                  type="number"
                  step="1"
                  value={floorPlanOffsetXInput}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setFloorPlanOffsetXInput(Math.round(Number(e.target.value || 0)))
                  }
                  className="flex-1 border-2 border-purple-200 rounded-lg px-3 py-2 text-center text-sm font-black"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustFloorPlanOffsetX(10);
                  }}
                  className="w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-lg font-black"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-gray-600">Offset Y</span>
                <span className="text-xs font-black text-purple-700">
                  {floorPlanOffsetYInput}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustFloorPlanOffsetY(-10);
                  }}
                  className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-lg font-black"
                >
                  -
                </button>

                <input
                  type="number"
                  step="1"
                  value={floorPlanOffsetYInput}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setFloorPlanOffsetYInput(Math.round(Number(e.target.value || 0)))
                  }
                  className="flex-1 border-2 border-purple-200 rounded-lg px-3 py-2 text-center text-sm font-black"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustFloorPlanOffsetY(10);
                  }}
                  className="w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-lg font-black"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isSavingAlignment}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveFloorPlanAlignment();
                }}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-3 py-2 text-xs font-black shadow-sm"
              >
                {isSavingAlignment ? "Saving..." : "Save Alignment"}
              </button>

              <button
                type="button"
                disabled={isSavingAlignment}
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetFloorPlanAlignment();
                }}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-black border border-slate-200"
              >
                Reset
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              ปรับเฉพาะรูป Floor Plan เท่านั้น ไม่กระทบตำแหน่ง Camera / Rack / Cabinet / Fiber
            </p>
          </div>
        </div>
      )}

      {effectiveCanManageFiber && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {canvasMode === 'normal' ? (
          <button onClick={(e) => { e.stopPropagation(); setCanvasMode('draw_fiber'); setSelectedItem(null); setSelectedFiberId(null); setDrawingPoints([]); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-lg transition-all active:scale-95">
            Draw Fiber Route
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 rounded-lg px-4 py-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-700 text-sm font-semibold">Drawing Mode</span>
            <span className="text-red-500 text-xs">Click to add points · Double-click to finish · ESC to cancel</span>
            <button onClick={(e) => { e.stopPropagation(); setDrawingPoints([]); setCursorPos(null); setCanvasMode('normal'); }} className="ml-2 px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors">Cancel (ESC)</button>
          </div>
        )}

        {selectedFiberId && canvasMode === 'normal' && (
          <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-400 rounded-lg px-3 py-2 shadow-lg">
            <span className="text-yellow-700 text-sm font-medium">Fiber selected</span>
            {effectiveCanManageLayout && (
              <button onClick={(e) => { e.stopPropagation(); deleteFiberRoute(selectedFiberId); setSelectedFiberId(null); }} className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors">Delete Route</button>
            )}
            <button onClick={(e) => { e.stopPropagation(); setSelectedFiberId(null); }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors">Deselect</button>
          </div>
        )}
        </div>
      )}



      <svg
        ref={svgRef}
        className={`w-full h-full ${canvasMode === 'draw_fiber' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        viewBox="0 0 1400 900"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging || isMovingEquipment ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <g
          transform={`translate(${floorPlanOffsetXInput || 0} ${floorPlanOffsetYInput || 0}) scale(${floorPlanScaleInput || 1})`}
        >
          <image
            href={floorPlan.floorPlanUrl || "/floor_plan_2dcc9a6b.webp"}
            x="0"
            y="0"
            width="1400"
            height="900"
            opacity="0.85"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
        <rect width="1400" height="900" fill="#FFFFFF" opacity="0.08" />

        {(fiberRoutes || []).map((route) => (
          <g key={route.id} onClick={(e) => { e.stopPropagation(); handleFiberClick(route.id); }} style={{ cursor: !effectiveCanManageLayout ? 'default' : canvasMode === 'normal' ? 'pointer' : 'crosshair' }}>
            <path d={(route.points || []).reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')} fill="none" stroke="transparent" strokeWidth={16} />
            <FiberRouteMarker route={route} isSelected={selectedFiberId === route.id} />
          </g>
        ))}

        {previewPath && (
          <g>
            <path d={previewPath} fill="none" stroke="#EF4444" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" opacity={0.8} />
            {(drawingPoints || []).map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y} r={4} fill="#EF4444" stroke="white" strokeWidth={1.5} />)}
          </g>
        )}

        {(cameras || []).map((camera) => {
          const isSelected = selectedItem?.type === 'camera' && selectedItem.id === camera.id;
          const isDraggedItem = draggedItem?.type === 'camera' && draggedItem.id === camera.id && (isMovingEquipment || showPositionModal);
          const displayCamera = isDraggedItem ? { ...camera, x: tempPosition.x, y: tempPosition.y } : camera;
          return (
            <g
              key={camera.id}
              onMouseDown={(e) => {
                if (isMovingEquipment) {
                  e.preventDefault();
                  placeMovingEquipment();
                  return;
                }

                e.stopPropagation();
                handleCameraClick(camera);
              }}
              style={{
                cursor: !effectiveCanManageLayout
                  ? 'pointer'
                  : canvasMode === 'draw_fiber'
                    ? 'crosshair'
                    : isSelected
                      ? 'grab'
                      : 'pointer',
              }}
            >
              <CameraMarker
                camera={displayCamera}
                isSelected={isSelected}
                onClick={() => {
                  if (isMovingEquipment) return;
                  handleCameraClick(camera);
                }}
              />
            </g>
          );
        })}

        {(racks || []).map((rack) => {
          const isSelected = selectedItem?.type === 'rack' && selectedItem.id === rack.id;
          const isDraggedItem = draggedItem?.type === 'rack' && draggedItem.id === rack.id && (isMovingEquipment || showPositionModal);
          const displayRack = isDraggedItem ? { ...rack, x: tempPosition.x, y: tempPosition.y } : rack;
          return (
            <g
              key={rack.id}
              onMouseDown={(e) => {
                if (isMovingEquipment) {
                  e.preventDefault();
                  placeMovingEquipment();
                  return;
                }

                e.stopPropagation();
                handleRackClick(rack);
              }}
              style={{
                cursor: !effectiveCanManageLayout
                  ? 'pointer'
                  : canvasMode === 'draw_fiber'
                    ? 'crosshair'
                    : isSelected
                      ? 'grab'
                      : 'pointer',
              }}
            >
              <RackMarker
                rack={displayRack}
                isSelected={isSelected}
                onClick={() => {
                  if (isMovingEquipment) return;
                  handleRackClick(rack);
                }}
              />
            </g>
          );
        })}

        {(cabinets || []).map((cabinet) => {
          const isSelected = selectedItem?.type === 'cabinet' && selectedItem.id === cabinet.id;
          const isDraggedItem = draggedItem?.type === 'cabinet' && draggedItem.id === cabinet.id && (isMovingEquipment || showPositionModal);
          const displayCabinet = isDraggedItem ? { ...cabinet, x: tempPosition.x, y: tempPosition.y } : cabinet;
          return (
            <g
              key={cabinet.id}
              onMouseDown={(e) => {
                if (isMovingEquipment) {
                  e.preventDefault();
                  placeMovingEquipment();
                  return;
                }

                e.stopPropagation();
                handleCabinetClick(cabinet);
              }}
              style={{
                cursor: !effectiveCanManageLayout
                  ? 'pointer'
                  : canvasMode === 'draw_fiber'
                    ? 'crosshair'
                    : isSelected
                      ? 'grab'
                      : 'pointer',
              }}
            >
              <CabinetMarker
                cabinet={displayCabinet}
                isSelected={isSelected}
                onClick={() => {
                  if (isMovingEquipment) return;
                  handleCabinetClick(cabinet);
                }}
              />
            </g>
          );
        })}
      </svg>

      {selectedCamera && !isMovingEquipment && !showPositionModal && <CameraStatusModal camera={selectedCamera} isOpen={true} onClose={() => setSelectedItem(null)} canEditProgress={effectiveCanEditProgress} canManageLayout={effectiveCanManageLayout} onEditPosition={effectiveCanManageLayout ? (e) => startMovingEquipment(e) : undefined} />}
      {selectedRack && !isMovingEquipment && !showPositionModal && <RackStatusModal rack={selectedRack} isOpen={true} onClose={() => setSelectedItem(null)} canEditProgress={effectiveCanEditProgress} canManageLayout={effectiveCanManageLayout} onEditPosition={effectiveCanManageLayout ? (e) => startMovingEquipment(e) : undefined} />}
      {selectedCabinet && !isMovingEquipment && !showPositionModal && <CabinetStatusModal cabinet={selectedCabinet} isOpen={true} onClose={() => setSelectedItem(null)} canEditProgress={effectiveCanEditProgress} canManageLayout={effectiveCanManageLayout} onEditPosition={effectiveCanManageLayout ? (e) => startMovingEquipment(e) : undefined} />}
      {effectiveCanEditProgress && selectedFiberRoute && !isMovingEquipment && !showPositionModal && (
        <FiberRouteStatusModal
          route={selectedFiberRoute}
          isOpen={true}
          canEditFiber={effectiveCanEditProgress}
          canManageLayout={effectiveCanManageLayout}
          onClose={() => setSelectedFiberId(null)}
          onUpdate={(changes: any) =>
            updateFiberRoute(
              selectedFiberRoute.id,
              changes
            )
          }
          onDelete={
            effectiveCanManageLayout
              ? () => {
                  deleteFiberRoute(
                    selectedFiberRoute.id
                  );

                  setSelectedFiberId(null);
                }
              : undefined
          }
        />
      )}

      {effectiveCanManageLayout && (
        <PositionConfirmationModal
        isOpen={showPositionModal}
        item={draggedItem ? draggedItem.type === 'camera' ? selectedCamera || null : draggedItem.type === 'rack' ? selectedRack || null : selectedCabinet || null : null}
        newX={tempPosition.x}
        newY={tempPosition.y}
        oldX={oldPosition.x}
        oldY={oldPosition.y}
        onConfirm={confirmPosition}
        onCancel={cancelPositionChange}
        onPositionChange={handlePositionChange}
        />
      )}

      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-4 py-2 text-sm text-gray-600">
        {canvasMode === 'draw_fiber' ? `Drawing Fiber · ${(drawingPoints || []).length} point${(drawingPoints || []).length !== 1 ? 's' : ''} placed` : `Zoom: ${(zoom * 100).toFixed(0)}% | Scroll to zoom, drag to pan`}
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
