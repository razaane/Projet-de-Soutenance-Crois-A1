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
    const urlRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;


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

        // Validation
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

    const btnEmploye = document.getElementById("btnEmploye");
    const employesSection = document.getElementById("employesSection");
    const listeEmployes = document.getElementById("listeEmployes");
    const profileModal = document.getElementById("profileModal");
    const profileContent = document.getElementById("profileContent");
    const closeProfile = document.getElementById("closeProfile");

    btnEmploye.addEventListener("click", () => {
        employesSection.classList.remove("opacity-0");
        employesSection.classList.remove("hidden");
        listeEmployes.innerHTML = "";

        if (employees.length === 0) {
            listeEmployes.innerHTML = "<p class='text-red-500'>Aucun employé trouvé !</p>";
            return;
        }

        employees.forEach((emp, index) => {
            const empDiv = document.createElement("div");
            empDiv.classList.add(
                "flex",
                "items-center",
                "gap-3",
                "p-2",
                "bg-gray-100",
                "rounded-lg",
                "cursor-pointer",
                "transition-transform",
                "hover:scale-105"
            );

            empDiv.innerHTML = `
                <img src="${emp.photo}" alt="${emp.nom}" class="w-12 h-12 object-cover rounded-full border-2 border-gray-400">
                <div>
                    <h2 class="font-bold text-sm">${emp.nom}</h2>
                    <p class="text-xs text-gray-600 font-bold">${emp.role}</p>
                </div>
            `;

            empDiv.addEventListener("click", () => {
                profileContent.innerHTML = `
                    <div class="flex flex-col gap-3">
                        <img src="${emp.photo}" alt="${emp.nom}" class="w-32 h-32 object-cover rounded-full mx-auto border-2 border-gray-400">
                        <h2 class="text-lg font-bold text-center">${emp.nom}</h2>
                        <p class="text-sm text-center font-semibold">${emp.role}</p>
                        <p class="text-sm">Email: ${emp.email}</p>
                        <p class="text-sm">Téléphone: ${emp.tel}</p>
                        <p class="text-sm">Expériences: ${emp.experiences.join(", ")}</p>
                        <button id="deleteEmp" class="mt-3 bg-red-500 text-white rounded-lg py-2 font-bold hover:bg-red-400">Supprimer</button>
                    </div>
                `;
                profileModal.classList.remove("hidden");
                document.getElementById("deleteEmp").addEventListener("click", () => {
                    employees.splice(index, 1);
                    localStorage.setItem("employees", JSON.stringify(employees));
                    profileModal.classList.add("hidden");
                    btnEmploye.click();
                });
            });

            listeEmployes.appendChild(empDiv);
        });
    });

    closeProfile.addEventListener("click", () => profileModal.classList.add("hidden"));
});


//  <div>
//                     <div class="salleConference border-2"> Salle de Conférence</div>
//                     <!-- <button type="button"
//                         class="btn-add bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg px-3 py-2">
//                         +
//                     </button> -->
//                 </div>

//                 <div>
//                     <div class="reception ">Réception</div>
//                 </div>

//                 <div>
//                     <div class="salleServeurs ">Salle de Serveurs</div>
//                 </div>

//                 <div>
//                     <div class="salleSecurite ">Salle de Sécurités</div>
//                 </div>

//                 <div>
//                     <div class="sallePersonnel">Salle de Personnel</div>
//                 </div>

//                 <div>
//                     <div class="salleArchive"> Salle D'Archive</div>
//                 </div>