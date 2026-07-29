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
        tabelaBody.innerHTML = pacientes.map(p => `
            <tr>
                <td><strong>${p.nome}</strong><br><small style="color:#64748b">${p.email || ''}</small></td>
                <td><span class="status-badge active">Ativo</span></td>
                <td>Sem medicação agendada</td>
                <td>
                    <button class="btn-icon" onclick="verDetalhes('${p._id || p.id}')" title="Ver Detalhes">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="registrarRotina('${p._id || p.id}')" title="Registrar Rotina">
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

// Função chamada ao clicar no ícone do olho 👁️
// Abre e carrega os dados
// 1. Função acionada ao clicar no botão de olho
function abrirModalDetalhes(paciente) {
    // Salva o ID no input hidden
    document.getElementById('modalIdPaciente').value = paciente._id || paciente.id || '';

    // Preenche os textos de visualização (campo-view)
    document.getElementById('modalNomePacienteDisplay').innerText = paciente.nome || 'Paciente';
    document.getElementById('viewNome').innerText = paciente.nome || 'Não informado';
    document.getElementById('viewIdade').innerText = paciente.idade ? paciente.idade : 'Não informada';
    document.getElementById('viewDiagnostico').innerText = paciente.diagnostico || paciente.diagnosticoBase || 'Não informado';
    document.getElementById('viewCpf').innerText = paciente.cpf || 'Não informado';
    document.getElementById('viewStatus').innerText = paciente.status || 'Ativo';

    // Preenche os campos editáveis (campo-edit)
    document.getElementById('editNome').value = paciente.nome || '';
    document.getElementById('editIdade').value = paciente.idade || '';
    document.getElementById('editDiagnostico').value = paciente.diagnostico || paciente.diagnosticoBase || '';
    document.getElementById('editCpf').value = paciente.cpf || '';
    document.getElementById('editStatus').value = paciente.status || 'Ativo';

    // Garante modo de visualização (esconde inputs e botão salvar)
    document.querySelectorAll('.campo-view').forEach(el => el.style.display = 'inline-block');
    document.querySelectorAll('.campo-edit').forEach(el => el.style.display = 'none');
    
    const btnSalvar = document.getElementById('btnSalvarModal');
    if (btnSalvar) btnSalvar.style.display = 'none';

    // Exibe o modal na tela
    const modal = document.getElementById('modalDetalhesPaciente');
    if (modal) modal.style.display = 'flex';
}

// 2. Função acionada ao clicar em "Editar" dentro do modal
function habilitarEdicaoModal() {
    // Esconde visualização e mostra inputs de edição
    document.querySelectorAll('.campo-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.campo-edit').forEach(el => el.style.display = 'block');
    
    // Mostra o botão Salvar
    const btnSalvar = document.getElementById('btnSalvarModal');
    if (btnSalvar) btnSalvar.style.display = 'inline-block';
}

// 3. Função para fechar o modal
function fecharModalDetalhes() {
    const modal = document.getElementById('modalDetalhesPaciente');
    if (modal) modal.style.display = 'none';
}
// Preenche os campos do modal (texto e inputs)
function preencherCamposModal(p) {
    document.getElementById('modalNomePacienteDisplay').innerText = p.nome || 'Detalhes do Paciente';
    
    // Textos de Visualização
    document.getElementById('viewNome').innerText = p.nome || 'Não informado';
    document.getElementById('viewIdade').innerText = p.idade ? `${p.idade} anos` : 'Não informada';
    document.getElementById('viewDiagnostico').innerText = p.diagnosticoBase || p.diagnostico || 'Não informado';
    document.getElementById('viewCpf').innerText = p.cpf || 'Não informado';
    document.getElementById('viewStatus').innerText = p.status || 'Ativo';

    // Inputs de Edição
    document.getElementById('editNome').value = p.nome || '';
    document.getElementById('editIdade').value = p.idade || '';
    document.getElementById('editDiagnostico').value = p.diagnosticoBase || p.diagnostico || '';
    document.getElementById('editCpf').value = p.cpf || '';
    document.getElementById('editStatus').value = p.status || 'Ativo';
}

// Alterna entre modo Leitura e Edição
function alternarModoEdicao(editando) {
    const views = document.querySelectorAll('.campo-view');
    const edits = document.querySelectorAll('.campo-edit');
    const btnSalvar = document.getElementById('btnSalvarModal');
    const btnModoEdicao = document.getElementById('btnModoEdicao');

    views.forEach(el => el.style.display = editando ? 'none' : 'inline-block');
    edits.forEach(el => el.style.display = editando ? 'block' : 'none');
    
    btnSalvar.style.display = editando ? 'inline-block' : 'none';
    btnModoEdicao.style.display = editando ? 'none' : 'inline-block';
}

// Envia os dados editados para o Banco de Dados
async function salvarDadosPaciente(event) {
    // 1. Cancela o comportamento nativo de submit do formulário imediatamente
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // 2. Pega o ID do input hidden do modal
    const idPaciente = document.getElementById('modalIdPaciente')?.value;

    if (!idPaciente) {
        alert('Erro: ID do paciente não encontrado!');
        return;
    }

    // 3. Captura os valores dos campos
    const nome = document.getElementById('editNome')?.value || document.getElementById('modalNomePacienteDisplay')?.innerText;
    const idade = Number(document.getElementById('editIdade')?.value) || 0;
    const cpf = document.getElementById('editCpf')?.value || '';
    const status = document.getElementById('editStatus')?.value || 'Ativo';
    const diagnostico = document.getElementById('editDiagnostico')?.value || '';

    const payload = {
        nome: nome,
        idade: idade,
        cpf: cpf,
        status: status,
        diagnostico: diagnostico,
        diagnosticoBase: diagnostico
    };

    try {
        // Desabilita o botão para evitar cliques duplicados
        const btnSalvar = document.getElementById('btnSalvarModal');
        if (btnSalvar) btnSalvar.disabled = true;

        const response = await fetch(`/usuarios/${idPaciente}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Dados atualizados com sucesso!');
            // Recarrega a página para exibir os novos dados
            window.location.reload();
        } else {
            const err = await response.json();
            alert('Erro ao atualizar: ' + (err.error || 'Erro no servidor'));
            if (btnSalvar) btnSalvar.disabled = false;
        }
    } catch (error) {
        console.error('Erro no fetch:', error);
        alert('Erro de conexão com o servidor.');
        const btnSalvar = document.getElementById('btnSalvarModal');
        if (btnSalvar) btnSalvar.disabled = false;
    }
}

function fecharModalDetalhes() {
    document.getElementById('modalDetalhesPaciente').style.display = 'none';
}

function registrarRotina(idPaciente) {
    alert(`Abrindo formulário de rotina para o paciente ID: ${idPaciente}`);
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

      // Se sosData tiver o array do MongoDB, pega na ordem correta [1]=lat, [0]=lng
const coords = sosData.localizacao?.coordinates || sosData.coordinates;

const lat = coords ? coords[1] : (sosData.lat || -23.55052);
const lng = coords ? coords[0] : (sosData.lng || -46.633308);

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
  fetch('/sos/active')
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