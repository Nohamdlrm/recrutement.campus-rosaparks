const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";
let isAdmin = false; // Pour savoir si on est en mode admin

function openForm(role) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    document.getElementById('input-role').value = role;
}

function cancel() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

// FONCTION D'ENVOI
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

    try {
        await fetch(DB_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) 
        });
        
        alert("Dossier envoyé avec succès !");
        
        // Si on est admin, on rafraîchit le panel, sinon on reload l'accueil
        if (isAdmin) {
            cancel();
            loadAdmin();
            btn.disabled = false;
            btn.innerText = "Déposer le dossier";
        } else {
            location.reload();
        }
    } catch (error) {
        alert("Erreur de connexion à la base de données.");
        btn.disabled = false;
        btn.innerText = "Déposer le dossier";
    }
};

// GESTION CONNEXION ADMIN
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        isAdmin = true;
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('form-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        loadAdmin();
    } else {
        alert("Accès refusé : Vous n'êtes pas la Direction.");
    }
}

// CHARGEMENT DES DOSSIERS DANS LE PANEL
async function loadAdmin() {
    try {
        const res = await fetch(DB_URL);
        const data = await res.json();
        
        const pList = document.getElementById('list-pending');
        const aList = document.getElementById('list-admission');
        
        pList.innerHTML = ""; 
        aList.innerHTML = "";

        if(!data) {
            pList.innerHTML = "<p style='color:grey'>Aucun dossier en attente.</p>";
            return;
        }

        // On transforme l'objet Firebase en tableau et on inverse pour avoir le plus récent en haut
        Object.entries(data).reverse().forEach(([id, c]) => {
            const isAttente = (c.status === 'attente');
            const borderColor = c.status === 'Accepté' ? '#2ecc71' : (c.status === 'Refusé' ? '#e74c3c' : '#3498db');
            
            const card = `
                <div class="embed-card" style="border-left-color: ${borderColor}">
                    <div style="font-size:0.7rem; color:grey; float:right;">${c.date}</div>
                    <h3>Candidature : ${c.nom}</h3>
                    <div class="embed-field"><b>Rôle :</b> ${c.role}</div>
                    <div class="embed-field"><b>Discord :</b> ${c.discord}</div>
                    <div class="embed-field"><b>Poste visé :</b> ${c.matiere}</div>
                    <div class="embed-motiv"><b>Motivations :</b><br>${c.motivations}</div>
                    
                    ${isAttente ? `
                        <div class="decision-row">
                            <button class="btn-choice btn-accept" onclick="decider('${id}', 'Accepté')">ACCEPTER</button>
                            <button class="btn-choice btn-refuse" onclick="decider('${id}', 'REFUSER')">REFUSER</button>
                        </div>
                    ` : `
                        <div class="status-badge badge-${c.status.toLowerCase()}">DÉCISION : ${c.status.toUpperCase()}</div>
                    `}
                </div>`;
            
            if(isAttente) pList.innerHTML += card;
            else aList.innerHTML += card;
        });
    } catch (e) {
        console.error("Erreur de chargement admin:", e);
    }
}

// CHANGER LE STATUS (ARCHIVAGE AUTO)
async function decider(id, action) {
    const url = `https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures/${id}.json`;
    await fetch(url, { 
        method: 'PATCH', 
        body: JSON.stringify({ status: action }) 
    });
    loadAdmin(); // Recharge les listes immédiatement
}
