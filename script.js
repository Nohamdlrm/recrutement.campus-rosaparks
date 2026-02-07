const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

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
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "Envoi en cours..."; // Correction ici

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
    alert("Dossier envoyé avec succès !");
    location.reload();
};

function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        loadAdmin();
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
        const borderColor = c.status === 'Accepté' ? '#2ecc71' : (c.status === 'Refusé' ? '#e74c3c' : '#3498db');
        
        const card = `
            <div class="embed-card" style="border-left-color: ${borderColor}">
                <h3>Candidature : ${c.nom}</h3>
                <div class="embed-field"><b>Rôle :</b> ${c.role}</div>
                <div class="embed-field"><b>Discord :</b> ${c.discord}</div>
                <div class="embed-field"><b>Poste :</b> ${c.matiere}</div>
                <div class="embed-field"><b>Date :</b> ${c.date}</div>
                <div class="embed-motiv">"${c.motivations}"</div>
                ${isAttente ? `
                    <div class="decision-row">
                        <button class="btn-choice btn-accept" onclick="decider('${id}', 'Accepté')">Accepter le dossier</button>
                        <button class="btn-choice btn-refuse" onclick="decider('${id}', 'Refusé')">Refuser le dossier</button>
                    </div>
                ` : `
                    <div class="status-badge badge-${c.status.toLowerCase()}">DÉCISION : ${c.status.toUpperCase()}</div>
                `}
            </div>`;
        
        if(isAttente) pList.innerHTML += card;
        else aList.innerHTML += card;
    });
}

async function decider(id, action) {
    const url = `https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`;
    await fetch(url, { method: 'PATCH', body: JSON.stringify({ status: action }) });
    loadAdmin(); // Recharge automatiquement les listes
}
