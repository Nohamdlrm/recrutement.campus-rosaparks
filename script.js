const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// MODE SOMBRE/CLAIR
function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('#theme-toggle i');
    if(body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

// POPUP PERSONNALISÉE
function showPopup(title, text, type) {
    const popup = document.getElementById('custom-popup');
    const icon = document.getElementById('popup-icon');
    document.getElementById('popup-title').innerText = title;
    document.getElementById('popup-text').innerText = text;
    icon.className = type === 'success' ? 'fas fa-check-circle success-icon' : 'fas fa-exclamation-triangle error-icon';
    popup.style.display = 'flex';
}

function closePopup() {
    document.getElementById('custom-popup').style.display = 'none';
}

function openForm(role) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    document.getElementById('input-role').value = role;
}

function cancel() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

// ENVOI FORMULAIRE
document.getElementById('apply-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "Envoi en cours...";

    const data = {
        nom: document.getElementById('nom').value,
        discord: document.getElementById('discord').value,
        matiere: document.getElementById('matiere').value,
        motivations: document.getElementById('motivs').value,
        role: document.getElementById('input-role').value,
        status: "attente",
        date: new Date().toLocaleString('fr-FR')
    };

    await fetch(DB_URL, { method: 'POST', body: JSON.stringify(data) });
    showPopup("Dossier Envoyé", "Votre dossier a bien été envoyé à la direction. La direction prend les décisions en moins de 24h. Merci de ne pas relancer votre candidature sous un refus.", "success");
    cancel();
    btn.disabled = false;
    btn.innerText = "Déposer le dossier";
};

// CONNEXION ADMIN
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        loadAdmin();
    } else {
        showPopup("Accès Refusé", "Vous n'êtes pas administrateur de la base. Pour en savoir plus, contactez l'administration.", "error");
    }
}

async function loadAdmin() {
    const res = await fetch(DB_URL);
    const data = await res.json();
    const pList = document.getElementById('list-pending');
    const aList = document.getElementById('list-admission');
    pList.innerHTML = ""; aList.innerHTML = "";
    if(!data) return;

    Object.entries(data).reverse().forEach(([id, c]) => {
        const isAttente = (c.status === 'attente');
        const card = `
            <div class="embed-card ${c.status.toLowerCase()}">
                <button class="btn-delete" onclick="deleteDoc('${id}')"><i class="fas fa-trash"></i></button>
                <h3>Candidature : ${c.nom}</h3>
                <p><b>Discord :</b> ${c.discord} | <b>Poste :</b> ${c.matiere}</p>
                <p style="font-size:0.8rem; color:grey;">Déposé le : ${c.date}</p>
                <div style="background:rgba(0,0,0,0.05); padding:10px; border-radius:5px; margin-top:10px;">${c.motivations}</div>
                ${isAttente ? `
                    <div class="decision-row">
                        <button class="btn-choice btn-accept" onclick="decider('${id}', 'Accepté')">Accepter</button>
                        <button class="btn-choice btn-refuse" onclick="decider('${id}', 'Refusé')">Refuser</button>
                    </div>
                ` : `<div style="margin-top:10px; font-weight:700;">STATUS : ${c.status.toUpperCase()}</div>`}
            </div>`;
        if(isAttente) pList.innerHTML += card;
        else aList.innerHTML += card;
    });
}

async function decider(id, action) {
    const url = `https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`;
    await fetch(url, { method: 'PATCH', body: JSON.stringify({ status: action }) });
    loadAdmin();
}

async function deleteDoc(id) {
    if(confirm("Supprimer définitivement ce dossier ?")) {
        const url = `https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`;
        await fetch(url, { method: 'DELETE' });
        loadAdmin();
    }
}
