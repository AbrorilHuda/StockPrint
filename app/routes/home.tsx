import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { Route } from "./+types/home";
import type { StockFormData } from "../types/stock";
import { getSavedStockData, saveStockData } from "../utils/storage";

export function meta({ }: Route.MetaArgs) {
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
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const startTour = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    const submitSelector = isMobile ? "#tour-step-submit-mobile" : "#tour-step-submit-desktop";

    const tourDriver = driver({
      showProgress: true,
      nextBtnText: "Lanjut ›",
      prevBtnText: "‹ Kembali",
      doneBtnText: "Selesai",
      progressText: "Langkah {{current}} dari {{total}}",
      steps: [
        {
          element: "#tour-step-logo",
          popover: {
            title: "Selamat Datang di StokPrint! 👋",
            description: "Aplikasi web praktis untuk membuat form cek stok barang siap cetak A4 untuk warung, minimarket, atau gudang Anda.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#items-textarea",
          popover: {
            title: "Daftar Nama Barang 📝",
            description: "Masukkan daftar nama barang di sini. Cukup ketik satu nama barang per baris. Spasi kosong akan otomatis dibersihkan.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#tour-step-settings",
          popover: {
            title: "Pengaturan Lembar Cetak ⚙️",
            description: "Sesuaikan judul kertas stok, nama etalase/rak/lokasi, dan tanggal cetak sesuai kebutuhan operasional warung Anda.",
            side: isMobile ? "bottom" : "left",
            align: "start"
          },
          onHighlightStarted: () => {
            setIsSettingsExpanded(true);
          }
        },
        {
          element: submitSelector,
          popover: {
            title: "Generate & Preview 🚀",
            description: "Setelah selesai, klik tombol ini untuk men-generate form dan masuk ke pratinjau halaman cetak A4. Di sana Anda bisa langsung mencetaknya ke printer!",
            side: "top",
            align: "center"
          }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem("stokprint_tour_completed", "true");
      }
    });

    tourDriver.drive();
  };

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

    // Trigger tour for first-time visitors
    const tourCompleted = localStorage.getItem("stokprint_tour_completed");
    if (!tourCompleted) {
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 pb-28 lg:pb-16">
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
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-slate-900 pb-8">
          <div id="tour-step-logo" className="flex items-start sm:items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-950/50 shrink-0">
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  StokPrint
                </h1>
                {/* Tutorial button on mobile (right side of title) */}
                <button
                  type="button"
                  onClick={startTour}
                  className="sm:hidden text-xs text-indigo-300 hover:text-white font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-900/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="12" x2="12.01" y2="12" />
                  </svg>
                  Panduan
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Generate form kertas cetak stok barang A4 instan untuk operasional warung & toko Anda
              </p>
            </div>
          </div>

          <div className="flex items-end gap-4 self-stretch md:self-auto justify-between md:justify-end w-full md:w-auto">
            {/* Tutorial button on tablets and desktop (sm+) */}
            <button
              type="button"
              onClick={startTour}
              className="hidden sm:flex text-xs text-indigo-300 hover:text-white font-semibold px-3.5 py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-900/40 transition-all items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="12" x2="12.01" y2="12" />
              </svg>
              Panduan Pemakaian
            </button>

            <div className="text-right hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block leading-none mb-1">Tipe Output</span>
              <div className="bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 rounded-full px-4 py-1.5 text-xs font-semibold inline-flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                A4 Portrait - Pen Counting Ready
              </div>
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
            <div id="tour-step-settings" className="glass-panel rounded-3xl p-6 transition-all duration-300">

              {/* Mobile Clickable Header */}
              <button
                type="button"
                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                className="lg:hidden w-full flex items-center justify-between font-bold text-slate-200 border-b border-slate-900/40 pb-3 text-left focus:outline-none cursor-pointer group"
              >
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <span>⚙️ Pengaturan Lembar Cetak</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${isSettingsExpanded
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/40'
                        : 'bg-slate-900 text-slate-400 border-transparent'
                      }`}>
                      {isSettingsExpanded ? 'Tutup' : 'Ubah'}
                    </span>
                  </span>
                  {!isSettingsExpanded && (
                    <span className="text-[11px] text-slate-400 font-normal mt-1.5 truncate max-w-[280px]">
                      {formData.title} • {formData.cabinetName} • {formData.date ? formData.date.split('-').reverse().join('/') : ''}
                    </span>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isSettingsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Desktop Header */}
              <h2 className="hidden lg:block font-bold text-slate-200 border-b border-slate-900/60 pb-3">
                ⚙️ Pengaturan Lembar Cetak
              </h2>

              {/* Collapsible content area */}
              <div className={`accordion-content overflow-hidden lg:overflow-visible space-y-5 ${isSettingsExpanded
                  ? 'max-h-[500px] opacity-100 mt-4'
                  : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100 lg:mt-0'
                }`}>
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
            </div>

            {/* Giant Submit Button - Desktop ONLY */}
            <div className="hidden lg:block">
              <button
                id="tour-step-submit-desktop"
                type="submit"
                disabled={lineCount === 0}
                className={`w-full py-4 rounded-3xl font-extrabold text-sm tracking-wide uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer ${lineCount > 0
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
            {/* Sticky Bottom Action Bar - Mobile ONLY */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-900/80 p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Barang</span>
                <span className="text-slate-200 font-mono text-sm sm:text-base font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${lineCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  {lineCount} barang
                </span>
              </div>
              <button
                id="tour-step-submit-mobile"
                type="submit"
                disabled={lineCount === 0}
                className={`flex-1 py-3 px-5 sm:px-6 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97] cursor-pointer ${lineCount > 0
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30"
                    : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
              >
                Generate ({lineCount})
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}

