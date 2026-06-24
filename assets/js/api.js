// ===========================================
// api.js — Pusat konfigurasi & fungsi fetch ke backend
// ===========================================

const BASE_URL = "https://libraryapsiteo-production.up.railway.app/api";

async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Kalau nanti backend pakai token (JWT/session), tinggal tambahkan di sini
  const token = localStorage.getItem("token");
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Terjadi kesalahan pada server.");
  }

  return response.json();
}