/* ══════════════════════════════════════════════
   FIREBASE INIT — Auth + Firestore
   ══════════════════════════════════════════════ */
let db   = null;
let auth = null;
let currentCompId = 'coupe-monde-2026';
let matchResults  = {};  // mid → 'home'|'draw'|'away'
let matchScores   = {};  // mid → { t1: N, t2: N }

try {
  if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED
      && typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId !== 'votre-projet') {
    firebase.initializeApp(firebaseConfig);
    db   = firebase.firestore();
    auth = firebase.auth();
    console.log('[Stratos] 🔥 Firebase connecté ✓');

    // ── Listener temps réel sur les scores/résultats ──
    db.collection('matchResults').onSnapshot(snap => {
      matchResults = {};
      matchScores  = {};
      snap.forEach(doc => {
        const d = doc.data();
        matchResults[doc.id] = d.result;
        if (d.score) matchScores[doc.id] = d.score;
      });
      // Rafraîchir les vues actives
      refreshScoresInDOM();
    }, e => console.warn('[Stratos] matchResults listener :', e.message));
  } else {
    console.info('[Stratos] Mode local – configurer firebase-config.js pour activer Firebase.');
  }
} catch (e) {
  console.warn('[Stratos] Firebase non disponible.', e.message);
}

/**
 * Auto-seed : vérifie si les données WC 2026 sont présentes dans Firestore.
 * Si le document competitions/coupe-monde-2026 est absent (ou si le groupe A
 * n'a pas exactement 4 équipes), lance seedFirestore() automatiquement.
 * Appelé juste après la connexion Firestore.
 */
async function autoSeedIfNeeded() {
  if (!db) return;
  try {
    const teamsSnap = await db.collection('competitions/coupe-monde-2026/groups/A/teams').get();
    if (teamsSnap.size !== 4) {
      console.log('[Stratos] 🌱 Données manquantes ou incomplètes — seed automatique…');
      await window.seedFirestore();
    } else {
      console.log('[Stratos] ✓ Données Firestore présentes (groupe A : 4 équipes)');
    }
  } catch (err) {
    console.warn('[Stratos] autoSeed impossible :', err.message);
  }
}

/* ── Groups store ── */
const createdGroups = [];

/* ── Team Logos — Drapeaux nationaux Coupe du Monde 2026 ── */
const teamLogos = {
  // Groupe A
  'Mexique':              'https://flagcdn.com/w40/mx.png',
  'Afrique du Sud':       'https://flagcdn.com/w40/za.png',
  'Corée du Sud':         'https://flagcdn.com/w40/kr.png',
  'Tchéquie':             'https://flagcdn.com/w40/cz.png',
  // Groupe B
  'Canada':               'https://flagcdn.com/w40/ca.png',
  'Bosnie-Herzégovine':   'https://flagcdn.com/w40/ba.png',
  'Qatar':                'https://flagcdn.com/w40/qa.png',
  'Suisse':               'https://flagcdn.com/w40/ch.png',
  // Groupe C
  'Brésil':               'https://flagcdn.com/w40/br.png',
  'Maroc':                'https://flagcdn.com/w40/ma.png',
  'Haïti':                'https://flagcdn.com/w40/ht.png',
  'Écosse':               'https://flagcdn.com/w40/gb-sct.png',
  // Groupe D
  'États-Unis':           'https://flagcdn.com/w40/us.png',
  'Paraguay':             'https://flagcdn.com/w40/py.png',
  'Australie':            'https://flagcdn.com/w40/au.png',
  'Turquie':              'https://flagcdn.com/w40/tr.png',
  // Groupe E
  'Allemagne':            'https://flagcdn.com/w40/de.png',
  'Curaçao':              'https://flagcdn.com/w40/cw.png',
  "Côte d'Ivoire":        'https://flagcdn.com/w40/ci.png',
  'Équateur':             'https://flagcdn.com/w40/ec.png',
  // Groupe F
  'Pays-Bas':             'https://flagcdn.com/w40/nl.png',
  'Japon':                'https://flagcdn.com/w40/jp.png',
  'Suède':                'https://flagcdn.com/w40/se.png',
  'Tunisie':              'https://flagcdn.com/w40/tn.png',
  // Groupe G
  'Belgique':             'https://flagcdn.com/w40/be.png',
  'Égypte':               'https://flagcdn.com/w40/eg.png',
  'Iran':                 'https://flagcdn.com/w40/ir.png',
  'Nouvelle-Zélande':     'https://flagcdn.com/w40/nz.png',
  // Groupe H
  'Espagne':              'https://flagcdn.com/w40/es.png',
  'Cap-Vert':             'https://flagcdn.com/w40/cv.png',
  'Arabie saoudite':      'https://flagcdn.com/w40/sa.png',
  'Uruguay':              'https://flagcdn.com/w40/uy.png',
  // Groupe I
  'France':               'https://flagcdn.com/w40/fr.png',
  'Sénégal':              'https://flagcdn.com/w40/sn.png',
  'Irak':                 'https://flagcdn.com/w40/iq.png',
  'Norvège':              'https://flagcdn.com/w40/no.png',
  // Groupe J
  'Argentine':            'https://flagcdn.com/w40/ar.png',
  'Autriche':             'https://flagcdn.com/w40/at.png',
  'Algérie':              'https://flagcdn.com/w40/dz.png',
  'Jordanie':             'https://flagcdn.com/w40/jo.png',
  // Groupe K
  'Portugal':             'https://flagcdn.com/w40/pt.png',
  'RD Congo':             'https://flagcdn.com/w40/cd.png',
  'Ouzbékistan':          'https://flagcdn.com/w40/uz.png',
  'Colombie':             'https://flagcdn.com/w40/co.png',
  // Groupe L
  'Angleterre':           'https://flagcdn.com/w40/gb-eng.png',
  'Croatie':              'https://flagcdn.com/w40/hr.png',
  'Ghana':                'https://flagcdn.com/w40/gh.png',
  'Panama':               'https://flagcdn.com/w40/pa.png',
};

function teamLogoError(img) {
  img.style.display = 'none';
  const next = img.nextElementSibling;
  if (next && next.classList.contains('team-avatar')) next.style.display = '';
}

function teamAvatarHtml(name, avClass, ab, extraStyle = '') {
  const logo = teamLogos[name];
  const sAttr = extraStyle ? `style="${extraStyle}"` : '';
  if (logo) {
    const sep = extraStyle && !extraStyle.endsWith(';') ? ';' : '';
    return `<img class="team-logo" src="${logo}" alt="${name}" ${sAttr} onerror="teamLogoError(this)"><div class="team-avatar ${avClass}" style="${extraStyle}${sep}display:none">${ab}</div>`;
  }
  return `<div class="team-avatar ${avClass}" ${sAttr}>${ab}</div>`;
}

function applyTeamLogos() {
  // .cal-team and .match-team: avatar + sibling span with team name
  document.querySelectorAll('.cal-team, .match-team').forEach(el => {
    if (el.querySelector('.team-logo')) return; // already processed
    const avatar = el.querySelector('.team-avatar');
    const span = el.querySelector('span');
    if (!avatar || !span) return;
    const name = span.textContent.trim();
    const logo = teamLogos[name];
    if (!logo) return;
    const img = document.createElement('img');
    img.className = 'team-logo';
    img.src = logo;
    img.alt = name;
    if (avatar.style.width)  img.style.width  = avatar.style.width;
    if (avatar.style.height) img.style.height = avatar.style.height;
    img.onerror = () => { img.remove(); avatar.style.display = ''; };
    avatar.style.display = 'none';
    avatar.parentNode.insertBefore(img, avatar);
  });
  // .team-cell in standings: avatar + text node
  document.querySelectorAll('.team-cell').forEach(cell => {
    if (cell.querySelector('.team-logo')) return; // already processed
    const avatar = cell.querySelector('.team-avatar');
    if (!avatar) return;
    const name = cell.textContent.replace(avatar.textContent, '').trim();
    const logo = teamLogos[name];
    if (!logo) return;
    const img = document.createElement('img');
    img.className = 'team-logo';
    img.src = logo;
    img.alt = name;
    img.onerror = () => { img.remove(); avatar.style.display = ''; };
    avatar.style.display = 'none';
    avatar.parentNode.insertBefore(img, avatar);
  });
}

/* ── Screen navigation ── */
const screens = {
  login:       document.getElementById('screen-login'),
  home:        document.getElementById('screen-home'),
  competition: document.getElementById('screen-competition'),
  wimbledon:   document.getElementById('screen-wimbledon'),
  social:      document.getElementById('screen-social'),
  groups:      document.getElementById('screen-groups'),
  group:       document.getElementById('screen-group'),
  calendar:    document.getElementById('screen-calendar'),
  matchs:      document.getElementById('screen-matchs'),
  profile:     document.getElementById('screen-profile'),
};

const navScreenMap = {
  matchs:       'matchs',
  competitions: 'home',
  social:       'social',
  groupes:      'groups',
};

let previousScreen = 'home';
let currentScreen  = 'login';

function showScreen(name) {
  if (name !== currentScreen) previousScreen = currentScreen;
  currentScreen = name;
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
  window.scrollTo(0, 0);
}

/* ══ Auth — Firebase Authentication (email / mot de passe) ══════ */
let currentUser = null;   // { uid, email, pseudo, friends, online, ... }

/* Traduction des codes d'erreur Firebase Auth */
function authErrMsg(code) {
  const map = {
    'auth/user-not-found':      'Aucun compte avec cet e-mail.',
    'auth/wrong-password':      'Mot de passe incorrect.',
    'auth/invalid-credential':  'E-mail ou mot de passe incorrect.',
    'auth/email-already-in-use':'Cet e-mail est déjà utilisé.',
    'auth/weak-password':       'Mot de passe trop court (6 caractères min).',
    'auth/invalid-email':       'Adresse e-mail invalide.',
    'auth/too-many-requests':   'Trop de tentatives. Réessaie plus tard.',
  };
  return map[code] || 'Une erreur est survenue. Réessaie.';
}

/** Charge ou crée le document Firestore users/{uid} après authentification. */
async function loadOrCreateUserDoc(firebaseUser, pseudoForNew = null) {
  if (!db) {
    currentUser = { uid: firebaseUser.uid, email: firebaseUser.email,
                    pseudo: firebaseUser.email.split('@')[0], friends: [], online: false };
    return;
  }
  const ref = db.doc(`users/${firebaseUser.uid}`);
  try {
    const snap = await ref.get();
    if (snap.exists) {
      currentUser = { uid: firebaseUser.uid, ...snap.data() };
      await ref.update({ online: true });
    } else {
      const pseudo = pseudoForNew || firebaseUser.email.split('@')[0];
      const newUser = {
        uid: firebaseUser.uid, email: firebaseUser.email, pseudo,
        createdAt: new Date().toISOString(), friends: [], online: true,
        predictionCount: 0, predictionPoints: 0, correctPredictions: 0,
      };
      await ref.set(newUser);
      currentUser = newUser;
    }
    currentUser.online = true;
  } catch (err) {
    console.warn('[Stratos] Firestore indisponible :', err.message);
    currentUser = { uid: firebaseUser.uid, email: firebaseUser.email,
                    pseudo: firebaseUser.email.split('@')[0], friends: [], online: false };
  }
}

/* Passer offline à la fermeture */
window.addEventListener('beforeunload', () => {
  if (db && currentUser?.uid) {
    db.doc(`users/${currentUser.uid}`).update({ online: false }).catch(() => {});
  }
});

/* ── Onglets Connexion / Inscription ──────────────────────────── */
showScreen('login');

document.getElementById('tab-login').addEventListener('click', () => {
  document.getElementById('tab-login').classList.add('active');
  document.getElementById('tab-register').classList.remove('active');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
});
document.getElementById('tab-register').addEventListener('click', () => {
  document.getElementById('tab-register').classList.add('active');
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
});

/* ── Formulaire Connexion ─────────────────────────────────────── */
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errEl.classList.add('hidden');
  btn.disabled = true; btn.textContent = '…';

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    await loadOrCreateUserDoc(cred.user);
    showScreen('home');
  } catch (err) {
    errEl.textContent = authErrMsg(err.code);
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false; btn.textContent = 'Se connecter';
  }
});

