import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "20mb" }));

const PORT = 3000;

// Lazy initialize Gemini client to avoid crashes on startup
let aiClient: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback estimation math
function calculateFallbackEstimate(params: {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: number;
  service: number;
  accident: number;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Custom base values depending on South African car segment popular models
  const makeLower = params.make.toLowerCase();
  const modelLower = params.model.toLowerCase();
  
  let baseValue = 400000; // default average brand new price
  
  if (makeLower.includes("toyota")) {
    if (modelLower.includes("hilux") || modelLower.includes("fortuner") || modelLower.includes("prado")) {
      baseValue = 680000;
    } else if (modelLower.includes("corolla") || modelLower.includes("cross")) {
      baseValue = 380000;
    } else if (modelLower.includes("starlet") || modelLower.includes("vitz") || modelLower.includes("yaris")) {
      baseValue = 240000;
    } else {
      baseValue = 420000;
    }
  } else if (makeLower.includes("bmw")) {
    if (modelLower.includes("3") || modelLower.includes("320") || modelLower.includes("120") || modelLower.includes("1")) {
      baseValue = 750000;
    } else if (modelLower.includes("5") || modelLower.includes("x3") || modelLower.includes("x5")) {
      baseValue = 1100000;
    } else {
      baseValue = 850000;
    }
  } else if (makeLower.includes("mercedes") || makeLower.includes("benz") || makeLower.includes("merc")) {
    if (modelLower.includes("c") || modelLower.includes("a-class")) {
      baseValue = 820000;
    } else if (modelLower.includes("e") || modelLower.includes("gle") || modelLower.includes("glc")) {
      baseValue = 1200000;
    } else {
      baseValue = 900000;
    }
  } else if (makeLower.includes("vw") || makeLower.includes("volkswagen")) {
    if (modelLower.includes("polo") || modelLower.includes("vivo")) {
      baseValue = 290000;
    } else if (modelLower.includes("golf") || modelLower.includes("gti") || modelLower.includes("r")) {
      baseValue = 550000;
    } else if (modelLower.includes("tiguan") || modelLower.includes("t-cross") || modelLower.includes("amarok")) {
      baseValue = 620000;
    } else {
      baseValue = 390000;
    }
  } else if (makeLower.includes("ford")) {
    if (modelLower.includes("ranger")) {
      baseValue = 650000;
    } else if (modelLower.includes("everest")) {
      baseValue = 850000;
    } else if (modelLower.includes("eco") || modelLower.includes("ecosport") || modelLower.includes("fiesta")) {
      baseValue = 310000;
    } else {
      baseValue = 480000;
    }
  } else if (makeLower.includes("audi")) {
    if (modelLower.includes("a3") || modelLower.includes("q3")) {
      baseValue = 600000;
    } else if (modelLower.includes("a4") || modelLower.includes("a5") || modelLower.includes("q5")) {
      baseValue = 850000;
    } else {
      baseValue = 720000;
    }
  } else if (makeLower.includes("hyundai") || makeLower.includes("kia")) {
    if (modelLower.includes("i10") || modelLower.includes("grand i10") || modelLower.includes("picanto")) {
      baseValue = 210000;
    } else if (modelLower.includes("i20") || modelLower.includes("i30") || modelLower.includes("rio")) {
      baseValue = 320000;
    } else if (modelLower.includes("tucson") || modelLower.includes("sportage") || modelLower.includes("creta")) {
      baseValue = 520000;
    } else {
      baseValue = 350000;
    }
  } else if (makeLower.includes("suzuki")) {
    if (modelLower.includes("swift") || modelLower.includes("ignis") || modelLower.includes("celerio")) {
      baseValue = 220000;
    } else if (modelLower.includes("jimny")) {
      baseValue = 410000;
    } else if (modelLower.includes("grand") || modelLower.includes("vitara") || modelLower.includes("ertiga")) {
      baseValue = 340000;
    } else {
      baseValue = 260000;
    }
  }

  // Depreciation: 10% to 14% compound per year depending on age, cap at 15 years
  const age = Math.min(Math.max(currentYear - params.year, 0), 20);
  const depRate = age <= 3 ? 0.88 : age <= 7 ? 0.86 : 0.85; // newer cars deprecate slightly slower
  let retail = baseValue * Math.pow(depRate, age);

  // Mileage penalty relative to age (average SA mileage is 15,000 km/year)
  const expectedMileage = age * 15000;
  let kmImpact = 0;
  if (params.mileage > expectedMileage) {
    // excess mileage penalty
    const excessKm = params.mileage - expectedMileage;
    kmImpact = (excessKm / 15000) * 0.04; // 4% penalty per extra 15k
  } else if (params.mileage < expectedMileage && params.mileage > 0) {
    // low mileage bonus
    const lowKmBonus = Math.min(((expectedMileage - params.mileage) / 15000) * 0.025, 0.15); // max 15% bonus
    retail = retail * (1 + lowKmBonus);
  }
  
  retail = retail * (1 - Math.min(kmImpact, 0.5));

  // Multipliers
  retail = retail * params.condition * params.service;

  // Accident adjustments
  if (params.accident === 1) {
    // Yes, heavy accident history
    retail *= 0.70;
  } else if (params.accident === 0.5) {
    // Unsure or minor damage
    retail *= 0.88;
  }

  // Cap minimum value at R15,000 to keep it realistic for running vehicles
  if (retail < 15000) {
    retail = 15000;
  }

  // Dealer trade range is typically 15% to 22% lower than retail, depending on reconditioning needed
  let dealerBase = retail * 0.81;
  let recon = 6000 + params.mileage * 0.04; // reconditioning accumulates with mileage
  
  if (params.condition < 1) {
    recon += 12000; // needs repair
  } else if (params.condition > 1) {
    recon = Math.max(2000, recon - 3000); // pristine needs very little
  }
  
  let dealerAppraisal = dealerBase - recon;
  if (dealerAppraisal < 10000) {
    dealerAppraisal = 10000;
  }

  const roundedRetail = Math.round(retail / 1000) * 1000;
  const roundedMin = Math.round((dealerAppraisal * 0.93) / 1000) * 1000;
  const roundedMax = Math.round((dealerAppraisal * 1.05) / 1000) * 1000;

  let demand: "Low" | "Medium" | "High" | "Very High" = "Medium";
  if (makeLower.includes("toyota") || makeLower.includes("vw") || makeLower.includes("suzuki")) {
    demand = params.mileage < 120000 ? "Very High" : "High";
  } else if (makeLower.includes("bmw") || makeLower.includes("mercedes") || makeLower.includes("audi")) {
    demand = params.year >= currentYear - 5 ? "High" : "Medium";
  } else if (params.accident === 1 || params.condition < 0.8) {
    demand = "Low";
  }

  return {
    retailValue: roundedRetail,
    dealerMin: roundedMin,
    dealerMax: roundedMax,
    marketDemand: demand,
    aiRemarks: `Our AI estimation for this ${params.year} ${params.make} ${params.model} indicates a solid market status in SA as a ${demand} demand vehicle. Adjusted for ${params.mileage.toLocaleString()} km, ${params.condition >= 1.05 ? "pristine" : params.condition >= 1.0 ? "good" : "fair"} condition, and service history. This provides an excellent entry valuation prior to a visual check at our Pretoria showroom.`,
  };
}

// REST API Route for Smart AI Estimates
app.post("/api/estimate", async (req, res) => {
  const {
    make,
    model,
    year,
    mileage,
    transmission,
    fuel,
    condition,
    service,
    accident,
    settlement,
    notes,
    photoDataList, // Array of base64 photos optionally provided
  } = req.body;

  if (!make || !model || !year) {
    return res.status(400).json({ error: "Make, Model, and Year are required." });
  }

  // Parse fields
  const parsedYear = parseInt(year) || 2018;
  const parsedMileage = parseInt(mileage) || 0;
  const parsedCondition = parseFloat(condition) || 1.0;
  const parsedService = parseFloat(service) || 1.0;
  const parsedAccident = parseFloat(accident) || 0;
  const parsedSettlement = parseFloat(settlement) || 0;

  // Compute offline first as standard/fallback
  const fallback = calculateFallbackEstimate({
    make,
    model,
    year: parsedYear,
    mileage: parsedMileage,
    condition: parsedCondition,
    service: parsedService,
    accident: parsedAccident,
  });

  const ai = getAI();
  if (!ai) {
    // No Gemini key configured or empty, return the robust fallback with flag
    return res.json({
      ...fallback,
      isAIReal: false,
      disclaimer: "Offline/Mathematical estimate computed. Connect Gemini API in Secrets for fully customized vehicle intelligence.",
    });
  }

  try {
    // Condition, Service, Accident textual representations
    let conditionText = "Good";
    if (parsedCondition > 1.02) conditionText = "Excellent / Pristine";
    if (parsedCondition < 0.95) conditionText = "Average / Fair";
    if (parsedCondition < 0.8) conditionText = "Needs Urgent Reconditioning";

    let serviceText = "Full Service History (FSH)";
    if (parsedService === 0.9) serviceText = "Partial / Digital Service History";
    if (parsedService === 0.8) serviceText = "No Service History / Owner Serviced";

    let accidentText = "No Accidents reported";
    if (parsedAccident === 1) accidentText = "Yes, previous structural damage/accident repair";
    if (parsedAccident === 0.5) accidentText = "Unsure / minor fender bender repairs";

    // Build parts for Gemini API call
    const parts: any[] = [];

    // Attach up to 2 base64 photos to the prompt for visual analysis (if provided to save payload/tokens)
    const activePhotos = Array.isArray(photoDataList) ? photoDataList.filter((p: any) => p && p.base64) : [];
    
    for (let i = 0; i < Math.min(activePhotos.length, 2); i++) {
      const match = activePhotos[i].base64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const textualPrompt = `
      You are a premium vehicle evaluator at Mit Mak Motors showroom, Pretoria, South Africa.
      Evaluate this vehicle and return a precise valuation in South African Rands (ZAR).
      
      VEHICLE DETAILS:
      - Make: ${make}
      - Model: ${model}
      - Year: ${parsedYear}
      - Mileage: ${parsedMileage.toLocaleString()} km
      - Transmission: ${transmission || "Automatic"}
      - Fuel Type: ${fuel || "Petrol"}
      - Declared Condition: ${conditionText}
      - Service History: ${serviceText}
      - Accident History: ${accidentText}
      - Additional Seller Notes: ${notes || "None"}
      - Settlement Owed: R ${parsedSettlement.toLocaleString()}
      
      FALLBACK REFERENCE CODES (Use this as your baseline anchor so estimates are grounded with our pricing calculator):
      - Expected baseline Retail: R ${fallback.retailValue.toLocaleString()}
      - Expected baseline Dealer Range: R ${fallback.dealerMin.toLocaleString()} - R ${fallback.dealerMax.toLocaleString()}
      
      Please analyze the vehicle, adjust the prices realistically (usually within 15% of fallback reference unless visual factors or unique model information suggests otherwise).
      If images are attached, inspect them for aesthetic appeal, color, paint quality, dashboard layout, or notable factors and comment on them briefly in your AI Remarks.
      
      You must respond with a strictly formatted JSON object matching this schema:
      {
        "retailValue": number,
        "dealerMin": number,
        "dealerMax": number,
        "marketDemand": "Low" | "Medium" | "High" | "Very High",
        "aiRemarks": "2-3 sentences of direct appraisal breakdown mentioning strengths, weaknesses, South African resale popularity, and visual commentary if any image is provided"
      }
    `;

    parts.push({ text: textualPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            retailValue: { type: Type.NUMBER, description: "Highly realistic estimated retail market price in ZAR" },
            dealerMin: { type: Type.NUMBER, description: "Realistic minimum buy-in trade value in ZAR" },
            dealerMax: { type: Type.NUMBER, description: "Realistic maximum buy-in trade value in ZAR" },
            marketDemand: { type: Type.STRING, description: "ZAR Market demand level: Low, Medium, High, or Very High" },
            aiRemarks: { type: Type.STRING, description: "A friendly, professional analysis written in Mit Mak style." },
          },
          required: ["retailValue", "dealerMin", "dealerMax", "marketDemand", "aiRemarks"],
        },
      },
    });

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      retailValue: parsedResponse.retailValue || fallback.retailValue,
      dealerMin: parsedResponse.dealerMin || fallback.dealerMin,
      dealerMax: parsedResponse.dealerMax || fallback.dealerMax,
      marketDemand: parsedResponse.marketDemand || fallback.marketDemand,
      aiRemarks: parsedResponse.aiRemarks || fallback.aiRemarks,
      isAIReal: true,
    });
  } catch (error: any) {
    console.error("Gemini appraisal error, using fallback instead:", error);
    return res.json({
      ...fallback,
      isAIReal: false,
      disclaimer: "Computed via local appraisal algorithms. Connect or update Secrets to power live visual/AI insights.",
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamic import to avoid loading Vite package in production
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mit Mak Motors Appraisal server started on host 0.0.0.0 and port ${PORT}`);
  });
}

startServer();
