"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, X } from "lucide-react";
import { useState } from "react";

export default function AuthDebug() {
  const { user, isAuthed, isHydrated, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-xl shadow-2xl p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-blue-600 flex items-center gap-2">
          <User size={18} />
          Auth Status
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Hydrated:</span>
          <span className={`font-bold ${isHydrated ? "text-green-600" : "text-red-600"}`}>
            {isHydrated ? "✅ Yes" : "❌ No"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Authenticated:</span>
          <span className={`font-bold ${isAuthed ? "text-green-600" : "text-red-600"}`}>
            {isAuthed ? "✅ Yes" : "❌ No"}
          </span>
        </div>

        {user && (
          <>
            <div className="border-t pt-2 mt-2">
              <div className="text-gray-600 mb-1">User Info:</div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div><strong>Name:</strong> {user.name || "N/A"}</div>
                <div><strong>Email:</strong> {user.email || "N/A"}</div>
                <div><strong>Phone:</strong> {user.phone || "N/A"}</div>
              </div>
            </div>
          </>
        )}

        {!isAuthed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
            ⚠️ You are NOT logged in. Login to see logout button!
          </div>
        )}

        {isAuthed && (
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout Now
          </button>
        )}
      </div>
    </div>
  );
}
