import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
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
};

const FloorPlanCanvas: React.FC<Props> = ({
  readOnly = false,
  canManageLayout = false,
}) => {
  const [, setLocation] = useLocation();
  const floorPlan = useFloorPlan();

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focus = params.get('focus');

    if (!focus) return;

    const [type, id] = focus.split(':');
    if (!type || !id) return;

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

    setZoom(focusZoom);
    setPan({
      x: 700 - target.x * focusZoom,
      y: 350 - target.y * focusZoom,
    });

    const timer = window.setTimeout(() => {
      setLocation('/floorplan', { replace: true });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cameras, racks, cabinets, setLocation]);

  const [canvasMode, setCanvasMode] = useState<CanvasMode>('normal');
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedFiberId, setSelectedFiberId] = useState<string | null>(null);

  const screenToSvg = useCallback(
  (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const rect = svgRef.current.getBoundingClientRect();

    const x =
      (clientX - rect.left - pan.x) / zoom;

    const y =
      (clientY - rect.top - pan.y) / zoom;

    return {
      x: Math.max(0, Math.min(1400, x)),
      y: Math.max(0, Math.min(900, y)),
    };
  },
  [zoom, pan]
);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canManageLayout) {
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

    if (e.button === 0 && isMovingEquipment && draggedItem) {
  e.preventDefault();

  setIsMovingEquipment(false);
  setShowPositionModal(true);

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
    if (!canManageLayout) return;
    if (canvasMode !== 'draw_fiber') return;
    e.preventDefault();
    if ((drawingPoints || []).length < 2) return;

    const routeId = `fiber_${Date.now()}`;
    const routeNum = (fiberRoutes || []).length + 1;
    const clickedPos = screenToSvg(e.clientX, e.clientY);
    const finalPoints = [...(drawingPoints || []), clickedPos];

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
      if (!canManageLayout) {
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
  }, [canvasMode, selectedFiberId, deleteFiberRoute, canManageLayout]);

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

  const handleCameraTypeCountChange = (cameraType: string, value: number) => {
    if (!canManageLayout) return;
    const safeValue = Math.max(0, value);
    if (cameraType === 'type1') setCameraType1Count(safeValue);
    else setCameraType2Count(safeValue);
    if (typeof setCameraCountByType === 'function') setCameraCountByType(cameraType, safeValue);
  };

  const handleRackTypeCountChange = (rackType: string, value: number) => {
    if (!canManageLayout) return;
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
    if (!canManageLayout) return;
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
    if (!canManageLayout) return;
    if (canvasMode === 'draw_fiber') return;
    setSelectedFiberId((prev) => (prev === routeId ? null : routeId));
    setSelectedItem(null);
  };

  const startMovingEquipment = (
  e?: React.MouseEvent
) => {
  if (!canManageLayout) return;
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
    if (!canManageLayout) return;
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
    if (!canManageLayout) return;
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
      {canManageLayout && (
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

      {canManageLayout && (
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
            <button onClick={(e) => { e.stopPropagation(); deleteFiberRoute(selectedFiberId); setSelectedFiberId(null); }} className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors">Delete Route</button>
            <button onClick={(e) => { e.stopPropagation(); setSelectedFiberId(null); }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors">Deselect</button>
          </div>
        )}
        </div>
      )}

      {!canManageLayout && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 shadow-lg">
          <span className="text-blue-700 text-sm font-semibold">
            Layout Locked
          </span>
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
        <image href="/floor_plan_2dcc9a6b.webp" x="0" y="0" width="1400" height="900" opacity="0.85" preserveAspectRatio="xMidYMid slice" />
        <rect width="1400" height="900" fill="#FFFFFF" opacity="0.08" />

        {(fiberRoutes || []).map((route) => (
          <g key={route.id} onClick={(e) => { e.stopPropagation(); handleFiberClick(route.id); }} style={{ cursor: !canManageLayout ? 'default' : canvasMode === 'normal' ? 'pointer' : 'crosshair' }}>
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
          return <g key={camera.id} onMouseDown={(e) => { e.stopPropagation(); handleCameraClick(camera); }} style={{ cursor: !canManageLayout ? 'pointer' : canvasMode === 'draw_fiber' ? 'crosshair' : isSelected ? 'grab' : 'pointer' }}><CameraMarker camera={displayCamera} isSelected={isSelected} onClick={() => handleCameraClick(camera)} /></g>;
        })}

        {(racks || []).map((rack) => {
          const isSelected = selectedItem?.type === 'rack' && selectedItem.id === rack.id;
          const isDraggedItem = draggedItem?.type === 'rack' && draggedItem.id === rack.id && (isMovingEquipment || showPositionModal);
          const displayRack = isDraggedItem ? { ...rack, x: tempPosition.x, y: tempPosition.y } : rack;
          return <g key={rack.id} onMouseDown={(e) => { e.stopPropagation(); handleRackClick(rack); }} style={{ cursor: !canManageLayout ? 'pointer' : canvasMode === 'draw_fiber' ? 'crosshair' : isSelected ? 'grab' : 'pointer' }}><RackMarker rack={displayRack} isSelected={isSelected} onClick={() => handleRackClick(rack)} /></g>;
        })}

        {(cabinets || []).map((cabinet) => {
          const isSelected = selectedItem?.type === 'cabinet' && selectedItem.id === cabinet.id;
          const isDraggedItem = draggedItem?.type === 'cabinet' && draggedItem.id === cabinet.id && (isMovingEquipment || showPositionModal);
          const displayCabinet = isDraggedItem ? { ...cabinet, x: tempPosition.x, y: tempPosition.y } : cabinet;
          return <g key={cabinet.id} onMouseDown={(e) => { e.stopPropagation(); handleCabinetClick(cabinet); }} style={{ cursor: !canManageLayout ? 'pointer' : canvasMode === 'draw_fiber' ? 'crosshair' : isSelected ? 'grab' : 'pointer' }}><CabinetMarker cabinet={displayCabinet} isSelected={isSelected} onClick={() => handleCabinetClick(cabinet)} /></g>;
        })}
      </svg>

      {selectedCamera && !isMovingEquipment && !showPositionModal && <CameraStatusModal camera={selectedCamera} isOpen={true} onClose={() => setSelectedItem(null)} onEditPosition={canManageLayout ? (e) => startMovingEquipment(e) : undefined} />}
      {selectedRack && !isMovingEquipment && !showPositionModal && <RackStatusModal rack={selectedRack} isOpen={true} onClose={() => setSelectedItem(null)} onEditPosition={canManageLayout ? (e) => startMovingEquipment(e) : undefined} />}
      {selectedCabinet && !isMovingEquipment && !showPositionModal && <CabinetStatusModal cabinet={selectedCabinet} isOpen={true} onClose={() => setSelectedItem(null)} onEditPosition={canManageLayout ? (e) => startMovingEquipment(e) : undefined} />}
      {canManageLayout && selectedFiberRoute && !isMovingEquipment && !showPositionModal && <FiberRouteStatusModal route={selectedFiberRoute} isOpen={true} onClose={() => setSelectedFiberId(null)} onUpdate={(changes: any) => updateFiberRoute(selectedFiberRoute.id, changes)} />}

      {canManageLayout && (
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
