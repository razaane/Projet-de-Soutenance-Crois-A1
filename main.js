document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const btnAfficher = document.getElementById("btnAfficher");
    const closeModal = document.getElementById("closeModal");
    const form = document.getElementById("formulaire");
    const container = document.getElementById("experience_container");
    const photoUrlInput = document.getElementById("photo_url");
    const photoPreview = document.getElementById("photo_preview");
    const photoText = document.getElementById("text_container_photo");

    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+212|0)(6|7)\d{8}$/;
    const urlRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+/;

    btnAfficher.addEventListener("click", () => modal.classList.remove("hidden"));
    closeModal.addEventListener("click", () => modal.classList.add("hidden"));

    photoUrlInput.addEventListener("input", () => {
        const url = photoUrlInput.value.trim();
        if (!url) {
            photoPreview.classList.add("hidden");
            photoText.classList.remove("hidden");
            return;
        }
        photoPreview.src = url;
        photoPreview.classList.remove("hidden");
        photoText.classList.add("hidden");
    });

    container.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-add")) return;

        const newExp = document.createElement("div");
        newExp.classList.add("flex", "items-center", "gap-2", "experience-item");
        newExp.innerHTML = `
            <textarea class="experience-input border border-2 rounded-lg w-full p-2 text-sm" rows="1"
                placeholder="Décrire une autre expérience"></textarea>
            <button type="button"
                class="btn-add bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg px-3 py-2">+</button>
        `;
        container.appendChild(newExp);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nom = document.getElementById("nom").value.trim();
        const email = document.getElementById("email").value.trim();
        const tel = document.getElementById("Téléphone").value.trim();
        const role = document.getElementById("role").value;
        const photo = photoUrlInput.value.trim();

        const experiences = [...document.querySelectorAll(".experience-input")]
            .map(exp => exp.value.trim())
            .filter(exp => exp !== "");

        if (!nameRegex.test(nom)) return alert("❌ Nom invalide !");
        if (!emailRegex.test(email)) return alert("❌ Email invalide !");
        if (!phoneRegex.test(tel)) return alert("❌ Téléphone invalide !");
        if (!urlRegex.test(photo)) return alert("❌ URL de photo invalide !");
        if (role === "Choisir un rôle") return alert("❌ Choisissez un rôle !");
        if (experiences.length === 0) return alert("❌ Ajoutez au moins une expérience !");

        const employee = { nom, email, tel, role, photo, experiences };
        employees.push(employee);
        localStorage.setItem("employees", JSON.stringify(employees));

        alert("✅ Employé ajouté avec succès !");
        modal.classList.add("hidden");
        form.reset();
        photoPreview.classList.add("hidden");
        photoText.classList.remove("hidden");
    });

    
});
