// ===========================================
// logout-confirm.js — Modal konfirmasi logout (reusable, Anggota)
// ===========================================
//
// Cara pakai di halaman lain:
// 1. Tambahkan <div id="logoutModalRoot"></div> sebelum </body>
// 2. Import file ini setelah api.js
// 3. Ganti listener tombol Logout supaya manggil openLogoutModal() bukan langsung logout

function injectLogoutModal() {
  if (document.getElementById("logoutModalOverlay")) return; // sudah ada, jangan duplikat

  const root = document.getElementById("logoutModalRoot") || document.body;

  const modalHTML = `
    <div class="logout-modal-overlay" id="logoutModalOverlay">
      <div class="logout-modal-card">
        <p class="logout-modal-text">Apakah kamu yakin ingin keluar?</p>
        <div class="logout-modal-actions">
          <button class="logout-modal-btn cancel" id="logoutCancelBtn">Batal</button>
          <button class="logout-modal-btn confirm" id="logoutConfirmBtn">Keluar</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .logout-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(20, 30, 24, 0.45);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 100;
    }
    .logout-modal-overlay.show {
      display: flex;
      animation: logoutFadeIn 0.15s ease;
    }
    @keyframes logoutFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .logout-modal-card {
      background: #fff;
      border: 1px solid #e2ddd0;
      border-radius: 6px;
      max-width: 420px;
      width: 100%;
      padding: 40px 32px 28px;
      text-align: center;
      animation: logoutPopIn 0.18s ease;
    }
    @keyframes logoutPopIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .logout-modal-text {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #2b2b26;
      margin-bottom: 32px;
    }
    .logout-modal-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logout-modal-btn {
      padding: 10px 22px;
      border-radius: 4px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .logout-modal-btn:hover { opacity: 0.85; }
    .logout-modal-btn.cancel {
      background: #ece8de;
      color: #2b2b26;
    }
    .logout-modal-btn.confirm {
      background: #a01c1c;
      color: #fff;
    }
  `;

  document.head.appendChild(style);
  root.insertAdjacentHTML("beforeend", modalHTML);

  document.getElementById("logoutCancelBtn").addEventListener("click", closeLogoutModal);
  document.getElementById("logoutModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "logoutModalOverlay") closeLogoutModal();
  });

  document.getElementById("logoutConfirmBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("dummy_profile");
    // path relatif ke index.html mengikuti kedalaman folder halaman saat ini
    window.location.href = window.LOGOUT_REDIRECT_PATH || "../../index.html";
  });
}

function openLogoutModal() {
  injectLogoutModal();
  document.getElementById("logoutModalOverlay").classList.add("show");
}

function closeLogoutModal() {
  const overlay = document.getElementById("logoutModalOverlay");
  if (overlay) overlay.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  injectLogoutModal();

  // Cari semua link/tombol logout di halaman, override supaya buka modal dulu
  const logoutTrigger = document.getElementById("logoutLink");
  if (logoutTrigger) {
    logoutTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openLogoutModal();
    });
  }
});