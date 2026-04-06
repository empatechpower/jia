import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import type { PropertyInfo } from "@/types";
import { api } from "@/services/api";

const PROPERTY_TYPES = ["BTO", "Resale", "Condo", "Landed"] as const;

// ─── Small components ─────────────────────────────────────────────────────────

function StepHeader({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < current ? "bg-[#332e28]" : "bg-gray-200"
          }`}
          key={i}
        />
      ))}
    </div>
  );
}

interface RadioGroupProps {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}

function RadioGroup({ options, value, onChange, label }: RadioGroupProps) {
  return (
    <fieldset>
      <legend className="font-['Poppins'] text-sm text-[#414042] mb-2">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            className={`px-4 py-2 rounded-full border font-['Poppins'] text-sm transition ${
              value === opt
                ? "bg-[#332e28] text-white border-[#332e28]"
                : "bg-white text-[#414042] border-gray-300 hover:border-[#332e28]"
            }`}
            key={opt}
            onClick={() => onChange(opt)}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Ownership = "own" | "rented";

interface FormData {
  propertyType: string;
  ownership: Ownership;
  zipCode: string;
  unit: string;
  numRooms: string;
  keyDate: string; // YYYY-MM-DD
}
export default function NewProjectPage() {
  const { setCurrentPage, setNumberOfRooms, setPropertyInfo } = useApp();
  const [propertyType, setPropertyType] = useState<string>("");
  const [isOwnProperty, setIsOwnProperty] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [unit, setUnit] = useState("");
  const [numRooms, setNumRooms] = useState("");
  const [keyDate, setKeyDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setUser] = useState<any | null>(null);
  const [, setLoading] = useState(true);
  const [floorplanFile, setFloorplanFile] = useState<File | null>(null);
  const [floorplanUrl, setFloorplanUrl] = useState<string>(""); // from API
  const [formData, setFormData] = useState<FormData>({
    propertyType: "BTO",
    ownership: "own",
    zipCode: "",
    unit: "",
    numRooms: "",
    keyDate: "",
  });
  useEffect(() => {
    api.user
      .me(localStorage.getItem("jia_user_id") || "")
      .then((data) => {
        const project = data.response.user;
        setUser(project);

        // 👇 populate form fields from API
        setPropertyType(project.Property_Type_Text || "BTO");
        setIsOwnProperty(project.isThisYourProperty ?? "");
        setZipCode(project.zipCode || "");
        setUnit(project.addressUnit || "");
        setNumRooms(project.AmountOfRooms?.toString() || "");

        if (project.Floor_Plan_PDF) {
          setFloorplanUrl(project.Floor_Plan_PDF);
        }
        console.log("Fetched user data:", project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  function validate() {
    const e: Record<string, string> = {};
    if (!zipCode.match(/^\d{6}$/))
      e.zipCode = "Please enter a valid 6-digit postal code.";
    if (!unit) e.unit = "Unit number is required.";
    const n = parseInt(numRooms, 10);
    if (isNaN(n) || n < 1 || n > 10)
      e.numRooms = "Number of rooms must be between 1 and 10.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const info: PropertyInfo = {
      propertyType,
      isOwnProperty,
      zipCode,
      unit,
      keyDate,
    };

    setPropertyInfo(info);
    setNumberOfRooms(parseInt(numRooms, 10));
    setCurrentPage("areaSelection");
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFloorplanFile(file);

    // If user uploads a new file, clear old URL
    if (file) {
      setFloorplanUrl("");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center justify-between">
        <button
          aria-label="Back"
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("landing")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">
          New Project
        </h1>
        <button
          className="font-['Poppins'] text-sm text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("landing")}
        >
          Cancel
        </button>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10">
        <StepHeader current={1} total={4} />

        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-2">
          Tell us about your property
        </h2>
        <p className="font-['DM_Sans'] text-[#666] text-base mb-8">
          We'll use this information to tailor our recommendations for your
          space.
        </p>

        <form className="space-y-6" noValidate onSubmit={handleSubmit}>
          <RadioGroup
            label="Property type"
            onChange={setPropertyType}
            options={PROPERTY_TYPES}
            value={propertyType}
          />

          <fieldset>
            <legend className="font-['Poppins'] text-sm text-[#414042] mb-2">
              Ownership
            </legend>
            <div className="flex gap-2">
              {[
                { label: "Own Property", value: "own" },
                { label: "Rented Property", value: "rented" },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateField("ownership", value)}
                  className={`px-4 py-2 rounded-full border font-['Poppins'] text-sm transition ${
                    formData.ownership === value
                      ? "bg-[#332e28] text-white border-[#332e28]"
                      : "bg-white text-[#414042] border-gray-300 hover:border-[#332e28]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
                Postal Code
              </label>
              <input
                autoComplete="postal-code"
                className={`w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28] ${errors.zipCode ? "ring-2 ring-red-400" : ""}`}
                inputMode="numeric"
                maxLength={6}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="6-digit postal code"
                type="text"
                value={zipCode}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
              )}
            </div>
            <div>
              <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
                Unit Number
              </label>
              <input
                className={`w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28] ${errors.unit ? "ring-2 ring-red-400" : ""}`}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="#00-00"
                type="text"
                value={unit}
              />
              {errors.unit && (
                <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
              Number of Rooms
            </label>
            <input
              className={`w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28] ${errors.numRooms ? "ring-2 ring-red-400" : ""}`}
              max={10}
              min={1}
              onChange={(e) => setNumRooms(e.target.value)}
              type="number"
              value={numRooms}
            />
            {errors.numRooms && (
              <p className="text-red-500 text-xs mt-1">{errors.numRooms}</p>
            )}
          </div>

          {/* Key date */}
          <div>
            <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
              Expected Key Collection Date
            </label>
            <input
              className="w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28]"
              onChange={(e) => setKeyDate(e.target.value)}
              type="date"
              value={keyDate}
            />
          </div>

          {/* Floorplan upload */}
          <div>
            <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
              Upload Floorplan{" "}
              {/* <span className="text-[#999] font-normal">(optional)</span> */}
            </label>
            <label className="flex items-center gap-3 w-full bg-[#ececec] rounded-lg px-4 py-3 cursor-pointer hover:bg-[#e0e0e0] transition">
              <svg
                className="w-5 h-5 text-[#878787]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
              <span className="font-['Poppins'] text-sm text-[#878787]">
                {floorplanFile
                  ? floorplanFile.name
                  : floorplanUrl
                    ? "Existing file uploaded"
                    : "Choose a file…"}
              </span>
              {floorplanUrl && !floorplanFile && (
                <a
                  href={`https:${floorplanUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline mt-2 block"
                >
                  View current floorplan
                </a>
              )}
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={handleFileChange}
                type="file"
              />
            </label>
          </div>

          {/* Submit */}
          <button
            className="w-full bg-[#332e28] hover:bg-[#2a2622] active:scale-95 transition rounded-lg py-4 font-['Poppins'] font-medium text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#332e28]"
            type="submit"
          >
            Next: Select Area
          </button>
        </form>
      </main>
    </div>
  );
}
