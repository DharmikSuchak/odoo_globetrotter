import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

/** Derive 1–2 uppercase initials from a full name. */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/** Deterministic sky-blue-family color from a name string. */
function getAvatarColor(name) {
  const palette = ["#0284c7", "#0369a1", "#0ea5e9", "#075985", "#0c4a6e"];
  if (!name) return palette[0];
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

export default function ProfilePage() {
  const { currentUser, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(currentUser?.name || "");
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photoUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch latest profile on mount (photoUrl may not be in the JWT-derived currentUser)
  useEffect(() => {
    axios.get("/api/profile").then(({ data }) => {
      setName(data.user.name);
      if (data.user.photoUrl) setPhotoPreview(data.user.photoUrl);
    }).catch(() => {
      // Non-critical — currentUser values are still valid
    });
  }, []);

  /** Convert selected image file to a base64 data URI for preview and storage. */
  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setErrorMsg("");
  }

  function removePhoto() {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Name cannot be empty.");
      return;
    }
    if (name.trim().length > 100) {
      setErrorMsg("Name must be 100 characters or fewer.");
      return;
    }

    try {
      setIsSaving(true);
      const { data } = await axios.put("/api/profile", {
        name: name.trim(),
        photoUrl: photoPreview ?? null,
      });
      // Push updated values to the in-memory auth context
      updateUser({ name: data.user.name, photoUrl: data.user.photoUrl });
      setSuccessMsg("Profile saved successfully!");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const displayName = name || currentUser?.name || "";

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Profile & Settings</h1>
        <p className="text-slate-500 mt-1">Manage your name, photo, and account details.</p>
      </header>

      <div className="max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          {/* Success / Error banners */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#dcfce7] border border-[#4ade80] text-[#15803d] text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Avatar section */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative flex-shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile photo"
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                  style={{ background: getAvatarColor(displayName) }}
                >
                  {getInitials(displayName)}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">{displayName}</p>
              <p className="text-sm text-slate-500 mb-3">{currentUser?.email}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  Upload Photo
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <p className="text-xs text-slate-400 mt-1">Max 2 MB. JPEG, PNG, or WebP.</p>
            </div>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setSuccessMsg(""); setErrorMsg(""); }}
                maxLength={100}
                placeholder="Your name"
                className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={currentUser?.email || ""}
                disabled
                className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
