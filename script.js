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
    document.getElementById('display-role').innerText = "CANDIDATURE : " + role;
    window.scrollTo(0,0);
}

function cancel() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

// --- ENVOI DES DONNÉES ---
document.getElementById('apply-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "ENVOI EN COURS...";

    const payload = {
        nom: document.getElementById('nom').value,
        discord: document.getElementById('discord').value,
        matiere: document.getElementById('matiere').value,
        motivations: document.getElementById('motivs').value,
        role: document.getElementById('input-role').value,
        status: "attente",
        date: new Date().toLocaleString('fr-FR')
    };

    try {
        await fetch(DB_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        alert("Dossier envoyé avec succès !");
        location.reload();
    } catch (err) {
        alert("Erreur lors de l'envoi.");
        btn.disabled = false;
    }
};

// --- ADMINISTRATION ---
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
    const response = await fetch(DB_URL);
    const data = await response.json();
    
    const pending = document.getElementById('list-pending');
    const admission = document.getElementById('list-admission');
    
    pending.innerHTML = "";
    admission.innerHTML = "";

    if(!data) return;

    Object.entries(data).reverse().forEach(([id, c]) => {
        const card = `
            <div class="admin-card">
                <p><b>${c.role}</b> - ${c.date}</p>
                <h3>${c.nom}</h3>
                <p>Discord: ${c.discord} | Pôle: ${c.matiere}</p>
                <div class="motiv-box">${c.motivations}</div>
                <div class="btn-zone">
                    ${c.status === 'attente' ? `
                        <button class="btn-ok" onclick="decider('${id}', 'Accepté')">ACCEPTER</button>
                        <button class="btn-no" onclick="decider('${id}', 'Refusé')">REFUSER</button>
                    ` : `<div class="status-tag ${c.status.toLowerCase()}">${c.status}</div>`}
                </div>
            </div>`;
        
        if(c.status === 'attente') pending.innerHTML += card;
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