/* ── Formulaire Inscription ───────────────────────────────────── */
document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('reg-email').value.trim();
  const pseudo   = document.getElementById('reg-pseudo').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('register-error');
  const btn      = document.getElementById('register-btn');

  errEl.classList.add('hidden');

  if (pseudo.length < 2) {
    errEl.textContent = 'Le pseudo doit faire au moins 2 caractères.';
    errEl.classList.remove('hidden'); return;
  }
  if (!/^[a-z0-9_.\-]+$/.test(pseudo)) {
    errEl.textContent = 'Pseudo : lettres, chiffres, _ . - uniquement.';
    errEl.classList.remove('hidden'); return;
  }

  btn.disabled = true; btn.textContent = '…';

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await loadOrCreateUserDoc(cred.user, pseudo);
    showScreen('home');
  } catch (err) {
    errEl.textContent = authErrMsg(err.code);
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false; btn.textContent = 'Créer mon compte';
  }
});

/* ── Données Coupe du Monde FIFA 2026 — Phase de groupes (tirage officiel) ── */
// Abréviations équipes (ab) utilisées comme fallback si drapeau indisponible
const groupsData = {
  A: [
    { av:'av-mancity', ab:'MEX', name:'Mexique',        j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'RSA', name:'Afrique du Sud', j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'KOR', name:'Corée du Sud',   j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'CZE', name:'Tchéquie',       j:0, v:0, n:0, d:0, pts:0 },
  ],
  B: [
    { av:'av-mancity', ab:'CAN', name:'Canada',             j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'BIH', name:'Bosnie-Herzégovine', j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'QAT', name:'Qatar',              j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'SUI', name:'Suisse',             j:0, v:0, n:0, d:0, pts:0 },
  ],
  C: [
    { av:'av-mancity', ab:'BRE', name:'Brésil',  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'MAR', name:'Maroc',   j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'HAI', name:'Haïti',   j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'SCO', name:'Écosse',  j:0, v:0, n:0, d:0, pts:0 },
  ],
  D: [
    { av:'av-mancity', ab:'USA', name:'États-Unis', j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'PAR', name:'Paraguay',   j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'AUS', name:'Australie',  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'TUR', name:'Turquie',    j:0, v:0, n:0, d:0, pts:0 },
  ],
  E: [
    { av:'av-mancity', ab:'ALL', name:'Allemagne',      j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'CUR', name:'Curaçao',        j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'CIV', name:"Côte d'Ivoire",  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'ECU', name:'Équateur',       j:0, v:0, n:0, d:0, pts:0 },
  ],
  F: [
    { av:'av-mancity', ab:'NED', name:'Pays-Bas', j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'JAP', name:'Japon',    j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'SUE', name:'Suède',    j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'TUN', name:'Tunisie',  j:0, v:0, n:0, d:0, pts:0 },
  ],
  G: [
    { av:'av-mancity', ab:'BEL', name:'Belgique',          j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'EGY', name:'Égypte',            j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'IRA', name:'Iran',              j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'NZL', name:'Nouvelle-Zélande',  j:0, v:0, n:0, d:0, pts:0 },
  ],
  H: [
    { av:'av-mancity', ab:'ESP', name:'Espagne',          j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'CPV', name:'Cap-Vert',         j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'KSA', name:'Arabie saoudite',  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'URU', name:'Uruguay',          j:0, v:0, n:0, d:0, pts:0 },
  ],
  I: [
    { av:'av-mancity', ab:'FRA', name:'France',   j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'SEN', name:'Sénégal',  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'IRQ', name:'Irak',     j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'NOR', name:'Norvège',  j:0, v:0, n:0, d:0, pts:0 },
  ],
  J: [
    { av:'av-mancity', ab:'ARG', name:'Argentine', j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'AUT', name:'Autriche',  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'ALG', name:'Algérie',   j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'JOR', name:'Jordanie',  j:0, v:0, n:0, d:0, pts:0 },
  ],
  K: [
    { av:'av-mancity', ab:'POR', name:'Portugal',     j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'RDC', name:'RD Congo',     j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'OUZ', name:'Ouzbékistan',  j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'COL', name:'Colombie',     j:0, v:0, n:0, d:0, pts:0 },
  ],
  L: [
    { av:'av-mancity', ab:'ANG', name:'Angleterre', j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'CRO', name:'Croatie',    j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'GHA', name:'Ghana',      j:0, v:0, n:0, d:0, pts:0 },
    { av:'av-mancity', ab:'PAN', name:'Panama',     j:0, v:0, n:0, d:0, pts:0 },
  ],
};

