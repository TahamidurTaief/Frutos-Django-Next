"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
// Trigger HMR

export default function FormModal({ fields, initialValues = {}, onSubmit, submitLabel = "Save", loading: externalLoading }) {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState({});

  const isLoading = externalLoading || submitting;

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const togglePassword = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit?.(values);
    } catch (err) {
      setError(err?.data?.detail || err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm";
  const labelClasses = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        {fields.map((field) => {
          const isFullWidth = field.type === "textarea" || field.type === "file";
          
          return (
            <div key={field.key} className={isFullWidth ? "sm:col-span-2" : ""}>
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <SearchableSelect
                  options={field.options || []}
                  value={values[field.key] ?? ""}
                  onChange={(val) => handleChange(field.key, val)}
                  placeholder={`Select ${field.label}...`}
                  required={field.required}
                />
              ) : field.type === "textarea" ? (
                <textarea
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  rows={3}
                  placeholder={field.placeholder}
                  className={`${inputClasses} resize-y min-h-[80px]`}
                />
              ) : field.type === "password" ? (
                <div className="relative">
                  <input
                    type={showPassword[field.key] ? "text" : "password"}
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className={`${inputClasses} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword(field.key)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ) : field.type === "file" ? (
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300 group-hover:border-emerald-300">
                      {values[field.key] ? (
                        <img
                          src={typeof values[field.key] === "string" ? values[field.key] : URL.createObjectURL(values[field.key])}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">
                        {values[field.key] ? "Change File" : "Upload File"}
                      </span>
                      <span className="text-xs font-medium text-slate-500">Click to select a file</span>
                    </div>
                    <input
                      type="file"
                      accept={field.accept || "image/*"}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleChange(field.key, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {values[field.key] && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleChange(field.key, null); }}
                      className="text-xs font-bold text-red-500 hover:text-red-600 self-start"
                    >
                      Remove File
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  className={inputClasses}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#00694C] text-white rounded-xl hover:bg-[#085041] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
