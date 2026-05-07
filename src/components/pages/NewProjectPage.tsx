import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { CartIconWithBadge } from "@/assets/icons";
import { uploadFile } from "@/services/cloudinary"; // adjust path
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
  const {
    setCurrentProject,
    setCurrentPage,
    setNumberOfRooms,
    setPropertyInfo,
    cartItemCount,
    navigateTo,
  } = useApp();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [, setLoading] = useState(true);
  const [project, setProject] = useState<any>();
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
    api.projects
      .get_user_project()
      .then((data) => {
        const project = data.response.results;
        setProject(project);
        setFormData({
          propertyType: project.Property_Type_Text || "BTO",
          ownership: project.propertyOwner ?? "own",
          zipCode: project.postalCode || "",
          unit: project.unit || "",
          numRooms: project.roomNumber?.toString() || "",
          keyDate: project.keyCollectionDate || "",
        });
        if (project.floorPlan) {
          setFloorplanUrl(project.floorPlan);
        }
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
    if (!formData.zipCode.match(/^\d{6}$/))
      e.zipCode = "Please enter a valid 6-digit postal code.";
    if (!formData.unit) e.unit = "Unit number is required.";
    // if (!formData.keyDate) e.keyDate = "Key collection date is required.";

    const n = parseInt(formData.numRooms, 10);
    if (isNaN(n) || n < 1 || n > 10)
      e.numRooms = "Number of rooms must be between 1 and 10.";
    if (!floorplanFile && !floorplanUrl) {
      e.floorPlan = "Floor plan is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function mapToProjectPayload(formData: any, floorplanUrl?: string) {
    const fd = new FormData();

    fd.append("propertyType", formData.propertyType);
    fd.append("propertyOwner", formData.ownership);
    fd.append("postalCode", formData.zipCode);
    fd.append("unit", formData.unit);
    fd.append("roomNumber", formData.numRooms);

    if (formData.keyDate) {
      fd.append("keyCollectionDate", formData.keyDate);
    }

    // ✅ ONLY send URL now
    if (floorplanUrl) {
      fd.append("floorPlan", floorplanUrl);
    }

    return fd;
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      let uploadedUrl = floorplanUrl;

      // 🚀 1. Upload to Cloudinary if new file exists
      if (floorplanFile) {
        const result = await uploadFile(floorplanFile);
        uploadedUrl = result.secure_url;
      }

      let projectId: string;

      if (!project || !project._id) {
        // =========================
        // ✅ CREATE
        // =========================

        const formDataPayload = mapToProjectPayload(formData, uploadedUrl);

        const createRes = await api.projects.create(formDataPayload);
        projectId = createRes.response.project_id;
        console.log("Created project with ID:", createRes);
      } else {
        // =========================
        // ✅ UPDATE
        // =========================

        projectId = project._id;

        const formDataPayload = mapToProjectPayload(formData, uploadedUrl);

        formDataPayload.append("project_id", projectId);

        await api.projects.update(projectId, formDataPayload);
      }

      // =========================
      // NEXT STEP
      // =========================
      setCurrentProject(project);
      setPropertyInfo({
        propertyType: formData.propertyType,
        isOwnProperty: formData.ownership,
        zipCode: formData.zipCode,
        unit: formData.unit,
        keyDate: formData.keyDate,
        projectId,
      });

      // setProject()
      setNumberOfRooms(parseInt(formData.numRooms, 10));
      setCurrentPage("areaSelection");
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFloorplanFile(file);

    if (file) {
      setFloorplanUrl(""); // clear old Cloudinary URL
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.floorPlan;
        return newErrors;
      });
    }
  }
  const formatDate = (value: number | string) => {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between relative">
        <button
          onClick={() => setCurrentPage("landing")}
          className="text-gray-900 hover:opacity-60 transition"
        >
          <svg
            className="w-6 h-6"
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
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-[15px] text-gray-900">
          New Project
        </span>

        <div className="flex items-center gap-2.5">
          <span
            onClick={() => navigateTo("landing", true)}
            className="bg-[#7b7267] cursor-pointer text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            Home
          </span>
          <button
            aria-label={`Cart, ${cartItemCount} items`}
            className="p-2 hover:opacity-80 transition"
            onClick={() => navigateTo("cart", true)}
          >
            <CartIconWithBadge color="#000000" count={cartItemCount} />
          </button>
        </div>
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
            onChange={(value) => updateField("propertyType", value)}
            options={PROPERTY_TYPES}
            value={formData.propertyType}
          />

          <fieldset>
            <legend className="font-['Poppins'] text-sm text-[#414042] mb-2">
              Is this your property?
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
                Home zip Code
              </label>
              <input
                autoComplete="postal-code"
                className={`w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28] ${
                  errors.zipCode ? "ring-2 ring-red-400" : ""
                }`}
                inputMode="numeric"
                maxLength={6}
                onChange={(e) => updateField("zipCode", e.target.value)}
                placeholder="6-digit postal code"
                type="text"
                value={formData.zipCode}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
              )}
            </div>
            <div>
              <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
                Home Unit
              </label>
              <input
                className={`w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28] ${
                  errors.unit ? "ring-2 ring-red-400" : ""
                }`}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="#00-00"
                type="text"
                value={formData.unit}
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
              className={`w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28] ${
                errors.numRooms ? "ring-2 ring-red-400" : ""
              }`}
              max={10}
              min={1}
              onChange={(e) => updateField("numRooms", e.target.value)}
              type="number"
              value={formData.numRooms}
            />
            {errors.numRooms && (
              <p className="text-red-500 text-xs mt-1">{errors.numRooms}</p>
            )}
          </div>

          {/* Key date */}
          <div>
            <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
              Key Collection Date (Optional)
            </label>
            <input
              className="w-full bg-[#ececec] rounded-lg px-4 py-3 font-['Poppins'] text-base outline-none focus:ring-2 focus:ring-[#332e28]"
              onChange={(e) => updateField("keyDate", e.target.value)}
              type="date"
              value={formatDate(formData.keyDate)}
            />
          </div>

          {/* Floorplan upload */}
          <div>
            <label className="font-['Poppins'] text-sm text-[#414042] block mb-1">
              Upload Floorplan{" "}
              {/* <span className="text-[#999] font-normal">(optional)</span> */}
            </label>
            <label
              className="flex items-center gap-3 w-full bg-[#ececec] rounded-lg px-4 py-3 cursor-pointer hover:bg-[#e0e0e0] transition"
              htmlFor="floorplan-upload"
            >
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
                id="floorplan-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {errors.floorPlan && (
              <p className="text-red-500 text-xs mt-1">{errors.floorPlan}</p>
            )}
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
