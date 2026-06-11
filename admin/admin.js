/* ════════════════════════════════════════════
   STRATOS ADMIN — Gestion des résultats
════════════════════════════════════════════ */

// ── Tous les matchs de la phase de groupes ──
const ALL_MATCHES = [
  // Groupe A
  { group:'A', mid:'MEXvRSA', t1:'Mexique',          ab1:'MEX', t2:'Afrique du Sud',  ab2:'RSA', date:'2026-06-11', time:'21:00' },
  { group:'A', mid:'KORvCZE', t1:'Corée du Sud',     ab1:'KOR', t2:'Tchéquie',        ab2:'CZE', date:'2026-06-12', time:'04:00' },
  { group:'A', mid:'CZEvRSA', t1:'Tchéquie',         ab1:'CZE', t2:'Afrique du Sud',  ab2:'RSA', date:'2026-06-18', time:'18:00' },
  { group:'A', mid:'MEXvKOR', t1:'Mexique',          ab1:'MEX', t2:'Corée du Sud',    ab2:'KOR', date:'2026-06-19', time:'03:00' },
  { group:'A', mid:'CZEvMEX', t1:'Tchéquie',         ab1:'CZE', t2:'Mexique',         ab2:'MEX', date:'2026-06-25', time:'03:00' },
  { group:'A', mid:'RSAvKOR', t1:'Afrique du Sud',   ab1:'RSA', t2:'Corée du Sud',    ab2:'KOR', date:'2026-06-25', time:'03:00' },
  // Groupe B
  { group:'B', mid:'CANvBIH', t1:'Canada',           ab1:'CAN', t2:'Bosnie-Herzégovine', ab2:'BIH', date:'2026-06-12', time:'21:00' },
  { group:'B', mid:'QATvSUI', t1:'Qatar',            ab1:'QAT', t2:'Suisse',          ab2:'SUI', date:'2026-06-13', time:'21:00' },
  { group:'B', mid:'SUIvBIH', t1:'Suisse',           ab1:'SUI', t2:'Bosnie-Herzégovine', ab2:'BIH', date:'2026-06-18', time:'21:00' },
  { group:'B', mid:'CANvQAT', t1:'Canada',           ab1:'CAN', t2:'Qatar',           ab2:'QAT', date:'2026-06-19', time:'00:00' },
  { group:'B', mid:'SUIvCAN', t1:'Suisse',           ab1:'SUI', t2:'Canada',          ab2:'CAN', date:'2026-06-24', time:'21:00' },
  { group:'B', mid:'BIHvQAT', t1:'Bosnie-Herzégovine', ab1:'BIH', t2:'Qatar',        ab2:'QAT', date:'2026-06-24', time:'21:00' },
  // Groupe C
  { group:'C', mid:'BREvMAR', t1:'Brésil',           ab1:'BRE', t2:'Maroc',           ab2:'MAR', date:'2026-06-14', time:'00:00' },
  { group:'C', mid:'HAIvSCO', t1:'Haïti',            ab1:'HAI', t2:'Écosse',          ab2:'SCO', date:'2026-06-14', time:'03:00' },
  { group:'C', mid:'SCOvMAR', t1:'Écosse',           ab1:'SCO', t2:'Maroc',           ab2:'MAR', date:'2026-06-20', time:'00:00' },
  { group:'C', mid:'BREvHAI', t1:'Brésil',           ab1:'BRE', t2:'Haïti',           ab2:'HAI', date:'2026-06-20', time:'03:00' },
  { group:'C', mid:'SCOvBRE', t1:'Écosse',           ab1:'SCO', t2:'Brésil',          ab2:'BRE', date:'2026-06-25', time:'00:00' },
  { group:'C', mid:'MARvHAI', t1:'Maroc',            ab1:'MAR', t2:'Haïti',           ab2:'HAI', date:'2026-06-25', time:'00:00' },
  // Groupe D
  { group:'D', mid:'USAvPAR', t1:'États-Unis',       ab1:'USA', t2:'Paraguay',        ab2:'PAR', date:'2026-06-13', time:'03:00' },
  { group:'D', mid:'AUSvTUR', t1:'Australie',        ab1:'AUS', t2:'Turquie',         ab2:'TUR', date:'2026-06-14', time:'06:00' },
  { group:'D', mid:'USAvAUS', t1:'États-Unis',       ab1:'USA', t2:'Australie',       ab2:'AUS', date:'2026-06-19', time:'21:00' },
  { group:'D', mid:'TURvPAR', t1:'Turquie',          ab1:'TUR', t2:'Paraguay',        ab2:'PAR', date:'2026-06-20', time:'06:00' },
  { group:'D', mid:'TURvUSA', t1:'Turquie',          ab1:'TUR', t2:'États-Unis',      ab2:'USA', date:'2026-06-25', time:'21:00' },
  { group:'D', mid:'PARvAUS', t1:'Paraguay',         ab1:'PAR', t2:'Australie',       ab2:'AUS', date:'2026-06-25', time:'21:00' },
  // Groupe E
  { group:'E', mid:'CIVvECU', t1:'Côte d\'Ivoire',  ab1:'CIV', t2:'Équateur',        ab2:'ECU', date:'2026-06-15', time:'01:00' },
  { group:'E', mid:'SUEvTUN', t1:'Suède',            ab1:'SUE', t2:'Tunisie',         ab2:'TUN', date:'2026-06-15', time:'04:00' },
  { group:'E', mid:'ECUvTUN', t1:'Équateur',         ab1:'ECU', t2:'Tunisie',         ab2:'TUN', date:'2026-06-21', time:'01:00' },
  { group:'E', mid:'CIVvSUE', t1:'Côte d\'Ivoire',  ab1:'CIV', t2:'Suède',           ab2:'SUE', date:'2026-06-21', time:'04:00' },
  { group:'E', mid:'ECUvCIV', t1:'Équateur',         ab1:'ECU', t2:'Côte d\'Ivoire',  ab2:'CIV', date:'2026-06-26', time:'21:00' },
  { group:'E', mid:'TUNvSUE', t1:'Tunisie',          ab1:'TUN', t2:'Suède',           ab2:'SUE', date:'2026-06-26', time:'21:00' },
  // Groupe F
  { group:'F', mid:'ESPvCPV', t1:'Espagne',          ab1:'ESP', t2:'Cap-Vert',        ab2:'CPV', date:'2026-06-15', time:'18:00' },
  { group:'F', mid:'BELvEGY', t1:'Belgique',         ab1:'BEL', t2:'Égypte',          ab2:'EGY', date:'2026-06-15', time:'21:00' },
  { group:'F', mid:'CPVvEGY', t1:'Cap-Vert',         ab1:'CPV', t2:'Égypte',          ab2:'EGY', date:'2026-06-21', time:'18:00' },
  { group:'F', mid:'ESPvBEL', t1:'Espagne',          ab1:'ESP', t2:'Belgique',        ab2:'BEL', date:'2026-06-21', time:'21:00' },
  { group:'F', mid:'CPVvESP', t1:'Cap-Vert',         ab1:'CPV', t2:'Espagne',         ab2:'ESP', date:'2026-06-26', time:'21:00' },
  { group:'F', mid:'EGYvBEL', t1:'Égypte',           ab1:'EGY', t2:'Belgique',        ab2:'BEL', date:'2026-06-26', time:'21:00' },
  // Groupe G
  { group:'G', mid:'KSAvURU', t1:'Arabie saoudite',  ab1:'KSA', t2:'Uruguay',         ab2:'URU', date:'2026-06-16', time:'00:00' },
  { group:'G', mid:'ESPvPOR', t1:'Espagne',          ab1:'ESP', t2:'Portugal',        ab2:'POR', date:'2026-06-16', time:'00:00' },
  { group:'G', mid:'URUvPOR', t1:'Uruguay',          ab1:'URU', t2:'Portugal',        ab2:'POR', date:'2026-06-22', time:'00:00' },
  { group:'G', mid:'KSAvESP', t1:'Arabie saoudite',  ab1:'KSA', t2:'Espagne',         ab2:'ESP', date:'2026-06-22', time:'03:00' },
  { group:'G', mid:'URUvKSA', t1:'Uruguay',          ab1:'URU', t2:'Arabie saoudite', ab2:'KSA', date:'2026-06-26', time:'21:00' },
  { group:'G', mid:'PORvESP', t1:'Portugal',         ab1:'POR', t2:'Espagne',         ab2:'ESP', date:'2026-06-26', time:'21:00' },
  // Groupe H
  { group:'H', mid:'IRAv NZL', t1:'Iran',            ab1:'IRA', t2:'Nouvelle-Zélande', ab2:'NZL', date:'2026-06-16', time:'03:00' },
  { group:'H', mid:'AUTvJOR', t1:'Autriche',         ab1:'AUT', t2:'Jordanie',        ab2:'JOR', date:'2026-06-16', time:'06:00' },
  { group:'H', mid:'NZLvJOR', t1:'Nouvelle-Zélande', ab1:'NZL', t2:'Jordanie',        ab2:'JOR', date:'2026-06-22', time:'03:00' },
  { group:'H', mid:'IRAv AUT', t1:'Iran',            ab1:'IRA', t2:'Autriche',        ab2:'AUT', date:'2026-06-22', time:'06:00' },
  { group:'H', mid:'NZLvIRA', t1:'Nouvelle-Zélande', ab1:'NZL', t2:'Iran',            ab2:'IRA', date:'2026-06-27', time:'21:00' },
  { group:'H', mid:'JORvAUT', t1:'Jordanie',         ab1:'JOR', t2:'Autriche',        ab2:'AUT', date:'2026-06-27', time:'21:00' },
  // Groupe I
  { group:'I', mid:'IRQvNOR', t1:'Irak',             ab1:'IRQ', t2:'Norvège',         ab2:'NOR', date:'2026-06-17', time:'00:00' },
  { group:'I', mid:'ARGvALG', t1:'Argentine',        ab1:'ARG', t2:'Algérie',         ab2:'ALG', date:'2026-06-17', time:'03:00' },
  { group:'I', mid:'NORvALG', t1:'Norvège',          ab1:'NOR', t2:'Algérie',         ab2:'ALG', date:'2026-06-23', time:'00:00' },
  { group:'I', mid:'ARGvIRQ', t1:'Argentine',        ab1:'ARG', t2:'Irak',            ab2:'IRQ', date:'2026-06-23', time:'03:00' },
  { group:'I', mid:'NORvARG', t1:'Norvège',          ab1:'NOR', t2:'Argentine',       ab2:'ARG', date:'2026-06-27', time:'21:00' },
  { group:'I', mid:'ALGvIRQ', t1:'Algérie',          ab1:'ALG', t2:'Irak',            ab2:'IRQ', date:'2026-06-27', time:'21:00' },
  // Groupe J
  { group:'J', mid:'FRAvSEN', t1:'France',           ab1:'FRA', t2:'Sénégal',         ab2:'SEN', date:'2026-06-17', time:'21:00' },
  { group:'J', mid:'PORvRDC', t1:'Portugal',         ab1:'POR', t2:'RD Congo',        ab2:'RDC', date:'2026-06-17', time:'19:00' },
  { group:'J', mid:'SENvRDC', t1:'Sénégal',          ab1:'SEN', t2:'RD Congo',        ab2:'RDC', date:'2026-06-23', time:'19:00' },
  { group:'J', mid:'FRAvPOR', t1:'France',           ab1:'FRA', t2:'Portugal',        ab2:'POR', date:'2026-06-23', time:'21:00' },
  { group:'J', mid:'SENvFRA', t1:'Sénégal',          ab1:'SEN', t2:'France',          ab2:'FRA', date:'2026-06-27', time:'21:00' },
  { group:'J', mid:'RDCvPOR', t1:'RD Congo',         ab1:'RDC', t2:'Portugal',        ab2:'POR', date:'2026-06-27', time:'21:00' },
  // Groupe K
  { group:'K', mid:'ALLvCUR', t1:'Allemagne',        ab1:'ALL', t2:'Curaçao',         ab2:'CUR', date:'2026-06-14', time:'19:00' },
  { group:'K', mid:'NEDvJAP', t1:'Pays-Bas',         ab1:'NED', t2:'Japon',           ab2:'JAP', date:'2026-06-14', time:'22:00' },
  { group:'K', mid:'CURvJAP', t1:'Curaçao',          ab1:'CUR', t2:'Japon',           ab2:'JAP', date:'2026-06-20', time:'19:00' },
  { group:'K', mid:'ALLvNED', t1:'Allemagne',        ab1:'ALL', t2:'Pays-Bas',        ab2:'NED', date:'2026-06-20', time:'22:00' },
  { group:'K', mid:'CURvALL', t1:'Curaçao',          ab1:'CUR', t2:'Allemagne',       ab2:'ALL', date:'2026-06-25', time:'21:00' },
  { group:'K', mid:'JAPvNED', t1:'Japon',            ab1:'JAP', t2:'Pays-Bas',        ab2:'NED', date:'2026-06-25', time:'21:00' },
  // Groupe L
  { group:'L', mid:'ANGvCRO', t1:'Angleterre',       ab1:'ANG', t2:'Croatie',         ab2:'CRO', date:'2026-06-17', time:'22:00' },
  { group:'L', mid:'SAMvXXX', t1:'Équipe L3',        ab1:'L3',  t2:'Équipe L4',       ab2:'L4',  date:'2026-06-18', time:'00:00' },
  { group:'L', mid:'CROvXXX', t1:'Croatie',          ab1:'CRO', t2:'Équipe L3',       ab2:'L3',  date:'2026-06-23', time:'22:00' },
  { group:'L', mid:'ANGvXXX', t1:'Angleterre',       ab1:'ANG', t2:'Équipe L4',       ab2:'L4',  date:'2026-06-24', time:'00:00' },
  { group:'L', mid:'CROvANG', t1:'Croatie',          ab1:'CRO', t2:'Angleterre',      ab2:'ANG', date:'2026-06-28', time:'21:00' },
  { group:'L', mid:'L3vL4',   t1:'Équipe L3',        ab1:'L3',  t2:'Équipe L4',       ab2:'L4',  date:'2026-06-28', time:'21:00' },

  // ── Wimbledon 2026 — Tennis ──
  { group:'W-1T',  sport:'tennis', mid:'SINvQ01', t1:'Sinner',    ab1:'SIN', t2:'Qualifié 1',   ab2:'Q01', date:'2026-06-30', time:'11:00' },
  { group:'W-1T',  sport:'tennis', mid:'ALCvQ02', t1:'Alcaraz',   ab1:'ALC', t2:'Qualifié 2',   ab2:'Q02', date:'2026-06-30', time:'11:30' },
  { group:'W-1T',  sport:'tennis', mid:'FRIvQ03', t1:'Fritz',     ab1:'FRI', t2:'Qualifié 3',   ab2:'Q03', date:'2026-06-30', time:'13:00' },
  { group:'W-1T',  sport:'tennis', mid:'RUUvQ04', t1:'Ruud',      ab1:'RUU', t2:'Qualifié 4',   ab2:'Q04', date:'2026-06-30', time:'13:30' },
  { group:'W-1T',  sport:'tennis', mid:'SABvQ05', t1:'Sabalenka', ab1:'SAB', t2:'Qualifiée 5',  ab2:'Q05', date:'2026-06-30', time:'12:00' },
  { group:'W-1T',  sport:'tennis', mid:'SWIvQ06', t1:'Swiatek',   ab1:'SWI', t2:'Qualifiée 6',  ab2:'Q06', date:'2026-06-30', time:'12:30' },
  { group:'W-1T',  sport:'tennis', mid:'GAUvQ07', t1:'Gauff',     ab1:'GAU', t2:'Qualifiée 7',  ab2:'Q07', date:'2026-06-30', time:'14:00' },
  { group:'W-1T',  sport:'tennis', mid:'RYBvQ08', t1:'Rybakina',  ab1:'RYB', t2:'Qualifiée 8',  ab2:'Q08', date:'2026-06-30', time:'14:30' },
  { group:'W-1T',  sport:'tennis', mid:'DJOvQ09', t1:'Djokovic',  ab1:'DJO', t2:'Qualifié 9',   ab2:'Q09', date:'2026-07-01', time:'11:00' },
  { group:'W-1T',  sport:'tennis', mid:'ZVEvQ10', t1:'Zverev',    ab1:'ZVE', t2:'Qualifié 10',  ab2:'Q10', date:'2026-07-01', time:'11:30' },
  { group:'W-1T',  sport:'tennis', mid:'MEDvQ11', t1:'Medvedev',  ab1:'MED', t2:'Qualifié 11',  ab2:'Q11', date:'2026-07-01', time:'13:00' },
  { group:'W-1T',  sport:'tennis', mid:'RUBvQ12', t1:'Rublev',    ab1:'RUB', t2:'Qualifié 12',  ab2:'Q12', date:'2026-07-01', time:'13:30' },
  { group:'W-1T',  sport:'tennis', mid:'PEGvQ13', t1:'Pegula',    ab1:'PEG', t2:'Qualifiée 13', ab2:'Q13', date:'2026-07-01', time:'12:00' },
  { group:'W-1T',  sport:'tennis', mid:'ANDvQ14', t1:'Andreeva',  ab1:'AND', t2:'Qualifiée 14', ab2:'Q14', date:'2026-07-01', time:'12:30' },
  { group:'W-1T',  sport:'tennis', mid:'ZHEvQ15', t1:'Zheng',     ab1:'ZHE', t2:'Qualifiée 15', ab2:'Q15', date:'2026-07-01', time:'14:00' },
  { group:'W-1T',  sport:'tennis', mid:'KASvQ16', t1:'Kasatkina', ab1:'KAS', t2:'Qualifiée 16', ab2:'Q16', date:'2026-07-01', time:'14:30' },
  { group:'W-QF',  sport:'tennis', mid:'WQFM1',   t1:'QF M1',     ab1:'TBD', t2:'QF M2',        ab2:'TBD', date:'2026-07-08', time:'13:00' },
  { group:'W-QF',  sport:'tennis', mid:'WQFM2',   t1:'QF M3',     ab1:'TBD', t2:'QF M4',        ab2:'TBD', date:'2026-07-08', time:'15:00' },
  { group:'W-QF',  sport:'tennis', mid:'WQFD1',   t1:'QF D1',     ab1:'TBD', t2:'QF D2',        ab2:'TBD', date:'2026-07-08', time:'11:00' },
  { group:'W-QF',  sport:'tennis', mid:'WQFD2',   t1:'QF D3',     ab1:'TBD', t2:'QF D4',        ab2:'TBD', date:'2026-07-08', time:'13:00' },
  { group:'W-SF',  sport:'tennis', mid:'WSFM1',   t1:'SF M1',     ab1:'TBD', t2:'SF M2',        ab2:'TBD', date:'2026-07-11', time:'14:00' },
  { group:'W-SF',  sport:'tennis', mid:'WSFD1',   t1:'SF D1',     ab1:'TBD', t2:'SF D2',        ab2:'TBD', date:'2026-07-10', time:'14:00' },
  { group:'W-FIN', sport:'tennis', mid:'WFIND',   t1:'Finaliste D1', ab1:'TBD', t2:'Finaliste D2', ab2:'TBD', date:'2026-07-12', time:'14:00' },
  { group:'W-FIN', sport:'tennis', mid:'WFINM',   t1:'Finaliste M1', ab1:'TBD', t2:'Finaliste M2', ab2:'TBD', date:'2026-07-13', time:'14:00' },
];

