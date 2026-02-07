const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

// GESTION POPUPS & LOADER
const overlay = document.getElementById('overlay');
const box = document.getElementById('popup-box');

function showMsg(title, text, type = "info", onConfirm = null) {
    box.innerHTML = `
        <h2 style="margin-bottom:15px">${title}</h2>
        <p style="margin-bottom:25px; opacity:0.8">${text}</p>
        <div style="display:flex; gap:10px">
            ${onConfirm ? `<button class="btn-main" style="background:#f2f2f7; color:#000" onclick="closePop()">Annuler</button>` : ''}
            <button class="btn-main" id="pop-ok-btn">${onConfirm ? 'Confirmer' : 'D\'accord'}</button>
        </div>
    `;
    overlay.style.display = 'flex';
    document.getElementById('pop-ok-btn').onclick = () => {
        if(onConfirm) onConfirm();
        closePop();
    };
}

function closePop() { overlay.style.display = 'none'; }

// ACTUALISER AVEC SPINNER 3S
async function refreshData() {
    box.innerHTML = `<div class="spinner"></div><p>Synchronisation avec la base...</p>`;
    overlay.style.display = 'flex';

    setTimeout(async () => {
        await loadAdmin();
        box.innerHTML = `
            <i class="fas fa-check-circle" style="color:#34c759; font-size:3.5rem; margin-bottom:15px; display:block;"></i>
            <h2>Bien actualisé</h2>
            <p style="margin-top:10px">Les dossiers sont à jour.</p>
            <button class="btn-main" style="margin-top:20px" onclick="closePop()">D'accord</button>
        `;
    }, 5000); 
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

// ENVOI
document.getElementById('apply-form').onsubmit = async (e) => {
    e.preventDefault();
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
    showMsg("Dossier Envoyé", "Votre dossier a été transmis à la direction. Décision sous 24h.");
    cancel();
};

// ADMIN
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        loadAdmin();
    } else {
        showMsg("Accès Refusé", "Vous n'êtes pas administrateur.");
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
        const card = `
            <div class="embed-card ${c.status.toLowerCase()}">
                <button class="btn-trash" onclick="askDel('${id}')"><i class="fas fa-trash"></i></button>
                <p><b>Prenom & Nom Rp :</b> ${c.nom}</p>
                <p><b>Discord :</b> ${c.discord}</p>
                <p><b>Poste :</b> ${c.matiere}</p>
                <div style="background:rgba(0,0,0,0.05); padding:15px; border-radius:12px; margin:15px 0;">
                    <b>Motivation :</b><br>${c.motivations}
                </div>
                ${c.status === 'attente' ? `
                    <button class="btn-refresh" style="background:#34c759" onclick="decide('${id}','Accepté')">Accepter</button>
                    <button class="btn-refresh" style="background:#ff3b30; margin-left:10px" onclick="decide('${id}','Refusé')">Refuser</button>
                ` : `<b>DÉCISION : ${c.status.toUpperCase()}</b>`}
            </div>`;
        c.status === 'attente' ? pList.innerHTML += card : aList.innerHTML += card;
    });
}

async function decide(id, s) {
    await fetch(`https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`, {
        method: 'PATCH', body: JSON.stringify({ status: s })
    });
    loadAdmin();
}

function askDel(id) {
    showMsg("Confirmation", "Voulez-vous supprimer définitivement ce dossier ?", "warning", async () => {
        await fetch(`https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`, { method: 'DELETE' });
        loadAdmin();
    });
}