/* ── Calendrier complet phase de groupes — Coupe du Monde 2026 (tirage officiel) ── */
// 6 matchs par groupe × 12 groupes = 72 matchs
// Jours réels : juin 2026 — 11 juin = jeudi, 12 = vendredi, etc.
const T = (name, ab) => ({ av:'av-mancity', ab, name });
const groupMatchesData = {
  A: [
    { time:'JEU. 11 JUIN, 21:00', badge:'J-2',  live:false, t1:T('Mexique','MEX'),        o1:'1.65', nul:'3.80', o2:'5.00', t2:T('Afrique du Sud','RSA') },
    { time:'VEN. 12 JUIN, 04:00', badge:'J-3',  live:false, t1:T('Corée du Sud','KOR'),   o1:'1.80', nul:'3.60', o2:'4.50', t2:T('Tchéquie','CZE') },
    { time:'JEU. 18 JUIN, 18:00', badge:'J-9',  live:false, t1:T('Tchéquie','CZE'),       o1:'2.00', nul:'3.40', o2:'3.60', t2:T('Afrique du Sud','RSA') },
    { time:'VEN. 19 JUIN, 03:00', badge:'J-10', live:false, t1:T('Mexique','MEX'),         o1:'1.70', nul:'3.70', o2:'4.80', t2:T('Corée du Sud','KOR') },
    { time:'JEU. 25 JUIN, 03:00', badge:'J-16', live:false, t1:T('Tchéquie','CZE'),        o1:'2.10', nul:'3.30', o2:'3.40', t2:T('Mexique','MEX') },
    { time:'JEU. 25 JUIN, 03:00', badge:'J-16', live:false, t1:T('Afrique du Sud','RSA'),  o1:'2.80', nul:'3.20', o2:'2.50', t2:T('Corée du Sud','KOR') },
  ],
  B: [
    { time:'VEN. 12 JUIN, 21:00', badge:'J-3',  live:false, t1:T('Canada','CAN'),             o1:'1.75', nul:'3.70', o2:'4.50', t2:T('Bosnie-Herzégovine','BIH') },
    { time:'SAM. 13 JUIN, 21:00', badge:'J-4',  live:false, t1:T('Qatar','QAT'),              o1:'2.50', nul:'3.30', o2:'2.70', t2:T('Suisse','SUI') },
    { time:'JEU. 18 JUIN, 21:00', badge:'J-9',  live:false, t1:T('Suisse','SUI'),             o1:'1.60', nul:'3.90', o2:'5.20', t2:T('Bosnie-Herzégovine','BIH') },
    { time:'VEN. 19 JUIN, 00:00', badge:'J-10', live:false, t1:T('Canada','CAN'),             o1:'1.55', nul:'4.00', o2:'5.50', t2:T('Qatar','QAT') },
    { time:'MER. 24 JUIN, 21:00', badge:'J-15', live:false, t1:T('Suisse','SUI'),             o1:'1.65', nul:'3.80', o2:'5.00', t2:T('Canada','CAN') },
    { time:'MER. 24 JUIN, 21:00', badge:'J-15', live:false, t1:T('Bosnie-Herzégovine','BIH'), o1:'1.85', nul:'3.50', o2:'4.20', t2:T('Qatar','QAT') },
  ],
  C: [
    { time:'DIM. 14 JUIN, 00:00', badge:'J-5',  live:false, t1:T('Brésil','BRE'),  o1:'1.40', nul:'4.50', o2:'7.50', t2:T('Maroc','MAR') },
    { time:'DIM. 14 JUIN, 03:00', badge:'J-5',  live:false, t1:T('Haïti','HAI'),   o1:'2.80', nul:'3.20', o2:'2.50', t2:T('Écosse','SCO') },
    { time:'SAM. 20 JUIN, 00:00', badge:'J-11', live:false, t1:T('Écosse','SCO'),  o1:'2.30', nul:'3.30', o2:'3.00', t2:T('Maroc','MAR') },
    { time:'SAM. 20 JUIN, 03:00', badge:'J-11', live:false, t1:T('Brésil','BRE'),  o1:'1.30', nul:'5.00', o2:'8.50', t2:T('Haïti','HAI') },
    { time:'JEU. 25 JUIN, 00:00', badge:'J-16', live:false, t1:T('Écosse','SCO'),  o1:'2.50', nul:'3.30', o2:'2.70', t2:T('Brésil','BRE') },
    { time:'JEU. 25 JUIN, 00:00', badge:'J-16', live:false, t1:T('Maroc','MAR'),   o1:'1.70', nul:'3.70', o2:'4.80', t2:T('Haïti','HAI') },
  ],
  D: [
    { time:'SAM. 13 JUIN, 03:00', badge:'J-4',  live:false, t1:T('États-Unis','USA'), o1:'1.70', nul:'3.70', o2:'4.80', t2:T('Paraguay','PAR') },
    { time:'DIM. 14 JUIN, 06:00', badge:'J-5',  live:false, t1:T('Australie','AUS'),  o1:'2.00', nul:'3.40', o2:'3.60', t2:T('Turquie','TUR') },
    { time:'VEN. 19 JUIN, 21:00', badge:'J-10', live:false, t1:T('États-Unis','USA'), o1:'1.60', nul:'3.90', o2:'5.20', t2:T('Australie','AUS') },
    { time:'SAM. 20 JUIN, 06:00', badge:'J-11', live:false, t1:T('Turquie','TUR'),    o1:'1.90', nul:'3.50', o2:'4.00', t2:T('Paraguay','PAR') },
    { time:'VEN. 26 JUIN, 04:00', badge:'J-17', live:false, t1:T('Turquie','TUR'),    o1:'2.20', nul:'3.30', o2:'3.10', t2:T('États-Unis','USA') },
    { time:'VEN. 26 JUIN, 04:00', badge:'J-17', live:false, t1:T('Paraguay','PAR'),   o1:'2.30', nul:'3.20', o2:'3.00', t2:T('Australie','AUS') },
  ],
  E: [
    { time:'DIM. 14 JUIN, 19:00', badge:'J-5',  live:false, t1:T('Allemagne','ALL'),     o1:'1.45', nul:'4.30', o2:'7.00', t2:T('Curaçao','CUR') },
    { time:'LUN. 15 JUIN, 01:00', badge:'J-6',  live:false, t1:T("Côte d'Ivoire",'CIV'), o1:'1.80', nul:'3.60', o2:'4.50', t2:T('Équateur','ECU') },
    { time:'SAM. 20 JUIN, 22:00', badge:'J-11', live:false, t1:T('Allemagne','ALL'),     o1:'1.55', nul:'4.00', o2:'5.50', t2:T("Côte d'Ivoire",'CIV') },
    { time:'DIM. 21 JUIN, 02:00', badge:'J-12', live:false, t1:T('Équateur','ECU'),      o1:'2.00', nul:'3.40', o2:'3.60', t2:T('Curaçao','CUR') },
    { time:'JEU. 25 JUIN, 22:00', badge:'J-16', live:false, t1:T('Équateur','ECU'),      o1:'2.30', nul:'3.30', o2:'3.00', t2:T('Allemagne','ALL') },
    { time:'JEU. 25 JUIN, 22:00', badge:'J-16', live:false, t1:T('Curaçao','CUR'),       o1:'3.00', nul:'3.20', o2:'2.30', t2:T("Côte d'Ivoire",'CIV') },
  ],
  F: [
    { time:'DIM. 14 JUIN, 22:00', badge:'J-5',  live:false, t1:T('Pays-Bas','NED'), o1:'1.65', nul:'3.80', o2:'5.00', t2:T('Japon','JAP') },
    { time:'LUN. 15 JUIN, 04:00', badge:'J-6',  live:false, t1:T('Suède','SUE'),    o1:'1.90', nul:'3.50', o2:'4.00', t2:T('Tunisie','TUN') },
    { time:'SAM. 20 JUIN, 19:00', badge:'J-11', live:false, t1:T('Pays-Bas','NED'), o1:'1.55', nul:'4.00', o2:'5.50', t2:T('Suède','SUE') },
    { time:'DIM. 21 JUIN, 06:00', badge:'J-12', live:false, t1:T('Tunisie','TUN'),  o1:'2.40', nul:'3.20', o2:'2.90', t2:T('Japon','JAP') },
    { time:'VEN. 26 JUIN, 01:00', badge:'J-17', live:false, t1:T('Tunisie','TUN'),  o1:'2.80', nul:'3.20', o2:'2.50', t2:T('Pays-Bas','NED') },
    { time:'VEN. 26 JUIN, 01:00', badge:'J-17', live:false, t1:T('Japon','JAP'),    o1:'2.10', nul:'3.30', o2:'3.40', t2:T('Suède','SUE') },
  ],
  G: [
    { time:'MAR. 16 JUIN, 00:00', badge:'J-7',  live:false, t1:T('Belgique','BEL'),         o1:'1.65', nul:'3.80', o2:'5.00', t2:T('Égypte','EGY') },
    { time:'MAR. 16 JUIN, 06:00', badge:'J-7',  live:false, t1:T('Iran','IRA'),              o1:'1.90', nul:'3.50', o2:'4.00', t2:T('Nouvelle-Zélande','NZL') },
    { time:'DIM. 21 JUIN, 21:00', badge:'J-12', live:false, t1:T('Belgique','BEL'),         o1:'1.60', nul:'3.90', o2:'5.20', t2:T('Iran','IRA') },
    { time:'LUN. 22 JUIN, 03:00', badge:'J-13', live:false, t1:T('Nouvelle-Zélande','NZL'), o1:'2.50', nul:'3.30', o2:'2.70', t2:T('Égypte','EGY') },
    { time:'SAM. 27 JUIN, 05:00', badge:'J-18', live:false, t1:T('Nouvelle-Zélande','NZL'), o1:'3.00', nul:'3.30', o2:'2.20', t2:T('Belgique','BEL') },
    { time:'SAM. 27 JUIN, 05:00', badge:'J-18', live:false, t1:T('Égypte','EGY'),           o1:'2.10', nul:'3.30', o2:'3.40', t2:T('Iran','IRA') },
  ],
  H: [
    { time:'LUN. 15 JUIN, 19:00', badge:'J-6',  live:false, t1:T('Espagne','ESP'),       o1:'1.40', nul:'4.50', o2:'7.50', t2:T('Cap-Vert','CPV') },
    { time:'MAR. 16 JUIN, 00:00', badge:'J-7',  live:false, t1:T('Arabie saoudite','KSA'), o1:'2.30', nul:'3.30', o2:'3.00', t2:T('Uruguay','URU') },
    { time:'DIM. 21 JUIN, 18:00', badge:'J-12', live:false, t1:T('Espagne','ESP'),       o1:'1.50', nul:'4.10', o2:'6.00', t2:T('Arabie saoudite','KSA') },
    { time:'LUN. 22 JUIN, 00:00', badge:'J-13', live:false, t1:T('Uruguay','URU'),       o1:'1.70', nul:'3.70', o2:'4.80', t2:T('Cap-Vert','CPV') },
    { time:'SAM. 27 JUIN, 02:00', badge:'J-18', live:false, t1:T('Uruguay','URU'),       o1:'2.00', nul:'3.40', o2:'3.60', t2:T('Espagne','ESP') },
    { time:'SAM. 27 JUIN, 02:00', badge:'J-18', live:false, t1:T('Cap-Vert','CPV'),      o1:'3.50', nul:'3.20', o2:'2.00', t2:T('Arabie saoudite','KSA') },
  ],
  I: [
    { time:'MAR. 16 JUIN, 21:00', badge:'J-7',  live:false, t1:T('France','FRA'),   o1:'1.55', nul:'4.00', o2:'5.50', t2:T('Sénégal','SEN') },
    { time:'MER. 17 JUIN, 00:00', badge:'J-8',  live:false, t1:T('Irak','IRQ'),     o1:'2.30', nul:'3.30', o2:'3.00', t2:T('Norvège','NOR') },
    { time:'LUN. 22 JUIN, 23:00', badge:'J-13', live:false, t1:T('France','FRA'),   o1:'1.45', nul:'4.30', o2:'7.00', t2:T('Irak','IRQ') },
    { time:'MAR. 23 JUIN, 02:00', badge:'J-14', live:false, t1:T('Norvège','NOR'),  o1:'1.80', nul:'3.60', o2:'4.50', t2:T('Sénégal','SEN') },
    { time:'VEN. 26 JUIN, 21:00', badge:'J-17', live:false, t1:T('Norvège','NOR'),  o1:'2.50', nul:'3.30', o2:'2.70', t2:T('France','FRA') },
    { time:'VEN. 26 JUIN, 21:00', badge:'J-17', live:false, t1:T('Sénégal','SEN'),  o1:'1.75', nul:'3.70', o2:'4.50', t2:T('Irak','IRQ') },
  ],
  J: [
    { time:'MER. 17 JUIN, 03:00', badge:'J-8',  live:false, t1:T('Argentine','ARG'), o1:'1.40', nul:'4.50', o2:'7.50', t2:T('Algérie','ALG') },
    { time:'MER. 17 JUIN, 06:00', badge:'J-8',  live:false, t1:T('Autriche','AUT'),  o1:'1.70', nul:'3.70', o2:'4.80', t2:T('Jordanie','JOR') },
    { time:'LUN. 22 JUIN, 19:00', badge:'J-13', live:false, t1:T('Argentine','ARG'), o1:'1.45', nul:'4.30', o2:'7.00', t2:T('Autriche','AUT') },
    { time:'MAR. 23 JUIN, 05:00', badge:'J-14', live:false, t1:T('Jordanie','JOR'),  o1:'2.50', nul:'3.30', o2:'2.70', t2:T('Algérie','ALG') },
    { time:'DIM. 28 JUIN, 04:00', badge:'J-19', live:false, t1:T('Jordanie','JOR'),  o1:'3.00', nul:'3.20', o2:'2.30', t2:T('Argentine','ARG') },
    { time:'DIM. 28 JUIN, 04:00', badge:'J-19', live:false, t1:T('Algérie','ALG'),   o1:'1.90', nul:'3.50', o2:'4.00', t2:T('Autriche','AUT') },
  ],
  K: [
    { time:'MER. 17 JUIN, 19:00', badge:'J-8',  live:false, t1:T('Portugal','POR'),    o1:'1.45', nul:'4.30', o2:'7.00', t2:T('RD Congo','RDC') },
    { time:'JEU. 18 JUIN, 04:00', badge:'J-9',  live:false, t1:T('Ouzbékistan','OUZ'), o1:'2.70', nul:'3.20', o2:'2.60', t2:T('Colombie','COL') },
    { time:'MAR. 23 JUIN, 19:00', badge:'J-14', live:false, t1:T('Portugal','POR'),    o1:'1.40', nul:'4.50', o2:'7.50', t2:T('Ouzbékistan','OUZ') },
    { time:'MER. 24 JUIN, 04:00', badge:'J-15', live:false, t1:T('Colombie','COL'),    o1:'1.65', nul:'3.80', o2:'5.00', t2:T('RD Congo','RDC') },
    { time:'DIM. 28 JUIN, 01:30', badge:'J-19', live:false, t1:T('Colombie','COL'),    o1:'2.10', nul:'3.30', o2:'3.40', t2:T('Portugal','POR') },
    { time:'DIM. 28 JUIN, 01:30', badge:'J-19', live:false, t1:T('RD Congo','RDC'),    o1:'2.80', nul:'3.20', o2:'2.50', t2:T('Ouzbékistan','OUZ') },
  ],
  L: [
    { time:'MER. 17 JUIN, 22:00', badge:'J-8',  live:false, t1:T('Angleterre','ANG'), o1:'1.50', nul:'4.10', o2:'6.00', t2:T('Croatie','CRO') },
    { time:'JEU. 18 JUIN, 01:00', badge:'J-9',  live:false, t1:T('Ghana','GHA'),      o1:'2.00', nul:'3.40', o2:'3.60', t2:T('Panama','PAN') },
    { time:'MAR. 23 JUIN, 22:00', badge:'J-14', live:false, t1:T('Angleterre','ANG'), o1:'1.45', nul:'4.30', o2:'7.00', t2:T('Ghana','GHA') },
    { time:'MER. 24 JUIN, 01:00', badge:'J-15', live:false, t1:T('Panama','PAN'),     o1:'2.50', nul:'3.30', o2:'2.70', t2:T('Croatie','CRO') },
    { time:'SAM. 27 JUIN, 23:00', badge:'J-18', live:false, t1:T('Panama','PAN'),     o1:'3.50', nul:'3.20', o2:'2.00', t2:T('Angleterre','ANG') },
    { time:'SAM. 27 JUIN, 23:00', badge:'J-18', live:false, t1:T('Croatie','CRO'),    o1:'1.80', nul:'3.60', o2:'4.50', t2:T('Ghana','GHA') },
  ],
};

/* ── Render standings + matches (Firestore si dispo, sinon données statiques) ── */
async function renderGroup(groupKey) {
  const tbody    = document.querySelector('#screen-competition .standings-table tbody');
  const container = document.getElementById('comp-matches-list');

  // Indicateur de chargement
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:16px;color:#aaa">Chargement…</td></tr>';
  container.innerHTML = '<div style="text-align:center;padding:16px;color:#aaa">Chargement…</div>';

  // Charger les scores/résultats avant d'afficher
  await loadPredictionsData();

  let teams, matches;

  if (db) {
    try {
      const basePath = `competitions/${currentCompId}/groups/${groupKey}`;
      const [teamsSnap, matchesSnap] = await Promise.all([
        db.collection(`${basePath}/teams`).get(),
        db.collection(`${basePath}/matches`).get(),
      ]);
      teams   = teamsSnap.docs.map(d => d.data()).sort((a, b) => b.pts - a.pts);
      matches = matchesSnap.docs.map(d => d.data());
      console.log(`[Stratos] 🔥 Firestore OK — ${teams.length} équipes, ${matches.length} matchs (${currentCompId}/${groupKey})`);
    } catch (e) {
      console.warn('[Stratos] Firestore read failed, fallback local.', e.message);
      teams   = groupsData[groupKey]       || groupsData['A'];
      matches = groupMatchesData[groupKey] || groupMatchesData['A'];
    }
  } else {
    teams   = groupsData[groupKey]       || groupsData['A'];
    matches = groupMatchesData[groupKey] || groupMatchesData['A'];
  }

  /* ── Classement ── */
  tbody.innerHTML = teams.map(t => `
    <tr>
      <td class="team-cell">${teamAvatarHtml(t.name, t.av, t.ab)}${t.name}</td>
      <td>${t.j}</td><td>${t.v}</td><td>${t.n}</td><td>${t.d}</td>
      <td class="pts">${t.pts}</td>
    </tr>`).join('');

  /* ── Matchs à venir ── */
  // Normalise les champs Firestore (t1/t2) vs statiques (t1/t2 identiques)
  container.innerHTML = matches.map(m => {
    const t1 = m.t1 || m.team1;
    const t2 = m.t2 || m.team2;
    const o1 = m.o1 || m.odds?.o1;
    const o2 = m.o2 || m.odds?.o2;
    const nul = m.nul || m.odds?.nul;
    const mid = `${t1.ab}v${t2.ab}`;
    const score = matchScores[mid];
    const scoreSep = score != null
      ? `<span class="match-score">${score.t1}<span class="match-score-sep">–</span>${score.t2}</span>`
      : `<span class="match-vs">–</span>`;
    return `
    <div class="match-card">
      <div class="match-meta">
        <span class="match-time">${m.time}</span>
        ${m.live ? `<span class="match-live"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> LIVE</span>` : ''}
      </div>
      <div class="match-teams">
        <div class="match-team">${teamAvatarHtml(t1.name, t1.av, t1.ab)}<span>${t1.name}</span></div>
        ${scoreSep}
        <div class="match-team match-team--right">${teamAvatarHtml(t2.name, t2.av, t2.ab)}<span>${t2.name}</span></div>
      </div>
      ${score == null ? `
      <div class="match-teams match-teams--nul"><span class="nul-pill">Nul : ${nul}</span></div>
      <div class="match-teams">
        <span class="odds-pill">${o1}</span>
        <span class="odds-pill">${o2}</span>
      </div>` : ''}
    </div>`;
  }).join('');
}