// ── État ──
let db = null;
let matchResults = {};   // mid → { result, score: {t1, t2} }
let allUsers     = [];
let currentMatch = null;
let scoreT1 = 0;
let scoreT2 = 0;

// ── Firebase init ──
firebase.initializeApp(firebaseConfig);
db = firebase.firestore();
setStatus('ok', '✅ Firebase connecté');

// ── Navigation ──
document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
    if (btn.dataset.view === 'users') loadUsers();
  });
});

// ── Filtres ──
document.getElementById('filter-sport').addEventListener('change', renderMatchesTable);
document.getElementById('filter-group').addEventListener('change', renderMatchesTable);
document.getElementById('filter-status').addEventListener('change', renderMatchesTable);
document.getElementById('user-search').addEventListener('input', renderUsersTable);

// ── Charger les résultats existants puis afficher ──
async function init() {
  try {
    const snap = await db.collection('matchResults').get();
    snap.forEach(doc => {
      const d = doc.data();
      matchResults[doc.id] = { result: d.result, score: d.score || null };
    });
  } catch (e) {
    setStatus('err', '❌ Erreur Firestore');
    console.error(e);
  }
  renderMatchesTable();
}

function renderMatchesTable() {
  const sportFilter  = document.getElementById('filter-sport').value;
  const groupFilter  = document.getElementById('filter-group').value;
  const statusFilter = document.getElementById('filter-status').value;

  let matches = ALL_MATCHES.filter(m => {
    const sport = m.sport || 'football';
    if (sportFilter && sport !== sportFilter) return false;
    if (groupFilter && m.group !== groupFilter) return false;
    if (statusFilter === 'pending' && matchResults[m.mid]?.result) return false;
    if (statusFilter === 'done'    && !matchResults[m.mid]?.result) return false;
    return true;
  });

  const tbody = document.getElementById('matches-tbody');
  if (!matches.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Aucun match trouvé.</td></tr>';
    return;
  }

  tbody.innerHTML = matches.map(m => {
    const data = matchResults[m.mid];
    const badge = resBadge(m, data);
    return `
      <tr>
        <td>${formatDate(m.date)} ${m.time}</td>
        <td><strong>Groupe ${m.group}</strong></td>
        <td>
          <div class="match-teams-cell">
            <span class="team-ab">${m.ab1}</span>
            <span>${m.t1}</span>
            <span class="vs">vs</span>
            <span>${m.t2}</span>
            <span class="team-ab">${m.ab2}</span>
          </div>
        </td>
        <td>${badge}</td>
        <td>
          <button class="btn-edit" data-mid="${m.mid}">✏️ Saisir</button>
          ${data?.result ? `<button class="btn-delete" data-mid="${m.mid}">✕</button>` : ''}
        </td>
      </tr>`;
  }).join('');

  // Events
  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.mid));
  });
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteResult(btn.dataset.mid));
  });
}

