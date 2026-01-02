/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

type ProfileData = {
  name: string;
  phone: string;
  address: {
    houseOrVillage: string;
    roadOrPostOffice: string;
    blockOrThana: string;
    district: string;
  };
};

export default function EditProfilePage() {
  const { user, isAuthed, isHydrated, token } = useAuth();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "";

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    phone: "",
    address: {
      houseOrVillage: "",
      roadOrPostOffice: "",
      blockOrThana: "",
      district: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthed) {
      router.push("/login");
    }
  }, [isAuthed, isHydrated, router]);

  useEffect(() => {
    if (isAuthed && token) {
      loadProfile();
    }
  }, [isAuthed, token]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/customers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      
      if (result.ok && result.data) {
        setProfile({
          name: result.data.name || "",
          phone: result.data.phone || "",
          address: {
            houseOrVillage: result.data.address?.houseOrVillage || "",
            roadOrPostOffice: result.data.address?.roadOrPostOffice || "",
            blockOrThana: result.data.address?.blockOrThana || "",
            district: result.data.address?.district || "",
          },
        });
      } else {
        setError(result.code || "Failed to load profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API}/customers/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const result = await response.json();

      if (result.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/profile"), 1500);
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          setError(result.errors.map((e: any) => e.message).join(", "));
        } else {
          setError(result.code || "Update failed");
        }
      }
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#167389]/70 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#167389] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-20 sm:py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[#167389] hover:text-cyan-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-pink-100 flex items-center justify-center">
              <User className="text-[#167389]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-sm text-gray-600">Update your account information</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#167389] focus:ring-4 focus:ring-cyan-200/40 text-sm text-gray-900 placeholder:text-gray-400"
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#167389] focus:ring-4 focus:ring-cyan-200/40 text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#167389]" />
                <h3 className="text-sm font-semibold text-gray-900">Address</h3>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="House/Village"
                  value={profile.address.houseOrVillage}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, houseOrVillage: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#167389] focus:ring-4 focus:ring-cyan-200/40 text-sm text-gray-900 placeholder:text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Road/Post Office"
                  value={profile.address.roadOrPostOffice}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, roadOrPostOffice: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#167389] focus:ring-4 focus:ring-cyan-200/40 text-sm text-gray-900 placeholder:text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Block/Thana"
                  value={profile.address.blockOrThana}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, blockOrThana: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#167389] focus:ring-4 focus:ring-cyan-200/40 text-sm text-gray-900 placeholder:text-gray-400"
                />

                <input
                  type="text"
                  placeholder="District"
                  value={profile.address.district}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, district: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#167389] focus:ring-4 focus:ring-cyan-200/40 text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#167389] text-white font-semibold hover:brightness-110 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
