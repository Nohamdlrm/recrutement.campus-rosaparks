const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

// GESTION POPUPS SIMPLIFIÉE
const overlay = document.getElementById('overlay');
const box = document.getElementById('popup-box');

function showMsg(title, text, onConfirm = null) {
    box.innerHTML = `
        <h2 style="margin-bottom:15px">${title}</h2>
        <p style="margin-bottom:25px; opacity:0.8">${text}</p>
        <div style="display:flex; gap:10px; justify-content:center;">
            ${onConfirm ? `<button class="btn-back" style="margin-bottom:0;" onclick="closePop()">Annuler</button>` : ''}
            <button class="btn-main" id="pop-ok-btn" style="width:auto; padding:10px 30px;">${onConfirm ? 'Confirmer' : 'D\'accord'}</button>
        </div>
    `;
    overlay.style.display = 'flex';
    document.getElementById('pop-ok-btn').onclick = () => {
        if(onConfirm) onConfirm();
        closePop();
    };
}

function closePop() { overlay.style.display = 'none'; }

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

// GESTION ADMIN (CONNEXION)
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

// CHARGEMENT AUTOMATIQUE DES DONNÉES
async function loadAdmin() {
    const res = await fetch(DB_URL);
    const data = await res.json();
    const pList = document.getElementById('list-pending');
    const aList = document.getElementById('list-admission');
    
    pList.innerHTML = ""; 
    aList.innerHTML = "";
    
    if(!data) {
        pList.innerHTML = "<p style='opacity:0.5'>Aucun dossier en attente.</p>";
        return;
    }

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
                    <div style="display:flex; gap:10px;">
                        <button class="btn-main" style="background:#34c759; padding:10px;" onclick="decide('${id}','Accepté')">Accepter</button>
                        <button class="btn-main" style="background:#ff3b30; padding:10px;" onclick="decide('${id}','Refusé')">Refuser</button>
                    </div>
                ` : `<b>DÉCISION : ${c.status.toUpperCase()}</b>`}
            </div>`;
        c.status === 'attente' ? pList.innerHTML += card : aList.innerHTML += card;
    });
}

// ACTIONS SANS RECHARGER LA PAGE (AJAX)
async function decide(id, s) {
    await fetch(`https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`, {
        method: 'PATCH', body: JSON.stringify({ status: s })
    });
    loadAdmin(); // Rafraîchissement automatique après décision
}

function askDel(id) {
    showMsg("Confirmation", "Voulez-vous supprimer définitivement ce dossier ?", async () => {
        await fetch(`https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`, { method: 'DELETE' });
        loadAdmin(); // Rafraîchissement automatique après suppression
    });
}