function resBadge(m, data) {
  if (!data?.result) return '<span class="result-badge none">–</span>';
  const labels = { home: m.t1, draw: 'Match nul', away: m.t2 };
  const score = data.score ? `<strong>${data.score.t1}–${data.score.t2}</strong> · ` : '';
  return `<span class="result-badge ${data.result}">${score}${labels[data.result]}</span>`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Modal ──
function openModal(mid) {
  currentMatch = ALL_MATCHES.find(m => m.mid === mid);
  const existing = matchResults[mid];
  scoreT1 = existing?.score?.t1 ?? 0;
  scoreT2 = existing?.score?.t2 ?? 0;

  document.getElementById('modal-match').textContent =
    `${currentMatch.t1} vs ${currentMatch.t2} — ${formatDate(currentMatch.date)} ${currentMatch.time}`;
  document.getElementById('score-t1-name').textContent = currentMatch.t1;
  document.getElementById('score-t2-name').textContent = currentMatch.t2;

  updateScoreDisplay();
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function updateScoreDisplay() {
  document.getElementById('score-t1').textContent = scoreT1;
  document.getElementById('score-t2').textContent = scoreT2;

  const isTennis = currentMatch?.sport === 'tennis';
  let result, label;
  if (scoreT1 > scoreT2)       { result = 'home'; label = currentMatch.t1; }
  else if (scoreT2 > scoreT1)  { result = 'away'; label = currentMatch.t2; }
  else if (!isTennis)          { result = 'draw'; label = 'Match nul'; }
  else                         { result = null;   label = 'Égalité impossible au tennis'; }

  const preview = document.getElementById('score-result-preview');
  const scoreLabel = isTennis
    ? `Sets : ${scoreT1} – ${scoreT2}`
    : `Score : ${scoreT1} – ${scoreT2}`;
  preview.textContent = `${scoreLabel} → ${label}`;
  preview.dataset.result = result || '';
}

document.querySelectorAll('.score-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const op = btn.dataset.op;
    if (btn.dataset.side === 't1') {
      scoreT1 = Math.max(0, scoreT1 + (op === '+' ? 1 : -1));
    } else {
      scoreT2 = Math.max(0, scoreT2 + (op === '+' ? 1 : -1));
    }
    updateScoreDisplay();
  });
});

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  currentMatch = null;
}

