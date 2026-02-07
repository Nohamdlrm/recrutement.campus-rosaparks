const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

// POPUP PERSONNALISÉE
function showPopup(title, text, isConfirm = false, onConfirm = null) {
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
        const bOk = document.createElement('button'); bOk.className="btn-primary"; bOk.innerText="D'accord";
        bOk.onclick = () => overlay.style.display='none';
        actions.append(bOk);
    }
    overlay.style.display = 'flex';
}

// ACTUALISER AVEC CHARGEMENT ET CONFIRMATION
async function refreshData() {
    const loader = document.getElementById('loader-overlay');
    const spinner = loader.querySelector('.spinner');
    const statusText = loader.querySelector('p');
    const loaderBox = loader.querySelector('.loader-box');

    // 1. On affiche le loader
    loader.style.display = 'flex';
    statusText.innerText = "Synchronisation avec la base de données...";
    spinner.style.display = "block";

    // 2. On attend 5 secondes (avec le rond qui tourne à 3s/tour)
    setTimeout(async () => {
        await loadAdmin(); // On recharge les données en arrière-plan
        
        // 3. On transforme le loader en message de succès
        spinner.style.display = "none";
        statusText.innerHTML = "<i class='fas fa-check-circle' style='color:#34c759; font-size:2rem; margin-bottom:10px; display:block;'></i> Données actualisées avec succès !";
        
        // 4. On ajoute le bouton "D'accord" s'il n'existe pas déjà
        if (!document.getElementById('btn-close-loader')) {
            const btnOk = document.createElement('button');
            btnOk.id = "btn-close-loader";
            btnOk.className = "btn-primary";
            btnOk.style.marginTop = "20px";
            btnOk.innerText = "D'accord";
            btnOk.onclick = () => {
                loader.style.display = 'none';
                btnOk.remove(); // On le retire pour la prochaine fois
            };
            loaderBox.appendChild(btnOk);
        }
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
    showPopup("Dossier Transmis", "Votre candidature a été envoyée. La direction traite les dossiers sous 24h. Ne pas relancer sous peine de refus.");
    cancel();
};

function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        loadAdmin();
    } else {
        showPopup("Accès Interdit", "Vous n'êtes pas administrateur de la base. Contactez la direction pour plus d'infos.", false);
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
                <button class="btn-del" onclick="askDelete('${id}')"><i class="fas fa-trash"></i></button>
                <p><b>Prenom & Nom Rp :</b> ${c.nom}</p>
                <p><b>Discord :</b> ${c.discord}</p>
                <p><b>Poste :</b> ${c.matiere}</p>
                <div style="background:rgba(0,0,0,0.05); padding:10px; border-radius:10px; margin:10px 0;">
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

function askDelete(id) {
    showPopup("Confirmation", "Voulez-vous supprimer définitivement ce dossier ?", true, async () => {
        await fetch(`https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`, { method: 'DELETE' });
        loadAdmin();
    });
}
