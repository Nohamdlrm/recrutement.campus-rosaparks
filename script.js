// CONFIGURATION
const FIREBASE_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_EMAIL = "ce.0227235a@campus-rosaparks.fr";

// VERIFICATION ADMIN GOOGLE
function checkAdmin(response) {
    const user = JSON.parse(atob(response.credential.split('.')[1]));
    
    if(user.email === ADMIN_EMAIL) {
        document.getElementById('admin-view').style.display = 'block';
        document.getElementById('admin-logged').style.display = 'block';
        document.getElementById('login-container').style.display = 'none';
        fetchCandidates(); // Charge les données direct
    } else {
        alert("Accès refusé : Cette zone est réservée à l'administrateur du Campus Rosa Parks.");
    }
}

// NAVIGATION
function openApp(role) {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    document.getElementById('role-val').value = role;
    document.getElementById('form-title').innerText = "Candidature " + role.toUpperCase();
    
    // Adaptation des textes d'engagement
    const engText = (role === 'prof') 
        ? "Je confirme que je validerai Pronote avant 21h chaque soir et que je ne quitterai pas mes fonctions sans prévenir." 
        : "Je confirme ma présence lors des surveillances et mon respect total des consignes administratives.";
    document.getElementById('eng-text').innerText = engText;
    
    window.scrollTo(0,0);
}

function goBack() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('role-selection').style.display = 'block';
}

// ENVOI VERS FIREBASE (DATABASE)
document.getElementById('applyForm').onsubmit = async function(e) {
    e.preventDefault();
    
    const dossier = {
        nom: document.getElementById('nom').value,
        discord: document.getElementById('discord').value,
        matiere: document.getElementById('matiere').value,
        motiv: document.getElementById('motiv').value,
        role: document.getElementById('role-val').value,
        date: new Date().toLocaleString('fr-FR')
    };

    try {
        const response = await fetch(FIREBASE_URL, {
            method: 'POST',
            body: JSON.stringify(dossier),
            headers: { 'Content-Type': 'application/json' }
        });

        if(response.ok) {
            document.getElementById('pop-success').style.display = 'flex';
        } else {
            alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
        }
    } catch (error) {
        console.error("Erreur Firebase:", error);
    }
};

// RÉCUPÉRATION DES DONNÉES (ADMIN)
async function fetchCandidates() {
    const listDiv = document.getElementById('candidates-list');
    listDiv.innerHTML = "Récupération des dossiers...";

    try {
        const response = await fetch(FIREBASE_URL);
        const data = await response.json();

        if(!data) {
            listDiv.innerHTML = "Aucune candidature reçue pour le moment.";
            return;
        }

        listDiv.innerHTML = "";
        // On transforme l'objet en tableau pour le trier du plus récent au plus ancien
        const entries = Object.entries(data).reverse();

        entries.forEach(([id, c]) => {
            const card = `
                <div class="candidature-item">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--accent); font-weight:bold;">${c.role.toUpperCase()}</span>
                        <span style="font-size:0.8rem; opacity:0.6;">${c.date}</span>
                    </div>
                    <h3 style="margin:10px 0;">${c.nom}</h3>
                    <p><b>Discord:</b> ${c.discord}</p>
                    <p><b>Matière/Pôle:</b> ${c.matiere}</p>
                    <p style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; font-style:italic;">"${c.motiv}"</p>
                </div>
            `;
            listDiv.innerHTML += card;
        });
    } catch (error) {
        listDiv.innerHTML = "Erreur lors du chargement des données.";
    }
}
