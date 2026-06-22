// ===========================================
// auth.js — Logic login (Admin)
// ===========================================

// ⚠️ SIMULASI SEMENTARA — hapus / ganti SIMULATION_MODE jadi false
// kalau backend dari temenmu sudah siap dan endpoint sudah dipasang.
const SIMULATION_MODE = true;

const DUMMY_ADMIN = {
  identifier: "admin",
  password: "admin123",
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const identifierInput = document.getElementById("identifier");
  const passwordInput = document.getElementById("password");
  const identifierError = document.getElementById("identifierError");
  const passwordError = document.getElementById("passwordError");
  const formError = document.getElementById("formError");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  const submitLabel = document.getElementById("submitLabel");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // reset error state
    formError.classList.remove("show");
    identifierError.classList.remove("show");
    passwordError.classList.remove("show");
    identifierInput.classList.remove("invalid");
    passwordInput.classList.remove("invalid");

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    // validasi sederhana di sisi frontend
    let hasError = false;
    if (!identifier) {
      identifierError.classList.add("show");
      identifierInput.classList.add("invalid");
      hasError = true;
    }
    if (!password) {
      passwordError.classList.add("show");
      passwordInput.classList.add("invalid");
      hasError = true;
    }
    if (hasError) return;

    // loading state
    submitBtn.disabled = true;
    spinner.classList.add("show");
    submitLabel.textContent = "Memproses...";

    try {
      if (SIMULATION_MODE) {
        // --- MODE SIMULASI: cek manual tanpa manggil backend ---
        await new Promise((resolve) => setTimeout(resolve, 600)); // pura-pura loading

        if (identifier === DUMMY_ADMIN.identifier && password === DUMMY_ADMIN.password) {
          localStorage.setItem("token", "dummy-token-admin");
          localStorage.setItem("role", "admin");

          // Inisialisasi data admin dummy begitu login berhasil
          if (!localStorage.getItem("dummy_admin")) {
            localStorage.setItem("dummy_admin", JSON.stringify({ nama: "Admin Name" }));
          }

          window.location.href = "dashboard_admin.html";
          return;
        } else {
          throw new Error("Username/email atau password yang Anda masukkan salah.");
        }
      }

      // --- MODE ASLI: manggil backend beneran ---
      // TODO: ganti endpoint sesuai yang disediakan backend, misal "/auth/login-admin"
      const result = await apiRequest("/auth/login-admin", "POST", {
        identifier,
        password,
      });

      // simpan token/sesi kalau backend mengembalikannya
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
      localStorage.setItem("role", "admin");

      // redirect ke dashboard admin setelah berhasil
      window.location.href = "dashboard_admin.html";

    } catch (err) {
      formError.textContent = err.message || "Username/email atau password yang Anda masukkan salah.";
      formError.classList.add("show");
    } finally {
      submitBtn.disabled = false;
      spinner.classList.remove("show");
      submitLabel.textContent = "Log In";
    }
  });
});