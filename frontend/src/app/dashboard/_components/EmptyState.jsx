import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "No data yet", description = "Items will appear here once they are created.", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-3 rounded-full bg-gray-100 mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

