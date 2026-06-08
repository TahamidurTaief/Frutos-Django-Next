export default function Container({ title, description, actions, children }) {
  return (
    <div className="p-4 lg:p-6 space-y-5 bg-[#f8fafc] min-h-full">
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            {title && (
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
