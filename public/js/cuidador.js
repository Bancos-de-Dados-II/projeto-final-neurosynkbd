// Proteção exclusiva para a página do Cuidador
validarAcesso('CUIDADOR');

function validarAcesso(roleEsperado) {
    const role = (localStorage.getItem('userRole') || '').toUpperCase();
    const nome = localStorage.getItem('userName');

    if (!role) {
        window.location.href = '../index.html';
        return;
    }

    if (role !== roleEsperado) {
        alert('Acesso negado para o seu perfil!');
        window.location.href = '../index.html';
        return;
    }

    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.innerHTML = `<i class="fa-regular fa-circle-user"></i> Olá, ${nome || 'Cuidador'}`;
    }
}

// Executa as verificações assim que a página carrega
document.addEventListener('DOMContentLoaded', () => {
    carregarPacientes();
    configurarLogout();
    checarStatusSOS();
    setInterval(checarStatusSOS, 3000); // Roda o monitoramento a cada 3s
});

// ----------------------------------------------------
// FUNCIONALIDADE 1: Buscar Pacientes Reais da API
// ----------------------------------------------------
async function carregarPacientes() {
    const tabelaBody = document.getElementById('lista-pacientes');
    const countElement = document.getElementById('count-pacientes');

    try {
        const response = await fetch('http://localhost:3000/usuarios?tipo=PACIENTE');
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        
        const pacientes = await response.json();

        if (countElement) {
            countElement.textContent = pacientes.length || 0;
        }

        if (!pacientes || pacientes.length === 0) {
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #64748b;">
                        Nenhum paciente cadastrado até o momento.
                    </td>
                </tr>`;
            return;
        }

        tabelaBody.innerHTML = pacientes.map(p => `
            <tr>
                <td><strong>${p.nome}</strong><br><small style="color:#64748b">${p.email || ''}</small></td>
                <td><span class="status-badge active">Ativo</span></td>
                <td>${p.proxima_medicacao || 'Sem medicação agendada'}</td>
                <td>
                    <button class="btn-icon" onclick="verDetalhes('${p._id || p.id}')" title="Ver Detalhes">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="abrirModalRotina('${p._id || p.id}', '${p.nome}')" title="Registrar Rotina">
                        <i class="fa-solid fa-notes-medical"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Erro:', error);
        if (tabelaBody) {
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ef4444;">
                        Erro ao carregar a lista de pacientes. Verifique a conexão com a API.
                    </td>
                </tr>`;
        }
    }
}

// ----------------------------------------------------
// FUNCIONALIDADE 3: Ações dos Botões & Modais
// ----------------------------------------------------
async function vincularPaciente() {
  const inputEmail = document.getElementById('email-paciente-input');
  let email = inputEmail ? inputEmail.value.trim() : '';

  if (!email) {
    email = prompt("Digite o e-mail do paciente que deseja vincular:");
  }

  if (!email) {
    alert('⚠️ Por favor, informe o e-mail do paciente.');
    return;
  }

  const idCuidador = localStorage.getItem('usuarioId');

  try {
    const resposta = await fetch('/usuarios/vincular-paciente', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailPaciente: email, idCuidador: idCuidador })
    });

    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao vincular paciente');

    alert(`✅ ${dados.mensagem}`);
    if (inputEmail) inputEmail.value = '';
    location.reload();

  } catch (erro) {
    alert(`❌ ${erro.message}`);
  }
}

async function verDetalhes(idPaciente) {
    const modal = document.getElementById('modal-detalhes-paciente');
    const conteudo = document.getElementById('conteudo-detalhes-paciente');
    
    if (modal) modal.style.display = 'flex';
    
    try {
        const response = await fetch(`/usuarios/paciente/${idPaciente}`);
        if (!response.ok) throw new Error('Não foi possível carregar os detalhes.');
        
        const paciente = await response.json();
        
        conteudo.innerHTML = `
            <p><strong>Nome:</strong> ${paciente.nome || 'Não informado'}</p>
            <p><strong>E-mail:</strong> ${paciente.email || 'Não informado'}</p>
            <p><strong>Diagnóstico Base:</strong> ${paciente.diagnostico || 'Nenhum laudo registrado'}</p>
            <p><strong>Status:</strong> Ativo</p>
        `;
    } catch (err) {
        conteudo.innerHTML = `<p style="color: red;">Erro ao carregar detalhes: ${err.message}</p>`;
    }
}

function fecharModalDetalhes() {
    const modal = document.getElementById('modal-detalhes-paciente');
    if (modal) modal.style.display = 'none';
}

function configurarLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}

function abrirModalRotina(idPaciente, nomePaciente) {
    document.getElementById('rotina-paciente-id').value = idPaciente;
    document.getElementById('rotina-paciente-nome').textContent = `Paciente: ${nomePaciente}`;
    document.getElementById('form-registrar-rotina').reset();

    const modal = document.getElementById('modal-registrar-rotina');
    if (modal) modal.style.display = 'flex';
}

function fecharModalRotina() {
    const modal = document.getElementById('modal-registrar-rotina');
    if (modal) modal.style.display = 'none';
}

async function salvarRotinaNoBanco(event) {
    event.preventDefault();

    const pacienteId = document.getElementById('rotina-paciente-id').value;
    const titulo = document.getElementById('rotina-titulo').value.trim();
    const medicacao = document.getElementById('rotina-medicacao').value.trim();
    const fileInput = document.getElementById('rotina-foto');

    if (!pacienteId) {
        alert('❌ ID do paciente inválido.');
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', titulo); 
    formData.append('proxima_medicacao', medicacao);
    if (fileInput.files.length > 0) {
        formData.append('foto', fileInput.files[0]);
    }

    try {
        const response = await fetch(`/api/pacientes/${pacienteId}/rotina`, {
            method: 'POST',
            body: formData
        });

        const dados = await response.json();

        if (response.ok) {
            alert('✅ Rotina e medicação cadastradas com sucesso!');
            fecharModalRotina();
            if (typeof carregarPacientes === 'function') carregarPacientes();
        } else {
            alert('❌ Erro: ' + (dados.mensagem || dados.error || 'Verifique as informações.'));
        }
    } catch (err) {
        console.error('Erro de conexão:', err);
        alert('❌ Erro de conexão ao salvar rotina.');
    }
}

// =========================================================
// MÓDULO CUIDADOR: MONITORAMENTO DE SOS E MAPA (LEAFLET)
// =========================================================

let map = null;
let marker = null;

function inicializarMapa(lat, lng) {
  const containerMapa = document.getElementById('mapa-sos');
  if (!containerMapa) return;

  if (!map) {
    map = L.map('mapa-sos').setView([lat, lng], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([lat, lng]).addTo(map)
      .bindPopup('📍 Paciente em emergência!')
      .openPopup();
  } else {
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 15);
  }

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 300);
}

async function checarStatusSOS() {
  const cardAlerta = document.getElementById('card-alerta-sos');

  try {
    const response = await fetch('/localizacao');
    
    if (response.ok) {
      const sosData = await response.json();

      if (sosData && sosData.ativo) {
        if (cardAlerta) cardAlerta.style.display = 'block';

        const lat = parseFloat(sosData.latitude);
        const lng = parseFloat(sosData.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          inicializarMapa(lat, lng);
          return;
        }
      }
    } else if (response.status === 404) {
      // Se a API retornou 404, significa que o SOS foi resolvido/desativado no backend
      if (cardAlerta) cardAlerta.style.display = 'none';
      localStorage.removeItem('neurosync_sos_status');
      return;
    }
  } catch (err) {
    console.warn('Backend indisponível no momento.');
  }

  // Fallback apenas se não houver resposta do backend e houver item válido ativo no localStorage
  const sosDataRaw = localStorage.getItem('neurosync_sos_status');
  if (sosDataRaw) {
    try {
      const sosData = JSON.parse(sosDataRaw);

      if (sosData && sosData.ativo) {
        if (cardAlerta) cardAlerta.style.display = 'block';

        const lat = parseFloat(sosData.lat);
        const lng = parseFloat(sosData.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          inicializarMapa(lat, lng);
          return;
        }
      }
    } catch (e) {
      console.error('Erro ao ler JSON de SOS do localStorage:', e);
    }
  }

  // Se não houver nenhum SOS ativo
  if (cardAlerta) cardAlerta.style.display = 'none';
}

// Escuta alterações de outras abas em tempo real
window.addEventListener('storage', (event) => {
  if (event.key === 'neurosync_sos_status') {
    checarStatusSOS();
  }
});

// Botão: Marcar SOS como Resolvido
window.marcarSosComoResolvido = async function() {
  try {
    // 1. Limpa o SOS no banco MongoDB
    await fetch('/localizacao', { method: 'DELETE' });

    // 2. Limpa o localStorage local
    localStorage.removeItem('neurosync_sos_status');

    // 3. Esconde a caixa do alerta na hora
    const cardAlerta = document.getElementById('card-alerta-sos');
    if (cardAlerta) cardAlerta.style.display = 'none';

    alert('✅ SOS marcado como resolvido!');
  } catch (err) {
    console.error('Erro ao resolver SOS:', err);
    alert('⚠️ Erro ao conectar com o servidor para resolver o SOS.');
  }
};