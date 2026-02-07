// CONFIGURATION UNIQUE
const DB_BASE = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// --- ANIMATIONS ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

window.addEventListener('scroll', () => {
    if(window.scrollY === 0) {
        document.querySelectorAll('.reset-me').forEach(el => el.classList.remove('active'));
    }
});

// --- NAVIGATION ---
function openForm(role) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    document.getElementById('input-role').value = role;
    document.getElementById('display-role').innerText = "CANDIDATURE : " + role.toUpperCase();
    window.scrollTo(0,0);
}

function cancel() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

// --- ENVOI FIREBASE ---
document.getElementById('main-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "ENVOI EN COURS...";

    const data = {
        nom: document.getElementById('input-name').value,
        discord: document.getElementById('input-discord').value,
        matiere: document.getElementById('input-sub').value,
        motivations: document.getElementById('input-motivs').value,
        role: document.getElementById('input-role').value,
        status: "en_attente", // Statut initial strict
        date: new Date().toLocaleString('fr-FR')
    };

    try {
        const response = await fetch(`${DB_BASE}.json`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) 
        });
        if(response.ok) {
            alert("✅ Dossier transmis au campus !");
            location.reload();
        }
    } catch (error) {
        alert("❌ Erreur réseau");
        btn.disabled = false;
    }
});

// --- ADMIN : GESTION ET AFFICHAGE ---
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        document.getElementById('admin-indicator').style.display = 'block';
        loadData(); // Lancement du chargement
    }
}

async function loadData() {
    try {
        const response = await fetch(`${DB_BASE}.json`);
        const data = await response.json();
        
        const pendingList = document.getElementById('pending-list');
        const admissionCenter = document.getElementById('admission-center');
        
        pendingList.innerHTML = "";
        admissionCenter.innerHTML = "";

        if(!data) {
            pendingList.innerHTML = "<p>Aucun nouveau dossier.</p>";
            return;
        }

        // On transforme l'objet Firebase en tableau et on l'inverse (plus récent en premier)
        Object.entries(data).reverse().forEach(([id, c]) => {
            // Création de la carte
            const card = document.createElement('div');
            card.className = "admin-card";
            
            // Formatage de la couleur de statut pour le centre d'admission
            const statusClass = c.status === 'Accepté' ? 'status-accepté' : (c.status === 'Refusé' ? 'status-refusé' : '');

            card.innerHTML = `
                <div class="card-header">
                    <span class="role-badge">${c.role}</span>
                    <span class="date-txt">${c.date}</span>
                </div>
                <h3>${c.nom}</h3>
                <p><b>Discord :</b> ${c.discord} | <b>Pôle :</b> ${c.matiere}</p>
                <div class="motiv-box">${c.motivations}</div>
                <div class="action-zone">
                    ${c.status === 'en_attente' ? `
                        <button class="btn-approve" onclick="updateStatus('${id}', 'Accepté')">ACCEPTER</button>
                        <button class="btn-reject" onclick="updateStatus('${id}', 'Refusé')">REFUSER</button>
                    ` : `
                        <div class="final-status ${statusClass}">DOSSIER ${c.status.toUpperCase()}</div>
                    `}
                </div>
            `;

            // Tri automatique dans les deux sections
            if(c.status === 'en_attente') {
                pendingList.appendChild(card);
            } else {
                admissionCenter.appendChild(card);
            }
        });
    } catch (e) {
        console.error("Erreur de chargement :", e);
    }
}

async function updateStatus(id, newStatus) {
    try {
        await fetch(`${DB_BASE}/${id}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        loadData(); // Recharger les listes après modification
    } catch (e) {
        alert("Erreur lors de la mise à jour");
    }
}