document.getElementById('group-select').addEventListener('change', e => renderGroup(e.target.value));

// Render default group on load
renderGroup('A');

/* ══════════════════════════════════════════════
   WIMBLEDON 2026
══════════════════════════════════════════════ */
function P(name, ab) { return { name, ab }; }

const wimbledonRounds = [
  {
    round: '1er Tour', date: '2026-06-30', label: '1er Tour — 30 juin',
    matches: [
      // Messieurs
      { mid:'SINvQ01', t1:P('Sinner','SIN'),     t2:P('Qualifié 1','Q01'), time:'11:00', o1:'1.05', o2:'9.00' },
      { mid:'ALCvQ02', t1:P('Alcaraz','ALC'),    t2:P('Qualifié 2','Q02'), time:'11:30', o1:'1.06', o2:'8.50' },
      { mid:'FRIvQ03', t1:P('Fritz','FRI'),      t2:P('Qualifié 3','Q03'), time:'13:00', o1:'1.20', o2:'4.50' },
      { mid:'RUUvQ04', t1:P('Ruud','RUU'),       t2:P('Qualifié 4','Q04'), time:'13:30', o1:'1.18', o2:'4.80' },
      // Dames
      { mid:'SABvQ05', t1:P('Sabalenka','SAB'),  t2:P('Qualifiée 5','Q05'), time:'12:00', o1:'1.07', o2:'7.50' },
      { mid:'SWIvQ06', t1:P('Swiatek','SWI'),    t2:P('Qualifiée 6','Q06'), time:'12:30', o1:'1.08', o2:'7.00' },
      { mid:'GAUvQ07', t1:P('Gauff','GAU'),      t2:P('Qualifiée 7','Q07'), time:'14:00', o1:'1.12', o2:'5.50' },
      { mid:'RYBvQ08', t1:P('Rybakina','RYB'),   t2:P('Qualifiée 8','Q08'), time:'14:30', o1:'1.10', o2:'6.00' },
    ],
  },
  {
    round: '1er Tour', date: '2026-07-01', label: '1er Tour — 1er juillet',
    matches: [
      { mid:'DJOvQ09', t1:P('Djokovic','DJO'),   t2:P('Qualifié 9','Q09'),  time:'11:00', o1:'1.10', o2:'6.00' },
      { mid:'ZVEvQ10', t1:P('Zverev','ZVE'),     t2:P('Qualifié 10','Q10'), time:'11:30', o1:'1.15', o2:'5.00' },
      { mid:'MEDvQ11', t1:P('Medvedev','MED'),   t2:P('Qualifié 11','Q11'), time:'13:00', o1:'1.18', o2:'4.80' },
      { mid:'RUBvQ12', t1:P('Rublev','RUB'),     t2:P('Qualifié 12','Q12'), time:'13:30', o1:'1.20', o2:'4.50' },
      { mid:'PEGvQ13', t1:P('Pegula','PEG'),     t2:P('Qualifiée 13','Q13'), time:'12:00', o1:'1.22', o2:'4.20' },
      { mid:'ANDvQ14', t1:P('Andreeva','AND'),   t2:P('Qualifiée 14','Q14'), time:'12:30', o1:'1.25', o2:'4.00' },
      { mid:'ZHEvQ15', t1:P('Zheng','ZHE'),      t2:P('Qualifiée 15','Q15'), time:'14:00', o1:'1.28', o2:'3.80' },
      { mid:'KASvQ16', t1:P('Kasatkina','KAS'),  t2:P('Qualifiée 16','Q16'), time:'14:30', o1:'1.30', o2:'3.60' },
    ],
  },
  {
    round: 'Quarts de finale', date: '2026-07-08', label: 'Quarts de finale — 8 & 9 juillet',
    matches: [
      { mid:'WQFM1', t1:P('QF M1 - TBD','TBD'), t2:P('QF M2 - TBD','TBD'), time:'13:00', o1:'1.80', o2:'2.00' },
      { mid:'WQFM2', t1:P('QF M3 - TBD','TBD'), t2:P('QF M4 - TBD','TBD'), time:'15:00', o1:'1.90', o2:'1.90' },
      { mid:'WQFD1', t1:P('QF D1 - TBD','TBD'), t2:P('QF D2 - TBD','TBD'), time:'11:00', o1:'1.75', o2:'2.05' },
      { mid:'WQFD2', t1:P('QF D3 - TBD','TBD'), t2:P('QF D4 - TBD','TBD'), time:'13:00', o1:'1.85', o2:'1.95' },
    ],
  },
  {
    round: 'Demi-finales', date: '2026-07-10', label: 'Demi-finales — 10 & 11 juillet',
    matches: [
      { mid:'WSFM1', t1:P('SF M1 - TBD','TBD'), t2:P('SF M2 - TBD','TBD'), time:'14:00', o1:'1.85', o2:'1.95' },
      { mid:'WSFD1', t1:P('SF D1 - TBD','TBD'), t2:P('SF D2 - TBD','TBD'), time:'14:00', o1:'1.85', o2:'1.95' },
    ],
  },
  {
    round: 'Finales', date: '2026-07-12', label: 'Finales — 12 & 13 juillet',
    matches: [
      { mid:'WFIND', t1:P('Finaliste D1 - TBD','TBD'), t2:P('Finaliste D2 - TBD','TBD'), time:'14:00', o1:'1.90', o2:'1.90' },
      { mid:'WFINM', t1:P('Finaliste M1 - TBD','TBD'), t2:P('Finaliste M2 - TBD','TBD'), time:'14:00', o1:'1.90', o2:'1.90' },
    ],
  },
];

// Tous les matchs Wimbledon à plat avec startMs
function buildWimbledonMatches() {
  const all = [];
  for (const round of wimbledonRounds) {
    for (const m of round.matches) {
      const timePart = m.time || '';
      const startMs  = timePart ? new Date(`${round.date}T${timePart}:00`).getTime() : 0;
      const isUnknown = n => n.ab === 'TBD' || /^qualifi[ée]e?\s*\d/i.test(n.name);
      const isTBD    = isUnknown(m.t1) || isUnknown(m.t2);
      all.push({ ...m, round: round.round, dateIso: round.date, label: round.label, timePart, startMs, sport: 'tennis', tbd: isTBD });
    }
  }
  return all;
}

async function renderWimbledonScreen() {
  const container = document.getElementById('wimbledon-matches-list');
  if (!container) return;
  await loadPredictionsData();

  // Utilise buildWimbledonMatches() pour avoir timePart et tbd correctement définis
  const allMatches = buildWimbledonMatches();

  // Regrouper par label de round (dans l'ordre original)
  const roundOrder = [];
  const byRoundLabel = {};
  for (const m of allMatches) {
    if (!byRoundLabel[m.label]) {
      roundOrder.push(m.label);
      byRoundLabel[m.label] = [];
    }
    byRoundLabel[m.label].push(m);
  }

  container.innerHTML = roundOrder.map(label => {
    const matches = byRoundLabel[label];
    return `
      <div class="cal-day-label">${label}</div>
      ${matches.map(m => {
        const timeHtml = m.timePart ? `<span class="match-time">${m.timePart}</span>` : '';
        const unknownPlayer = n => n.ab === 'TBD' || /^qualifi[ée]e?\s*\d/i.test(n.name);
        const t1Name   = unknownPlayer(m.t1) ? '?' : m.t1.name;
        const t2Name   = unknownPlayer(m.t2) ? '?' : m.t2.name;
        const t1Ab     = unknownPlayer(m.t1) ? '?' : m.t1.ab;
        const t2Ab     = unknownPlayer(m.t2) ? '?' : m.t2.ab;
        return `
        <div class="match-card" data-mid="${m.mid}">
          <div class="match-meta">
            ${timeHtml}
            <span class="match-badge-tennis">${m.round}</span>
          </div>
          <div class="match-teams">
            <div class="match-team">${teamAvatarHtml(t1Name, null, t1Ab)}<span>${t1Name}</span></div>
            ${buildScoreSep(m.mid)}
            <div class="match-team match-team--right">${teamAvatarHtml(t2Name, null, t2Ab)}<span>${t2Name}</span></div>
          </div>
          ${buildPredBar(m)}
        </div>`;
      }).join('')}`;
  }).join('');

  attachPredictionClicks(container);
}

/* ── Competition cards → detail screen ── */
const competitionsConfig = {
  'Coupe du Monde FIFA 2026': { id: 'coupe-monde-2026', hasGroups: true },
};

document.querySelectorAll('.btn-comp:not(.btn-comp--wimbledon)').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.comp-card');
    const name = card?.querySelector('.comp-name')?.textContent || '';
    document.getElementById('comp-hero-league').textContent = name.toUpperCase();
    document.getElementById('comp-screen-title').textContent = name;
    const cfg = competitionsConfig[name] || { id: 'coupe-monde-2026', hasGroups: true };
    currentCompId = cfg.id;
    const groupWrap = document.querySelector('.group-select-wrap') || document.getElementById('group-select').parentElement;
    groupWrap.style.display = cfg.hasGroups ? '' : 'none';
    const sel = document.getElementById('group-select');
    sel.value = 'A';
    renderGroup('A');
    showScreen('competition');
  });
});

document.querySelectorAll('.btn-comp--wimbledon').forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen('wimbledon');
    renderWimbledonScreen();
  });
});

document.getElementById('wimbledon-back').addEventListener('click', () => showScreen('home'));

document.getElementById('comp-back').addEventListener('click', () => showScreen('home'));
document.getElementById('group-back').addEventListener('click', () => showScreen('groups'));

let calendarFrom = 'competition';
let calendarComp = null; // compétition active quand on ouvre le calendrier
document.getElementById('calendar-back').addEventListener('click', () => showScreen(calendarFrom));

document.querySelectorAll('.btn-calendar').forEach(btn => {
  btn.addEventListener('click', async () => {
    const screen = btn.closest('.screen');
    calendarFrom = screen?.id?.replace('screen-', '') || 'competition';
    // Détecter la compétition selon l'écran d'origine
    if (calendarFrom === 'group') {
      calendarComp = document.getElementById('group-hero-comp')?.textContent || null;
      document.getElementById('calendar-title').textContent = calendarComp || 'Calendrier';
    } else {
      calendarComp = document.getElementById('comp-screen-title')?.textContent || null;
      document.getElementById('calendar-title').textContent = calendarComp || 'Calendrier';
    }
    showScreen('calendar');
    await renderCalendarScreen();
  });
});

async function renderCalendarScreen() {
  const container = document.getElementById('calendar-scroll');
  if (!container) return;

  const isWimbledon = calendarComp === 'Wimbledon 2026';
  const allMatches  = isWimbledon
    ? buildWimbledonMatches()
    : buildAllMatches(); // par défaut : football uniquement

  // Grouper par date
  const byDate = {};
  for (const m of allMatches) {
    (byDate[m.dateIso] = byDate[m.dateIso] || []).push(m);
  }

  const days = Object.keys(byDate).sort();
  container.innerHTML = days.map(dateIso => {
    const matches = byDate[dateIso];
    const label = matchDateLabels[dateIso] || dateIso;
    const rows = matches.map(m => {
      const isTennis = m.sport === 'tennis';
      const nulRow = isTennis ? '' : `
          <div class="match-teams match-teams--nul">
            <span class="nul-pill">Nul : ${m.nul}</span>
          </div>`;
      return `
        <div class="match-card">
          <div class="match-meta">
            <span class="match-time">${m.timePart}</span>
          </div>
          <div class="match-teams">
            <div class="match-team">${teamAvatarHtml(m.t1.name, m.t1.av, m.t1.ab)}<span>${m.t1.name}</span></div>
            <span class="odds-pill">${m.o1}</span>
          </div>
          ${nulRow}
          <div class="match-teams">
            <div class="match-team">${teamAvatarHtml(m.t2.name, m.t2.av, m.t2.ab)}<span>${m.t2.name}</span></div>
            <span class="odds-pill">${m.o2}</span>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="cal-day-label">${label}</div>
      ${rows}`;
  }).join('');

}

/* ── Search ── */
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.comp-card').forEach(card => {
    const name = card.querySelector('.comp-name').textContent.toLowerCase();
    const desc = card.querySelector('.comp-desc').textContent.toLowerCase();
    const badge = card.querySelector('.comp-badge').textContent.toLowerCase();
    const match = !query || name.includes(query) || desc.includes(query) || badge.includes(query);
    card.style.display = match ? '' : 'none';
  });
});

