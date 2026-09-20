import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Incident, IncidentSeverity, IncidentStatus } from "../../types";
import { useIncidents } from "../../context/IncidentContext";
import {
  Crosshair,
  Maximize2,
  Layers,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

// Custom DivIcons for Leaflet
export const createIncidentDivIcon = (severity: IncidentSeverity, status: IncidentStatus, isSelected = false) => {
  let color = "#10B981"; // green
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let badgeText = "●";

  if (status === "resolved" || status === "verified") {
    color = "#16A34A";
    glowColor = "rgba(22, 163, 74, 0.35)";
    badgeText = "✓";
  } else if (severity === "critical" || status === "reported") {
    color = "#EF4444";
    glowColor = "rgba(239, 68, 68, 0.5)";
    badgeText = "!";
  } else if (severity === "high" || status === "assigned") {
    color = "#F59E0B";
    glowColor = "rgba(245, 158, 11, 0.4)";
    badgeText = "▲";
  } else if (status === "in_progress") {
    color = "#3B82F6";
    glowColor = "rgba(59, 130, 246, 0.4)";
    badgeText = "⏳";
  }

  const ringStyle = isSelected ? "box-shadow: 0 0 0 4px #FFFFFF, 0 0 16px " + color : "box-shadow: 0 0 10px " + glowColor;

  return L.divIcon({
    className: "cleanward-custom-pin",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transform: translate(-50%, -50%);
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: ${color};
          opacity: 0.25;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          background-color: ${color};
          border: 2.5px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 11px;
          ${ringStyle};
          transition: transform 0.2s ease;
        ">
          ${badgeText}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const createDraggablePinIcon = () => {
  return L.divIcon({
    className: "cleanward-draggable-pin",
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: grab;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, #10B981, #047857);
          transform: rotate(-45deg);
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(4, 120, 87, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 9999px;
            background: #FFFFFF;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 8px;
          height: 4px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          margin-top: 2px;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
  });
};

export const createUserLocationIcon = () => {
  return L.divIcon({
    className: "cleanward-user-pin",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background-color: #3B82F6;
        border: 3px solid #FFFFFF;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        position: relative;
      ">
        <div style="
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          border: 2px solid rgba(59, 130, 246, 0.4);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Map helper components
const MapClickHandler: React.FC<{
  enabled: boolean;
  onLocationPick: (lat: number, lng: number) => void;
}> = ({ enabled, onLocationPick }) => {
  useMapEvents({
    click(e) {
      if (enabled) {
        onLocationPick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapController: React.FC<{
  center?: [number, number];
  zoom?: number;
  fitBoundsCoords?: [number, number][];
}> = ({ center, zoom, fitBoundsCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (fitBoundsCoords && fitBoundsCoords.length > 0) {
      const bounds = L.latLngBounds(fitBoundsCoords.map((c) => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [fitBoundsCoords, map]);

  return null;
};

// Draggable Report Marker
const DraggableReportMarker: React.FC<{
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}> = ({ position, onDragEnd }) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onDragEnd(latLng.lat, latLng.lng);
        }
      },
    }),
    [onDragEnd]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={createDraggablePinIcon()}
    >
      <Popup className="cleanward-custom-popup">
        <div className="p-1 text-xs font-semibold text-slate-800">
          📍 Incident Location Pin
          <div className="text-[10px] text-slate-500 font-normal">
            Drag to adjust precise reporting spot
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

interface LeafletMapProps {
  incidents?: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  draggablePin?: { lat: number; lng: number } | null;
  onPinChange?: (lat: number, lng: number) => void;
  allowClickToPlace?: boolean;
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  heightClass?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  showControls?: boolean;
  filterStatus?: string | null;
  filterSeverity?: string | null;
  showHeatmapCircles?: boolean;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  draggablePin,
  onPinChange,
  allowClickToPlace = false,
  userLocation,
  heightClass = "h-[450px]",
  initialCenter = [16.5142, 80.6278],
  initialZoom = 14,
  showControls = true,
  filterStatus = null,
  filterSeverity = null,
  showHeatmapCircles = true,
  className = "",
}) => {
  const { tileUrl } = useIncidents();
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(initialZoom);
  const [fitCoords, setFitCoords] = useState<[number, number][] | undefined>(undefined);

  // Filter incidents if specified
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (filterStatus && inc.status !== filterStatus) return false;
      if (filterSeverity && inc.severity !== filterSeverity) return false;
      return true;
    });
  }, [incidents, filterStatus, filterSeverity]);

  // Recenter when selectedIncident changes
  useEffect(() => {
    if (selectedIncident) {
      setMapCenter([selectedIncident.latitude, selectedIncident.longitude]);
      setMapZoom(16);
    }
  }, [selectedIncident]);

  // Recenter if draggable pin is explicitly passed
  useEffect(() => {
    if (draggablePin) {
      setMapCenter([draggablePin.lat, draggablePin.lng]);
    }
  }, [draggablePin]);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMapCenter([lat, lng]);
          setMapZoom(16);
          if (onPinChange && allowClickToPlace) {
            onPinChange(lat, lng);
          }
        },
        (err) => {
          console.warn("Geolocation warning:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleFitAll = () => {
    if (filteredIncidents.length > 0) {
      const coords = filteredIncidents.map((inc) => [inc.latitude, inc.longitude] as [number, number]);
      setFitCoords(coords);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        attributionControl={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} fitBoundsCoords={fitCoords} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url={tileUrl}
        />

        {allowClickToPlace && onPinChange && (
          <MapClickHandler
            enabled={allowClickToPlace}
            onLocationPick={(lat, lng) => onPinChange(lat, lng)}
          />
        )}

        {/* User live location marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()}>
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-semibold text-blue-600">Your Current GPS Position</div>
                  <div className="text-[11px] text-slate-500">
                    Accuracy: ±{Math.round(userLocation.accuracy || 15)}m
                  </div>
                </div>
              </Popup>
            </Marker>
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.1, weight: 1 }}
              />
            )}
          </>
        )}

        {/* Draggable Reporting Pin */}
        {draggablePin && onPinChange && (
          <DraggableReportMarker
            position={[draggablePin.lat, draggablePin.lng]}
            onDragEnd={(lat, lng) => onPinChange(lat, lng)}
          />
        )}

        {/* Incident Heatmap/Risk Glow Rings */}
        {showHeatmapCircles &&
          filteredIncidents
            .filter((inc) => inc.severity === "critical" && inc.status !== "resolved")
            .map((inc) => (
              <Circle
                key={`heat-${inc.id}`}
                center={[inc.latitude, inc.longitude]}
                radius={180}
                pathOptions={{
                  color: "#EF4444",
                  fillColor: "#EF4444",
                  fillOpacity: 0.15,
                  weight: 1,
                  dashArray: "4, 6",
                }}
              />
            ))}

        {/* Incident Markers */}
        {filteredIncidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={createIncidentDivIcon(incident.severity, incident.status, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectIncident) {
                    onSelectIncident(incident);
                  }
                },
              }}
            >
              <Popup className="cleanward-custom-popup" maxWidth={280}>
                <div className="w-64 p-0 font-sans text-slate-900 dark:text-slate-100">
                  {incident.imageUrl && (
                    <div className="relative h-28 w-full overflow-hidden rounded-t-lg bg-slate-100">
                      <img
                        src={incident.imageUrl}
                        alt={incident.category}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 text-white backdrop-blur-md">
                        {incident.ticketId}
                      </div>
                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          incident.severity === "critical"
                            ? "bg-red-500 text-white"
                            : incident.severity === "high"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {incident.severity}
                      </div>
                    </div>
                  )}

                  <div className="p-3">
                    <h4 className="font-semibold text-sm leading-tight text-slate-900 dark:text-white">
                      {incident.category}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{incident.area}</span>
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {incident.status.replace("_", " ")}
                      </span>
                      {onSelectIncident && (
                        <button
                          onClick={() => onSelectIncident(incident)}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          View Incident <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Polished Floating Map Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLocateMe}
            title="Locate My Position"
            aria-label="Locate My Position"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFitAll}
            title="Fit All Incidents"
            aria-label="Fit All Incidents"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>Critical / Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Active / Assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
};
