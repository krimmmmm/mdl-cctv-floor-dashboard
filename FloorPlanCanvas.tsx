import React, { useState, useEffect, useCallback } from 'react';
import { useFloorPlan } from '@/contexts/FloorPlanContext';
import { Camera, Rack, Cabinet, FiberRoute } from '@/lib/floorPlanData';
import CameraMarker from './equipment/CameraMarker';
import RackMarker from './equipment/RackMarker';
import CabinetMarker from './equipment/CabinetMarker';
import FiberRouteMarker from './equipment/FiberRouteMarker';
import CameraStatusModal from './modals/CameraStatusModal';
import RackStatusModal from './modals/RackStatusModal';
import CabinetStatusModal from './modals/CabinetStatusModal';
import PositionConfirmationModal from './modals/PositionConfirmationModal';

type SelectedItem = { type: 'camera'; id: string } | { type: 'rack'; id: string } | { type: 'cabinet'; id: string } | null;
type CanvasMode = 'normal' | 'draw_fiber';

const FloorPlanCanvas: React.FC = () => {
  const {
    cameras, racks, cabinets, fiberRoutes,
    updateCameraPosition, updateRackPosition, updateCabinetPosition,
    addActivityLog, addFiberRoute, deleteFiberRoute,
  } = useFloorPlan();

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMovingEquipment, setIsMovingEquipment] = useState(false);
  const [draggedItem, setDraggedItem] = useState<SelectedItem>(null);
  const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 });
  const [showPositionModal, setShowPositionModal] = useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Fiber Draw Mode state
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('normal');
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedFiberId, setSelectedFiberId] = useState<string | null>(null);

  // Convert screen coords to SVG coords
  const screenToSvg = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / zoom - pan.x / zoom;
    const y = (clientY - rect.top) / zoom - pan.y / zoom;
    return {
      x: Math.max(0, Math.min(1400, x)),
      y: Math.max(0, Math.min(900, y)),
    };
  }, [zoom, pan]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (canvasMode === 'draw_fiber') {
      // In draw mode: left-click adds a point
      if (e.button === 0) {
        e.preventDefault();
        const pos = screenToSvg(e.clientX, e.clientY);
        setDrawingPoints((prev) => [...prev, pos]);
      }
      // Right-click in draw mode: pan
      if (e.button === 2) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
      return;
    }

    // Normal mode
    if (e.button === 0 && !isMovingEquipment) {
      const target = e.target as SVGElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'svg' || tagName === 'rect' || tagName === 'image' || tagName === 'text') {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        // Deselect fiber when clicking background
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
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (isMovingEquipment && draggedItem && svgRef.current) {
      const pos = screenToSvg(e.clientX, e.clientY);
      setTempPosition(pos);
    }

    if (canvasMode === 'draw_fiber') {
      const pos = screenToSvg(e.clientX, e.clientY);
      setCursorPos(pos);
    }
  };

  const handleMouseUp = () => {
    if (isMovingEquipment && draggedItem) {
      setIsMovingEquipment(false);
      setShowPositionModal(true);
    }
    setIsDragging(false);
  };

  // Double-click to finish drawing fiber route
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (canvasMode !== 'draw_fiber') return;
    e.preventDefault();
    if (drawingPoints.length < 2) return;

    const routeId = `fiber_${Date.now()}`;
    const routeNum = fiberRoutes.length + 1;
    const newRoute: FiberRoute = {
      id: routeId,
      name: `Fiber Route ${routeNum}`,
      points: drawingPoints,
      status: 'idle',
      color: '#EF4444',
    };
    addFiberRoute(newRoute);
    setDrawingPoints([]);
    setCursorPos(null);
    setCanvasMode('normal');
  };

  // ESC to cancel drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (canvasMode === 'draw_fiber') {
          setDrawingPoints([]);
          setCursorPos(null);
          setCanvasMode('normal');
        }
        if (selectedFiberId) {
          setSelectedFiberId(null);
        }
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
  }, [canvasMode, selectedFiberId, deleteFiberRoute]);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMovingEquipment && draggedItem) {
        setIsMovingEquipment(false);
        setShowPositionModal(true);
      }
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isMovingEquipment, draggedItem]);

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
    if (canvasMode === 'draw_fiber') return;
    setSelectedFiberId((prev) => (prev === routeId ? null : routeId));
    setSelectedItem(null);
  };

  const startMovingEquipment = () => {
    if (!selectedItem) return;
    setIsMovingEquipment(true);
    setDraggedItem(selectedItem);
    if (selectedItem.type === 'camera') {
      const camera = cameras.find((c) => c.id === selectedItem.id);
      if (camera) setTempPosition({ x: camera.x, y: camera.y });
    } else if (selectedItem.type === 'rack') {
      const rack = racks.find((r) => r.id === selectedItem.id);
      if (rack) setTempPosition({ x: rack.x, y: rack.y });
    } else if (selectedItem.type === 'cabinet') {
      const cabinet = cabinets.find((c) => c.id === selectedItem.id);
      if (cabinet) setTempPosition({ x: cabinet.x, y: cabinet.y });
    }
  };

  const confirmPosition = () => {
    if (!draggedItem) return;
    const newX = Math.round(tempPosition.x);
    const newY = Math.round(tempPosition.y);

    if (draggedItem.type === 'camera') {
      const camera = cameras.find((c) => c.id === draggedItem.id);
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
    } else if (draggedItem.type === 'rack') {
      const rack = racks.find((r) => r.id === draggedItem.id);
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
    } else if (draggedItem.type === 'cabinet') {
      const cabinet = cabinets.find((c) => c.id === draggedItem.id);
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
    setTempPosition({ x, y });
  };

  const selectedCamera = selectedItem?.type === 'camera' ? cameras.find((c) => c.id === selectedItem.id) : null;
  const selectedRack = selectedItem?.type === 'rack' ? racks.find((r) => r.id === selectedItem.id) : null;
  const selectedCabinet = selectedItem?.type === 'cabinet' ? cabinets.find((c) => c.id === selectedItem.id) : null;

  const getOldPosition = () => {
    if (!draggedItem) return { x: 0, y: 0 };
    if (draggedItem.type === 'camera') {
      const camera = cameras.find((c) => c.id === draggedItem.id);
      return { x: camera?.x || 0, y: camera?.y || 0 };
    } else if (draggedItem.type === 'rack') {
      const rack = racks.find((r) => r.id === draggedItem.id);
      return { x: rack?.x || 0, y: rack?.y || 0 };
    } else {
      const cabinet = cabinets.find((c) => c.id === draggedItem.id);
      return { x: cabinet?.x || 0, y: cabinet?.y || 0 };
    }
  };

  const oldPosition = getOldPosition();

  // Build preview path for drawing
  const previewPath = (() => {
    if (canvasMode !== 'draw_fiber' || drawingPoints.length === 0 || !cursorPos) return null;
    const pts = [...drawingPoints, cursorPos];
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
      {/* Draw Fiber Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {canvasMode === 'normal' ? (
          <button
            onClick={() => {
              setCanvasMode('draw_fiber');
              setSelectedItem(null);
              setSelectedFiberId(null);
              setDrawingPoints([]);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-lg transition-all active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 21 L21 3M8 3h13v13" />
            </svg>
            Draw Fiber Route
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 rounded-lg px-4 py-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-700 text-sm font-semibold">Drawing Mode</span>
            <span className="text-red-500 text-xs">Click to add points · Double-click to finish · ESC to cancel</span>
            <button
              onClick={() => {
                setDrawingPoints([]);
                setCursorPos(null);
                setCanvasMode('normal');
              }}
              className="ml-2 px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors"
            >
              Cancel (ESC)
            </button>
          </div>
        )}

        {/* Selected fiber actions */}
        {selectedFiberId && canvasMode === 'normal' && (
          <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-400 rounded-lg px-3 py-2 shadow-lg">
            <span className="text-yellow-700 text-sm font-medium">Fiber selected</span>
            <button
              onClick={() => {
                deleteFiberRoute(selectedFiberId);
                setSelectedFiberId(null);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
              Delete Route
            </button>
            <button
              onClick={() => setSelectedFiberId(null)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors"
            >
              Deselect
            </button>
          </div>
        )}
      </div>

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
        {/* Floor Plan Background Image */}
        <image
          href="/manus-storage/floor_plan_2dcc9a6b.webp"
          x="0"
          y="0"
          width="1400"
          height="900"
          opacity="0.85"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Overlay for better visibility of markers */}
        <rect width="1400" height="900" fill="#FFFFFF" opacity="0.08" />

        {/* Fiber Optic Routes */}
        {fiberRoutes.map((route) => (
          <g
            key={route.id}
            onClick={(e) => { e.stopPropagation(); handleFiberClick(route.id); }}
            style={{ cursor: canvasMode === 'normal' ? 'pointer' : 'crosshair' }}
          >
            {/* Wider invisible hit area */}
            <path
              d={route.points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
            />
            <FiberRouteMarker
              route={route}
              isSelected={selectedFiberId === route.id}
            />
          </g>
        ))}

        {/* Preview path while drawing */}
        {previewPath && (
          <g>
            <path
              d={previewPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              opacity={0.8}
            />
            {/* Points already placed */}
            {drawingPoints.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={4} fill="#EF4444" stroke="white" strokeWidth={1.5} />
            ))}
          </g>
        )}

        {/* Cameras */}
        {cameras.map((camera) => {
          const isSelected = selectedItem?.type === 'camera' && selectedItem.id === camera.id;
          const isDraggedItem = isMovingEquipment && draggedItem?.type === 'camera' && draggedItem.id === camera.id;
          const displayCamera = isDraggedItem ? { ...camera, x: tempPosition.x, y: tempPosition.y } : camera;

          return (
            <g
              key={camera.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleCameraClick(camera);
              }}
              onMouseMove={(e) => {
                if (isMovingEquipment && isDraggedItem) {
                  handleMouseMove(e as React.MouseEvent);
                }
              }}
              style={{ cursor: canvasMode === 'draw_fiber' ? 'crosshair' : (isSelected ? 'grab' : 'pointer') }}
            >
              <CameraMarker
                camera={displayCamera}
                isSelected={isSelected}
                onClick={() => handleCameraClick(camera)}
              />
            </g>
          );
        })}

        {/* Racks */}
        {racks.map((rack) => {
          const isSelected = selectedItem?.type === 'rack' && selectedItem.id === rack.id;
          const isDraggedItem = isMovingEquipment && draggedItem?.type === 'rack' && draggedItem.id === rack.id;
          const displayRack = isDraggedItem ? { ...rack, x: tempPosition.x, y: tempPosition.y } : rack;

          return (
            <g
              key={rack.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleRackClick(rack);
              }}
              onMouseMove={(e) => {
                if (isMovingEquipment && isDraggedItem) {
                  handleMouseMove(e as React.MouseEvent);
                }
              }}
              style={{ cursor: canvasMode === 'draw_fiber' ? 'crosshair' : (isSelected ? 'grab' : 'pointer') }}
            >
              <RackMarker
                rack={displayRack}
                isSelected={isSelected}
                onClick={() => handleRackClick(rack)}
              />
            </g>
          );
        })}

        {/* Cabinets */}
        {cabinets.map((cabinet) => {
          const isSelected = selectedItem?.type === 'cabinet' && selectedItem.id === cabinet.id;
          const isDraggedItem = isMovingEquipment && draggedItem?.type === 'cabinet' && draggedItem.id === cabinet.id;
          const displayCabinet = isDraggedItem ? { ...cabinet, x: tempPosition.x, y: tempPosition.y } : cabinet;

          return (
            <g
              key={cabinet.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleCabinetClick(cabinet);
              }}
              onMouseMove={(e) => {
                if (isMovingEquipment && isDraggedItem) {
                  handleMouseMove(e as React.MouseEvent);
                }
              }}
              style={{ cursor: canvasMode === 'draw_fiber' ? 'crosshair' : (isSelected ? 'grab' : 'pointer') }}
            >
              <CabinetMarker
                cabinet={displayCabinet}
                isSelected={isSelected}
                onClick={() => handleCabinetClick(cabinet)}
              />
            </g>
          );
        })}
      </svg>

      {/* Status Modals */}
      {selectedCamera && !isMovingEquipment && (
        <CameraStatusModal
          camera={selectedCamera}
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          onEditPosition={startMovingEquipment}
        />
      )}

      {selectedRack && !isMovingEquipment && (
        <RackStatusModal
          rack={selectedRack}
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          onEditPosition={startMovingEquipment}
        />
      )}

      {selectedCabinet && !isMovingEquipment && (
        <CabinetStatusModal
          cabinet={selectedCabinet}
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          onEditPosition={startMovingEquipment}
        />
      )}

      {/* Position Confirmation Modal */}
      <PositionConfirmationModal
        isOpen={showPositionModal}
        item={draggedItem ? (draggedItem.type === 'camera' ? (selectedCamera || null) : draggedItem.type === 'rack' ? (selectedRack || null) : (selectedCabinet || null)) : null}
        newX={tempPosition.x}
        newY={tempPosition.y}
        oldX={oldPosition.x}
        oldY={oldPosition.y}
        onConfirm={confirmPosition}
        onCancel={cancelPositionChange}
        onPositionChange={handlePositionChange}
      />

      {/* Zoom Info */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-4 py-2 text-sm text-gray-600">
        {canvasMode === 'draw_fiber'
          ? `Drawing Fiber · ${drawingPoints.length} point${drawingPoints.length !== 1 ? 's' : ''} placed`
          : `Zoom: ${(zoom * 100).toFixed(0)}% | Scroll to zoom, drag to pan`}
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
