"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Save, User, Building2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const societies = [
  "1. IEEE OCEANIC ENGINEERING SOCIETY (OES)",
  "2. ISHRAE",
  "3. IAENG SOCIETY OF INTERNET COMPUTING AND WEB SERVICES",
  "4. INTERNATIONAL ASSOCIATION OF ENGINEERS",
  "5. INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG)",
  "6. INTERNATIONAL ASSOCIATION OF ENGINEERS - AIML",
  "7. SYSTEM SOCIETY OF INDIA (SSI)",
  "8. ANALYTICAL VIDHYA",
  "9. BVERSITY INDIA",
  "10. BIOTECH RESEARCH SOCIETY OF INDIA",
  "11. ASSOCIATION OF FOOD SCIENTISTS & TECHNOLOGISTS (INDIA)",
  "12. AMERICAL SOCIETY OF CIVIL ENGINEERS",
  "13. COMPUTER SCIENCE TEACHERS ASSOCIATION",
  "14. THE INDIAN SOCIETY OF HEATING, REFRIGERATING AND AIR CONDITIONING ENGINEERS",
  "15. SOCIETY OF AUTOMOBILE ENGINEERING INDIA",
  "16. THE INDIAN SOCIETY OF HEATING, REFIGERATING AND AIR CONDITIONING ENGINEERS",
  "17. BVERSITY",
  "18. IAENG",
  "19. TEXTILE ASSOCIATION OF INDIA (TAI) - TXT",
  "20. THE INSTITUTION OF ENGINEERS (INDIA) (IE(I)) - TXT",
  "21. INTERNATIONAL SOCIETY OF AUTOMATION (ISA)",
  "22. ROBOTIC SOCIETY OF INDIA (RSI)",
  "23. INDIAN WELDING SOCIETY (IWS)",
  "24. MARINE TECHNOLOGY SOCIETY (MTS)",
  "25. INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - IT",
  "26. INSTITUTE FOR ENGINEERING RESEARCH AND PUBLICATION (IFERP) - IT",
  "27. HACKEREARTH CHAPTER",
  "28. INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - ISE",
  "29. TEXTILE ASSOCIATION OF INDIA (TAI) - FT",
  "30. THE INSTITUTION OF ENGINEERS (INDIA) (IE(I)) - FT",
  "31. UNIVERSAL SOCIETY OF FOOD AND NUTRITION (USFN)",
  "32. ASSOCIATION OF FOOD SCIENTISTS AND TECHNOLOGISTS INDIA (AFSTI) - FD",
  "33. AUTOMATIC CONTROL & DYNAMIC OPTIMIZATION SOCIETY (ACDOS)",
  "34. INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - EIE",
  "35. IEEE WOMEN IN ENGINEERING (IEEE_WIE)",
  "36. IEEE STUDENT BRANCH (IEEE_SB)",
  "37. IETE STUDENTS FORUM (ISF)",
  "38. IEEE INDUSTRIAL ELECTRONIC SOCIETY (IEEE_IES)",
  "39. INDIAN SOCIETY OF SYSTEMS FOR SCIENCES AND ENGINEERING (ISSSE)",
  "40. IACSIT SOFTWARE ENGINEERING SOCIETY",
  "41. COMPUTER SOCIETY OF INDIA (CSI)",
  "42. SYSTEMS SOCIETY OF INDIA (SSI)",
  "43. CODECHEF BIT CHAPTER",
  "44. COMPUTER SCIENCE TEACHER ASSOCIATION (CSTA)",
  "45. INDIAN CONCRETE INSTITUTE (ICI)",
  "46. IGS COIMBATORE CHAPTER",
  "47. AMERICAN SOCIETY OF CIVIL ENGINEERS (ASCE)",
  "48. THE BIOTECH RESEARCH SOCIETY, INDIA (BRSI)",
  "49. INSTITUTE FOR ENGINEERING RESEARCH AND PUBLICATION (IFERP) - BT",
  "50. FORCE BIOMEDICAL SOCIETY",
  "51. BIOMEDICAL ENGINEERING SOCIETY OF INDIA (BMESI)",
  "52. IMPERIAL SOCIETY OF INNOVATIVE ENGINEERS (ISIE)",
  "53. SOCIETY FOR SMART E-MOBILITY",
  "54. ANALYTICS VIDHYA",
  "55. KAGGLE COMMUNITIES",
  "56. IAENG SOCIETY OF ARTIFICIAL INTELLIGENCE",
  "57. ASSOCIATION OF FOOD SCIENTISTS AND TECHNOLOGISTS INDIA (AFSTI) - AGRI",
  "58. INDIAN SOCIETY OF AGRICULTURAL ENGINEERS (ISAE)",
  "59. SOCIETY OF AUTOMOTIVE ENGINEERS INDIA (SAEINDIA)",
  "60. AERONAUTICAL SOCIETY OF INDIA (AESI)",
] as const;

const statusOptions = ["Active", "Non-Active"] as const;

type FormData = {
  name: string;
  society: string;
  status: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function TechnicalSocietiesSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    society: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user?.name]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.society) nextErrors.society = "Please select a society";
    if (!formData.status) nextErrors.status = "Status is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
      }

      const formBody = Object.entries(formData)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&");

      const response = await fetch(`${API_URL}/api/owi/technicalSocieties`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.details || "Unknown error",
        );
      }

      alert("Technical Society membership submitted successfully!");
      router.push("/faculty/outside-world/technical-societies");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit form: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Technical Societies Details
            </h1>
            <p className="text-sm text-slate-500">
              Add Technical Society membership details
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Faculty Information
              </h3>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name <RequiredAst />
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your name"
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Society Details
              </h3>
              <div>
                <label
                  htmlFor="society"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Society <RequiredAst />
                </label>
                <select
                  name="society"
                  id="society"
                  value={formData.society}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.society ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  <option value="">Select a society</option>
                  {societies.map((society) => (
                    <option key={society} value={society}>
                      {society}
                    </option>
                  ))}
                </select>
                {errors.society ? (
                  <p className="mt-1 text-sm text-red-600">{errors.society}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Status <RequiredAst />
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.status ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.status ? (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                ) : null}
              </div>
            </div>

            <div className="pt-5 flex items-center justify-end space-x-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
