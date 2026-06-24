// ===========================================
// profil.js — Logic lihat & edit profil (Anggota)
// ===========================================



const FIELD_IDS = ["nama", "username", "email", "noHp", "alamat", "password"];

function getInitials(nama) {
  return nama
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function fillForm(data) {
  FIELD_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = data[id] || "";
  });
  document.getElementById("avatarInitials").textContent = getInitials(data.nama || "?");
  document.getElementById("avatarName").textContent = data.nama || "-";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

let originalData = {};

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("profileForm");
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveSpinner = document.getElementById("saveSpinner");
  const saveLabel = document.getElementById("saveLabel");
  const logoutLink = document.getElementById("logoutLink");

  // ===== Ambil data profil saat halaman dibuka =====
  async function loadProfile() {
    // Panggil backend beneran
    try {
      const result = await apiRequest("/anggota/profil", "GET");
      fillForm(result);
      originalData = { ...result };
    } catch (err) {
      showToast("Gagal memuat data profil.");
    }
  }

  function setEditMode(isEditing) {
    FIELD_IDS.forEach((id) => {
      document.getElementById(id).disabled = !isEditing;
    });
    editBtn.style.display = isEditing ? "none" : "inline-flex";
    saveBtn.style.display = isEditing ? "inline-flex" : "none";
    cancelBtn.style.display = isEditing ? "inline-flex" : "none";
  }

  editBtn.addEventListener("click", () => setEditMode(true));

  cancelBtn.addEventListener("click", () => {
    fillForm(originalData);
    setEditMode(false);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {};
    FIELD_IDS.forEach((id) => {
      updatedData[id] = document.getElementById(id).value.trim();
    });

    saveBtn.disabled = true;
    saveSpinner.classList.add("show");
    saveLabel.textContent = "Menyimpan...";

    try {
      // Kirim update ke backend
      const result = await apiRequest("/anggota/profil", "PUT", updatedData);
      originalData = { ...updatedData };
      fillForm(result);
      setEditMode(false);
      showToast("Profil berhasil diperbarui.");

    } catch (err) {
      showToast(err.message || "Gagal menyimpan perubahan.");
    } finally {
      saveBtn.disabled = false;
      saveSpinner.classList.remove("show");
      saveLabel.textContent = "Simpan";
    }
  });

  // Logout sekarang ditangani oleh logout-confirm.js (modal konfirmasi)

  loadProfile();
});