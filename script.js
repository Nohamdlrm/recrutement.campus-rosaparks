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
    const btn = document.querySelector('.btn-main-action');
    btn.disabled = true; btn.innerText = "Envoi...";

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
    alert("Candidature envoyée !");
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
        const card = `
            <div class="admin-card">
                <span class="label">${c.role}</span>
                <h3>${c.nom}</h3>
                <div class="details">${c.discord} | ${c.matiere} | ${c.date}</div>
                <div class="motiv-box">${c.motivations}</div>
                <div class="btn-group">
                    ${isAttente ? `
                        <button class="btn-adm ok" onclick="decider('${id}', 'Accepté')">Accepter</button>
                        <button class="btn-adm no" onclick="decider('${id}', 'Refusé')">Refuser</button>
                    ` : `<div style="width:100%; font-weight:700; color:${c.status === 'Accepté' ? '#0071e3' : '#ff3b30'}">${c.status.toUpperCase()}</div>`}
                </div>
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
