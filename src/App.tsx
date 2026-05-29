import React, { useState } from "react";
import { ContactDetails, VehicleDetails, PhotoUpload, EstimateResult } from "./types";
import IntroAnimation from "./components/IntroAnimation";
import AppraisalForm from "./components/AppraisalForm";
import PhotoUploadGrid from "./components/PhotoUpload";
import ResultPanel from "./components/ResultPanel";
import { 
  Car, 
  MapPin, 
  PhoneCall, 
  Award, 
  Clock, 
  Users, 
  FileCheck,
  Building,
  ShieldCheck,
  Star,
  ExternalLink
} from "lucide-react";

export default function App() {
  const [introActive, setIntroActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // App primary States
  const [contact, setContact] = useState<ContactDetails>({
    name: "",
    phone: "",
    location: "",
  });

  const [vehicle, setVehicle] = useState<VehicleDetails>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    transmission: "Automatic",
    fuel: "Petrol",
    condition: 1.0,
    service: 1.0,
    accident: 0.0,
    settlement: "",
    notes: "",
  });

  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [result, setResult] = useState<EstimateResult | null>(null);

  // Trigger server-side AI or Fallback calculation
  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Map base64 photolist to small payload representation to send to Gemini
      const photolist = photos.map((p) => ({
        id: p.id,
        base64: p.base64,
      }));

      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...vehicle,
          ...contact,
          photoDataList: photolist,
        }),
      });

      if (!res.ok) {
        throw new Error("Valuation service responded with error status");
      }

      const data: EstimateResult = await res.json();
      setResult(data);
      
      // Smooth scroll down to calculation block for immediate view
      setTimeout(() => {
        const resultBlock = document.getElementById("result");
        if (resultBlock) {
          resultBlock.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (err: any) {
      console.error(err);
      setError("AI calculation timed out or service offline. Showing computerized fallback values instead.");
      
      // Compute direct local fallback if API fails
      // Base calculation math
      let baseValue = 400000;
      const age = Math.min(Math.max(new Date().getFullYear() - vehicle.year, 0), 20);
      const depRate = 0.88;
      let retail = baseValue * Math.pow(depRate, age);
      
      const expectedMileage = age * 15000;
      let kmImpact = 0;
      if (vehicle.mileage > expectedMileage) {
        const excessKm = vehicle.mileage - expectedMileage;
        kmImpact = (excessKm / 15000) * 0.05;
      }
      retail = retail * (1 - Math.min(kmImpact, 0.5));
      retail = retail * vehicle.condition * vehicle.service;

      if (vehicle.accident === 1) retail *= 0.70;
      if (vehicle.accident === 0.5) retail *= 0.88;
      if (retail < 20000) retail = 20000;

      let dealerBase = retail * 0.82;
      let recon = 6000 + vehicle.mileage * 0.04;
      let dealerAppraisal = dealerBase - recon;
      if (dealerAppraisal < 12000) dealerAppraisal = 12000;

      const roundedRetail = Math.round(retail / 1000) * 1000;
      const roundedMin = Math.round((dealerAppraisal * 0.94) / 1000) * 1000;
      const roundedMax = Math.round((dealerAppraisal * 1.05) / 1000) * 1000;

      setResult({
        retailValue: roundedRetail,
        dealerMin: roundedMin,
        dealerMax: roundedMax,
        marketDemand: "Medium",
        aiRemarks: `Computer calculated valuation computed. Adjusted for ${vehicle.mileage.toLocaleString()} km and service history. Visit the Pretoria showroom for custom manual checks.`,
        isAIReal: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContact({ name: "", phone: "", location: "" });
    setVehicle({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: 0,
      transmission: "Automatic",
      fuel: "Petrol",
      condition: 1.0,
      service: 1.0,
      accident: 0.0,
      settlement: "",
      notes: "",
    });
    setPhotos([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (introActive) {
    return <IntroAnimation onComplete={() => setIntroActive(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background watermark decorations */}
      <div className="absolute -right-20 top-40 rotate-90 origin-center opacity-[0.02] select-none pointer-events-none z-0">
        <h1 className="text-[180px] sm:text-[240px] font-black tracking-tighter text-white">MITMAK</h1>
      </div>

      {/* Upper header */}
      <header className="border-b border-white/10 bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="logo-mmm text-4xl font-black tracking-tighter text-red-600 select-none italic">
              MMM
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
            <div className="hidden sm:block">
              <div className="text-xs font-black tracking-[0.2em] text-white uppercase leading-none">
                Mit Mak Motors
              </div>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono font-bold leading-none block mt-1">
                South Africa’s Trusted Dealership
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <a 
              href="https://www.mitmakmotors.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 font-black uppercase tracking-wider text-red-500 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-600" />
              Visit Showroom
            </a>
            <a 
              href="tel:27825426659" 
              className="flex items-center gap-1.5 font-black uppercase tracking-wider text-white hover:text-red-500 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              082 542 6659
            </a>
            <span className="hidden md:flex items-center gap-1.5 text-gray-400 uppercase tracking-wider font-bold">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              Pretoria Showroom
            </span>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 relative z-10">
        
        {/* Welcome Text block */}
        <div className="mb-12 text-center sm:text-left space-y-4">
          <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
            <span className="h-[2px] w-12 bg-red-600"></span>
            <span className="text-[11px] font-black tracking-[0.4em] uppercase text-red-600">Valuation Engine v4.0</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none uppercase">
            Appraisal<br/>
            <span className="text-white/40">Intelligence</span>
          </h1>
          
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed uppercase tracking-wide">
            Get an instant AI-assisted retail market and trade-in range evaluation tailored to South African resale indices. Share with our dispatch desk on WhatsApp to lock in values!
          </p>
        </div>

        {/* Master Column Grid split on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form and photos column */}
          <div className="lg:col-span-8 space-y-8">
            <AppraisalForm 
              contact={contact}
              vehicle={vehicle}
              onContactChange={setContact}
              onVehicleChange={setVehicle}
              onSubmit={handleCalculate}
              loading={loading}
            />

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
              <PhotoUploadGrid 
                photos={photos}
                onChange={setPhotos}
              />
            </div>
          </div>

          {/* Result or info column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            {result ? (
              <ResultPanel 
                result={result}
                contact={contact}
                vehicle={vehicle}
                photos={photos}
                onReset={handleReset}
              />
            ) : (
              /* Information card display when no appraisal exists yet */
              <div className="bg-[#0c0c0c] border border-white/10 rounded-lg p-8 space-y-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 top-32 rotate-90 origin-center opacity-[0.02] select-none pointer-events-none">
                  <h1 className="text-[120px] font-black tracking-tighter">MITMAK</h1>
                </div>

                <div className="space-y-2">
                  <div className="text-red-600 font-black text-4xl tracking-tighter italic">MMM</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Mit Mak Motors</div>
                </div>

                <div className="space-y-4 relative z-10">
                  <h4 className="text-lg font-black tracking-tighter uppercase text-white leading-tight">
                    Showroom Appraisal Pending
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed pb-1">
                    Complete the customer credentials and vehicle specification fields to generate your customized AI estimate score index.
                  </p>
                  <a
                    href="https://www.mitmakmotors.co.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded uppercase tracking-widest text-[11px] font-display transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Browse Showroom Stocks
                  </a>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Mit Mak trust indicators */}
                <div className="space-y-5 text-left relative z-10">
                  <div className="flex items-start gap-4">
                    <span className="bg-red-600/10 text-red-500 p-2 rounded shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white block">Guaranteed Cash Payouts</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Same-day bank settlements and full outstanding payoff.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="bg-red-600/10 text-red-500 p-2 rounded shrink-0">
                      <Star className="w-4 h-4" />
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white block">Pretoria’s No 1 Hub</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Decades of outstanding service with premium dealer trade index appraisals.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="bg-red-600/10 text-red-500 p-2 rounded shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white block">30-Min Visual Checklist</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Quick visual verify at our central Pretoria dealer block to confirm values.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="bg-[#0c0c0c]/90 border-t border-white/10 py-8 text-center text-[10px] text-gray-500 mt-16 space-y-1 font-mono uppercase tracking-widest relative z-10">
        <div>© {new Date().getFullYear()} MIT MAK MOTORS APPRAISAL CENTER, PRETORIA. ALL RIGHTS RESERVED.</div>
        <div className="text-gray-600 text-[9px] mt-1">[ MATCHING YOU WITH YOUR DREAM CAR • NO. 1 IN SOUTH AFRICA ]</div>
      </footer>
    </div>
  );
}
