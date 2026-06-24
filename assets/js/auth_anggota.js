// ===========================================
// auth_anggota.js — Logic login (Anggota)
// ===========================================



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
      // Panggil backend beneran
      const result = await apiRequest("/auth/login-anggota", "POST", {
        identifier,
        password,
      });

      // simpan token/sesi kalau backend mengembalikannya
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
      localStorage.setItem("role", "anggota");

      // redirect ke katalog setelah berhasil login
      window.location.href = "katalog_anggota.html";

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