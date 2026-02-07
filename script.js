const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// Intersection Observer pour les animations
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Navigation
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

// Envoi Formulaire
document.getElementById('apply-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true; btn.innerText = "TRANSMISSION...";

    const data = {
        nom: document.getElementById('nom').value,
        discord: document.getElementById('discord').value,
        matiere: document.getElementById('matiere').value,
        motivations: document.getElementById('motivs').value,
        role: document.getElementById('input-role').value,
        status: "attente",
        date: new Date().toLocaleString('fr-FR')
    };

    await fetch(`${DB_URL}.json`, { method: 'POST', body: JSON.stringify(data) });
    alert("Dossier envoyé avec succès !");
    location.reload();
};

// Admin Login
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
    const r = await fetch(`${DB_URL}.json`);
    const data = await r.json();
    const pendingList = document.getElementById('list-pending');
    const admissionList = document.getElementById('list-admission');
    
    pendingList.innerHTML = ""; admissionList.innerHTML = "";
    if(!data) return;

    Object.entries(data).reverse().forEach(([id, c]) => {
        const isPending = c.status === 'attente';
        const cardClass = isPending ? 'pending' : (c.status === 'Accepté' ? 'accepted' : 'rejected');
        
        const cardHtml = `
            <div class="admin-card ${cardClass}">
                <div class="card-top">
                    <span class="card-role-tag">${c.role.toUpperCase()}</span>
                    <span class="card-date">${c.date}</span>
                </div>
                <h3>${c.nom}</h3>
                <div class="card-meta"><b>Discord:</b> ${c.discord} | <b>Pôle:</b> ${c.matiere}</div>
                <div class="card-motivs">${c.motivations}</div>
                <div class="card-actions">
                    ${isPending ? `
                        <button class="btn-approve" onclick="decider('${id}', 'Accepté')">ACCEPTER</button>
                        <button class="btn-reject" onclick="decider('${id}', 'Refusé')">REFUSER</button>
                    ` : `
                        <div class="status-badge ${c.status === 'Accepté' ? 'badge-accepted' : 'badge-rejected'}">
                            DOSSIER ${c.status.toUpperCase()}
                        </div>
                    `}
                </div>
            </div>
        `;

        if(isPending) pendingList.innerHTML += cardHtml;
        else admissionList.innerHTML += cardHtml;
    });
}

async function decider(id, stat) {
    await fetch(`${DB_URL}/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status: stat })
    });
    loadAdmin();
}
