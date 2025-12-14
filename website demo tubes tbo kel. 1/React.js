import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  LogOut,
  CreditCard,
  BarChart3,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
} from "lucide-react";

const SmartMallPark = () => {
  const [activeTab, setActiveTab] = useState("entrance");
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [scannedPlate, setScannedPlate] = useState("");
  const [gateStatus, setGateStatus] = useState("TERTUTUP");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const fileInputRef = useRef(null);

  // Simulasi OCR yang lebih realistis
  const simulateOCR = () => {
    const plates = [
      "B1234ABC",
      "D5678XYZ",
      "B9999KLM",
      "D1111PQR",
      "B8888TUV",
      "D3333MNO",
    ];
    return plates[Math.floor(Math.random() * plates.length)];
  };

  const validatePlate = (plate) => {
    const regex = /^[A-Z]{1,2}\d{1,4}[A-Z]{1,3}$/;
    return regex.test(plate);
  };

  const addLog = (action, plate, details = "") => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString("id-ID"),
      action,
      plate,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Mode Demo Otomatis
  const runDemoMode = () => {
    setDemoMode(true);
    addLog("DEMO", "SYSTEM", "Mode demo dimulai");

    // Simulasi masuk
    setTimeout(() => {
      const plate = "B1234ABC";
      setScannedPlate(plate);
      addLog("SCAN", plate, "Plat terdeteksi di gerbang masuk");

      setTimeout(() => {
        handleEntrance(plate);
        setScannedPlate("");
      }, 1500);
    }, 1000);
  };

  const scanPlateSimulation = () => {
    const plate = simulateOCR();
    setScannedPlate(plate);
    addLog("SCAN", plate, "Simulasi OCR berhasil");

    setTimeout(() => {
      if (activeTab === "entrance") {
        handleEntrance(plate);
      } else if (activeTab === "exit") {
        handleExit(plate);
      }
      setScannedPlate("");
    }, 1500);
  };

  // Handle file upload untuk simulasi scan dari gambar
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addLog("UPLOAD", "IMAGE", `Gambar ${file.name} diunggah`);
      // Simulasi OCR dari gambar
      setTimeout(() => {
        scanPlateSimulation();
      }, 1000);
    }
  };

  const handleEntrance = (plate) => {
    if (!validatePlate(plate)) {
      alert("Format plat tidak valid!");
      addLog("SCAN_GAGAL", plate, "Format tidak valid");
      return;
    }

    const existing = vehicles.find(
      (v) => v.plate === plate && v.status === "IN"
    );
    if (existing) {
      alert("Kendaraan sudah terparkir!");
      addLog("MASUK_GAGAL", plate, "Kendaraan sudah di dalam");
      return;
    }

    const newVehicle = {
      id: Date.now(),
      plate,
      entryTime: new Date(),
      status: "IN",
      paid: false,
    };

    setVehicles((prev) => [...prev, newVehicle]);
    setGateStatus("TERBUKA");
    addLog("MASUK", plate, "Gerbang masuk terbuka");

    setTimeout(() => {
      setGateStatus("TERTUTUP");
      addLog("GERBANG", plate, "Gerbang masuk tertutup");
    }, 3000);
  };

  const handleExit = (plate) => {
    const vehicle = vehicles.find(
      (v) => v.plate === plate && v.status === "IN"
    );
    if (!vehicle) {
      alert("Kendaraan tidak ditemukan atau sudah keluar!");
      addLog("KELUAR_GAGAL", plate, "Kendaraan tidak ditemukan");
      return;
    }

    const duration = Math.floor((new Date() - vehicle.entryTime) / 1000 / 60);
    const rate = 3000;
    const cost = Math.max(rate, Math.ceil(duration / 60) * rate);

    setSelectedVehicle({ ...vehicle, duration, cost });
    addLog("SCAN_KELUAR", plate, `Durasi: ${duration} menit`);
    setActiveTab("payment");
  };

  const processPayment = () => {
    if (!selectedVehicle) return;

    const updatedVehicles = vehicles.map((v) =>
      v.id === selectedVehicle.id
        ? { ...v, paid: true, exitTime: new Date(), cost: selectedVehicle.cost }
        : v
    );
    setVehicles(updatedVehicles);

    addLog(
      "BAYAR",
      selectedVehicle.plate,
      `Rp ${selectedVehicle.cost.toLocaleString()}`
    );

    // Auto proceed ke exit setelah bayar
    setTimeout(() => {
      completeExit(selectedVehicle);
    }, 2000);
  };

  const completeExit = (vehicle) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicle.id ? { ...v, status: "OUT" } : v
    );
    setVehicles(updatedVehicles);

    setGateStatus("TERBUKA");
    addLog("KELUAR", vehicle.plate, "Gerbang keluar terbuka");

    setTimeout(() => {
      setGateStatus("TERTUTUP");
      addLog("GERBANG", vehicle.plate, "Gerbang keluar tertutup");
      setSelectedVehicle(null);
      setActiveTab("admin");
    }, 3000);
  };

  const stats = {
    total: vehicles.length,
    parked: vehicles.filter((v) => v.status === "IN").length,
    revenue: vehicles
      .filter((v) => v.paid)
      .reduce((sum, v) => sum + (v.cost || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  SmartMallPark
                </h1>
                <p className="text-sm text-gray-500">Sistem Parkir Otomatis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={runDemoMode}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
              >
                🎬 Mode Demo
              </button>
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  gateStatus === "TERBUKA"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Gerbang: {gateStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-2 flex space-x-2">
          {[
            { id: "entrance", icon: LogOut, label: "Masuk", rotate: true },
            { id: "exit", icon: LogOut, label: "Keluar" },
            { id: "payment", icon: CreditCard, label: "Pembayaran" },
            { id: "admin", icon: BarChart3, label: "Admin" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 ${tab.rotate ? "rotate-180" : ""}`}
              />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Entrance Tab */}
        {activeTab === "entrance" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Gerbang Masuk
            </h2>

            <div className="text-center">
              {/* Simulasi Kamera */}
              <div className="relative w-full max-w-2xl mx-auto mb-6">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simulasi feed kamera */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-6 h-full">
                      {[...Array(48)].map((_, i) => (
                        <div key={i} className="border border-gray-600"></div>
                      ))}
                    </div>
                  </div>

                  {/* Target scan area */}
                  <div className="relative z-10 border-4 border-yellow-400 rounded-lg p-8 bg-black bg-opacity-40">
                    <Camera className="w-16 h-16 text-yellow-400 mb-2 mx-auto animate-pulse" />
                    <p className="text-yellow-400 font-semibold">SCAN AREA</p>
                    {scannedPlate && (
                      <div className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg font-bold text-xl animate-pulse">
                        {scannedPlate}
                      </div>
                    )}
                  </div>

                  {/* Overlay info */}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    REC
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                    GERBANG MASUK
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 max-w-2xl mx-auto">
                <p className="font-semibold mb-2">📸 Simulasi Kamera & OCR</p>
                <p>
                  Sistem menggunakan teknologi OCR untuk membaca plat nomor
                  secara otomatis. Dalam implementasi nyata, kamera akan aktif
                  menggunakan WebRTC API.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={scanPlateSimulation}
                    className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Scan Plat Nomor</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Gambar</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  * Klik "Scan Plat Nomor" untuk simulasi atau upload gambar
                  plat
                </p>
              </div>

              {scannedPlate && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg max-w-md mx-auto animate-bounce">
                  <p className="text-green-800 font-bold text-lg">
                    ✅ Plat Terdeteksi: {scannedPlate}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Memproses masuk...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exit Tab */}
        {activeTab === "exit" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Gerbang Keluar
            </h2>

            <div className="text-center">
              <div className="relative w-full max-w-2xl mx-auto mb-6">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-6 h-full">
                      {[...Array(48)].map((_, i) => (
                        <div key={i} className="border border-gray-600"></div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 border-4 border-yellow-400 rounded-lg p-8 bg-black bg-opacity-40">
                    <Camera className="w-16 h-16 text-yellow-400 mb-2 mx-auto animate-pulse" />
                    <p className="text-yellow-400 font-semibold">SCAN AREA</p>
                    {scannedPlate && (
                      <div className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg font-bold text-xl animate-pulse">
                        {scannedPlate}
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    REC
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                    GERBANG KELUAR
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 max-w-2xl mx-auto">
                <p className="font-semibold mb-2">⚠️ Scan untuk Keluar</p>
                <p>
                  Pastikan kendaraan sudah terdaftar masuk. Sistem akan
                  menghitung durasi dan biaya parkir otomatis.
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={scanPlateSimulation}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Scan Plat Nomor</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Gambar</span>
                </button>
              </div>

              {scannedPlate && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg max-w-md mx-auto animate-bounce">
                  <p className="text-green-800 font-bold text-lg">
                    ✅ Plat Terdeteksi: {scannedPlate}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Menghitung biaya...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Pembayaran QRIS
            </h2>

            {selectedVehicle ? (
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-indigo-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Plat Nomor:</span>
                      <span className="font-bold text-xl">
                        {selectedVehicle.plate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waktu Masuk:</span>
                      <span className="font-semibold">
                        {selectedVehicle.entryTime.toLocaleTimeString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi:</span>
                      <span className="font-semibold">
                        {selectedVehicle.duration} menit
                      </span>
                    </div>
                    <div className="border-t-2 border-indigo-300 pt-3 mt-3">
                      <div className="flex justify-between items-center text-2xl">
                        <span className="text-gray-800 font-bold">Total:</span>
                        <span className="font-bold text-indigo-600">
                          Rp {selectedVehicle.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 mb-6 shadow-lg">
                  <div className="bg-white rounded-lg p-6">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center rounded-lg border-4 border-dashed border-blue-400">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-gray-700 font-semibold text-center">
                        QR Code QRIS
                      </p>
                      <p className="text-gray-500 text-sm">(Simulasi)</p>
                      <div className="mt-4 grid grid-cols-8 gap-1">
                        {[...Array(64)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 ${
                              Math.random() > 0.5 ? "bg-black" : "bg-white"
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-white mt-4 text-sm">
                      Scan dengan aplikasi mobile banking
                    </p>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                >
                  ✅ Konfirmasi Pembayaran
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  Dalam implementasi nyata, sistem akan terintegrasi dengan
                  payment gateway
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold">
                  Tidak ada transaksi pembayaran
                </p>
                <p className="text-sm mt-2">
                  Silakan scan plat di gerbang keluar terlebih dahulu
                </p>
              </div>
            )}
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Kendaraan</p>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                  </div>
                  <BarChart3 className="w-14 h-14 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Sedang Parkir</p>
                    <p className="text-4xl font-bold mt-2">{stats.parked}</p>
                  </div>
                  <Clock className="w-14 h-14 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Pendapatan</p>
                    <p className="text-3xl font-bold mt-2">
                      Rp {stats.revenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-14 h-14 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Vehicles Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Daftar Kendaraan
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Plat Nomor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Waktu Masuk
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Pembayaran
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Biaya
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vehicles.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Belum ada kendaraan. Klik "Mode Demo" untuk simulasi.
                        </td>
                      </tr>
                    ) : (
                      vehicles.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-indigo-50 transition"
                        >
                          <td className="px-4 py-3 font-bold text-indigo-600">
                            {v.plate}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {v.entryTime.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                v.status === "IN"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-gray-100 text-gray-700 border border-gray-300"
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {v.paid ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-purple-600">
                            {v.cost ? `Rp ${v.cost.toLocaleString()}` : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Logs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                System Log
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada aktivitas sistem
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:shadow-md transition"
                    >
                      <div className="flex-shrink-0 w-3 h-3 mt-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold text-indigo-600">
                            {log.plate}
                          </span>
                          {log.details && ` - ${log.details}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMallPark;
