// ===========================================
// kelola_anggota.js — Logic CRUD Kelola Anggota (Admin)
// ===========================================

const SIMULATION_MODE = true;

let DUMMY_ANGGOTA = [
  { id: 1, nama: "Inas Amatullah", username: "inas.a", email: "inas.amtllh@gmail.com", noHp: "+62 8125823582", alamat: "Jl. Cemara No. 1", tanggalDaftar: "14/06/2026", status: "aktif" },
  { id: 2, nama: "Rahmadevi Inas", username: "anggota", email: "rhmainas@gmail.com", noHp: "+62 81234578", alamat: "-", tanggalDaftar: "14/06/2026", status: "nonaktif" },
  { id: 3, nama: "Rahmadevi", username: "rahma.s", email: "rahma@gmail.com", noHp: "+62 83856689633", alamat: "Jl. Indah No. 2", tanggalDaftar: "10/06/2026", status: "aktif" },
];

let nextId = 4;
let selectedId = null;

// ===== UTIL =====
function getInitials(nama) {
  return nama.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}

function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = isError ? "#a01c1c" : "#1d3b2f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

function getTodayString() {
  const d = new Date();
  return d.toISOString().split("T")[0]; // format yyyy-mm-dd untuk input[type=date]
}

// ===== RENDER TABEL =====
function renderTable(data) {
  const tbody = document.getElementById("anggotaBody");

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">Tidak ada anggota ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((a) => `
    <tr data-id="${a.id}">
      <td>
        <div class="student-cell">
          <div class="avatar-sm">${getInitials(a.nama)}</div>
          <span>${a.nama}</span>
        </div>
      </td>
      <td>${a.username}</td>
      <td>${a.email}</td>
      <td><span class="status-pill ${a.status}">${a.status === "aktif" ? "Aktif" : "Nonaktif"}</span></td>
      <td>
        <div class="action-cell">
          <button class="action-btn edit" data-id="${a.id}" title="Edit Anggota">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn toggle ${a.status}" data-id="${a.id}" title="${a.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  // event listeners
  tbody.querySelectorAll(".action-btn.edit").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  tbody.querySelectorAll(".action-btn.toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleStatus(btn.dataset.id));
  });
}

// ===== LOAD =====
async function loadAnggota() {
  if (SIMULATION_MODE) {
    await new Promise((r) => setTimeout(r, 250));
    renderTable(DUMMY_ANGGOTA);
    return;
  }
  // TODO: ganti endpoint, misal "/anggota"
  try {
    const result = await apiRequest("/anggota", "GET");
    renderTable(result);
  } catch (err) {
    showToast("Gagal memuat data anggota.", true);
  }
}

// ===== TAMBAH =====
async function tambahAnggota(data) {
  if (SIMULATION_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const newAnggota = {
      id: nextId++,
      nama: data.nama,
      username: data.username,
      email: data.email,
      noHp: data.noHp,
      alamat: data.alamat,
      tanggalDaftar: data.tanggalDaftar,
      status: "aktif",
    };
    DUMMY_ANGGOTA.unshift(newAnggota);
    return newAnggota;
  }
  // TODO: ganti endpoint, misal "/anggota"
  return await apiRequest("/anggota", "POST", data);
}

// ===== EDIT =====
async function editAnggota(id, data) {
  if (SIMULATION_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const idx = DUMMY_ANGGOTA.findIndex((a) => String(a.id) === String(id));
    if (idx !== -1) DUMMY_ANGGOTA[idx] = { ...DUMMY_ANGGOTA[idx], ...data };
    return DUMMY_ANGGOTA[idx];
  }
  // TODO: ganti endpoint, misal "/anggota/:id"
  return await apiRequest(`/anggota/${id}`, "PUT", data);
}

// ===== TOGGLE STATUS =====
async function toggleStatus(id) {
  const anggota = DUMMY_ANGGOTA.find((a) => String(a.id) === String(id));
  if (!anggota) return;

  const newStatus = anggota.status === "aktif" ? "nonaktif" : "aktif";

  if (SIMULATION_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    anggota.status = newStatus;
    renderTable(DUMMY_ANGGOTA);
    showToast(`Status ${anggota.nama} diubah menjadi ${newStatus}.`);
    return;
  }
  // TODO: ganti endpoint, misal "/anggota/:id/status"
  try {
    await apiRequest(`/anggota/${id}/status`, "PATCH", { status: newStatus });
    loadAnggota();
    showToast(`Status anggota diubah menjadi ${newStatus}.`);
  } catch (err) {
    showToast("Gagal mengubah status.", true);
  }
}