/* ── Filter tabs scroll with mouse wheel ── */
const filterTabs = document.querySelector('.filter-tabs');
filterTabs.addEventListener('wheel', e => {
  e.preventDefault();
  filterTabs.scrollLeft += e.deltaY;
}, { passive: false });

/* ── Comp picker scroll with mouse wheel ── */
const compPicker = document.getElementById('comp-picker');
compPicker.addEventListener('wheel', e => {
  e.preventDefault();
  compPicker.scrollLeft += e.deltaY;
}, { passive: false });

/* ── Filter tabs ── */
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    document.querySelectorAll('.comp-card').forEach(card => {
      if (filter === 'all' || card.dataset.sport === filter) {
        card.classList.remove('hidden-filter');
      } else {
        card.classList.add('hidden-filter');
      }
    });
  });
});

/* ── Create group modal ── */
/* ══ Groupes — Firestore ════════════════════════════════════════ */

const modalOverlay = document.getElementById('modal-create-group');
const stepName     = document.getElementById('step-name');
const stepConfirm  = document.getElementById('step-confirm');

/** Ouvre le modal de création en peuplant les amis depuis currentUser */
function openCreateGroup() {
  modalOverlay.classList.remove('hidden');
  stepName.classList.remove('hidden');
  stepConfirm.classList.add('hidden');
  document.getElementById('group-name-input').value = '';

  // Peupler le friend-picker depuis la vraie liste d'amis (UIDs → charger profils)
  const picker = document.getElementById('friend-picker');
  const friendUids = currentUser?.friends || [];
  if (friendUids.length === 0) {
    picker.innerHTML = `<p style="font-size:13px;color:#aaa;padding:8px 0">Aucun ami — va dans l'onglet Social pour en ajouter.</p>`;
  } else {
    picker.innerHTML = `<p style="font-size:12px;color:#aaa;padding:4px 0 8px">Chargement…</p>`;
    loadUsersByUids(friendUids).then(profiles => {
      picker.innerHTML = profiles.map(p => `
        <label class="friend-pick-item">
          <input type="checkbox" value="${p.uid}" />
          <div class="friend-avatar" style="width:36px;height:36px;font-size:13px;background:${pseudoColor(p.pseudo)}">${pseudoInitials(p.pseudo)}</div>
          <span>${p.pseudo}</span>
        </label>`).join('');
    });
  }
}

function closeModal() { modalOverlay.classList.add('hidden'); }