document.getElementById('modal-save').addEventListener('click', async () => {
  if (!currentMatch) return;
  const btn = document.getElementById('modal-save');
  btn.disabled = true;
  btn.textContent = 'Enregistrement…';

  const result = document.getElementById('score-result-preview').dataset.result;
  if (!result) { toast('⚠️ Score invalide (égalité impossible)', 'error'); btn.disabled = false; btn.textContent = 'Enregistrer'; return; }
  const score  = { t1: scoreT1, t2: scoreT2 };

  try {
    await db.doc(`matchResults/${currentMatch.mid}`).set({ result, score });
    matchResults[currentMatch.mid] = { result, score };
    toast('✅ Score enregistré', 'success');
    closeModal();
    renderMatchesTable();
  } catch (e) {
    toast('❌ Erreur : ' + e.message, 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Enregistrer';
});

async function deleteResult(mid) {
  if (!confirm('Supprimer le résultat de ce match ?')) return;
  try {
    await db.doc(`matchResults/${mid}`).delete();
    delete matchResults[mid];
    toast('🗑️ Résultat supprimé', 'success');
    renderMatchesTable();
  } catch (e) {
    toast('❌ Erreur : ' + e.message, 'error');
  }
}

// ── Utilisateurs ──
async function loadUsers() {
  document.getElementById('users-tbody').innerHTML =
    '<tr><td colspan="6" class="loading">Chargement…</td></tr>';
  try {
    const snap = await db.collection('users').orderBy('predictionPoints', 'desc').get();
    allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    renderUsersTable();
  } catch (e) {
    document.getElementById('users-tbody').innerHTML =
      `<tr><td colspan="6" class="loading">Erreur : ${e.message}</td></tr>`;
  }
}

function renderUsersTable() {
  const q = document.getElementById('user-search').value.trim().toLowerCase();
  const users = allUsers.filter(u => !q || (u.pseudo || '').toLowerCase().includes(q));

  if (!users.length) {
    document.getElementById('users-tbody').innerHTML =
      '<tr><td colspan="6" class="loading">Aucun utilisateur trouvé.</td></tr>';
    return;
  }

  document.getElementById('users-tbody').innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.pseudo || '–'}</strong></td>
      <td>${u.email || '–'}</td>
      <td>${u.predictionCount ?? 0}</td>
      <td><strong>${u.predictionPoints ?? 0} pts</strong></td>
      <td>${u.correctPredictions ?? 0}</td>
      <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '–'}</td>
    </tr>`).join('');
}

// ── Utilitaires ──
function setStatus(cls, msg) {
  const el = document.getElementById('firebase-status');
  el.textContent = msg;
  el.className = `sidebar-status ${cls}`;
}

const toastEl = document.createElement('div');
toastEl.className = 'toast';
document.body.appendChild(toastEl);
let toastTimer = null;

function toast(msg, type = '') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast show ${type}`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// ── Démarrage ──
init();
