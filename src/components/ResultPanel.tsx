import React, { useState } from "react";
import { EstimateResult, ContactDetails, VehicleDetails, PhotoUpload } from "../types";
import { 
  Send, 
  RotateCcw, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle,
  BadgeCent,
  UserCheck,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface ResultPanelProps {
  result: EstimateResult;
  contact: ContactDetails;
  vehicle: VehicleDetails;
  photos: PhotoUpload[];
  onReset: () => void;
}

export default function ResultPanel({
  result,
  contact,
  vehicle,
  photos,
  onReset,
}: ResultPanelProps) {
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  // Settlement and Net Trade in Calculations
  const settlementValue = parseFloat(vehicle.settlement) || 0;
  const averagePrice = (result.dealerMin + result.dealerMax) / 2;
  const netDealerPayout = Math.max(0, averagePrice - settlementValue);

  // Custom styling depending on dynamic demand rating
  const getDemandPill = (demand: string) => {
    switch (demand) {
      case "Very High":
        return "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30";
      case "High":
        return "bg-teal-950/80 text-teal-400 border border-teal-500/30";
      case "Medium":
        return "bg-brand-gold/15 text-brand-gold border border-brand-gold/30";
      default:
        return "bg-amber-950/80 text-amber-500 border border-amber-500/30";
    }
  };

  const getConditionText = (val: number) => {
    if (val === 1.05) return "Excellent";
    if (val === 1.0) return "Good";
    if (val === 0.9) return "Average";
    return "Needs Work";
  };

  const getServiceHistoryText = (val: number) => {
    if (val === 1) return "Full History";
    if (val === 0.9) return "Partial History";
    return "No History";
  };

  const getAccidentHistoryText = (val: number) => {
    if (val === 0) return "No Accidents";
    if (val === 1) return "Yes, Structural Repaired";
    return "Unsure / Minor Damage";
  };

  // Build and parse the WhatsApp text sequence
  const executeWhatsAppLink = () => {
    let msg = `*Mit Mak Motors Appraisal Request*\n\n`;
    msg += `*Customer:* ${contact.name}\n`;
    msg += `*Phone:* ${contact.phone}\n`;
    msg += `*Location:* ${contact.location}\n\n`;
    msg += `*Vehicle:* ${vehicle.year} ${vehicle.make} ${vehicle.model}\n`;
    msg += `*Mileage:* ${vehicle.mileage.toLocaleString()} km\n`;
    msg += `*Transmission:* ${vehicle.transmission}\n`;
    msg += `*Fuel:* ${vehicle.fuel}\n`;
    msg += `*Condition:* ${getConditionText(vehicle.condition)}\n`;
    msg += `*Service:* ${getServiceHistoryText(vehicle.service)}\n`;
    msg += `*Accidents:* ${getAccidentHistoryText(vehicle.accident)}\n`;
    msg += `*Settlement Amount:* R ${settlementValue.toLocaleString()}\n\n`;
    msg += `*AI Estimate*\n`;
    msg += `Retail Value: R ${result.retailValue.toLocaleString()}\n`;
    msg += `Dealer Range: R ${result.dealerMin.toLocaleString()} - R ${result.dealerMax.toLocaleString()}\n\n`;
    msg += `*Notes:* ${vehicle.notes || "None Entered"}\n\n`;
    msg += `_Photos Captured: ${photos.length} of 8 uploaded on preview._`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/27825426659?text=${encodedMsg}`;
    
    // Open in parent frame or secondary tab safely
    window.open(waUrl, "_blank");
    setShowRedirectModal(false);
  };

  return (
    <div id="result" className="space-y-6 scroll-mt-6">
      
      {/* Primary Valuation Hero Card */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 shadow-[0_10px_35px_rgba(0,0,0,0.8)] relative mt-4">
        <div className="absolute -top-3 -left-3 bg-red-600 text-[10px] font-black px-2.5 py-1 uppercase tracking-widest">
          Live Result
        </div>

        {/* Retail price visual */}
        <div className="space-y-1 relative z-10 pt-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold block">
            Estimated Market Value
          </span>
          <h2 id="retail-val" className="text-5xl sm:text-6xl font-black text-white font-display tracking-tighter">
            R {result.retailValue.toLocaleString()}
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
            Average market listing price in South Africa
          </p>
        </div>

        {/* Dealer Range visual */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center relative z-10">
          <div className="text-left space-y-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">
              Dealer Buy-In Range
            </span>
            <div id="dealer-val" className="text-xl sm:text-2xl font-black text-red-500 font-display uppercase tracking-tight">
              R {result.dealerMin.toLocaleString()} — R {result.dealerMax.toLocaleString()}
            </div>
            <span id="recon-msg" className="text-[10px] text-gray-500 uppercase tracking-tight block">
              Adjusted for Pretoria dealer margin
            </span>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 px-1 text-left sm:text-right">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">
              SA Market Demand Status
            </span>
            <div className={`px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-widest ${getDemandPill(result.marketDemand)}`}>
              {result.marketDemand} Demand
            </div>
          </div>
        </div>

        {/* AI Insight Paragraph block */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded p-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-red-600 font-black block">
                Mit Mak AI Broker Audit Remarks
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                "{result.aiRemarks}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financed settlement ledger if active */}
      {settlementValue > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-inner">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 mb-3">
            <BadgeCent className="w-4 h-4 text-red-600" />
            Financed Settlement Analysis
          </h4>
          <div className="text-xs space-y-2 text-neutral-300">
            <div className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Avg Dealer Value</span>
              <span className="font-mono">R {averagePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1.5 text-red-500 font-medium">
              <span className="text-[10px] text-red-500/80 uppercase font-bold tracking-widest">Outstanding Payoff</span>
              <span className="font-mono">- R {settlementValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-emerald-400 text-sm">
              <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Net Cash payout</span>
              <span className="font-mono">R {netDealerPayout.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Send Submission triggers */}
      <div className="space-y-4">
        <button
          onClick={() => setShowRedirectModal(true)}
          className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-black font-black py-4 rounded-full uppercase tracking-widest text-xs hover:bg-[#20ba59] transition-all cursor-pointer"
        >
          <Send className="w-4 h-4 fill-current text-black" />
          Direct Quote Support
        </button>

        <a
          href="https://www.mitmakmotors.co.za"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-neutral-200 text-black font-black py-4 rounded-full uppercase tracking-widest text-xs transition-all cursor-pointer text-center"
        >
          <ExternalLink className="w-4 h-4 text-red-600" />
          Browse Showroom Stocks
        </a>

        <button
          onClick={onReset}
          className="w-full bg-white/5 border border-white/10 hover:border-red-600 hover:bg-white/10 text-neutral-400 font-bold uppercase tracking-widest text-[10px] py-3.5 rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET APPRAISAL
        </button>

        <p className="text-[10px] text-center text-gray-600 tracking-tight font-mono">
          Valuation based on current market trends across South Africa. Subject to physical inspection at Mit Mak Motors showroom.
        </p>
      </div>

      {/* Redirect Custom Notice Modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-lg max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <span className="w-12 h-12 rounded bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </span>
            </div>
            
            <h3 className="text-center text-xs font-black text-white uppercase tracking-widest font-display">
              ATTENTION VEHICLE SELLER
            </h3>
            
            <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed uppercase tracking-wide">
              In the next step on WhatsApp, please lock in this deal by attaching your vehicle photos from your device to our agent before sending!
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={executeWhatsAppLink}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-black py-3 rounded uppercase font-black text-[11px] tracking-widest transition-all cursor-pointer text-center"
              >
                PROCEED TO WHATSAPP
              </button>
              
              <button
                onClick={() => setShowRedirectModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/10 py-3 rounded font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer text-center"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
