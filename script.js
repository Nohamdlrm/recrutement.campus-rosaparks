const DB_URL = "https://campus-rosa-parks-default-rtdb.europe-west1.firebasedatabase.app/candidatures";
const ADMIN_MAIL = "ce.0227235a@campus-rosaparks.fr";

// 1. ANIMATIONS
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

// 3. ENVOI FIREBASE
document.getElementById('main-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerText = "ENVOI...";

    const data = {
        nom: document.getElementById('input-name').value,
        discord: document.getElementById('input-discord').value,
        matiere: document.getElementById('input-sub').value,
        motivations: document.getElementById('input-motivs').value,
        role: document.getElementById('input-role').value,
        status: "en_attente",
        date: new Date().toLocaleString('fr-FR')
    };

    await fetch(`${DB_URL}.json`, { method: 'POST', body: JSON.stringify(data) });
    alert("Candidature envoyée !");
    location.reload();
});

// 4. ADMIN
function handleAdmin(res) {
    const user = JSON.parse(atob(res.credential.split('.')[1]));
    if(user.email === ADMIN_MAIL) {
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        document.getElementById('admin-indicator').style.display = 'block';
        loadData();
    }
}

async function loadData() {
    const res = await fetch(`${DB_URL}.json`);
    const data = await res.json();
    const pendingList = document.getElementById('pending-list');
    const admissionCenter = document.getElementById('admission-center');
    
    pendingList.innerHTML = "";
    admissionCenter.innerHTML = "";

    if(!data) return;

    Object.entries(data).reverse().forEach(([id, c]) => {
        const cardHtml = `
            <div class="admin-card">
                <div class="card-header">
                    <span class="role-badge">${c.role}</span>
                    <span class="date-txt">${c.date}</span>
                </div>
                <h3>${c.nom}</h3>
                <p><b>Discord:</b> ${c.discord} | <b>Matière:</b> ${c.matiere}</p>
                <div class="motiv-box">${c.motivations}</div>
                <div class="action-zone" id="actions-${id}">
                    ${c.status === 'en_attente' ? `
                        <button class="btn-approve" onclick="updateStatus('${id}', 'Accepté')">ACCEPTER</button>
                        <button class="btn-reject" onclick="updateStatus('${id}', 'Refusé')">REFUSER</button>
                    ` : `
                        <div class="final-status status-${c.status.toLowerCase()}">DOSSIER ${c.status.toUpperCase()}</div>
                    `}
                </div>
            </div>
        `;

        if(c.status === 'en_attente') {
            pendingList.innerHTML += cardHtml;
        } else {
            admissionCenter.innerHTML += cardHtml;
        }
    });
}

async function updateStatus(id, newStatus) {
    await fetch(`${DB_URL}/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
    });
    loadData(); // Rafraîchit les listes
}
