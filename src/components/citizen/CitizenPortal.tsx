import React, { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useIncidents } from "../../context/IncidentContext";
import { LeafletMap } from "../common/LeafletMap";
import { SeverityBadge } from "../common/Badges";
import { SAMPLE_IMAGES } from "../../data/mockData";
import { SampleReportImage, IncidentSeverity, Incident } from "../../types";
import { BeforeAfterSlider } from "../common/BeforeAfterSlider";
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Crosshair,
  Share2,
  Copy,
  Info,
  ShieldAlert,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export const CitizenPortal: React.FC = () => {
  const { addIncident, setActiveTab, setSelectedIncident, incidents } = useIncidents();

  // Wizard state: 1 = Capture, 2 = Locate, 3 = Analyze, 4 = Review/Submit, 5 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form data
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [sampleType, setSampleType] = useState<string>("plastic");
  const [reporterName, setReporterName] = useState<string>("Citizen Reporter");
  const [reporterPhone, setReporterPhone] = useState<string>("+91 98480 22334");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  // Coordinates & Ward state
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 16.5186,
    lng: 80.62,
  });
  const [detectedWard, setDetectedWard] = useState<string>("Ward 14 - Central Market");
  const [detectedArea, setDetectedArea] = useState<string>("Station Road Corner");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // AI Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<number>(0); // 0 to 4
  const [aiAnalysis, setAiAnalysis] = useState<{
    category: string;
    severity: IncidentSeverity;
    confidence: number;
    detectedObjects: string[];
    healthHazard: string;
    description: string;
    estimatedVolumeKg: number;
    dispatchUrgency: string;
    recommendedCrewSize: string;
  }>({
    category: "Plastic / Dry Waste",
    severity: "high",
    confidence: 94,
    detectedObjects: ["Single-use plastic bottles", "Polythene bags", "Food wrappers", "Drainage obstruction risk"],
    healthHazard: "Moderate - Microplastic dispersal & stormwater drain clogging",
    description: "Dense accumulation of non-biodegradable plastics encroaching upon public pedestrian walkway. Immediate clearance required to prevent gutter blockages.",
    estimatedVolumeKg: 120,
    dispatchUrgency: "4-Hour Response Required",
    recommendedCrewSize: "Crew #12 (4 personnel + 1 mini-tipper)",
  });

  // Success ticket state
  const [createdTicket, setCreatedTicket] = useState<Incident | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wizardRef = useRef<HTMLDivElement>(null);

  // Run AI Vision Scanner with progressive feedback
  const runAiAnalysis = async (imgUrl: string, sampleKey?: string) => {
    setIsScanning(true);
    setScanStage(1);

    // Stage progress simulation for cinematic experience
    const timer1 = setTimeout(() => setScanStage(2), 600);
    const timer2 = setTimeout(() => setScanStage(3), 1200);

    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleType: sampleKey || sampleType,
          imageBase64: imgUrl.startsWith("data:") ? imgUrl : undefined,
        }),
      });

      const json = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      setScanStage(4);

      if (json.success && json.data) {
        setAiAnalysis(json.data);
      }
    } catch (e) {
      setScanStage(4);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
    }
  };

  const handleSelectSample = (sample: SampleReportImage) => {
    setSelectedImage(sample.url);
    setSampleType(sample.id);
    setCoords({ lat: sample.coords[0], lng: sample.coords[1] });
    setDetectedWard(sample.ward);
    setDetectedArea(sample.area);
    runAiAnalysis(sample.url, sample.id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setSampleType("custom");
        runAiAnalysis(base64, "plastic");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(accuracy);
        setIsLocating(false);

        // Map reverse coordinates to simulated ward context
        if (latitude > 16.515) {
          setDetectedWard("Ward 14 - Central Market");
          setDetectedArea("Station Boulevard Enclave");
        } else if (latitude < 16.505) {
          setDetectedWard("Ward 21 - Green Valley");
          setDetectedArea("South Arterial Corridor");
        } else {
          setDetectedWard("Ward 8 - Railway Enclave");
          setDetectedArea("Civic Sector 3");
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Click anywhere on the map to set your incident pin.");
        } else {
          setLocationError("Unable to retrieve GPS fix. Please select manually on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePinDrag = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    // Dynamically adjust area label
    setDetectedArea(`Pin: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
  };

  const handleSubmitReport = () => {
    if (!selectedImage) return;

    const newInc = addIncident({
      category: aiAnalysis.category,
      severity: aiAnalysis.severity,
      status: "reported",
      ward: detectedWard,
      area: detectedArea,
      latitude: coords.lat,
      longitude: coords.lng,
      imageUrl: selectedImage,
      reportedBy: `${reporterName} (${reporterPhone})`,
      aiAnalysis,
    });

    setCreatedTicket(newInc);
    setCurrentStep(5); // Success step

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10B981", "#047857", "#34D399", "#F59E0B"],
      });
    } catch {}
  };

  const scrollToWizard = () => {
    wizardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] dark:bg-[#071311] text-slate-900 dark:text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800">
        {/* Subtle geometric eco background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Next-Gen Municipal Cleanliness Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase leading-[1.08] font-sans">
              REPORT. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400">
                RESPOND. RESOLVE.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
              AI-powered civic reporting connecting citizens directly with the municipal sanitation crews responsible for keeping their neighborhoods spotless.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={scrollToWizard}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>REPORT WASTE NOW</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("map")}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>EXPLORE CLEANLINESS MAP</span>
              </button>
            </div>

            {/* Floating Live KPI Badges */}
            <div className="mt-14 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  87%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  Cleanliness Score
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {incidents.length + 140}+
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  Active Reports
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  42
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  Resolved Today
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REPORTING WIZARD */}
      <section ref={wizardRef} className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Citizen Intake Console
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Submit an Urban Waste Incident
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
            Take or drop a photo. CleanWard AI analyzes the waste hazard and dispatches the optimal ward crew in seconds.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: "01", title: "CAPTURE" },
              { num: "02", title: "LOCATE" },
              { num: "03", title: "ANALYZE" },
              { num: "04", title: "SUBMIT" },
            ].map((step, idx) => {
              const stepNum = idx + 1;
              const isCurrent = currentStep === stepNum;
              const isDone = currentStep > stepNum;

              return (
                <button
                  key={step.num}
                  onClick={() => {
                    if (currentStep !== 5) setCurrentStep(stepNum);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-sm"
                      : isDone
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      : "bg-transparent border-slate-200/50 dark:border-slate-800/50 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {step.num}
                    </span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="text-xs font-bold mt-1 tracking-wider uppercase">
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-8 transition-all">
          {/* STEP 1: CAPTURE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Capture or Select Waste Image
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload an authentic municipal street photograph or select one of the calibrated demo incident types below.
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  DROP WASTE PHOTO HERE
                </p>
                <p className="text-xs text-slate-400 mt-1">or use your camera / click to browse files</p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm hover:bg-emerald-500">
                    Take Photo
                  </span>
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Upload File
                  </span>
                </div>
              </div>

              {/* Sample Calibrated Images (5 required options) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Or Select Calibrated Sample Incident:
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    1-Click Auto Simulation
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {SAMPLE_IMAGES.map((sample) => {
                    const isSelected = sampleType === sample.id;
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="h-20 w-full overflow-hidden bg-slate-100">
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                            {sample.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {sample.category}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Continue to Step 2 Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Proceed to Location (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 2: Pinpoint Incident Location
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click on the map or use your device GPS. Drag the custom pin to adjust the precise reporting spot.
                </p>
              </div>

              {/* Location Bar & GPS trigger */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{detectedWard}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Geo-Verified
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {detectedArea} • Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                      {gpsAccuracy && ` (±${Math.round(gpsAccuracy)}m accuracy)`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : ""}`} />
                  <span>{isLocating ? "Acquiring GPS..." : "USE CURRENT LOCATION"}</span>
                </button>
              </div>

              {locationError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Real Leaflet Map with Draggable Pin */}
              <div className="relative">
                <LeafletMap
                  heightClass="h-[380px]"
                  initialCenter={[coords.lat, coords.lng]}
                  initialZoom={15}
                  draggablePin={coords}
                  onPinChange={handlePinDrag}
                  allowClickToPlace={true}
                  userLocation={gpsAccuracy ? { ...coords, accuracy: gpsAccuracy } : null}
                  showControls={true}
                />
                <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm pointer-events-none">
                  💡 Click map or drag pin to position
                </div>
              </div>

              {/* Step Navigation */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    if (selectedImage) runAiAnalysis(selectedImage);
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Analyze with AI (Step 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ANALYZE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 3: Cinematic AI Vision Diagnostic
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  CleanWard AI neural vision pipeline extracts hazardous objects, evaluates biohazard risk, and calculates crew load.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Image with Scanning Laser Effect */}
                <div className="lg:col-span-6 relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Waste Incident"
                      className="w-full h-full object-cover opacity-90"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Scanning HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase bg-black/70 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                        AI VISION ACTIVE • {aiAnalysis.confidence}% CONFIDENCE
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300">
                        FPS: 30
                      </span>
                    </div>

                    {/* Detected Object Bounding Box Annotations */}
                    <div className="space-y-1.5">
                      {aiAnalysis.detectedObjects.map((obj, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-emerald-500/30 text-[10px] text-white font-medium mr-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moving Green Laser Beam when scanning */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-[bounce_2s_infinite]"></div>
                      <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                    </div>
                  )}
                </div>

                {/* Right: AI Diagnostic Insight Panel */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✦</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          AI Neural Triage Insight
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        {aiAnalysis.confidence}% ACCURACY
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {aiAnalysis.category}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <SeverityBadge severity={aiAnalysis.severity} size="md" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {aiAnalysis.dispatchUrgency}
                        </span>
                      </div>
                    </div>

                    {/* Health Hazard assessment */}
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Public Health & Environmental Risk</span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-200 mt-1">
                        {aiAnalysis.healthHazard}
                      </p>
                    </div>

                    {/* AI Description */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        AI Operational Summary
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {aiAnalysis.description}
                      </p>
                    </div>

                    {/* Crew recommendations */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium">Est. Waste Mass</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          ~{aiAnalysis.estimatedVolumeKg} kg
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium">Recommended Squad</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {aiAnalysis.recommendedCrewSize}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => runAiAnalysis(selectedImage || "", sampleType)}
                      disabled={isScanning}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                      <span>Re-Run AI Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Review & Submit (Step 4)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 4: Review Municipal Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm reporter contact details and review the final intake dossier before dispatching to the ward officer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dossier Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedImage || ""}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {aiAnalysis.category}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <SeverityBadge severity={aiAnalysis.severity} size="sm" />
                        <span className="text-[11px] text-slate-500">
                          {aiAnalysis.confidence}% Conf.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Ward:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {detectedWard}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Area / Landmark:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {detectedArea}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GPS Coordinates:</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reporter Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Reporter Name
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. S. Rao"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Citizen Mobile / WhatsApp (for status SMS)
                    </label>
                    <input
                      type="text"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="+91 98480 22334"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Additional Field Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="e.g. Waste is blocking the storm drain gate right in front of the tea stall."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  className="px-8 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SUBMIT REPORT & DISPATCH CREW</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS STATE */}
          {currentStep === 5 && createdTicket && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Municipal Incident Registered
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Ticket {createdTicket.ticketId}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Your waste complaint has been transmitted to {createdTicket.ward} sanitation headquarters. An automated dispatch alert has been generated.
                </p>
              </div>

              {/* Status Tracker */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-wider">
                    {createdTicket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 font-medium">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {createdTicket.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Resolution SLA</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Within 4 Hours (Standard Beat)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdTicket.ticketId);
                    setCopiedTicket(true);
                    setTimeout(() => setCopiedTicket(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedTicket ? "Copied to Clipboard!" : "Copy Ticket ID"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedIncident(createdTicket);
                    setActiveTab("officer");
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Track in Command Center</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setCreatedTicket(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Report Another Incident
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. VISUAL STORYTELLING: HOW CLEANWARD WORKS */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Closed-Loop Municipal Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              From Citizen Photo to Certified Clean Street
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              CleanWard AI bridges community participation and municipal crew dispatch through computer vision diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: "01", title: "See It", desc: "Citizen spots uncollected waste in their neighborhood" },
              { num: "02", title: "Report It", desc: "Upload a photo via mobile in under 15 seconds" },
              { num: "03", title: "Understand It", desc: "AI Vision analyzes waste volume, hazard, & priority" },
              { num: "04", title: "Act On It", desc: "Ward officer dispatches tipper & sanitation crew" },
              { num: "05", title: "Verify It", desc: "Before/After proof photo uploaded & verified" },
              { num: "06", title: "Cleaner City", desc: "Telemetry feeds recurring hotspot prediction" },
            ].map((step) => (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xl font-black text-emerald-600/40 dark:text-emerald-400/40 font-mono">
                    {step.num}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECENT VERIFIED CLEANUPS (Before / After Showcase) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Verified Public Record
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Before & After Community Resolutions
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("officer")}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Operational Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <BeforeAfterSlider
              beforeImage={SAMPLE_IMAGES[0].url}
              afterImage="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80"
              className="h-64 sm:h-72 w-full"
            />
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-900 dark:text-white">
                Ward 14 • Station Road Corner
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Resolved in 1h 42m
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <BeforeAfterSlider
              beforeImage={SAMPLE_IMAGES[3].url}
              afterImage="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80"
              className="h-64 sm:h-72 w-full"
            />
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-900 dark:text-white">
                Ward 14 • Sabzi Mandi West Gate
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Resolved in 2h 15m
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