document.getElementById('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

document.getElementById('comp-picker').addEventListener('click', e => {
  const btn = e.target.closest('.comp-pick-item');
  if (!btn) return;
  document.querySelectorAll('.comp-pick-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

/** Sauvegarde le groupe dans Firestore puis affiche la confirmation */
document.getElementById('btn-confirm-group').addEventListener('click', async () => {
  const name    = document.getElementById('group-name-input').value.trim() || 'Mon Groupe';
  const comp    = document.querySelector('.comp-pick-item.active')?.dataset.comp || 'Coupe du Monde FIFA 2026';
  const invitedUids = [...document.querySelectorAll('.friend-pick-item input:checked')].map(c => c.value);
  const members = [currentUser.uid, ...invitedUids];  // UIDs

  const sub = `"${name}" sur ${comp}` + (invitedUids.length ? ` · ${invitedUids.length} ami(s) invité(s)` : '');
  document.getElementById('confirm-sub').textContent = sub;
  stepName.classList.add('hidden');
  stepConfirm.classList.remove('hidden');

  // Sauvegarder dans Firestore
  const groupData = {
    name, comp,
    owner:   currentUser.uid,
    members,  // UIDs
    createdAt: new Date().toISOString(),
  };

  let groupId = `local_${Date.now()}`;
  if (db) {
    try {
      const ref = await db.collection('groups').add(groupData);
      groupId = ref.id;
      console.log('[Stratos] Groupe créé :', groupId);
    } catch (e) {
      console.warn('[Stratos] Firestore groupe error:', e.message);
    }
  }

  // Mémoriser localement aussi
  createdGroups.push({ id: groupId, ...groupData });

  // Rafraîchir la liste des groupes
  renderGroupsScreen();

  // Stocker le groupe courant pour "Voir mon groupe"
  document.getElementById('btn-confirm-ok')._pendingGroup = { id: groupId, ...groupData };
});

document.getElementById('btn-confirm-ok').addEventListener('click', function () {
  closeModal();
  if (this._pendingGroup) {
    openGroupDetail(this._pendingGroup);
    this._pendingGroup = null;
  }
});

/** Affiche le détail d'un groupe avec vrais matchs WC */
// Stocke les matchs affichés dans le groupe courant pour le re-render rapide
let _groupDetailMatches = [];

function renderGroupMatchCards() {
  const container = document.getElementById('group-next-matches');
  if (!container || !_groupDetailMatches.length) return;
  container.innerHTML = _groupDetailMatches.map(m => {
    const logo1 = teamLogos[m.t1.name] ? `<img src="${teamLogos[m.t1.name]}" class="match-flag" style="width:22px;height:16px;border-radius:2px">` : '';
    const logo2 = teamLogos[m.t2.name] ? `<img src="${teamLogos[m.t2.name]}" class="match-flag" style="width:22px;height:16px;border-radius:2px">` : '';
    return `
      <div class="match-card" data-mid="${m.mid}">
        <div class="match-meta">
          <span class="match-time">${m.time.split(', ')[0]}, ${m.timePart}</span>
        </div>
        <div class="match-teams">
          <div class="match-team">${logo1}<span>${m.t1.name}</span></div>
          ${buildScoreSep(m.mid)}
          <div class="match-team match-team--right">${logo2}<span>${m.t2.name}</span></div>
        </div>
        ${buildPredBar(m)}
      </div>`;
  }).join('');
}

async function openGroupDetail({ name, comp, members = [] }) {
  document.getElementById('group-screen-title').textContent = name;
  document.getElementById('group-hero-name').textContent = name;
  document.getElementById('group-hero-comp').textContent = comp;
  document.getElementById('group-stat-members').textContent = members.length;

  // ── Classement trié par points réels ──
  const medals = ['🥇','🥈','🥉'];
  const tbody = document.getElementById('group-standings-body');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#aaa">Chargement…</td></tr>';
  const memberProfiles = await loadUsersByUids(members);
  const uidToProfile = Object.fromEntries(memberProfiles.map(p => [p.uid, p]));

  // Trier par predictionPoints décroissant
  const sorted = [...members].sort((a, b) => {
    const pa = uidToProfile[a]?.predictionPoints ?? 0;
    const pb = uidToProfile[b]?.predictionPoints ?? 0;
    return pb - pa;
  });

  tbody.innerHTML = sorted.map((uid, i) => {
    const profile = uidToProfile[uid] || { pseudo: uid.slice(0, 8), uid };
    const pseudo  = profile.pseudo;
    const pts     = profile.predictionPoints ?? 0;
    const correct = profile.correctPredictions ?? 0;
    const total   = profile.predictionCount ?? 0;
    const isMe    = uid === currentUser?.uid;
    const color   = pseudoColor(pseudo);
    const initials = pseudoInitials(pseudo);
    return `
      <tr ${isMe ? 'class="row-me"' : ''}>
        <td style="font-size:15px">${medals[i] || (i + 1)}</td>
        <td class="team-cell">
          <div class="team-avatar" style="width:26px;height:26px;font-size:9px;background:${color}">${initials}</div>
          ${pseudo}${isMe ? ' <span style="font-size:10px;color:#888">(moi)</span>' : ''}
        </td>
        <td style="font-size:12px;color:#888">${correct}/${total}</td>
        <td class="pts">${pts}</td>
      </tr>`;
  }).join('');

  // ── Matchs de la compétition du groupe ──
  await loadPredictionsData();

  const isWimbledon = comp === 'Wimbledon 2026';
  _groupDetailMatches = isWimbledon ? buildWimbledonMatches() : buildAllMatches();
  renderGroupMatchCards();

  showScreen('group');
}

/** Charge et affiche la liste des groupes de l'utilisateur depuis Firestore */
async function renderGroupsScreen() {
  const listEl = document.getElementById('my-groups-list');
  if (!listEl || !currentUser) return;

  listEl.innerHTML = `<p class="no-groups-msg" style="color:#aaa">Chargement…</p>`;

  let groups = [];
  if (db) {
    try {
      const snap = await db.collection('groups')
        .where('members', 'array-contains', currentUser.uid)
        .get();
      groups = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Stratos] renderGroupsScreen error:', e.message);
      groups = createdGroups.filter(g => g.members?.includes(currentUser.uid));
    }
  } else {
    groups = createdGroups.filter(g => g.members?.includes(currentUser.uid));
  }

  if (groups.length === 0) {
    listEl.innerHTML = `<p class="no-groups-msg">Aucun groupe pour l'instant.</p>`;
    return;
  }

  listEl.innerHTML = groups.map(g => `
    <div class="group-item" data-id="${g.id}">
      <div class="group-icon" style="background:var(--blue);color:#fff;font-size:18px">👥</div>
      <div class="group-info">
        <span class="group-name">${g.name}</span>
        <span class="group-meta">${g.members.length} membre(s) · ${g.comp}</span>
      </div>
    </div>`).join('');

  listEl.querySelectorAll('.group-item').forEach((el, i) => {
    el.addEventListener('click', () => openGroupDetail(groups[i]));
  });
}

// Trigger boutons de création
document.querySelectorAll('.btn-create-now, #btn-create-group').forEach(btn =>
  btn.addEventListener('click', openCreateGroup)
);

/* ══ Système d'amis — Firestore ════════════════════════════════ */

/** Génère les initiales d'un pseudo (ex: "arthur" → "AR") */
function pseudoInitials(pseudo) {
  return pseudo.slice(0, 2).toUpperCase();
}

/** Couleur d'avatar déterministe à partir du pseudo */
function pseudoColor(pseudo) {
  const colors = [
    '#1a3de8','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777',
  ];
  let hash = 0;
  for (const c of pseudo) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

/** Construit le HTML d'un avatar de pseudo */
function avatarHtml(pseudo, size = 44) {
  const color = pseudoColor(pseudo);
  const initials = pseudoInitials(pseudo);
  return `<div class="friend-avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.33)}px;background:${color};flex-shrink:0">${initials}</div>`;
}

/** Charge + affiche la liste d'amis depuis Firestore avec leur statut online */
/**
 * Charge les profils Firestore d'une liste d'UIDs.
 */
async function loadUsersByUids(uids) {
  if (!db || uids.length === 0) return [];
  const profiles = [];
  for (let i = 0; i < uids.length; i += 30) {
    const chunk = uids.slice(i, i + 30);
    try {
      const snap = await db.collection('users')
        .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
        .get();
      snap.docs.forEach(d => profiles.push({ uid: d.id, ...d.data() }));
    } catch (e) { console.warn('[Stratos] loadUsersByUids:', e.message); }
  }
  return profiles;
}

async function renderSocialScreen() {
  if (!currentUser) return;

  // Données fraîches
  if (db) {
    try {
      const snap = await db.doc(`users/${currentUser.uid}`).get();
      if (snap.exists) currentUser = { uid: currentUser.uid, ...snap.data(), online: true };
    } catch (e) { /* offline */ }
  }

  const friendUids = currentUser.friends || [];   // tableau d'UIDs

  // Charger les profils en une passe (documentId 'in')
  const friendProfiles = await loadUsersByUids(friendUids);
  const profileMap = Object.fromEntries(friendProfiles.map(p => [p.uid, p]));

  const countEl = document.getElementById('friends-count');
  if (countEl) countEl.textContent = friendUids.length === 1 ? '1 ami' : `${friendUids.length} amis`;

  // Scroll horizontal
  const scrollEl = document.getElementById('friends-scroll-list');
  if (scrollEl) {
    if (friendUids.length === 0) {
      scrollEl.innerHTML = `<p class="friends-empty">Aucun ami pour l'instant</p>`;
    } else {
      scrollEl.innerHTML = friendUids.map(uid => {
        const p = profileMap[uid];
        if (!p) return '';
        return `
          <div class="friend-avatar-wrap">
            ${avatarHtml(p.pseudo, 48)}
            ${p.online ? '<span class="online-dot"></span>' : ''}
            <span class="friend-name">${p.pseudo}</span>
          </div>`;
      }).join('');
    }
  }

  // Liste complète
  const listEl = document.getElementById('all-friends-list');
  if (listEl) {
    if (friendUids.length === 0) {
      listEl.innerHTML = `<p class="friends-empty-list">Recherche un pseudo ci-dessus pour ajouter des amis.</p>`;
    } else {
      listEl.innerHTML = friendUids.map(uid => {
        const p = profileMap[uid];
        if (!p) return '';
        const isOnline = p.online === true;
        return `
          <div class="friend-row">
            ${avatarHtml(p.pseudo, 40)}
            <div class="friend-row-info">
              <span class="friend-name">${p.pseudo}</span>
              <span class="friend-status ${isOnline ? 'online' : 'offline'}">
                ● ${isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <button class="btn-remove-friend" data-uid="${uid}">Retirer</button>
          </div>`;
      }).join('');

      listEl.querySelectorAll('.btn-remove-friend').forEach(btn => {
        btn.addEventListener('click', () => removeFriend(btn.dataset.uid));
      });
    }
  }
}

/** Ajoute un ami par UID */
async function addFriend(uid) {
  if (!currentUser || !uid) return;
  if (uid === currentUser.uid) return;
  if ((currentUser.friends || []).includes(uid)) return;

  currentUser.friends = [...(currentUser.friends || []), uid];

  if (db) {
    try {
      // Ajoute l'ami dans notre liste
      await db.doc(`users/${currentUser.uid}`).update({ friends: currentUser.friends });
      // Ajoute nous-même dans la liste de l'autre
      await db.doc(`users/${uid}`).update({
        friends: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
      });
    } catch (e) {
      console.warn('[Stratos] addFriend error:', e.message);
    }
  }
  renderSocialScreen();
  const input = document.getElementById('friend-search-input');
  if (input && input.value.trim().length >= 2) searchUsers(input.value.trim());
}

/** Retire un ami par UID (des deux côtés) */
async function removeFriend(uid) {
  if (!currentUser) return;
  currentUser.friends = (currentUser.friends || []).filter(u => u !== uid);

  if (db) {
    try {
      // Retire l'ami de notre liste
      await db.doc(`users/${currentUser.uid}`).update({ friends: currentUser.friends });
      // Retire nous-même de la liste de l'autre
      await db.doc(`users/${uid}`).update({
        friends: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
      });
    } catch (e) {
      console.warn('[Stratos] removeFriend error:', e.message);
    }
  }
  renderSocialScreen();
}

/** Recherche par préfixe de pseudo — ajoute par UID */
async function searchUsers(query) {
  const resultsEl = document.getElementById('friend-search-results');
  if (!resultsEl) return;

  if (query.length < 2) {
    resultsEl.innerHTML = '';
    resultsEl.classList.add('hidden');
    return;
  }

  resultsEl.innerHTML = `<p class="search-loading">Recherche…</p>`;
  resultsEl.classList.remove('hidden');

  let users = [];
  if (db) {
    try {
      const snap = await db.collection('users')
        .where('pseudo', '>=', query)
        .where('pseudo', '<', query + '\uf8ff')
        .limit(8)
        .get();
      users = snap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.uid !== currentUser?.uid);
    } catch (e) {
      console.warn('[Stratos] searchUsers error:', e.message);
    }
  }

  if (users.length === 0) {
    resultsEl.innerHTML = `<p class="search-empty">Aucun utilisateur trouvé pour « ${query} »</p>`;
    return;
  }

  const myFriends = currentUser?.friends || [];
  resultsEl.innerHTML = users.map(u => {
    const isFriend = myFriends.includes(u.uid);
    return `
      <div class="friend-row search-result-row">
        ${avatarHtml(u.pseudo, 40)}
        <div class="friend-row-info">
          <span class="friend-name">${u.pseudo}</span>
        </div>
        ${isFriend
          ? '<span class="already-friend">✓ Ami</span>'
          : `<button class="btn-add-friend" data-uid="${u.uid}">+ Ajouter</button>`
        }
      </div>`;
  }).join('');

  resultsEl.querySelectorAll('.btn-add-friend').forEach(btn => {
    btn.addEventListener('click', () => addFriend(btn.dataset.uid));
  });
}


/* Branchement de la barre de recherche */
const friendSearchInput = document.getElementById('friend-search-input');
let searchTimer = null;
friendSearchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = friendSearchInput.value.trim().toLowerCase();
  if (q.length < 2) {
    const r = document.getElementById('friend-search-results');
    r.innerHTML = '';
    r.classList.add('hidden');
    return;
  }
  searchTimer = setTimeout(() => searchUsers(q), 350); // debounce 350ms
});

// Fermer les résultats si on clique ailleurs
document.addEventListener('click', e => {
  if (!e.target.closest('.social-search') && !e.target.closest('#friend-search-results')) {
    const r = document.getElementById('friend-search-results');
    if (r) { r.innerHTML = ''; r.classList.add('hidden'); }
  }
});

/* ── Bottom nav ── */
/* ══ Écran Matchs — rendu complet de tous les matchs triés ══════ */

/**
 * Génère la liste complète des 72 matchs de la phase de groupes
 * groupés par jour, triés par date + heure, avec drapeaux.
 */
/* ══ PREDICTIONS ══════════════════════════════════════════════════
   matchResults    : { [badge]: 'home'|'draw'|'away' }   — résultats connus
   userPredictions : { [badge]: { id, pick, points, isCorrect } }
   ══════════════════════════════════════════════════════════════ */
let userPredictions = {};

/** Charge résultats + pronostics depuis Firestore, puis score les pronostics en attente. */
async function loadPredictionsData() {
  if (!db) return;

  // 1. Résultats des matchs (public — pas besoin d'être connecté)
  try {
    const snap = await db.collection('matchResults').get();
    matchResults = {};
    matchScores   = {};
    snap.forEach(doc => {
      const d = doc.data();
      matchResults[doc.id] = d.result;
      if (d.score) matchScores[doc.id] = d.score;
    });
  } catch (e) { console.warn('[Predictions] résultats :', e.message); }

  if (!currentUser) return;

  // 2. Pronostics de l'utilisateur courant
  try {
    const snap = await db.collection('predictions')
      .where('userId', '==', currentUser.uid).get();
    userPredictions = {};
    snap.forEach(doc => {
      const d = doc.data();
      // eventId est maintenant le mid unique (ex. "MEXvRSA")
      userPredictions[d.eventId] = { id: doc.id, pick: d.pick, points: d.points, isCorrect: d.isCorrect };
    });
  } catch (e) { console.warn('[Predictions] pronostics :', e.message); }

  // 3. Lazy scoring
  await resolvePendingPredictions();
}

/** Score les pronostics non encore résolus pour lesquels un résultat existe. */
async function resolvePendingPredictions() {
  if (!db || !currentUser) return;
  const pending = Object.entries(userPredictions)
    .filter(([mid, p]) => p.points === null && matchResults[mid]);
  if (!pending.length) return;

  const batch = db.batch();
  let pts = 0, correct = 0;

  for (const [mid, pred] of pending) {
    const ok     = pred.pick === matchResults[mid];
    const points = ok ? 3 : 1;
    batch.update(db.doc(`predictions/${pred.id}`), { points, isCorrect: ok });
    userPredictions[mid] = { ...pred, points, isCorrect: ok };
    pts += points;
    if (ok) correct++;
  }

  batch.update(db.doc(`users/${currentUser.uid}`), {
    predictionPoints:   firebase.firestore.FieldValue.increment(pts),
    correctPredictions: firebase.firestore.FieldValue.increment(correct),
  });

  try {
    await batch.commit();
    currentUser.predictionPoints   = (currentUser.predictionPoints   || 0) + pts;
    currentUser.correctPredictions = (currentUser.correctPredictions || 0) + correct;
    console.log(`[Predictions] ${pending.length} pronostic(s) scoré(s) : +${pts} pts`);
  } catch (e) { console.warn('[Predictions] scoring :', e.message); }
}

/** Soumet ou modifie un pronostic. mid = identifiant unique du match (ex. "MEXvRSA"). */
async function submitPrediction(mid, pick, startMs) {
  if (!currentUser) return;
  if (Date.now() >= startMs) return;

  const existing = userPredictions[mid];
  // Re-clic sur le même bouton = annulation du pari
  if (existing?.pick === pick) {
    await deletePrediction(mid);
    return;
  }

  const docId = `${currentUser.uid}_${mid}`;
  const isNew = !existing;

  // Optimistic update
  userPredictions[mid] = { id: docId, pick, points: null, isCorrect: null };

  if (db) {
    try {
      if (isNew) {
        await db.doc(`predictions/${docId}`).set({
          userId: currentUser.uid, eventId: mid, pick,
          points: null, isCorrect: null, createdAt: new Date().toISOString(),
        });
        await db.doc(`users/${currentUser.uid}`).update({
          predictionCount: firebase.firestore.FieldValue.increment(1),
        });
        currentUser.predictionCount = (currentUser.predictionCount || 0) + 1;
      } else {
        await db.doc(`predictions/${docId}`).update({ pick, points: null, isCorrect: null });
      }
    } catch (e) {
      console.warn('[Predictions] soumission :', e.message);
      if (isNew) delete userPredictions[mid];
      else userPredictions[mid] = existing;
    }
  }

  // Mise à jour chirurgicale : toggle uniquement les boutons de CE match
  updatePredBarInDOM(mid);
}

async function deletePrediction(mid) {
  if (!currentUser) return;
  const existing = userPredictions[mid];
  if (!existing) return;

  // Optimistic update
  delete userPredictions[mid];
  updatePredBarInDOM(mid);

  if (db) {
    const docId = `${currentUser.uid}_${mid}`;
    try {
      await db.doc(`predictions/${docId}`).delete();
      await db.doc(`users/${currentUser.uid}`).update({
        predictionCount: firebase.firestore.FieldValue.increment(-1),
      });
      currentUser.predictionCount = Math.max(0, (currentUser.predictionCount || 1) - 1);
    } catch (e) {
      console.warn('[Predictions] suppression :', e.message);
      // Rollback
      userPredictions[mid] = existing;
      updatePredBarInDOM(mid);
    }
  }
}

// Index badge → objet match, peuplé au premier rendu
const _matchByBadge = {};

/**
 * Contenu interne d'une barre de pronostic (sans le div englobant).
 * Appelé aussi bien pour le rendu initial que pour les mises à jour.
 */
function buildPredBarInner(m) {
  // Match avec joueurs inconnus → paris indisponibles
  if (m.tbd) {
    return `<span class="pred-tbd">🔒 Joueurs non encore qualifiés — paris indisponibles</span>`;
  }

  const now        = Date.now();
  const elapsed    = now - m.startMs;          // ms depuis le coup d'envoi
  const isStarted  = elapsed >= 0;
  const isLive     = isStarted && elapsed < 115 * 60 * 1000; // < 115 min
  const userPred   = userPredictions[m.mid];
  const result     = matchResults[m.mid];
  const isTennis   = m.sport === 'tennis';
  const labels     = isTennis
    ? { home: m.t1.name, away: m.t2.name }
    : { home: m.t1.name, draw: 'Match nul', away: m.t2.name };
  const odds       = isTennis
    ? { home: m.o1, away: m.o2 }
    : { home: m.o1, draw: m.nul, away: m.o2 };

  // ── Match terminé (résultat connu) ──
  if (result) {
    if (userPred) {
      const ok = userPred.pick === result;
      return `
        <span class="pred-outcome ${ok ? 'pred-outcome--win' : 'pred-outcome--loss'}">${ok ? '✓' : '✗'} ${userPred.points ?? '?'} pts</span>
        <span class="pred-result-label"><strong>${labels[result]}</strong></span>`;
    }
    return `<span class="pred-result-label pred-result-label--no-pick"><strong>${labels[result]}</strong> — pas de pronostic</span>`;
  }

  // ── Match en direct ──
  if (isLive) {
    const min = Math.floor(elapsed / 60000);
    const predInfo = userPred
      ? `<span class="pred-live-pick">Ton pari&nbsp;: <strong>${labels[userPred.pick]}</strong></span>`
      : `<span class="pred-live-pick pred-live-pick--none">Pas de pronostic</span>`;
    return `
      <span class="pred-live-badge">🔴 EN DIRECT ${min}'</span>
      ${predInfo}`;
  }

  // ── Match à venir ──
  let html = '';
  for (const [val, label] of Object.entries(labels)) {
    const sel = userPred?.pick === val;
    html += `<div class="pred-item"><span class="pred-odd-label">${odds[val]}</span><button class="pred-btn${sel ? ' pred-btn--selected' : ''}" data-pick="${val}">${label}</button></div>`;
  }
  return html;
}

/**
 * Génère le HTML COMPLET (wrapper + contenu) d'une barre de pronostic.
 * Le wrapper a un ID stable `pw-{mid}` et porte data-mid / data-start.
 * mid = t1.ab + 'v' + t2.ab, ex. "MEXvRSA" — TOUJOURS unique.
 */
/** Met à jour les scores affichés dans le DOM sans re-rendre toute la page. */
function refreshScoresInDOM() {
  // Mettre à jour les séparateurs de score dans les match-cards
  document.querySelectorAll('.match-card[data-mid]').forEach(card => {
    const mid = card.dataset.mid;
    const sep = card.querySelector('.match-score, .match-vs');
    if (!sep) return;
    const score = matchScores[mid];
    if (score != null) {
      sep.outerHTML = buildScoreSep(mid);
    }
    // Mettre à jour la pred-bar si besoin
    const bar = card.querySelector('[id^="pw-"]');
    if (bar) {
      const m = _matchByBadge[mid];
      if (m) bar.innerHTML = buildPredBarInner(m);
    }
  });

  // Reconstruire le rendu des groupes si la vue compétition est active
  if (currentScreen === 'competition') {
    const sel = document.getElementById('group-select');
    if (sel) renderGroup(sel.value);
  }
  // Reconstruire les cartes du groupe detail si actif
  if (currentScreen === 'group') {
    renderGroupMatchCards();
  }
  // Reconstruire l'onglet matchs si actif
  if (currentScreen === 'matchs') {
    renderMatchsScreen();
  }
  // Reconstruire Wimbledon si actif
  if (currentScreen === 'wimbledon') {
    renderWimbledonScreen();
  }
}

function buildScoreSep(mid) {
  const score = matchScores[mid];
  if (score != null) {
    const m = _matchByBadge[mid];
    if (m?.sport === 'tennis' && score.sets?.length) {
      const setsHtml = score.sets
        .map(s => `<span class="tennis-set">${s.t1}<span class="match-score-sep">-</span>${s.t2}</span>`)
        .join('');
      return `<span class="match-score match-score--tennis">${setsHtml}</span>`;
    }
    return `<span class="match-score">${score.t1}<span class="match-score-sep">–</span>${score.t2}</span>`;
  }
  return `<span class="match-vs">–</span>`;
}

function buildPredBar(m) {
  const result = matchResults[m.mid];
  const cls    = result ? 'pred-bar pred-bar--done' : 'pred-bar';
  return `<div class="${cls}" id="pw-${m.mid}" data-mid="${m.mid}" data-start="${m.startMs}">${buildPredBarInner(m)}</div>`;
}

/**
 * Toggle la classe pred-btn--selected sur les boutons du seul match concerné.
 * Utilise l'ID unique #pw-{mid} → impossible de toucher un autre match.
 */
function updatePredBarInDOM(mid) {
  const userPred = userPredictions[mid];
  document.querySelectorAll(`#pw-${mid} .pred-btn`).forEach(btn => {
    btn.classList.toggle('pred-btn--selected', userPred?.pick === btn.dataset.pick);
  });
}

/** Attache une délégation de clics pronostic sur un conteneur donné. */
function attachPredictionClicks(container) {
  if (!container) return;
  container.addEventListener('click', async e => {
    const btn = e.target.closest('.pred-btn');
    if (!btn || btn.disabled) return;
    const bar = btn.closest('[data-mid]');
    if (!bar) return;
    const mid     = bar.dataset.mid;
    const startMs = parseInt(bar.dataset.start, 10);
    const pick    = btn.dataset.pick;
    await submitPrediction(mid, pick, startMs);
  });
}

/** Délégation de clics sur les boutons de pronostic (appelé une seule fois). */
function initPredictionClicks() {
  attachPredictionClicks(document.getElementById('matchs-list'));
  attachPredictionClicks(document.getElementById('group-next-matches'));
}

/** Construit et retourne la liste triée de tous les matchs enrichis.
 *  Chaque match reçoit un `mid` (match ID) UNIQUE : t1.ab + 'v' + t2.ab
 *  ex. "MEXvRSA". Le badge (J-5, J-3…) n'est PAS unique — plusieurs matchs
 *  de groupes différents partagent le même badge. */
function buildAllMatches() {
  const all = [];
  for (const [group, matches] of Object.entries(groupMatchesData)) {
    for (const m of matches) {
      const dateIso  = matchDates[m.badge] || '2026-06-11';
      const timePart = m.time.includes(',') ? m.time.split(', ')[1].trim() : m.time.trim();
      const startMs  = new Date(`${dateIso}T${timePart}:00`).getTime();
      const mid      = `${m.t1.ab}v${m.t2.ab}`;          // identifiant vraiment unique
      const enriched = { ...m, group, dateIso, timePart, startMs, mid, sortKey: `${dateIso}T${timePart}` };
      all.push(enriched);
      _matchByBadge[mid] = enriched;
    }
  }
  all.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // Indexer aussi les matchs Wimbledon
  for (const m of buildWimbledonMatches()) {
    _matchByBadge[m.mid] = m;
  }

  return all;
}

/* ── Construction HTML de l'écran Matchs ──────────────────────── */
function renderMatchsScreenUI() {
  const container = document.getElementById('matchs-list');
  if (!container) return;

  const isUnknownPlayer = n => n.ab === 'TBD' || /^qualifi[ée]e?\s*\d/i.test(n.name);

  function flagHtml(team, side, forceName) {
    const name = forceName || team.name;
    const ab   = forceName ? '?' : team.ab;
    const logo = teamLogos[team.name];
    const img  = (!forceName && logo)
      ? `<img src="${logo}" alt="${ab}" class="match-flag">`
      : `<div class="team-avatar" style="width:26px;height:26px;font-size:9px;flex-shrink:0">${ab}</div>`;
    return side === 'left'
      ? `<div class="cal-team">${img}<span>${name}</span></div>`
      : `<div class="cal-team cal-team--right"><span>${name}</span>${img}</div>`;
  }

  function buildSection(matches) {
    const byDate = {};
    for (const m of matches) (byDate[m.dateIso] = byDate[m.dateIso] || []).push(m);
    let html = '';
    for (const [dateIso, dayMatches] of Object.entries(byDate)) {
      const dayLabel = matchDateLabels[dateIso] || dateIso;
      const validGroups = [...new Set(dayMatches.map(m => m.group).filter(g => g && !g.startsWith('W-')))];
      const groupsLabel = validGroups.length ? validGroups.map(g => `Gr. ${g}`).join(' · ') : '';
      html += `
        <div class="matchs-day-sep">
          <span class="matchs-day-name">${dayLabel}</span>
          <span class="matchs-day-groups">${groupsLabel}</span>
        </div>
        <div class="cal-group">`;
      for (const m of dayMatches) {
        const t1Unknown = isUnknownPlayer(m.t1);
        const t2Unknown = isUnknownPlayer(m.t2);
        html += `
          <div class="cal-row">
            <div class="cal-time">${m.timePart || ''}</div>
            <div class="cal-teams">
              ${flagHtml(m.t1, 'left',  t1Unknown ? '?' : null)}
              ${buildScoreSep(m.mid)}
              ${flagHtml(m.t2, 'right', t2Unknown ? '?' : null)}
            </div>
          </div>
          ${buildPredBar(m)}`;
      }
      html += `</div>`;
    }
    return html;
  }

  const footballMatches  = buildAllMatches();
  const wimbledonMatches = buildWimbledonMatches();

  let html = '';

  // Section Football
  html += `<div class="matchs-sport-sep"><span>⚽ Coupe du Monde FIFA 2026</span></div>`;
  html += buildSection(footballMatches);

  // Section Tennis
  html += `<div class="matchs-sport-sep matchs-sport-sep--tennis"><span>🎾 Wimbledon 2026</span></div>`;
  html += buildSection(wimbledonMatches);

  container.innerHTML = html;
}

/** Point d'entrée public : charge les données puis rend l'UI. */
async function renderMatchsScreen() {
  const container = document.getElementById('matchs-list');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px 0">Chargement…</p>';
  await loadPredictionsData();
  renderMatchsScreenUI();
}

/* ── Navigation ─────────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const nav = btn.dataset.nav;
    const target = navScreenMap[nav];
    if (!target) return;
    showScreen(target);
    // Mettre à jour l'onglet actif dans le nouvel écran affiché
    const newScreen = screens[target];
    if (newScreen) {
      newScreen.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      const activeBtn = newScreen.querySelector(`.nav-item[data-nav="${nav}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
    if (target === 'matchs') renderMatchsScreen();
    if (target === 'social') renderSocialScreen();
    if (target === 'groups') renderGroupsScreen();
  });
});

// Délégation clics pronostics (une seule fois au démarrage)
initPredictionClicks();

// Render au premier affichage si l'écran matchs est l'écran initial
if (!screens.matchs.classList.contains('hidden')) renderMatchsScreen();

/* ── Invite to group modal ── */
const modalInvite = document.getElementById('modal-invite-group');
document.getElementById('modal-invite-close').addEventListener('click', () => modalInvite.classList.add('hidden'));
modalInvite.addEventListener('click', e => { if (e.target === modalInvite) modalInvite.classList.add('hidden'); });

function openInviteModal(pseudo) {
  document.getElementById('invite-friend-name').textContent = pseudo;
  const list = document.getElementById('invite-groups-list');
  list.innerHTML = '';

  if (createdGroups.length === 0) {
    list.innerHTML = '<p style="color:#aaa;font-size:14px;text-align:center;padding:20px 0">Aucun groupe — créez-en un d\'abord.</p>';
  } else {
    createdGroups.forEach(g => {
      const already = g.friends.includes(pseudo);
      const row = document.createElement('div');
      row.className = 'group-item';
      row.style.cssText = 'cursor:pointer;opacity:' + (already ? '0.5' : '1');
      row.innerHTML = `
        <div class="group-icon" style="background:var(--blue);color:#fff;font-size:18px">👥</div>
        <div class="group-info">
          <span class="group-name">${g.name}</span>
          <span class="group-meta">${g.comp}</span>
        </div>
        <span style="font-size:13px;font-weight:700;color:${already ? '#aaa' : 'var(--blue)'}">${already ? 'Déjà membre' : 'Inviter'}</span>`;
      if (!already) {
        row.addEventListener('click', () => {
          g.friends.push(pseudo);
          g.members++;
          row.querySelector('span:last-child').textContent = 'Déjà membre';
          row.querySelector('span:last-child').style.color = '#aaa';
          row.style.opacity = '0.5';
          row.style.cursor = 'default';
          row.removeEventListener('click', () => {});
        });
      }
      list.appendChild(row);
    });
  }

  modalInvite.classList.remove('hidden');
}

/* ── Copy friend invite link ── */
document.getElementById('btn-share-link').addEventListener('click', () => {
  const pseudo = currentUser?.pseudo || 'moi';
  const link = `https://stratos.app/ajouter-ami?ref=${encodeURIComponent(pseudo)}`;
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('btn-share-link');
    const original = btn.innerHTML;
    btn.textContent = '✓ Lien copié !';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = link;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const btn = document.getElementById('btn-share-link');
    const original = btn.innerHTML;
    btn.textContent = '✓ Lien copié !';
    btn.style.background = '#22c55e';
    setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; }, 2000);
  });
});

