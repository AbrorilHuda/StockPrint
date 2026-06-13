import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import type { StockFormData } from "../types/stock";
import { getSavedStockData, saveStockData } from "../utils/storage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "StokPrint - Pembuat Lembar Stok Toko Kelontong & Warung" },
    { name: "description", content: "Buat lembar cek stok barang siap cetak A4 secara praktis dan otomatis untuk warung, kelontong, atau gudang Anda." },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  // Load initial state from local storage (safe for hydration checks)
  const [formData, setFormData] = useState<StockFormData>({
    title: "",
    date: "",
    cabinetName: "",
    items: [],
  });

  const [rawText, setRawText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedStockData();
    // Default to today's date if empty
    const today = new Date().toISOString().substring(0, 10);
    setFormData({
      title: saved.title || "FORM CETAK STOK BARANG",
      date: saved.date || today,
      cabinetName: saved.cabinetName || "Etalase Utama",
      items: saved.items,
    });
    setRawText(saved.items.join("\n"));
    setIsLoaded(true);
  }, []);

  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(null);
    }, 2000);
  };

  const lineCount = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedItems = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (parsedItems.length === 0) {
      alert("Harap masukkan minimal satu nama barang!");
      return;
    }

    const updatedFormData: StockFormData = {
      title: formData.title.trim() || "FORM CETAK STOK BARANG",
      date: formData.date,
      cabinetName: formData.cabinetName.trim() || "Etalase Utama",
      items: parsedItems,
    };

    saveStockData(updatedFormData);
    navigate("/preview");
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 pb-16">
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 glow-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 glow-blob" />

      {/* Floating Notification Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border-indigo-500/30 px-5 py-3 rounded-2xl flex items-center gap-3 animate-fade-in shadow-indigo-950/40 shadow-lg text-sm text-indigo-200">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          {showToast}
        </div>
      )}

      <div className="container mx-auto px-4 pt-12 max-w-6xl relative z-10">
        {/* Header Hero Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 14h6" />
                <path d="M9 18h6" />
                <path d="M12 10h3" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                StokPrint
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Generate form kertas cetak stok barang A4 instan untuk operasional warung & toko Anda
              </p>
            </div>
          </div>
          
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Tipe Output</div>
            <div className="bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 rounded-full px-4 py-1.5 mt-1 text-xs font-semibold inline-flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              A4 Portrait - Pen Counting Ready
            </div>
          </div>
        </header>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Textarea Input (Left Panel) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel rounded-3xl p-6 relative">
              <div className="flex items-center justify-between mb-4 border-b border-slate-900/60 pb-3">
                <div>
                  <label htmlFor="items-textarea" className="block font-bold text-slate-200">
                    Daftar Nama Barang
                  </label>
                  <span className="text-xs text-slate-400">
                    Masukkan satu nama barang per baris
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (rawText && confirm("Bersihkan daftar barang?")) {
                      setRawText("");
                      triggerToast("Daftar barang dibersihkan");
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all active:scale-95"
                >
                  Bersihkan
                </button>
              </div>

              <div className="relative">
                <textarea
                  id="items-textarea"
                  rows={16}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Contoh:&#10;Surya 16&#10;Marlboro Merah&#10;Indomie Goreng&#10;Minyak Bimoli 2L"
                  className="w-full glass-input p-4 font-mono text-sm leading-relaxed resize-y focus:ring-indigo-600/30"
                />
                <div className="absolute bottom-3 right-4 bg-slate-900/90 border border-slate-800 text-slate-400 text-xs py-1 px-3 rounded-full flex items-center gap-1.5 font-mono shadow-md">
                  <span className={`w-2 h-2 rounded-full ${lineCount > 0 ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {lineCount} barang dideteksi
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings Sidebar (Right Panel) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-5">
              <h2 className="font-bold text-slate-200 border-b border-slate-900/60 pb-3">
                ⚙️ Pengaturan Lembar Cetak
              </h2>

              {/* Title Setting */}
              <div className="space-y-2">
                <label htmlFor="title-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Judul Dokumen
                </label>
                <input
                  id="title-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: FORM CETAK STOK BARANG"
                  className="w-full glass-input px-4 py-2.5 text-sm text-slate-100"
                />
              </div>

              {/* Cabinet Setting */}
              <div className="space-y-2">
                <label htmlFor="cabinet-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nama Etalase / Rak / Lokasi
                </label>
                <input
                  id="cabinet-input"
                  type="text"
                  value={formData.cabinetName}
                  onChange={(e) => setFormData({ ...formData, cabinetName: e.target.value })}
                  placeholder="Contoh: Etalase Depan"
                  className="w-full glass-input px-4 py-2.5 text-sm text-slate-100"
                />
              </div>

              {/* Date Setting */}
              <div className="space-y-2">
                <label htmlFor="date-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tanggal Cetak
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 text-sm text-slate-100 text-left"
                />
              </div>
            </div>

            {/* Giant Submit Button */}
            <button
              type="submit"
              disabled={lineCount === 0}
              className={`w-full py-4 rounded-3xl font-extrabold text-sm tracking-wide uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer ${
                lineCount > 0
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-950/40 hover:shadow-indigo-900/30"
                  : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Generate & Preview Form
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

