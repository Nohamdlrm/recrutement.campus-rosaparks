const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// MODE SOMBRE
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

// POPUP UNIQUE
function popup(title, text, isConfirm = false, onConfirm = null) {
    const overlay = document.getElementById('popup-overlay');
    const actions = document.getElementById('p-actions');
    document.getElementById('p-title').innerText = title;
    document.getElementById('p-text').innerText = text;
    
    actions.innerHTML = "";
    if(isConfirm) {
        const bY = document.createElement('button'); bY.className="btn-y"; bY.innerText="Confirmer";
        bY.onclick = () => { onConfirm(); overlay.style.display='none'; };
        const bN = document.createElement('button'); bN.className="btn-n"; bN.innerText="Annuler";
        bN.onclick = () => overlay.style.display='none';
        actions.append(bN, bY);
    } else {
        const bOk = document.createElement('button'); bOk.className="btn-submit"; bOk.innerText="OK";
        bOk.onclick = () => overlay.style.display='none';
        actions.append(bOk);
    }
    overlay.style.display = 'flex';
}

function refreshData() {
    document.getElementById('loader-overlay').style.display = 'flex';
    setTimeout(async () => {
        await loadAdmin();
        document.getElementById('loader-overlay').style.display = 'none';
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
    popup("Dossier Envoyé", "Votre dossier a bien été envoyé. Décision sous 24h. Ne relancez pas en cas de refus.");
    cancel();
};

function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        loadAdmin();
    } else {
        popup("Accès Refusé", "Vous n'êtes pas administrateur. Contactez la direction.", false);
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
                <p><b>Motivation :</b><br>${c.motivations}</p>
                <hr style="margin:10px 0; opacity:0.1">
                ${c.status === 'attente' ? `
                    <button class="btn-sync" style="background:#34c759" onclick="decide('${id}','Accepté')">Accepter</button>
                    <button class="btn-sync" style="background:#ff3b30; margin-left:10px" onclick="decide('${id}','Refusé')">Refuser</button>
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
    popup("Confirmation", "Voulez-vous supprimer définitivement ce dossier ?", true, async () => {
        await fetch(`https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`, { method: 'DELETE' });
        loadAdmin();
    });
}
