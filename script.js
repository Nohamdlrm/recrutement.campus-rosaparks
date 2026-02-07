const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// --- FONCTIONS DE BASE ---
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        document.getElementById('admin-indicator').style.display = 'block';
        loadAdmin();
    }
}

async function loadAdmin() {
    const res = await fetch(DB_URL);
    const data = await res.json();
    const pending = document.getElementById('list-pending');
    const admission = document.getElementById('list-admission');
    
    pending.innerHTML = "";
    admission.innerHTML = "";

    if(!data) return;

    Object.entries(data).reverse().forEach(([id, c]) => {
        // Détermination du statut réel
        const statusClean = c.status === 'en_attente' || c.status === 'attente' ? 'attente' : c.status;
        
        const card = `
            <div class="admin-card" style="border-left-color: ${statusClean === 'Accepté' ? '#10b981' : (statusClean === 'Refusé' ? '#ef4444' : '#38bdf8')}">
                <div class="card-header-pro">
                    <span class="badge-role">${c.role}</span>
                    <span class="card-date"><i class="far fa-clock"></i> ${c.date}</span>
                </div>
                <h3>${c.nom}</h3>
                <div class="info-box">
                    <span><b>Discord:</b> ${c.discord}</span>
                    <span><b>Pôle:</b> ${c.matiere}</span>
                </div>
                <div class="motiv-embed">
                    ${c.motivations}
                </div>
                <div class="btn-group">
                    ${statusClean === 'attente' ? `
                        <button class="btn-adm btn-accept" onclick="decider('${id}', 'Accepté')">Accepter</button>
                        <button class="btn-adm btn-refuse" onclick="decider('${id}', 'Refusé')">Refuser</button>
                    ` : `
                        <div class="final-badge badge-${statusClean.toLowerCase()}">DOSSIER ${statusClean.toUpperCase()}</div>
                    `}
                </div>
            </div>`;

        if(statusClean === 'attente') pending.innerHTML += card;
        else admission.innerHTML += card;
    });
}

async function decider(id, action) {
    const url = `https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`;
    await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify({ status: action })
    });
    loadAdmin();
}

// NAVIGATION... (garder tes fonctions openForm et cancel)
