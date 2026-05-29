import React from "react";
import { ContactDetails, VehicleDetails } from "../types";
import { 
  User, 
  Phone, 
  MapPin, 
  Car, 
  Settings, 
  Gauge, 
  Info, 
  AlertOctagon, 
  CalendarMinus, 
  CheckSquare, 
  SlidersHorizontal,
  FileSpreadsheet
} from "lucide-react";

interface AppraisalFormProps {
  contact: ContactDetails;
  vehicle: VehicleDetails;
  onContactChange: (updated: ContactDetails) => void;
  onVehicleChange: (updated: VehicleDetails) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function AppraisalForm({
  contact,
  vehicle,
  onContactChange,
  onVehicleChange,
  onSubmit,
  loading,
}: AppraisalFormProps) {
  
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 1; y >= 1995; y--) {
    years.push(y);
  }

  const handleContactUpdate = (field: keyof ContactDetails, value: string) => {
    onContactChange({
      ...contact,
      [field]: value,
    });
  };

  const handleVehicleUpdate = (field: keyof VehicleDetails, value: any) => {
    onVehicleChange({
      ...vehicle,
      [field]: value,
    });
  };

  const isFormValid = () => {
    return (
      contact.name.trim() !== "" &&
      contact.phone.trim() !== "" &&
      contact.location.trim() !== "" &&
      vehicle.make.trim() !== "" &&
      vehicle.model.trim() !== "" &&
      vehicle.mileage !== undefined &&
      vehicle.mileage >= 0
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Contact Details Card */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
        <h3 className="text-lg font-black tracking-tighter uppercase text-white mb-6 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-red-600"></span>
          Customer Contact Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Name & Surname"
              value={contact.name}
              id="name"
              onChange={(e) => handleContactUpdate("name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 082 542 6659"
              value={contact.phone}
              id="phone"
              onChange={(e) => handleContactUpdate("phone", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Location
            </label>
            <input
              type="text"
              placeholder="City / Province"
              value={contact.location}
              id="location"
              onChange={(e) => handleContactUpdate("location", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Spec Grid */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
        <h3 className="text-lg font-black tracking-tighter uppercase text-white mb-6 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-red-600"></span>
          Vehicle Core Specification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Make
            </label>
            <input
              type="text"
              placeholder="e.g. BMW, Toyota, VW"
              value={vehicle.make}
              id="make"
              onChange={(e) => handleVehicleUpdate("make", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Model
            </label>
            <input
              type="text"
              placeholder="e.g. 320i, Hilux, Polo"
              value={vehicle.model}
              id="model"
              onChange={(e) => handleVehicleUpdate("model", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Year Model
            </label>
            <select
              value={vehicle.year}
              id="year"
              onChange={(e) => handleVehicleUpdate("year", parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-neutral-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Mileage (KM)
            </label>
            <input
              type="number"
              placeholder="e.g. 85000"
              value={vehicle.mileage === 0 ? "" : vehicle.mileage}
              id="mileage"
              onChange={(e) => handleVehicleUpdate("mileage", parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Transmission
            </label>
            <select
              value={vehicle.transmission}
              id="transmission"
              onChange={(e) => handleVehicleUpdate("transmission", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="Automatic" className="bg-neutral-900">Automatic</option>
              <option value="Manual" className="bg-neutral-900">Manual</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Fuel Type
            </label>
            <select
              value={vehicle.fuel}
              id="fuel"
              onChange={(e) => handleVehicleUpdate("fuel", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="Petrol" className="bg-neutral-900">Petrol</option>
              <option value="Diesel" className="bg-neutral-900">Diesel</option>
              <option value="Hybrid" className="bg-neutral-900">Hybrid</option>
              <option value="Electric" className="bg-neutral-900">Electric</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing Adjusters and Multipliers details */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
        <h3 className="text-lg font-black tracking-tighter uppercase text-white mb-6 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-red-600"></span>
          Technical Condition & History Math
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Overall Condition
            </label>
            <select
              value={vehicle.condition}
              id="condition"
              onChange={(e) => handleVehicleUpdate("condition", parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="1.05" className="bg-neutral-900">Excellent / Pristine</option>
              <option value="1.0" className="bg-neutral-900">Good (Regular Roadworthy)</option>
              <option value="0.9" className="bg-neutral-900">Average (Minor wear)</option>
              <option value="0.75" className="bg-neutral-900">Needs Reconditioning</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Service History
            </label>
            <select
              value={vehicle.service}
              id="service"
              onChange={(e) => handleVehicleUpdate("service", parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="1" className="bg-neutral-900">Full Service History (FSH)</option>
              <option value="0.9" className="bg-neutral-900">Partial Service History</option>
              <option value="0.8" className="bg-neutral-900">No Service History</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Accident History
            </label>
            <select
              value={vehicle.accident}
              id="accident"
              onChange={(e) => handleVehicleUpdate("accident", parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="0" className="bg-neutral-900">No Accidents / Clear History</option>
              <option value="1" className="bg-neutral-900">Yes (Previous Structural Damage)</option>
              <option value="0.5" className="bg-neutral-900">Unsure / Minor Fender Bender</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Bank Settlement Amount (ZAR)
            </label>
            <input
              type="number"
              placeholder="0 (fully paid out)"
              value={vehicle.settlement}
              id="settlement"
              onChange={(e) => handleVehicleUpdate("settlement", e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Extra text notes */}
        <div className="flex flex-col gap-1.5 mt-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Extra Vehicle Notes / Accessories
          </label>
          <textarea
            rows={3}
            placeholder="Specify options like custom rims, panoramic sunroof, aftermarket audio, or any wear details..."
            value={vehicle.notes}
            id="notes"
            onChange={(e) => handleVehicleUpdate("notes", e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Big Submit Button */}
      <button
        onClick={onSubmit}
        disabled={!isFormValid() || loading}
        id="calculate-est-btn"
        className={`w-full py-5 px-6 font-black font-display tracking-[0.2em] text-sm Transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 cursor-pointer uppercase border rounded ${
          isFormValid() && !loading
            ? "bg-red-600 hover:bg-red-700 border-red-700 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(220,38,38,0.35)] text-white"
            : "bg-white/5 border-white/10 text-neutral-500 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            COMPUTING AI VALUATION METRICS...
          </>
        ) : (
          <>
            EXECUTE AI VALUATION
          </>
        )}
      </button>

      {!isFormValid() && (
        <p className="text-[10px] text-center text-gray-500 uppercase tracking-wider font-mono">
          [!] enter Name, Phone, Location, Make, and Model to activate calculation hooks.
        </p>
      )}
    </div>
  );
}