// ===== OPEN MODAL EDIT =====
function openEditModal(id) {
  const anggota = DUMMY_ANGGOTA.find((a) => String(a.id) === String(id));
  if (!anggota) return;
  selectedId = id;
  document.getElementById("e_nama").value = anggota.nama;
  document.getElementById("e_username").value = anggota.username;
  document.getElementById("e_email").value = anggota.email;
  document.getElementById("e_nohp").value = anggota.noHp;
  document.getElementById("e_alamat").value = anggota.alamat;
  document.getElementById("e_status").value = anggota.status;
  openModal("modalEdit");
}

// ===== RESET FORM TAMBAH =====
function resetFormTambah() {
  ["t_nama", "t_username", "t_password", "t_konfirmasi", "t_email", "t_nohp", "t_alamat"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) { el.value = ""; el.classList.remove("invalid"); }
  });
  document.getElementById("t_tanggal").value = getTodayString();
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {
  const btnTambah = document.getElementById("btnTambah");
  const btnBatalTambah = document.getElementById("btnBatalTambah");
  const formTambahWrap = document.getElementById("formTambahWrap");
  const formTambah = document.getElementById("formTambah");
  const formEdit = document.getElementById("formEdit");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");

  // nama admin
  const savedAdmin = localStorage.getItem("dummy_admin");
  if (savedAdmin) document.getElementById("adminName").textContent = JSON.parse(savedAdmin).nama;

  // tampilkan form tambah
  btnTambah.addEventListener("click", () => {
    resetFormTambah();
    formTambahWrap.classList.add("show");
    formTambahWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // sembunyikan form tambah
  btnBatalTambah.addEventListener("click", () => formTambahWrap.classList.remove("show"));

  // close modal buttons
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.getElementById("modalEdit").addEventListener("click", (e) => {
    if (e.target.id === "modalEdit") closeModal("modalEdit");
  });

  // ===== SUBMIT TAMBAH =====
  formTambah.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.getElementById("t_nama").value.trim();
    const username = document.getElementById("t_username").value.trim();
    const password = document.getElementById("t_password").value;
    const konfirmasi = document.getElementById("t_konfirmasi").value;
    const email = document.getElementById("t_email").value.trim();

    // validasi
    let valid = true;
    [["t_nama", nama], ["t_username", username], ["t_password", password], ["t_email", email]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!val) { el.classList.add("invalid"); valid = false; }
      else el.classList.remove("invalid");
    });

    if (password && konfirmasi && password !== konfirmasi) {
      document.getElementById("t_konfirmasi").classList.add("invalid");
      showToast("Password dan konfirmasi tidak cocok.", true);
      return;
    }

    if (!valid) return;

    const btn = document.getElementById("btnSimpanAnggota");
    btn.disabled = true; btn.textContent = "Menyimpan...";

    try {
      await tambahAnggota({
        nama, username, password, email,
        noHp: document.getElementById("t_nohp").value.trim(),
        alamat: document.getElementById("t_alamat").value.trim(),
        tanggalDaftar: document.getElementById("t_tanggal").value,
      });
      formTambahWrap.classList.remove("show");
      showToast(`Anggota "${nama}" berhasil ditambahkan.`);
      loadAnggota();
    } catch (err) {
      showToast(err.message || "Gagal menambahkan anggota.", true);
    } finally {
      btn.disabled = false; btn.textContent = "Simpan Anggota";
    }
  });

  // ===== SUBMIT EDIT =====
  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedId) return;

    const btn = document.getElementById("btnSubmitEdit");
    btn.disabled = true; btn.textContent = "Menyimpan...";

    try {
      await editAnggota(selectedId, {
        nama: document.getElementById("e_nama").value.trim(),
        username: document.getElementById("e_username").value.trim(),
        email: document.getElementById("e_email").value.trim(),
        noHp: document.getElementById("e_nohp").value.trim(),
        alamat: document.getElementById("e_alamat").value.trim(),
        status: document.getElementById("e_status").value,
      });
      closeModal("modalEdit");
      showToast("Data anggota berhasil diperbarui.");
      loadAnggota();
    } catch (err) {
      showToast(err.message || "Gagal memperbarui anggota.", true);
    } finally {
      btn.disabled = false; btn.textContent = "Simpan";
    }
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.add("show");
  });
  document.getElementById("cancelLogout").addEventListener("click", () => logoutModal.classList.remove("show"));
  document.getElementById("keluarBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("dummy_admin");
    window.location.href = "../../index.html";
  });

  loadAnggota();
});