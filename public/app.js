// ESTADO GLOBAL DA APLICAÇÃO
let appState = {
  activeSOS: false,
  sosInterval: null,
  currentTask: {
    title: "Organizar Quarto e Fazer Lição",
    img: "https://via.placeholder.com/400x250?text=Quarto+Real+da+Abigail",
    steps: [
      { title: "Passo 1 de 3", instruction: "Colocar as roupas no cesto verde.", img: "https://via.placeholder.com/400x250?text=1.+Cesto+de+Roupas" },
      { title: "Passo 2 de 3", instruction: "Guardar os livros na estante.", img: "https://via.placeholder.com/400x250?text=2.+Guardar+Livros" },
      { title: "Passo 3 de 3", instruction: "Abrir o caderno de Português na página 12.", img: "https://via.placeholder.com/400x250?text=3.+Caderno+Aberto" }
    ]
  },
  currentStepIndex: 0,
  map: null,
  marker: null
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initTherapistChart();
});

// NAVEGAÇÃO POR ABAS
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.target.classList.add('active');

  if (tabName === 'cuidador' && appState.map) {
    setTimeout(() => appState.map.invalidateSize(), 200);
  }
}

// SIMULAÇÃO DO "BOTÃO TÔ TRAVADO" (US 2 & Fluxo do Diagrama de Sequência)
function triggerToTravado() {
  document.getElementById('normal-task-view').classList.add('hidden');
  document.getElementById('deconstructed-task-view').classList.remove('hidden');
  appState.currentStepIndex = 0;
  renderMicroStep();
  
  console.log("LOG: [POST /api/logs-crise] Evento 'Tô Travado' gerado no banco de dados.");
}

function renderMicroStep() {
  const step = appState.currentTask.steps[appState.currentStepIndex];
  document.getElementById('micro-step-title').innerText = step.title;
  document.getElementById('micro-step-instruction').innerText = step.instruction;
  document.getElementById('micro-step-img').src = step.img;
}

function nextMicroStep() {
  appState.currentStepIndex++;
  if (appState.currentStepIndex < appState.currentTask.steps.length) {
    renderMicroStep();
  } else {
    alert("Parabéns! Você concluiu todos os micro-passos com sucesso! 🌟");
    document.getElementById('normal-task-view').classList.remove('hidden');
    document.getElementById('deconstructed-task-view').classList.add('hidden');
  }
}

function completeTask() {
  alert("Tarefa concluída!");
}

// RASTREAMENTO GPS & BOTÃO SOS (US 3, 5 e 7)
function triggerSOS() {
  appState.activeSOS = true;
  document.getElementById('sos-status').classList.remove('hidden');
  
  // Atualiza visão do Cuidador
  const alertBox = document.getElementById('sos-alert-box');
  alertBox.className = "alert-box-active";
  alertBox.innerText = "🚨 ALERTA CRÍTICO: Paciente em Crise no Mapa!";
  document.getElementById('btn-resolve-sos').classList.remove('hidden');

  sendLocationTelemetry();
  appState.sosInterval = setInterval(sendLocationTelemetry, 5000); // Envio contínuo
}

function sendLocationTelemetry() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateMapLocation(latitude, longitude);
        console.log(`TELEMETRIA [PUT /api/localizacao]: Lat ${latitude}, Long ${longitude}`);
      },
      () => {
        // Fallback local caso GPS esteja indisponível
        updateMapLocation(-7.115, -34.863);
      }
    );
  }
}

function updateMapLocation(lat, lng) {
  if (appState.map) {
    appState.map.setView([lat, lng], 15);
    if (appState.marker) appState.map.removeLayer(appState.marker);
    appState.marker = L.marker([lat, lng]).addTo(appState.map)
      .bindPopup("<b>Paciente AQUI</b><br>Crise Detectada")
      .openPopup();
  }
}

function resolveSOS() { // US 9
  appState.activeSOS = false;
  clearInterval(appState.sosInterval);
  
  document.getElementById('sos-status').classList.add('hidden');
  const alertBox = document.getElementById('sos-alert-box');
  alertBox.className = "alert-box-inactive";
  alertBox.innerText = "Status: Paciente Seguro (Nenhum Alerta Ativo)";
  document.getElementById('btn-resolve-sos').classList.add('hidden');

  alert("Evento SOS marcado como Resolvido. A telemetria contínua foi interrompida.");
}

// LEAFLET MAP INITIALIZATION
function initMap() {
  appState.map = L.map('map-container').setView([-7.115, -34.863], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(appState.map);
}

// UPLOAD DE TAREFAS VISUAIS (US 1 e US 4)
function handleAddTask(e) {
  e.preventDefault();
  const title = document.getElementById('task-title-input').value;
  const fileInput = document.getElementById('task-file-input');
  const stepsRaw = document.getElementById('task-steps-input').value;

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById('current-task-title').innerText = title;
      document.getElementById('current-task-img').src = evt.target.result;
      
      // Atualiza passos se preenchidos
      if(stepsRaw) {
        const stepsArr = stepsRaw.split(',').map((s, i) => ({
          title: `Passo ${i+1}`,
          instruction: s.trim(),
          img: evt.target.result
        }));
        appState.currentTask.steps = stepsArr;
      }
      
      alert("Tarefa visual e fotos reais associadas com sucesso no ecossistema!");
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

// DASHBOARD CLÍNICO DO TERAPEUTA (US 6)
function initTherapistChart() {
  const ctx = document.getElementById('chart-crises').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Acionamentos "Tô Travado"',
        data: [4, 1, 6, 2, 5, 0, 1],
        backgroundColor: '#d93829'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function handleCreateTemplate(e) { // US 8
  e.preventDefault();
  alert("Novo Template de Decomposição disponibilizado com sucesso na biblioteca do sistema!");
}

function toggleTherapistAuth(grant) { // US 5
  if(grant) {
    alert("Acesso autorizado com sucesso! Os relatórios LGPD estão liberados para o profissional.");
  } else {
    alert("Acesso ao histórico do paciente revogado.");
  }
}

// AUTH MODAL LOGIC (US 10)
function openAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function handleAuth(e) {
  e.preventDefault();
  const role = document.getElementById('user-role-select').value;
  alert(`Usuário autenticado com sucesso sob o papel de: ${role.toUpperCase()}`);
  closeAuthModal();
  switchTab(role);
}