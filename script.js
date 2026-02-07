// URL FIREBASE (Vérifie bien que le .json est à la fin)
const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures.json";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// 1. ANIMATIONS AU SCROLL
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

window.addEventListener('scroll', () => {
    if(window.scrollY === 0) {
        document.querySelectorAll('.reset-me').forEach(el => el.classList.remove('active'));
    }
});

// 2. NAVIGATION
function openForm(role) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    document.getElementById('input-role').value = role;
    document.getElementById('display-role').innerText = "CANDIDATURE : " + role.toUpperCase();
    window.scrollTo(0,0);
}

function cancel() {
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

// 3. ENVOI DU FORMULAIRE
document.getElementById('main-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "TRANSMISSION EN COURS...";

    const data = {
        nom: document.getElementById('input-name').value,
        discord: document.getElementById('input-discord').value,
        matiere: document.getElementById('input-sub').value,
        motivations: document.getElementById('input-motivs').value,
        role: document.getElementById('input-role').value,
        status: "attente",
        date: new Date().toLocaleString('fr-FR')
    };

    try {
        const response = await fetch(DB_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert("✅ Votre dossier a été transmis avec succès à la direction !");
            location.reload();
        } else {
            throw new Error('Erreur');
        }
    } catch (err) {
        alert("❌ Erreur : Impossible de contacter la base de données. Vérifiez votre connexion.");
        btn.disabled = false;
        btn.innerText = "RÉESSAYER";
    }
});

// 4. ADMIN LOGIN
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        document.getElementById('admin-indicator').style.display = 'block';
        document.getElementById('login-zone').style.display = 'none';
        loadAdmin();
    } else {
        alert("Accès refusé : Ce compte n'est pas autorisé.");
    }
}

async function loadAdmin() {
    const r = await fetch(DB_URL);
    const d = await r.json();
    const list = document.getElementById('admin-list');
    list.innerHTML = "";
    if(!d) { list.innerHTML = "<p>Aucun dossier pour le moment.</p>"; return; }
    
    Object.entries(d).reverse().forEach(([id, c]) => {
        list.innerHTML += `
            <div class="admin-card" style="background:#1e293b; padding:25px; border-radius:20px; margin-bottom:15px; border-left:5px solid #0ea5e9; text-align:left;">
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:#0ea5e9; font-weight:700;">${c.role.toUpperCase()}</span>
                    <small style="opacity:0.5">${c.date}</small>
                </div>
                <h3 style="margin:10px 0;">${c.nom}</h3>
                <p><b>Discord:</b> ${c.discord} | <b>Pôle:</b> ${c.matiere}</p>
                <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; margin-top:10px;">${c.motivations}</div>
            </div>`;
    });
}
