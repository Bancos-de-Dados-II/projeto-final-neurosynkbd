// Proteção exclusiva para a página do Cuidador
validarAcesso('CUIDADOR');

function validarAcesso(roleEsperado) {
    const role = (localStorage.getItem('userRole') || '').toUpperCase();
    const nome = localStorage.getItem('userName');

    // 1. Se não tiver sessão (não está logado)
    if (!role) {
        window.location.href = '../index.html';
        return;
    }

    // 2. Se o perfil for diferente de CUIDADOR
    if (role !== roleEsperado) {
        alert('Acesso negado para o seu perfil!');
        window.location.href = '../index.html';
        return;
    }

    // 3. Exibe o nome do usuário na navbar
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.innerHTML = `<i class="fa-regular fa-circle-user"></i> Olá, ${nome || 'Cuidador'}`;
    }
}

// Executa a busca de pacientes assim que a página carrega
document.addEventListener('DOMContentLoaded', () => {
    carregarPacientes();
    configurarLogout();
});

// ----------------------------------------------------
// FUNCIONALIDADE 1: Buscar Pacientes Reais da API
// ----------------------------------------------------
async function carregarPacientes() {
    const tabelaBody = document.getElementById('lista-pacientes');
    const countElement = document.getElementById('count-pacientes');

    try {
        // Altere a URL caso seu endpoint de listar pacientes seja diferente:
        const response = await fetch('http://localhost:3000/usuarios?tipo=PACIENTE');
        
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        
        const pacientes = await response.json();

        // Atualiza o contador no card estatístico
        if (countElement) {
            countElement.textContent = pacientes.length || 0;
        }

        // Se não houver pacientes no banco
        if (!pacientes || pacientes.length === 0) {
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #64748b;">
                        Nenhum paciente cadastrado até o momento.
                    </td>
                </tr>`;
            return;
        }

        // Preenche a tabela com os dados reais
        // Substitua o trecho dentro do .map da função carregarPacientes():
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
        tabelaBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ef4444;">
                    Erro ao carregar a lista de pacientes. Verifique a conexão com a API.
                </td>
            </tr>`;
    }
    async function enviarTarefaPaciente(event) {
    event.preventDefault();

    const pacienteId = document.getElementById('select-paciente-tarefa').value;
    const titulo = document.getElementById('titulo-tarefa-input').value.trim();

    if (!pacienteId || !titulo) {
        alert('Selecione um paciente e informe o título da tarefa.');
        return;
    }

    try {
        const response = await fetch('/api/tarefas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paciente_id: pacienteId,
                titulo: titulo,
                concluida: false
            })
        });

        if (response.ok) {
            alert('✅ Tarefa enviada ao paciente com sucesso!');
            document.getElementById('form-criar-tarefa').reset();
        } else {
            const errData = await response.json();
            alert('❌ Erro ao enviar tarefa: ' + (errData.mensagem || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Erro ao enviar tarefa:', error);
        alert('Erro ao se conectar ao servidor.');
    }
}
}

// ----------------------------------------------------
// FUNCIONALIDADE 3: Ações dos Botões
// ----------------------------------------------------
async function vincularPaciente() {
  // Pega o input da tela ou faz o prompt caso o input não exista
  const inputEmail = document.getElementById('email-paciente-input');
  let email = inputEmail ? inputEmail.value.trim() : '';

  if (!email) {
    email = prompt("Digite o e-mail do paciente que deseja vincular:");
  }

  if (!email) {
    alert('⚠️ Por favor, informe o e-mail do paciente.');
    return;
  }

  // Pega o ID do cuidador logado
  const idCuidador = localStorage.getItem('usuarioId');

  try {
    // ✅ Como deve ficar
const resposta = await fetch('/usuarios/vincular-paciente', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailPaciente: email,
        idCuidador: idCuidador
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.mensagem || 'Erro ao vincular paciente');
    }

    alert(`✅ ${dados.mensagem}`);

    // Limpa o input após enviar
    if (inputEmail) inputEmail.value = '';

    // Recarrega a página para atualizar a lista
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
function popularSelectPacientes(pacientes) {
    const select = document.getElementById('select-paciente-tarefa');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o Paciente...</option>' + 
        pacientes.map(p => `<option value="${p._id || p.id}">${p.nome || p.email}</option>`).join('');
}

// Configuração do Botão de Logout
function configurarLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}
// Renderização das linhas da tabela consultando a API
function renderizarTabelaPacientes(pacientes) {
    const tbody = document.getElementById('lista-meus-pacientes');
    if (!tbody) return;

    if (pacientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum paciente vinculado.</td></tr>`;
        return;
    }

    tbody.innerHTML = pacientes.map(p => {
        const id = p._id || p.id;
        const nome = p.nome || p.email;
        const medicacao = p.proxima_medicacao || p.proximaMedicacao || 'Sem medicação agendada';

        return `
            <tr>
                <td>
                    <strong>${escapeHTML(nome)}</strong><br>
                    <small style="color:#64748b">${escapeHTML(p.email || '')}</small>
                </td>
                <td><span class="badge-status">Ativo</span></td>
                <td>${escapeHTML(medicacao)}</td>
                <td>
                    <button class="btn-acao" title="Ver Detalhes" onclick="verDetalhes('${id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-acao" title="Registrar Rotina" onclick="abrirModalRotina('${id}', '${escapeHTML(nome)}')">
                        <i class="fa-solid fa-folder-plus"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Abrir Modal de Rotina
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

    const formData = new FormData();
    formData.append('paciente_id', pacienteId);
    formData.append('titulo', titulo);
    formData.append('proxima_medicacao', medicacao);

    if (fileInput.files.length > 0) {
        formData.append('foto', fileInput.files[0]);
    }

    try {
        const response = await fetch(`/api/pacientes/${pacienteId}/rotina`, {
            method: 'POST',
            body: formData        });

        if (response.ok) {
            alert('✅ Rotina, foto e próxima medicação atualizadas no banco de dados!');
            fecharModalRotina();
            carregarPacientes(); 
        } else {
            const err = await response.json();
            alert('❌ Erro ao salvar rotina: ' + (err.mensagem || 'Verifique as informações.'));
        }
    } catch (err) {
        console.error('Erro ao conectar ao servidor:', err);
        alert('Erro ao se comunicar com o banco de dados.');
    }
}
async function checarStatusSOSDoBanco() {
    try {
        const res = await fetch('/api/sos/ativo');
        if (res.ok) {
            const sosAtivo = await res.json();
            if (sosAtivo && sosAtivo.ativo) {
                exibirAlertaSOS(sosAtivo);
            }
        }
    } catch (err) {
        console.error('Erro ao checar SOS no banco:', err);
    }
}

setInterval(checarStatusSOSDoBanco, 5000);

// =========================================================
// MÓDULO CUIDADOR (US 4, US 5, US 7 & US 9)
// =========================================================

// Variáveis Globais para o Mapa e SOS
let map = null;
let marker = null;
let sosAtivoId = null;

// ---------------------------------------------------------
// US 7 & 9: MONITORAMENTO DE SOS E MAPA (LEAFLET)
// ---------------------------------------------------------
function inicializarMapa(lat, lng) {
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
}

// Polling automático para checar SOS (Local Storage + Fallback API)
function checarStatusSOS() {
  const cardAlerta = document.getElementById('card-alerta-sos');
  const sosDataRaw = localStorage.getItem('neurosync_sos_status');

  if (sosDataRaw) {
    const sosData = JSON.parse(sosDataRaw);

    if (sosData.ativo) {
      if (cardAlerta) cardAlerta.style.display = 'block';

      const lat = sosData.lat || -23.55052;
      const lng = sosData.lng || -46.633308;

      setTimeout(() => {
        inicializarMapa(lat, lng);
        if (map) map.invalidateSize();
      }, 200);
      return; // Já resolveu localmente!
    } else {
      if (cardAlerta) cardAlerta.style.display = 'none';
    }
  }

  // Tenta o backend caso exista
  fetch('/api/sos/active')
    .then(res => res.json())
    .then(data => {
      if (data && data.ativo) {
        sosAtivoId = data.id;
        if (cardAlerta) cardAlerta.style.display = 'block';

        const lat = data.latitude || -23.55052;
        const lng = data.longitude || -46.633308;

        setTimeout(() => {
          inicializarMapa(lat, lng);
          if (map) map.invalidateSize();
        }, 200);
      } else if (cardAlerta) {
        cardAlerta.style.display = 'none';
        sosAtivoId = null;
      }
    })
    .catch(err => console.warn('Aguardando servidor/API de SOS...', err));
}

// Botão: Marcar SOS como Resolvido
window.marcarSosComoResolvido = function() {
  // Limpa o estado local de emergência
  const sosDataRaw = localStorage.getItem('neurosync_sos_status');
  if (sosDataRaw) {
    const sosData = JSON.parse(sosDataRaw);
    sosData.ativo = false;
    localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));
  }

  const cardAlerta = document.getElementById('card-alerta-sos');
  if (cardAlerta) cardAlerta.style.display = 'none';

  alert('✅ SOS marcado como resolvido!');

  if (!sosAtivoId) return;

  fetch(`/api/sos/${sosAtivoId}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'resolvido' })
  })
  .then(res => {
    sosAtivoId = null;
  })
  .catch(err => console.error('Erro ao resolver SOS na API:', err));
};

// ---------------------------------------------------------
// US 4: UPLOAD DE FOTOS PARA PERSONALIZAÇÃO
// ---------------------------------------------------------
window.fazerUploadFoto = function(event) {
  // Evita que o formulário recarregue a página antes de salvar a foto
  if (event) event.preventDefault();
  
  const fileInput = document.getElementById('input-foto-tarefa');
  const inputId = document.getElementById('input-tarefa-id');

  if (!fileInput || !fileInput.files[0]) {
    alert('⚠️ Por favor, escolha um arquivo de imagem primeiro!');
    return;
  }

  const tarefaId = inputId ? inputId.value.trim() : '101';
  if (!tarefaId) {
    alert('⚠️ Digite o ID da tarefa (ex: 101)!');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const imagemBase64 = e.target.result;

    // Salva com a chave exata que o paciente procura
    localStorage.setItem(`foto_tarefa_${tarefaId}`, imagemBase64);
    
    console.log(`💾 Foto salva no localStorage com a chave: foto_tarefa_${tarefaId}`);
    alert(`✅ Foto vinculada com sucesso à tarefa ${tarefaId}!`);
  };

  reader.readAsDataURL(file);
};

// ---------------------------------------------------------
// US 5: PERMISSÕES DO TERAPEUTA (TOGGLE SWITCH)
// ---------------------------------------------------------
window.alterarPermissaoTerapeuta = function(autorizado) {
  const pacienteId = localStorage.getItem('paciente_id') || 1;

  fetch(`/api/patients/${pacienteId}/permissions`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compartilhar_terapeuta: autorizado })
  })
  .then(res => {
    console.log(`Permissão do terapeuta atualizada para: ${autorizado}`);
  })
  .catch(err => console.error('Erro ao atualizar permissão:', err));
};

// Inicialização de escuta automática
document.addEventListener('DOMContentLoaded', () => {
  checarStatusSOS();
  setInterval(checarStatusSOS, 5000); // Checa a cada 5 segundos
});