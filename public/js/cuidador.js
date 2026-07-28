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
async function verDetalhes(id) {
    alternarModoEdicao(false); // Sempre começa em modo leitura
    const modal = document.getElementById('modalDetalhesPaciente');
    document.getElementById('modalIdPaciente').value = id;
    
    modal.style.display = 'flex';

    try {
        const response = await fetch(`/usuarios/${id}`);
        const paciente = response.ok ? await response.json() : {};

        preencherCamposModal(paciente);
    } catch (error) {
        console.warn('Erro ao carregar paciente:', error);
    }
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
    event.preventDefault();

// 1. Pega o ID diretamente do input hidden 'modalIdPaciente'
const id = document.getElementById('modalIdPaciente')?.value;

if (!id) {
    alert('Erro: ID do paciente não foi encontrado no modal.');
    return;
}

// 2. Coleta os dados convertendo idade para número
const payload = {
    nome: document.getElementById('editNome').value,
    idade: Number(document.getElementById('editIdade').value) || 0,
    diagnosticoBase: document.getElementById('editDiagnostico').value,
    cpf: document.getElementById('editCpf').value,
    status: document.getElementById('editStatus').value
};

    try {
        const response = await fetch(`/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (response.ok) {
            alert('Dados atualizados com sucesso!');

            // Pega o objeto retornado da API (pode ser resData, resData.usuario ou resData.paciente)
            const dadosSalvos = resData.usuario || resData.paciente || resData || payload;

            preencherCamposModal(dadosSalvos);
            alternarModoEdicao(false);

            if (typeof carregarPacientes === 'function') {
                carregarPacientes();
            }
        } else {
            alert(resData.mensagem || resData.error || 'Erro ao salvar no banco de dados.');
        }
    } catch (err) {
        console.error('Erro:', err);
        alert('Falha na comunicação com o servidor.');
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