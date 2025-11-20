// main.js - copie-colle entier, remplace ton fichier actuel
document.addEventListener("DOMContentLoaded", () => {
    /* -----------------------------
       Config & Storage helpers
    ------------------------------*/
    const STORAGE_EMP = "employees";
    const STORAGE_ZONE = "zonePeople";

    // Get from localStorage or sample fallback
    // let employees = JSON.parse(localStorage.getItem(STORAGE_EMP)) || [
    //     // si tu veux, tu peux supprimer ces exemples
    //     { id: 1, nom: "Sara", role: "Manager", photo: "https://i.pravatar.cc/150?img=1", email: "sara@x.com", tel: "+212600000001", experiences: [], zone: null },
    //     { id: 2, nom: "Omar", role: "Réception", photo: "https://i.pravatar.cc/150?img=2", email: "omar@x.com", tel: "+212600000002", experiences: [], zone: null },
    //     { id: 3, nom: "Aya", role: "Salle Serveurs", photo: "https://i.pravatar.cc/150?img=3", email: "aya@x.com", tel: "+212600000003", experiences: [], zone: null },
    //     { id: 4, nom: "Yassine", role: "Salle Sécurité", photo: "https://i.pravatar.cc/150?img=4", email: "yassine@x.com", tel: "+212600000004", experiences: [], zone: null },
    //     { id: 5, nom: "Imane", role: "Nettoyage", photo: "https://i.pravatar.cc/150?img=5", email: "imane@x.com", tel: "+212600000005", experiences: [], zone: null }
    // ];

    // zonePeople stored shape: { "Réception": [empId,...], ... }
    let zonePeople = JSON.parse(localStorage.getItem(STORAGE_ZONE)) || {
        "Réception": [],
        "Salle de Conférence": [],
        "Salle de Serveurs": [],
        "Salle de Sécurités": [],
        "Salle de Personnel": [],
        "Salle D'Archive": []
    };

    // rules & capacities
    const accessRules = {
        "Réception": ["Réception"],
        "Salle de Conférence": ["Tous"],
        "Salle de Serveurs": ["Salle Serveurs"],
        "Salle de Sécurités": ["Salle Sécurité"],
        "Salle de Personnel": ["Tous"],
        "Salle D'Archive": ["Manager"]
    };

    const maxPeoplePerZone = {
        "Réception": 4,
        "Salle de Conférence": 20,
        "Salle de Serveurs": 2,
        "Salle de Sécurités": 2,
        "Salle de Personnel": 10,
        "Salle D'Archive": 1
    };

    /* -----------------------------
       DOM ELEMENTS
    ------------------------------*/
    const btnAfficher = document.getElementById("btnAfficher");
    const btnEmploye = document.getElementById("btnEmploye");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const form = document.getElementById("formulaire");
    const photoUrlInput = document.getElementById("photo_url");
    const photoPreview = document.getElementById("photo_preview");
    const photoText = document.getElementById("text_container_photo");

    const employesSection = document.getElementById("employesSection");
    const listeEmployes = document.getElementById("listeEmployes");
    const profileModal = document.getElementById("profileModal");
    const profileContent = document.getElementById("profileContent");
    const closeProfile = document.getElementById("closeProfile");

    const btnSalles = document.querySelectorAll(".btnSalle");
    const salleModal = document.getElementById("salleModal");
    const salleContent = document.getElementById("salleContent");
    const closeSalleModal = document.getElementById("closeSalleModal");

    // new elements we added above
    const modalSelect = document.getElementById("modalSelect");
    const modalSelectContent = document.getElementById("modalSelectContent");
    const modalSelectTitle = document.getElementById("modalSelectTitle");
    const closeModalSelect = document.getElementById("closeModalSelect");
    const availableEmployeesEl = document.getElementById("availableEmployees");

    /* -----------------------------
       Small helpers
    ------------------------------*/
    function saveState() {
        localStorage.setItem(STORAGE_EMP, JSON.stringify(employees));
        localStorage.setItem(STORAGE_ZONE, JSON.stringify(zonePeople));
    }

    function getEmployeeById(id) {
        return employees.find(e => e.id === id);
    }

    function getAvailableEmployees() {
        return employees.filter(e => e.zone === null);
    }

    /* -----------------------------
       Render functions
    ------------------------------*/
    function renderAvailableEmployees() {
        if (!availableEmployeesEl) return;
        const available = getAvailableEmployees();
        availableEmployeesEl.innerHTML = "";

        if (available.length === 0) {
            availableEmployeesEl.innerHTML = `<p class="text-sm text-gray-500">Aucun employé non affecté</p>`;
            return;
        }

        available.forEach(emp => {
            const div = document.createElement("div");
            div.className = "flex items-center gap-3 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50";
            div.innerHTML = `
        <img src="${emp.photo}" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex-1">
          <p class="font-semibold text-sm">${emp.nom}</p>
          <p class="text-xs text-gray-500">${emp.role}</p>
        </div>
      `;
            // click opens modal to choose zone? we assign via modal in zone + button
            // but allow quick assign to a default (optional). We'll just not assign on click here.
            availableEmployeesEl.appendChild(div);
        });
    }

    // render single zone contents (tiny cards)
    function renderZone(zoneName) {
        const zoneId = `zone-${zoneName}`;
        // element ids contain spaces, so use querySelector
        const el = document.querySelector(`#${CSS.escape(zoneId)}`);
        if (!el) return;

        el.innerHTML = "";
        const list = zonePeople[zoneName] || [];
        list.forEach(empId => {
            const emp = getEmployeeById(empId);
            if (!emp) return;
            const card = document.createElement("div");
            card.className = "w-[55px] h-[70px] flex flex-col items-center bg-gray-100 rounded-md p-1 shadow relative";
            card.innerHTML = `
        <img src="${emp.photo}" class="w-8 h-8 rounded-full object-cover" />
        <p class="text-[8px] font-semibold truncate w-full text-center">${emp.nom}</p>
        <p class="text-[7px] text-gray-500 truncate w-full text-center">${emp.role}</p>
        <button class="removeEmp absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">×</button>
      `;
            // open profile on click except when clicking delete
            card.addEventListener("click", (e) => {
                if (e.target.classList.contains("removeEmp")) return;
                openProfileModal(emp);
            });
            // remove button
            card.querySelector(".removeEmp").addEventListener("click", (ev) => {
                ev.stopPropagation();
                removeEmployeeFromZone(emp.id, zoneName);
            });
            el.appendChild(card);
        });
    }

    function renderAllZones() {
        Object.keys(zonePeople).forEach(zone => {
            renderZone(zone);
        });
    }

    /* -----------------------------
       Assign / Remove logic
    ------------------------------*/
    function assignEmployeeToZone(empId, zoneName) {
        // capacity check
        const cap = maxPeoplePerZone[zoneName] ?? Infinity;
        if ((zonePeople[zoneName] || []).length >= cap) {
            alert("🚫 Capacité maximale atteinte pour " + zoneName);
            return false;
        }
        const emp = getEmployeeById(empId);
        if (!emp) return false;

        // access rule check
        const rules = accessRules[zoneName] || ["Tous"];
        if (!(rules.includes("Tous") || rules.includes(emp.role) || emp.role === "Manager")) {
            alert("🚫 Cet employé n'est pas autorisé dans " + zoneName);
            return false;
        }

        // remove from previous zone if any
        if (emp.zone) {
            const prev = zonePeople[emp.zone];
            if (prev) {
                zonePeople[emp.zone] = prev.filter(id => id !== empId);
            }
        }

        // assign
        emp.zone = zoneName;
        zonePeople[zoneName] = zonePeople[zoneName] || [];
        zonePeople[zoneName].push(empId);

        saveState();
        renderAvailableEmployees();
        renderZone(zoneName);
        renderAllZones();
        return true;
    }

    function removeEmployeeFromZone(empId, zoneName) {
        const emp = getEmployeeById(empId);
        if (!emp) return;
        zonePeople[zoneName] = (zonePeople[zoneName] || []).filter(id => id !== empId);
        emp.zone = null;
        saveState();
        renderAvailableEmployees();
        renderZone(zoneName);
        renderAllZones();
    }

    /* -----------------------------
       Modal selection (open when + clicked)
    ------------------------------*/
    function openModalSelectForZone(zoneName) {
        modalSelectTitle.textContent = `Ajouter à : ${zoneName}`;
        modalSelectContent.innerHTML = "";

        // compute eligible employees
        const eligible = employees.filter(emp => {
            const rules = accessRules[zoneName] || ["Tous"];
            return (rules.includes("Tous") || rules.includes(emp.role) || emp.role === "Manager") && emp.zone === null;
        });

        if (eligible.length === 0) {
            modalSelectContent.innerHTML = `<p class="text-sm text-gray-500">Aucun employé éligible</p>`;
        } else {
            eligible.forEach(emp => {
                const row = document.createElement("div");
                row.className = "flex items-center justify-between gap-3 p-2 rounded border hover:bg-gray-50 cursor-pointer";
                row.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${emp.photo}" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="font-semibold text-sm">${emp.nom}</p>
              <p class="text-xs text-gray-500">${emp.role}</p>
            </div>
          </div>
          <button class="confirmAdd bg-green-600 text-white px-3 py-1 rounded text-sm">Ajouter</button>
        `;
                // click on ajouter
                row.querySelector(".confirmAdd").addEventListener("click", (e) => {
                    e.stopPropagation();
                    const ok = assignEmployeeToZone(emp.id, zoneName);
                    if (ok) {
                        modalSelect.classList.add("hidden");
                    }
                });
                modalSelectContent.appendChild(row);
            });
        }

        modalSelect.classList.remove("hidden");
    }

    /* -----------------------------
       Profile modal
    ------------------------------*/
    function openProfileModal(emp) {
        profileContent.innerHTML = `
      <div class="flex flex-col gap-3">
        <img src="${emp.photo}" alt="${emp.nom}" class="w-32 h-32 object-cover rounded-full mx-auto" />
        <h2 class="text-lg font-bold text-center">${emp.nom}</h2>
        <p class="text-sm text-center font-semibold">${emp.role}</p>
        <p class="text-sm">Email: ${emp.email}</p>
        <p class="text-sm">Téléphone: ${emp.tel}</p>
        <p class="text-sm">Expériences: ${(emp.experiences || []).join(", ")}</p>
        <p class="text-sm">Localisation : ${emp.zone ?? "Non assigné"}</p>
        <div class="flex gap-2 mt-3">
          <button id="profileRemove" class="bg-red-500 text-white rounded px-3 py-1">Supprimer</button>
          <button id="profileClose" class="bg-gray-200 rounded px-3 py-1">Fermer</button>
        </div>
      </div>
    `;
        profileModal.classList.remove("hidden");

        // remove handler
        document.getElementById("profileRemove").addEventListener("click", () => {
            // delete from employees list entirely
            employees = employees.filter(e => e.id !== emp.id);
            // also remove from zones
            Object.keys(zonePeople).forEach(zone => {
                zonePeople[zone] = zonePeople[zone].filter(id => id !== emp.id);
            });
            saveState();
            profileModal.classList.add("hidden");
            renderAvailableEmployees();
            renderAllZones();
        });
        document.getElementById("profileClose").addEventListener("click", () => profileModal.classList.add("hidden"));
    }

    /* -----------------------------
       UI events binding
    ------------------------------*/
    // open add-employee modal
    if (btnAfficher && modal) btnAfficher.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeModal) closeModal.addEventListener("click", () => modal.classList.add("hidden"));

    // preview photo in add form
    if (photoUrlInput) {
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
    }

    // profile modal close
    if (closeProfile) closeProfile.addEventListener("click", () => profileModal.classList.add("hidden"));

    // salle + buttons
    btnSalles.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const parent = e.target.closest("[data-zone]");
            if (!parent) return;
            const zoneName = parent.getAttribute("data-zone");
            openModalSelectForZone(zoneName);
        });
    });

    if (closeModalSelect) closeModalSelect.addEventListener("click", () => modalSelect.classList.add("hidden"));

    // employé list show/hide
    if (btnEmploye) {
        btnEmploye.addEventListener("click", () => {
            if (!employesSection) return;
            const hidden = employesSection.classList.contains("hidden");
            if (hidden) {
                employesSection.classList.remove("hidden");
                setTimeout(() => employesSection.classList.remove("opacity-0"), 10);
                // render full list of employees for profile view
                renderFullEmployeesList();
            } else {
                employesSection.classList.add("opacity-0");
                setTimeout(() => employesSection.classList.add("hidden"), 300);
            }
        });
    }

    function renderFullEmployeesList() {
        if (!listeEmployes) return;
        listeEmployes.innerHTML = "";
        if (employees.length === 0) {
            listeEmployes.innerHTML = `<p class="text-red-500">Aucun employé trouvé !</p>`;
            return;
        }
        employees.forEach((emp) => {
            const empDiv = document.createElement("div");
            empDiv.className = "flex items-center gap-3 p-2 bg-gray-100 rounded cursor-pointer";
            empDiv.innerHTML = `
        <img src="${emp.photo}" class="w-12 h-12 rounded-full object-cover" />
        <div class="flex-1">
          <h2 class="font-bold text-sm">${emp.nom}</h2>
          <p class="text-xs text-gray-600">${emp.role}</p>
        </div>
      `;
            empDiv.addEventListener("click", () => openProfileModal(emp));
            listeEmployes.appendChild(empDiv);
        });
    }

    /* -----------------------------
       Form submit (add employee)
    ------------------------------*/
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const nom = document.getElementById("nom").value.trim();
            const email = document.getElementById("email").value.trim();
            const tel = document.getElementById("Téléphone").value.trim();
            const role = document.getElementById("role").value;
            const photo = document.getElementById("photo_url").value.trim();
            const experiences = [...document.querySelectorAll(".experience-input")].map(i => i.value.trim()).filter(x => x);

            // basic validation (you can expand)
            if (!nom || !email || !tel || !role || !photo) {
                alert("Remplissez tous les champs obligatoires.");
                return;
            }

            // generate id
            const newId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
            const newEmp = { id: newId, nom, role, photo, email, tel, experiences, zone: null };
            employees.push(newEmp);
            saveState();
            form.reset();
            photoPreview.classList.add("hidden");
            if (employesSection && !employesSection.classList.contains("hidden")) renderFullEmployeesList();
            renderAvailableEmployees();
            alert("✅ Employé ajouté !");
            modal.classList.add("hidden");
        });
    }

    /* -----------------------------
       UI: color zones empty (restricted)
    ------------------------------*/
    const restrictedZones = ["Réception", "Salle de Serveurs", "Salle de Sécurités", "Salle D'Archive"];
    restrictedZones.forEach(zone => {
        const el = document.querySelector(`[data-zone="${zone}"]`);
        if (el && zonePeople[zone] && zonePeople[zone].length === 0) {
            el.classList.add("zone-empty");
        }
    });

    /* -----------------------------
       Init render
    ------------------------------*/
    renderAvailableEmployees();
    renderAllZones();
    // ensure sidebar list up to date
    if (employesSection && !employesSection.classList.contains("hidden")) renderFullEmployeesList();

    const unsignedDiv = document.getElementById("unsignedEmployees");

    // Fonction pour récupérer les employés non assignés
    function renderUnsignedEmployees() {
        const unsigned = employees.filter(emp => !emp.zone);
        unsignedDiv.innerHTML = "";

        unsigned.forEach(emp => {
            const empDiv = document.createElement("div");
            empDiv.innerHTML = `
            <img src="${emp.photo}" alt="${emp.nom}" />
            <p class="truncate">${emp.nom}</p>
            <p class="truncate text-xs text-gray-500">${emp.role}</p>
        `;

            // click pour assigner à zone (par exemple zone sélectionnée)
            empDiv.addEventListener("click", () => {
                const zoneName = prompt("Dans quelle zone voulez-vous ajouter cet employé ?").trim();
                if (!zoneName || !zones[zoneName]) return alert("Zone invalide !");

                // vérifier règles d'accès
                const rules = accessRules[zoneName];
                if (!(rules.includes("Tous") || rules.includes(emp.role))) {
                    return alert("🚫 Ce rôle n'a pas accès à cette zone !");
                }

                // vérifier maxPeoplePerZone
                if (zones[zoneName].length >= maxPeoplePerZone[zoneName]) {
                    return alert("🚫 Capacité maximale atteinte !");
                }

                emp.zone = zoneName;
                zones[zoneName].push(emp);

                renderUnsignedEmployees();
                renderZone(zoneName);
            });

            unsignedDiv.appendChild(empDiv);
        });
    }

    // initialisation
    renderUnsignedEmployees();

    function assignEmployeeToZone(empId, zoneName) {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return;

        emp.zone = zoneName; // maintenant signed
        zones[zoneName].push(emp);

        renderZone(zoneName);       // affiche dans la zone
        renderUnsigned();           // met à jour la liste Unsigned (l’enlève automatiquement)
    }

    // 1. Liste des employés non assignés
    function getUnsignedEmployees() {
        return employees.filter(emp => emp.zone === null);
    }

    // 2. Afficher Unsigned Staff
    function renderUnsigned() {
        const container = document.getElementById("unsignedStaff"); // div à droite
        container.innerHTML = "";
        getUnsignedEmployees().forEach(emp => {
            const div = document.createElement("div");
            div.classList.add("cursor-pointer", "flex", "gap-2", "items-center");
            div.innerHTML = `
            <img src="${emp.photo}" class="w-10 h-10 rounded-full object-cover"/>
            <div>
                <p class="font-semibold">${emp.nom}</p>
                <p class="text-xs text-gray-500">${emp.role}</p>
            </div>
        `;
            // 3. Click pour assigner
            div.addEventListener("click", () => {
                const zone = prompt("Dans quelle zone ajouter cet employé ?");
                if (!zone) return;
                assignEmployeeToZone(emp.id, zone);
            });
            container.appendChild(div);
        });
    }

    // 4. Assignation
    function assignEmployeeToZone(empId, zoneName) {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return;

        emp.zone = zoneName;
        if (!zones[zoneName]) zones[zoneName] = [];
        zones[zoneName].push(emp);

        renderZone(zoneName); // affiche dans la zone
        renderUnsigned();     // supprime de la liste Unsigned
    }

    // 5. Affichage zone
    function renderZone(zoneName) {
        const zoneEl = document.getElementById(`zone-${zoneName}`);
        zoneEl.innerHTML = "";
        zones[zoneName].forEach(emp => {
            zoneEl.innerHTML += `
        <div class="w-[55px] h-[70px] flex flex-col items-center bg-gray-100 rounded-md p-1 shadow">
            <img src="${emp.photo}" class="w-8 h-8 rounded-full object-cover"/>
            <p class="text-[8px] font-semibold truncate w-full text-center">${emp.nom}</p>
            <p class="text-[7px] text-gray-500 truncate w-full text-center">${emp.role}</p>
        </div>`;
        });
    }

}); 
