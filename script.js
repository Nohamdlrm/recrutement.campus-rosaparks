const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// --- ANIMATIONS ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

window.onscroll = () => {
    if(window.scrollY === 0) {
        document.querySelectorAll('.reset-me').forEach(el => el.classList.remove('active'));
    }
};

// --- NAVIGATION ---
function openForm(role) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    document.getElementById('input-role').value = role;
    document.getElementById('display-role').innerText = "CANDIDATURE " + role.toUpperCase();
    window.scrollTo(0,0);
}

function cancel() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

// --- LOGIQUE FIREBASE ---
document.getElementById('apply-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.innerText = "TRANSMISSION...";
    btn.disabled = true;

    const payload = {
        nom: document.getElementById('nom').value,
        discord: document.getElementById('discord').value,
        matiere: document.getElementById('matiere').value,
        motivations: document.getElementById('motivs').value,
        role: document.getElementById('input-role').value,
        status: "attente",
        date: new Date().toLocaleString('fr-FR')
    };

    await fetch(DB_URL, { method: 'POST', body: JSON.stringify(payload) });
    alert("Dossier envoyé !");
    location.reload();
};

// --- ADMIN ---
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
    pending.innerHTML = ""; admission.innerHTML = "";

    if(!data) return;

    Object.entries(data).reverse().forEach(([id, c]) => {
        const card = `
            <div class="admin-card">
                <div style="display:flex; justify-content:space-between; color:var(--blue); font-weight:800; font-size:0.8rem">
                    <span>${c.role}</span><span>${c.date}</span>
                </div>
                <h3>${c.nom}</h3>
                <p>Discord: ${c.discord} | Matière: ${c.matiere}</p>
                <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; margin:10px 0;">${c.motivations}</div>
                <div class="btn-zone">
                    ${c.status === 'attente' ? `
                        <button onclick="decider('${id}', 'Accepté')" style="background:#10b981; border:none; color:white; padding:10px; border-radius:5px; cursor:pointer; width:48%">ACCEPTER</button>
                        <button onclick="decider('${id}', 'Refusé')" style="background:#ef4444; border:none; color:white; padding:10px; border-radius:5px; cursor:pointer; width:48%">REFUSER</button>
                    ` : `<div class="status-tag ${c.status.toLowerCase()}">DOSSIER ${c.status.toUpperCase()}</div>`}
                </div>
            </div>`;
        if(c.status === 'attente') pending.innerHTML += card;
        else admission.innerHTML += card;
    });
}

async function decider(id, action) {
    const url = `https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`;
    await fetch(url, { method: 'PATCH', body: JSON.stringify({ status: action }) });
    loadAdmin();
}
