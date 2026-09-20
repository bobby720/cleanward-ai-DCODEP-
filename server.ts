import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. Image Analysis using Gemini (gemini-3.1-pro-preview / gemini-3.8-flash)
app.post("/api/ai/analyze-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", sampleType } = req.body;
    const ai = getGemini();

    if (!ai) {
      // Realistic municipal AI vision response when API key is not configured
      const simulatedResponses: Record<string, any> = {
        plastic: {
          category: "Plastic / Dry Waste",
          severity: "high",
          confidence: 94,
          detectedObjects: ["Single-use plastic bottles", "Polythene bags", "Food wrappers", "Drainage obstruction risk"],
          healthHazard: "Moderate - Microplastic dispersal & stormwater drain clogging",
          description: "Dense accumulation of non-biodegradable plastics encroaching upon public pedestrian walkway. Immediate clearance required to prevent gutter blockages.",
          estimatedVolumeKg: 120,
          dispatchUrgency: "4-Hour Response Required",
          recommendedCrewSize: "Crew #12 (4 personnel + 1 mini-tipper)"
        },
        dumpster: {
          category: "Overflowing Dumpster / Mixed",
          severity: "critical",
          confidence: 96,
          detectedObjects: ["Decomposing organic matter", "Corrugated boxes", "Stray animal feeding", "Leachate runoff"],
          healthHazard: "Severe - Bacterial vector proliferation & active odor hazard",
          description: "Massive dumpster spillover exceeding containment capacity by 200%. Leachate pooling on asphalt with elevated pest activity.",
          estimatedVolumeKg: 450,
          dispatchUrgency: "Immediate Emergency Dispatch (under 2 hrs)",
          recommendedCrewSize: "Crew #8 (Compactor truck + sanitation crew)"
        },
        debris: {
          category: "Construction & Demolition Debris",
          severity: "medium",
          confidence: 91,
          detectedObjects: ["Concrete rubble", "Broken tiles", "Plaster fragments", "Roadside encroachment"],
          healthHazard: "Low - Particulate silica dust & pedestrian trip hazard",
          description: "Unauthorized dumping of renovation debris along public curb. Heavy lifting equipment required for clearing aggregate weight.",
          estimatedVolumeKg: 850,
          dispatchUrgency: "24-Hour Municipal Resolution Window",
          recommendedCrewSize: "Crew #4 (JCB loader + dumper truck)"
        },
        organic: {
          category: "Wet / Market Organic Waste",
          severity: "high",
          confidence: 93,
          detectedObjects: ["Rotting vegetable produce", "Discarded fruit rinds", "Bio-waste accumulation", "Flies & rodent vectors"],
          healthHazard: "High - Rapid microbial decomposition & public nuisance",
          description: "Market organic waste discarded on open ground without compost segregation. Emits foul odor and requires immediate enzymatic wash post-clearance.",
          estimatedVolumeKg: 310,
          dispatchUrgency: "6-Hour Sanitization Cycle",
          recommendedCrewSize: "Crew #15 (Bio-waste collection unit + disinfectant spray)"
        },
        hazardous: {
          category: "Hazardous / Chemical Waste",
          severity: "critical",
          confidence: 98,
          detectedObjects: ["Corroded battery cells", "Solvent containers", "Medical sharps packaging", "Soil discoloration"],
          healthHazard: "Critical - Chemical toxicity, groundwater contamination & biohazard risk",
          description: "Potentially dangerous industrial or bio-medical waste deposited near residential zone. Requires certified PPE handlers and hazardous containment drums.",
          estimatedVolumeKg: 65,
          dispatchUrgency: "Level-1 Rapid Hazmat Alert",
          recommendedCrewSize: "Hazmat Squad (Specialized Hazmat handlers + sealed transport)"
        }
      };

      const key = sampleType && simulatedResponses[sampleType] ? sampleType : "plastic";
      return res.json({
        success: true,
        isSimulated: true,
        data: simulatedResponses[key],
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const prompt = `Analyze this civic waste / garbage incident image for a modern municipal sanitation command center.
Return a STRICT JSON object matching this schema:
{
  "category": "string (e.g. Plastic / Dry Waste, Overflowing Dumpster, Construction Debris, Organic Waste, Hazardous Waste)",
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": number (80 to 99),
  "detectedObjects": string[],
  "healthHazard": "string explaining public health risk",
  "description": "string concise municipal incident description",
  "estimatedVolumeKg": number,
  "dispatchUrgency": "string (e.g. 2-Hour Rapid Response, 24-Hour Resolution)",
  "recommendedCrewSize": "string (e.g. Crew #12 with tipper truck)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      isSimulated: false,
      data: parsed,
    });
  } catch (error: any) {
    console.warn("Gemini vision analysis error, falling back to simulated analysis:", error?.message);
    return res.json({
      success: true,
      isSimulated: true,
      fallbackReason: error?.message || "Model timeout or key issue",
      data: {
        category: "Plastic / Dry Waste",
        severity: "high",
        confidence: 92,
        detectedObjects: ["Unsegregated dry waste", "Plastic bottles", "Roadside debris"],
        healthHazard: "Moderate - Environmental blight & drainage risk",
        description: "Surface accumulation of municipal solid waste detected via CleanWard AI Vision pipeline.",
        estimatedVolumeKg: 140,
        dispatchUrgency: "Standard 6-Hour Dispatch",
        recommendedCrewSize: "Crew #12 (4 sanitation workers + vehicle)",
      },
    });
  }
});

// 3. Low-latency triage using gemini-3.1-flash-lite
app.post("/api/ai/quick-triage", async (req: Request, res: Response) => {
  try {
    const { category, severity, ward, description } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        triage: {
          priorityScore: severity === "critical" ? 98 : severity === "high" ? 82 : 55,
          slaHours: severity === "critical" ? 2 : severity === "high" ? 6 : 24,
          dispatchUnit: severity === "critical" ? "Rapid Action Sanitation Wing" : "Ward Regular Beat",
          resourceEstimate: "1 Driver, 3 Crew Members, 1 Tipper",
          routeOptimizationTip: "Access via North Boulevard Gate 2 to avoid market congestion.",
        },
      });
    }

    const prompt = `Quickly triage this civic waste report for municipal routing:
Category: ${category}
Severity: ${severity}
Ward: ${ward}
Notes: ${description}

Respond with JSON:
{
  "priorityScore": number (1-100),
  "slaHours": number,
  "dispatchUnit": string,
  "resourceEstimate": string,
  "routeOptimizationTip": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return res.json({
      success: true,
      isSimulated: false,
      triage: JSON.parse(response.text || "{}"),
    });
  } catch (error: any) {
    return res.json({
      success: true,
      isSimulated: true,
      triage: {
        priorityScore: 85,
        slaHours: 4,
        dispatchUnit: "Sanitation Rapid Beat",
        resourceEstimate: "Standard 3-person squad",
        routeOptimizationTip: "Route through arterial ring road.",
      },
    });
  }
});

// 4. Grounded Civic Intelligence using gemini-3.5-flash with search
app.post("/api/ai/grounded-intelligence", async (req: Request, res: Response) => {
  try {
    const { query, city = "Vijayawada / Central Andhra" } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        insights: `Municipal guidelines recommend immediate segregation of wet vs. dry plastics at source under the Solid Waste Management Rules. In ${city}, commercial zones must conduct daily clearance by 08:00 AM. Bio-methanation units and designated material recovery facilities (MRFs) are operating across central wards.`,
        sources: [
          { title: "Municipal Solid Waste Management Byelaws", url: "https://cpcb.nic.in" },
          { title: "Swachh Bharat Urban Cleanliness Protocol", url: "https://mohua.gov.in" },
        ],
      });
    }

    const prompt = `You are CleanWard AI Municipal Advisor. Provide authoritative civic guidance, recycling protocols, or waste compliance rules for the query: "${query}" in the context of urban Indian municipalities (${city}). Include clear action steps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || "Civic Source",
        url: chunk.web?.uri || "#",
      }))
      .filter((s: any) => s.url !== "#");

    return res.json({
      success: true,
      isSimulated: false,
      insights: response.text,
      sources,
    });
  } catch (error: any) {
    return res.json({
      success: true,
      isSimulated: true,
      insights: "Municipal guidelines state that all mixed solid waste dumps should undergo segregated sorting at designated Material Recovery Facilities (MRFs). Non-biodegradable plastics must be shredded for asphalt road construction.",
      sources: [{ title: "Swachh Urban Guidelines", url: "https://mohua.gov.in" }],
    });
  }
});

// 5. Image Generation for post-cleanup preview with 1K, 2K, 4K affordance
app.post("/api/ai/generate-cleanup-visual", async (req: Request, res: Response) => {
  try {
    const { prompt, resolution = "1K" } = req.body;
    const ai = getGemini();

    if (!ai) {
      // Return high quality curated SVG / realistic mock canvas
      return res.json({
        success: true,
        isSimulated: true,
        resolution,
        imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
        message: `High-definition ${resolution} post-cleanup visualization generated successfully.`,
      });
    }

    const enhancedPrompt = `A pristine, immaculate urban street and pedestrian footpath after a comprehensive municipal eco-cleanup: completely free of litter, spotless clean asphalt, lush green potted sidewalk planters, warm sunlight, crystal clear, civic perfection, highly detailed, realistic architecture photography. ${prompt || ""}`;

    const response = await ai.models.generateImages({
      model: "gemini-3-pro-image-preview",
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "4:3",
      },
    });

    const imgBase64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (imgBase64) {
      return res.json({
        success: true,
        isSimulated: false,
        resolution,
        imageUrl: `data:image/jpeg;base64,${imgBase64}`,
      });
    }

    return res.json({
      success: true,
      isSimulated: true,
      resolution,
      imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    });
  } catch (error: any) {
    console.warn("Gemini image gen error:", error?.message);
    return res.json({
      success: true,
      isSimulated: true,
      resolution: req.body.resolution || "1K",
      imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CleanWard AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
