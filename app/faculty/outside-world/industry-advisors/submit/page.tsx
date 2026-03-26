"use client";

import {
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  DragEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Building2,
  User,
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const INDUSTRY_TYPE_OPTIONS = [
  "Choose an option",
  "MNC",
  "Large Scale",
  "MSME",
  "Small Scale",
  "Others",
];
const OWI_VERIFICATION_OPTIONS = [
  "Choose an option",
  "Initiated",
  "Approved",
  "Rejected",
];
const SPECIAL_LAB_OPTIONS = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

type FormData = {
  faculty: string;
  sigNumber: string;
  specialLabsInvolved: string;
  specialLab: string;
  industryName: string;
  domainArea: string;
  industryType: string;
  industryTypeOther: string;
  expertName: string;
  designation: string;
  emailId: string;
  phoneNumber: string;
  experienceYears: string;
  areaOfExpertise: string;
  industryAddress: string;
  industryWebsite: string;
  frequencyOfInteraction: string;
  dateOfMeeting: string;
  expenseIncurred: string;
  suggestions: string;
  collaborativeActivities: string;
  approvalDocument: File[];
  owiVerification: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function IndustryAdvisorSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    sigNumber: "",
    specialLabsInvolved: "",
    specialLab: "",
    industryName: "",
    domainArea: "",
    industryType: "Choose an option",
    industryTypeOther: "",
    expertName: "",
    designation: "",
    emailId: "",
    phoneNumber: "",
    experienceYears: "",
    areaOfExpertise: "",
    industryAddress: "",
    industryWebsite: "",
    frequencyOfInteraction: "",
    dateOfMeeting: "",
    expenseIncurred: "",
    suggestions: "",
    collaborativeActivities: "",
    approvalDocument: [],
    owiVerification: "Choose an option",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, faculty: user.name }));
    }
  }, [user?.name]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        approvalDocument: [
          ...prev.approvalDocument,
          ...Array.from(e.target.files as FileList),
        ],
      }));
      if (errors.approvalDocument) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.approvalDocument;
          return next;
        });
      }
    }
  };

  const clearFile = (index: number | null = null) => {
    setFormData((prev) => {
      if (index !== null) {
        const files = [...prev.approvalDocument];
        files.splice(index, 1);
        return { ...prev, approvalDocument: files };
      }
      return { ...prev, approvalDocument: [] };
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        approvalDocument: [
          ...prev.approvalDocument,
          ...Array.from(e.dataTransfer.files),
        ],
      }));
      if (errors.approvalDocument) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.approvalDocument;
          return next;
        });
      }
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.sigNumber.trim())
      nextErrors.sigNumber = "SIG Number is required";
    if (!formData.industryName.trim())
      nextErrors.industryName =
        "Name of the Industry / Organization is required";
    if (!formData.domainArea.trim())
      nextErrors.domainArea = "Domain Area of the Industry is required";
    if (
      !formData.industryType ||
      formData.industryType === "Choose an option"
    ) {
      nextErrors.industryType = "Type of Industry / Organization is required";
    }
    if (
      formData.industryType === "Others" &&
      !formData.industryTypeOther.trim()
    ) {
      nextErrors.industryTypeOther = "Please specify the industry type";
    }

    if (!formData.expertName.trim())
      nextErrors.expertName = "Name of the Expert is required";
    if (!formData.designation.trim())
      nextErrors.designation = "Designation is required";

    if (!formData.emailId.trim()) {
      nextErrors.emailId = "Email ID is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      nextErrors.emailId = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      nextErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (!formData.experienceYears.trim())
      nextErrors.experienceYears = "Experience (in Years) is required";
    if (!formData.areaOfExpertise.trim())
      nextErrors.areaOfExpertise = "Area of Expertise is required";
    if (!formData.industryAddress.trim())
      nextErrors.industryAddress = "Address of the Industry is required";
    if (!formData.frequencyOfInteraction)
      nextErrors.frequencyOfInteraction =
        "Frequency of Interaction is required";
    if (!formData.dateOfMeeting)
      nextErrors.dateOfMeeting = "Date of Meeting is required";

    if (
      formData.expenseIncurred &&
      Number.isNaN(Number(formData.expenseIncurred))
    ) {
      nextErrors.expenseIncurred = "Expense incurred must be a number";
    }

    if (!formData.approvalDocument || formData.approvalDocument.length === 0) {
      nextErrors.approvalDocument =
        "Approval Letter / Minutes of meeting / Sample / Photographs / Collaborative activities document is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Industry Advisor record saved successfully!");
      router.push("/faculty/outside-world/industry-advisors");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSpecialLab = formData.specialLabsInvolved === "yes";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Industry Advisor Details
            </h1>
            <p className="text-sm text-slate-500">
              Add Industry Advisor interaction details
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Faculty Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="faculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Faculty (Auto-filled)
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    id="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 text-slate-500 sm:text-sm cursor-not-allowed"
                    placeholder="Auto-filled from your account"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sigNumber"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    SIG Number <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="sigNumber"
                    id="sigNumber"
                    value={formData.sigNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.sigNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter SIG Number"
                  />
                  {errors.sigNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sigNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="specialLabsInvolved"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Special Labs Involved
                  </label>
                  <select
                    name="specialLabsInvolved"
                    id="specialLabsInvolved"
                    value={formData.specialLabsInvolved}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 h-10 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  >
                    <option value="">Choose an option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {showSpecialLab && (
                  <div>
                    <label
                      htmlFor="specialLab"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Special Lab Name
                    </label>
                    <select
                      name="specialLab"
                      id="specialLab"
                      value={formData.specialLab}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      {SPECIAL_LAB_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option === "Select Special Lab" ? "" : option}
                          disabled={option === "Select Special Lab"}
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                Industry / Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="industryName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Industry / Organization <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="industryName"
                    id="industryName"
                    value={formData.industryName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.industryName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter industry/organization name"
                  />
                  {errors.industryName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.industryName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="domainArea"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Domain Area of the Industry <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="domainArea"
                    id="domainArea"
                    value={formData.domainArea}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.domainArea ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., AI/ML, Finance, Healthcare"
                  />
                  {errors.domainArea && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.domainArea}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="industryType"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Type of Industry / Organization <RequiredAst />
                  </label>
                  <select
                    name="industryType"
                    id="industryType"
                    value={formData.industryType}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.industryType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {INDUSTRY_TYPE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Choose an option"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.industryType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.industryType}
                    </p>
                  )}
                </div>

                {formData.industryType === "Others" && (
                  <div>
                    <label
                      htmlFor="industryTypeOther"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      If Others, Please Specify <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="industryTypeOther"
                      id="industryTypeOther"
                      value={formData.industryTypeOther}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.industryTypeOther ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Please specify"
                    />
                    {errors.industryTypeOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.industryTypeOther}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                Expert Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="expertName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Expert <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="expertName"
                    id="expertName"
                    value={formData.expertName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.expertName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter expert's full name"
                  />
                  {errors.expertName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expertName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="designation"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Designation <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="designation"
                    id="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.designation ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., Senior Manager, CTO, Director"
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.designation}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="emailId"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Email ID <RequiredAst />
                  </label>
                  <input
                    type="email"
                    name="emailId"
                    id="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.emailId ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="expert@company.com"
                  />
                  {errors.emailId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emailId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Phone Number <RequiredAst />
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.phoneNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="10-digit phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="experienceYears"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Experience (in Years) <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    id="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.experienceYears ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 10"
                  />
                  {errors.experienceYears && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.experienceYears}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="areaOfExpertise"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Area of Expertise <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="areaOfExpertise"
                    id="areaOfExpertise"
                    value={formData.areaOfExpertise}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.areaOfExpertise ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., Machine Learning, Cloud Computing"
                  />
                  {errors.areaOfExpertise && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.areaOfExpertise}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                Industry Address & Website
              </h3>
              <div>
                <label
                  htmlFor="industryAddress"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Address of the Industry <RequiredAst />
                </label>
                <textarea
                  name="industryAddress"
                  id="industryAddress"
                  value={formData.industryAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.industryAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter complete address of the industry/organization"
                />
                {errors.industryAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.industryAddress}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="industryWebsite"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Industry Website
                </label>
                <input
                  type="url"
                  name="industryWebsite"
                  id="industryWebsite"
                  value={formData.industryWebsite}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://www.company.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Interaction Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="frequencyOfInteraction"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Frequency of Interaction (in months) <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="frequencyOfInteraction"
                    id="frequencyOfInteraction"
                    value={formData.frequencyOfInteraction}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.frequencyOfInteraction ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter frequency in months"
                  />
                  {errors.frequencyOfInteraction && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.frequencyOfInteraction}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dateOfMeeting"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Date of Meeting <RequiredAst />
                  </label>
                  <input
                    type="date"
                    name="dateOfMeeting"
                    id="dateOfMeeting"
                    value={formData.dateOfMeeting}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.dateOfMeeting ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.dateOfMeeting && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dateOfMeeting}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="expenseIncurred"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Expense incurred (in Rs.)
                </label>
                <input
                  type="number"
                  name="expenseIncurred"
                  id="expenseIncurred"
                  value={formData.expenseIncurred}
                  onChange={handleChange}
                  min="0"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.expenseIncurred ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter expense in Rs."
                />
                {errors.expenseIncurred && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.expenseIncurred}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                Additional Information
              </h3>
              <div>
                <label
                  htmlFor="suggestions"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Suggestions for further Improvements
                </label>
                <textarea
                  name="suggestions"
                  id="suggestions"
                  value={formData.suggestions}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your suggestions for further improvements"
                />
              </div>

              <div>
                <label
                  htmlFor="collaborativeActivities"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Collaborative activities, (if any)
                </label>
                <textarea
                  name="collaborativeActivities"
                  id="collaborativeActivities"
                  value={formData.collaborativeActivities}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter collaborative activities if any"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                Documents
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Approval Letter from BIT Minutes of meeting Sample,
                  Photographs, Collaborative activities if any <RequiredAst />
                </label>
                <div
                  className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                    errors.approvalDocument
                      ? "border-red-500"
                      : dragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-300"
                  } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("doc-upload")?.click()}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud
                      className={`mx-auto h-10 w-10 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                    />
                    <div className="flex text-sm text-slate-600">
                      <label
                        htmlFor="doc-upload"
                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Upload files</span>
                        <input
                          ref={fileInputRef}
                          id="doc-upload"
                          name="approvalDocument"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                {formData.approvalDocument.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.approvalDocument.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200"
                      >
                        <FileText
                          size={16}
                          className="mr-2 flex-shrink-0 text-indigo-600"
                        />
                        <span className="font-medium mr-2 truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-400 mr-2">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFile(index);
                          }}
                          className="ml-auto text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.approvalDocument && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.approvalDocument}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-indigo-600" />
                OWI Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="owiVerification"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    OWI Verification Status
                  </label>
                  <select
                    name="owiVerification"
                    id="owiVerification"
                    value={formData.owiVerification}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 h-10 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  >
                    {OWI_VERIFICATION_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Choose an option"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
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