document.querySelectorAll('.btn-friend-action').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const pseudo = btn.closest('[data-pseudo]')?.dataset.pseudo;
    if (pseudo) openInviteModal(pseudo);
  });
});

/* ── Apply team logos to static HTML ── */
applyTeamLogos();

/* ══════════════════════════════════════════════
   FIRESTORE SEED — Coupe du Monde FIFA 2026
   + Collection sports/football
   Lancé automatiquement par autoSeedIfNeeded() au démarrage.
   Peut aussi être appelé manuellement : seedFirestore()
   ══════════════════════════════════════════════ */

// Dates ISO par journée (pour tri Firestore)
const matchDates = {
  'J-2':  '2026-06-11', 'J-3':  '2026-06-12', 'J-4':  '2026-06-13',
  'J-5':  '2026-06-14', 'J-6':  '2026-06-15', 'J-7':  '2026-06-16',
  'J-8':  '2026-06-17', 'J-9':  '2026-06-18', 'J-10': '2026-06-19',
  'J-11': '2026-06-20', 'J-12': '2026-06-21', 'J-13': '2026-06-22',
  'J-14': '2026-06-23', 'J-15': '2026-06-24', 'J-16': '2026-06-25',
  'J-17': '2026-06-26', 'J-18': '2026-06-27', 'J-19': '2026-06-28',
  'J-20': '2026-06-29',
};

// Labels lisibles pour l'affichage dans l'écran Matchs
const matchDateLabels = {
  '2026-06-11': 'Jeudi 11 juin',      '2026-06-12': 'Vendredi 12 juin',
  '2026-06-13': 'Samedi 13 juin',     '2026-06-14': 'Dimanche 14 juin',
  '2026-06-15': 'Lundi 15 juin',      '2026-06-16': 'Mardi 16 juin',
  '2026-06-17': 'Mercredi 17 juin',   '2026-06-18': 'Jeudi 18 juin',
  '2026-06-19': 'Vendredi 19 juin',   '2026-06-20': 'Samedi 20 juin',
  '2026-06-21': 'Dimanche 21 juin',   '2026-06-22': 'Lundi 22 juin',
  '2026-06-23': 'Mardi 23 juin',      '2026-06-24': 'Mercredi 24 juin',
  '2026-06-25': 'Jeudi 25 juin',      '2026-06-26': 'Vendredi 26 juin',
  '2026-06-27': 'Samedi 27 juin',     '2026-06-28': 'Dimanche 28 juin',
  '2026-06-29': 'Lundi 29 juin',
  // Wimbledon 2026
  '2026-06-30': 'Mardi 30 juin',
  '2026-07-01': 'Mercredi 1er juillet',
  '2026-07-08': 'Mercredi 8 juillet',
  '2026-07-09': 'Jeudi 9 juillet',
  '2026-07-10': 'Vendredi 10 juillet',
  '2026-07-11': 'Samedi 11 juillet',
  '2026-07-12': 'Dimanche 12 juillet',
  '2026-07-13': 'Lundi 13 juillet',
};

window.seedFirestore = async function () {
  if (!db) { console.error('[Stratos] Firestore non connecté.'); return; }
  console.log('[Stratos] 🌱 Démarrage seed — purge puis écriture des vraies données…');

  // ══ ÉTAPE 0 : Purge des anciennes données ══════════════════════
  // Supprime tous les docs existants pour éviter les doublons
  // (p.ex. anciennes équipes fictives avec d'autres IDs)
  console.log('[Stratos]   ↻ Purge en cours…');

  for (const g of Object.keys(groupsData)) {
    const [tSnap, mSnap] = await Promise.all([
      db.collection(`competitions/coupe-monde-2026/groups/${g}/teams`).get(),
      db.collection(`competitions/coupe-monde-2026/groups/${g}/matches`).get(),
    ]);
    if (!tSnap.empty || !mSnap.empty) {
      const pb = db.batch();
      tSnap.docs.forEach(d => pb.delete(d.ref));
      mSnap.docs.forEach(d => pb.delete(d.ref));
      await pb.commit();
    }
  }

  // Purge sports/football/matches
  const sfSnap = await db.collection('sports/football/matches').get();
  if (!sfSnap.empty) {
    const pb = db.batch();
    sfSnap.docs.forEach(d => pb.delete(d.ref));
    await pb.commit();
  }
  console.log('[Stratos]   ✓ Purge terminée');

  // ══ ÉTAPE 1 : Écriture compétition (meta + équipes + matchs) ═══
  const b1 = db.batch();

  b1.set(db.doc('competitions/coupe-monde-2026'), {
    name: 'Coupe du Monde FIFA 2026',
    sport: 'football',
    badge: 'WC26',
    season: '2026',
    hasGroups: true,
  });

  // IDs fixes t1–t4 → évite les doublons lors d'un re-seed
  for (const [g, teams] of Object.entries(groupsData)) {
    teams.forEach((t, i) => {
      b1.set(db.doc(`competitions/coupe-monde-2026/groups/${g}/teams/t${i + 1}`), t);
    });
  }

  for (const [g, matches] of Object.entries(groupMatchesData)) {
    matches.forEach((m, i) => {
      b1.set(db.doc(`competitions/coupe-monde-2026/groups/${g}/matches/m${i + 1}`), {
        time:  m.time,
        badge: m.badge,
        live:  false,
        t1:    m.t1,
        t2:    m.t2,
        odds:  { o1: m.o1, nul: m.nul, o2: m.o2 },
      });
    });
  }

  await b1.commit();
  console.log('[Stratos]   ✓ competitions/coupe-monde-2026 — 12 groupes × 4 équipes + 6 matchs');

  // ══ ÉTAPE 2 : Collection sports/football/matches (vue à plat) ═══
  const b2 = db.batch();

  b2.set(db.doc('sports/football'), {
    name: 'Football',
    competition: 'Coupe du Monde FIFA 2026',
    icon: '⚽',
  });

  for (const [g, matches] of Object.entries(groupMatchesData)) {
    matches.forEach((m, i) => {
      const dateIso = matchDates[m.badge] || '2026-06-11';
      b2.set(db.doc(`sports/football/matches/${g}${i + 1}`), {
        group:     g,
        date:      dateIso,
        dateLabel: matchDateLabels[dateIso] || dateIso,
        time:      m.time.split(', ')[1] || m.time,
        badge:     m.badge,
        live:      false,
        t1:        m.t1,
        t2:        m.t2,
        odds:      { o1: m.o1, nul: m.nul, o2: m.o2 },
      });
    });
  }

  await b2.commit();
  console.log('[Stratos]   ✓ sports/football/matches — 72 matchs');

  const total = 1 + 48 + 72 + 1 + 72;
  console.log(`[Stratos] ✅ Seed terminé — ${total} documents écrits.`);
  console.log('  → competitions/coupe-monde-2026/groups/{A-L}/teams/{t1-t4}   (48 docs)');
  console.log('  → competitions/coupe-monde-2026/groups/{A-L}/matches/{m1-m6} (72 docs)');
  console.log('  → sports/football/matches/{A1-L6}                            (72 docs)');
};

// Lance le seed automatique dès que la page est prête
autoSeedIfNeeded();

/* ══ Écran Profil ════════════════════════════════════════════════ */

async function renderProfileScreen() {
  if (!currentUser) return;

  const u = currentUser;
  const color = pseudoColor(u.pseudo);

  // Avatar — silhouette neutre
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) {
    avatarEl.style.background = color;
    avatarEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
  }

  // Pseudo
  const pseudoEl = document.getElementById('profile-pseudo');
  if (pseudoEl) pseudoEl.textContent = u.pseudo;

  // Statut en ligne
  const badgeEl = document.getElementById('profile-status-badge');
  if (badgeEl) {
    const isOnline = u.online === true;
    badgeEl.textContent = isOnline ? '● En ligne' : '● Hors ligne';
    badgeEl.className = `profile-status-badge ${isOnline ? 'online' : 'offline'}`;
  }

  // Stats amis
  const friendsEl = document.getElementById('profile-stat-friends');
  if (friendsEl) friendsEl.textContent = (u.friends || []).length;

  // Stats groupes (depuis Firestore)
  const groupsEl = document.getElementById('profile-stat-groups');
  if (groupsEl) {
    groupsEl.textContent = '…';
    if (db) {
      try {
        const snap = await db.collection('groups')
          .where('members', 'array-contains', u.pseudo)
          .get();
        groupsEl.textContent = snap.size;
      } catch { groupsEl.textContent = '0'; }
    } else {
      groupsEl.textContent = createdGroups.filter(g => g.members?.includes(u.pseudo)).length;
    }
  }

  // Stats pronostics
  const pronosEl = document.getElementById('profile-stat-pronos');
  if (pronosEl) pronosEl.textContent = u.predictionCount ?? 0;

  // Infos compte
  const infoPs = document.getElementById('profile-info-pseudo');
  if (infoPs) infoPs.textContent = u.pseudo;

  const infoSince = document.getElementById('profile-info-since');
  if (infoSince && u.createdAt) {
    const d = new Date(u.createdAt);
    infoSince.textContent = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } else if (infoSince) {
    infoSince.textContent = '—';
  }

  const infoStatus = document.getElementById('profile-info-status');
  if (infoStatus) {
    infoStatus.textContent = u.online ? 'En ligne' : 'Hors ligne';
    infoStatus.style.color = u.online ? '#22c55e' : '#9ca3af';
  }

  // Performances récentes
  const perfEl = document.getElementById('profile-perf-list');
  if (perfEl) {
    const friends  = (u.friends || []).length;
    const total    = u.predictionCount    ?? 0;
    const pts      = u.predictionPoints   ?? 0;
    const correct  = u.correctPredictions ?? 0;
    const pct      = total > 0 ? Math.round((correct / total) * 100) : null;

    const items = [
      {
        icon: '🎯',
        label: `${pts} point${pts > 1 ? 's' : ''} de pronostic`,
        sub: total > 0
          ? `${correct} bon${correct > 1 ? 's' : ''} / ${total} pronostic${total > 1 ? 's' : ''} — ${pct}% de réussite`
          : 'Aucun pronostic soumis',
        val: pts > 0 ? `<span class="pred-points-badge">⭐ ${pts} pts</span>` : '',
      },
      { icon: '🏆', label: 'Coupe du Monde 2026', sub: 'Compétition suivie', val: '' },
      { icon: '👥', label: `${friends} ami${friends !== 1 ? 's' : ''}`, sub: 'dans ton réseau', val: '' },
    ];

    perfEl.innerHTML = items.map(it => `
      <div class="profile-perf-item">
        <div class="profile-perf-icon">${it.icon}</div>
        <div class="profile-perf-info">
          <span class="profile-perf-label">${it.label}</span>
          <span class="profile-perf-sub">${it.sub}</span>
        </div>
        ${it.val ? `<div>${it.val}</div>` : ''}
      </div>`).join('');
  }

  showScreen('profile');
}

/* Bouton retour profil */
document.getElementById('profile-back').addEventListener('click', () => showScreen(previousScreen));

/* Bouton déconnexion */
document.getElementById('btn-logout').addEventListener('click', async () => {
  if (db && currentUser?.uid) {
    try { await db.doc(`users/${currentUser.uid}`).update({ online: false }); } catch {}
  }
  currentUser = null;
  if (auth) await auth.signOut();
  showScreen('login');
});

/* Câbler tous les boutons Profil (icône en haut à droite) */
document.querySelectorAll('[aria-label="Profil"]').forEach(btn => {
  btn.addEventListener('click', renderProfileScreen);
});

// Drapeaux nationaux chargés via flagcdn.com — pas besoin d'appel API asynchrone
