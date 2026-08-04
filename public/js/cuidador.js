// js/cuidador.js - VERSÃO COMPLETA CORRIGIDA
// ============================================================
// CUIDADOR - DASHBOARD
// ============================================================

let map = null;
let marker = null;
let intervaloMonitoramento = null;

// ============================================================
// VALIDAÇÃO DE ACESSO
// ============================================================
function validarAcessoCuidador() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') || '';
    const userId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    console.log('🔍 Verificando acesso cuidador:', { token: !!token, role, userId });

    if (!token) {
        console.warn('❌ Token não encontrado');
        alert('Faça login para acessar o sistema.');
        window.location.href = '/index.html';
        return false;
    }

    if (role.toLowerCase() !== 'cuidador') {
        console.warn('❌ Role inválida:', role);
        alert(`Acesso negado! Você é um(a) ${role}, não um cuidador.`);
        window.location.href = '/index.html';
        return false;
    }

    if (!userId) {
        console.warn('❌ userId não encontrado');
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '/index.html';
        return false;
    }

    const nome = localStorage.getItem('userName') || 'Cuidador';
    const el = document.getElementById('user-name');
    if (el) {
        el.innerHTML = `<i class="fa-regular fa-circle-user"></i> Olá, ${nome}`;
    }

    console.log('✅ Acesso validado para cuidador:', nome);
    return true;
}

// ============================================================
// FUNÇÃO DE LOGOUT
// ============================================================
function fazerLogout() {
    console.log('🔴 Fazendo logout...');
    
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('paciente_id');
    localStorage.removeItem('neurosync_sos_status');
    
    window.location.href = '/index.html';
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Página do cuidador carregada');
    
    if (!validarAcessoCuidador()) return;

    // ✅ BOTÃO LOGOUT
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔴 Botão de sair clicado!');
            fazerLogout();
        });
    } else {
        console.warn('⚠️ Botão de logout não encontrado');
    }

    // Botões
    const btnVincular = document.getElementById('btn-vincular');
    if (btnVincular) {
        btnVincular.addEventListener('click', vincularPaciente);
    }

    const inputEmail = document.getElementById('email-paciente-input');
    if (inputEmail) {
        inputEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') vincularPaciente();
        });
    }

    const btnResolverSos = document.getElementById('btn-resolver-sos');
    if (btnResolverSos) {
        btnResolverSos.addEventListener('click', resolverSOS);
    }

    const togglePermissao = document.getElementById('toggle-permissao');
    if (togglePermissao) {
        togglePermissao.addEventListener('change', (e) => {
            alterarPermissao(e.target.checked);
        });
    }

    // Carregar dados
    carregarPacientes();
    iniciarMonitoramentoSOS();
});

// ============================================================
// 1. CARREGAR PACIENTES DO CUIDADOR - CORRIGIDO
// ============================================================
async function carregarPacientes() {
    const tbody = document.getElementById('lista-pacientes');
    const countEl = document.getElementById('count-pacientes');

    if (!tbody) return;

    try {
        const token = localStorage.getItem('token');
        console.log('📤 Buscando pacientes do cuidador...');
        console.log('📤 Token:', token ? 'Presente' : 'Ausente');
        
        const response = await fetch('/usuarios/meus-pacientes', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Resposta:', response.status);
        
        if (response.ok) {
            const pacientes = await response.json();
            console.log('✅ Pacientes carregados:', pacientes.length);
            console.log('📋 Dados:', pacientes);
            
            if (countEl) countEl.textContent = pacientes.length || 0;

            if (!pacientes || pacientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 20px;">
                            <i class="fa-regular fa-face-frown" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
                            Nenhum paciente vinculado até o momento.
                            <br><small>Use o campo acima para vincular um paciente.</small>
                        </td>
                    </tr>
                `;
                return;
            }

            // Contar medicações
            const medicacoes = pacientes.filter(p => p.proxima_medicacao && p.proxima_medicacao !== '').length;
            const countMedicacoes = document.getElementById('count-medicacoes');
            if (countMedicacoes) countMedicacoes.textContent = medicacoes || 0;

            // Contar alertas (pacientes com SOS ativo)
            let alertas = 0;
            try {
                const sosResponse = await fetch('/localizacao', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (sosResponse.ok) {
                    const sosData = await sosResponse.json();
                    if (sosData && sosData.ativo) alertas = 1;
                }
            } catch (e) {
                console.warn('Erro ao verificar SOS:', e);
            }
            const countAlertas = document.getElementById('count-alertas');
            if (countAlertas) countAlertas.textContent = alertas;

            tbody.innerHTML = pacientes.map(p => {
                const id = p._id || p.id;
                const nome = p.nome || 'Paciente';
                const email = p.email || '';
                const medicacao = p.proxima_medicacao || 'Sem medicação';
                const status = p.status || 'Ativo';

                return `
                    <tr>
                        <td>
                            <strong>${nome}</strong>
                            <br><small style="color: var(--text-secondary);">${email}</small>
                        </td>
                        <td>
                            <span class="status-badge ${status === 'Ativo' ? 'active' : 'inactive'}">
                                ${status}
                            </span>
                        </td>
                        <td>${medicacao}</td>
                        <td>
                            <button class="btn-acao" onclick="abrirModalNovaTarefa('${id}', '${nome}')" title="Nova Tarefa">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                            <button class="btn-acao" onclick="verDetalhes('${id}')" title="Ver Detalhes">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-acao" onclick="verHistoricoSOS('${id}')" title="Histórico SOS">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

        } else if (response.status === 401) {
            console.error('❌ Token expirado ou inválido');
            alert('Sua sessão expirou. Faça login novamente.');
            window.location.href = '/index.html';
        } else if (response.status === 403) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--danger); padding: 20px;">
                        ⚠️ Você não tem permissão para ver pacientes.
                        <br><small>Verifique se você está logado como cuidador.</small>
                    </td>
                </tr>
            `;
        } else {
            const erro = await response.json().catch(() => ({}));
            console.error('❌ Erro:', erro);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--danger); padding: 20px;">
                        ❌ Erro ao carregar pacientes: ${erro.mensagem || erro.error || 'Tente novamente.'}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar pacientes:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--danger); padding: 20px;">
                    ❌ Erro de conexão ao carregar pacientes.
                    <br><small>Verifique se o servidor está rodando.</small>
                </td>
            </tr>
        `;
    }
}

// ============================================================
// 2. VINCULAR PACIENTE
// ============================================================
async function vincularPaciente() {
    const input = document.getElementById('email-paciente-input');
    const email = input?.value?.trim();

    if (!email) {
        alert('⚠️ Digite o e-mail do paciente para vincular.');
        return;
    }

    const idCuidador = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    if (!idCuidador) {
        alert('⚠️ ID do cuidador não encontrado. Faça login novamente.');
        return;
    }

    console.log('📤 Vinculando paciente:', { idCuidador, emailPaciente: email });

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/usuarios/vincular-paciente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                idCuidador: idCuidador,
                emailPaciente: email
            })
        });

        const dados = await response.json();
        console.log('📥 Resposta do vínculo:', dados);

        if (response.ok) {
            alert('✅ ' + (dados.mensagem || 'Paciente vinculado com sucesso!'));
            if (input) input.value = '';
            carregarPacientes(); // Recarrega a lista
        } else {
            alert('❌ ' + (dados.mensagem || dados.erro || 'Erro ao vincular paciente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao vincular:', error);
        alert('❌ Erro de conexão ao vincular paciente.');
    }
}

// ============================================================
// 3. MONITORAMENTO SOS - CORRIGIDO
// ============================================================
function iniciarMonitoramentoSOS() {
    console.log('🔄 Iniciando monitoramento SOS...');
    verificarSOS();
    if (intervaloMonitoramento) clearInterval(intervaloMonitoramento);
    intervaloMonitoramento = setInterval(verificarSOS, 10000);
}

async function verificarSOS() {
    const cardAlerta = document.getElementById('card-alerta-sos');
    if (!cardAlerta) return;
    
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('🔍 Verificando SOS...');
        const response = await fetch('/localizacao', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Resposta SOS:', response.status);
        
        if (response.ok) {
            const dados = await response.json();
            console.log('📋 Dados SOS:', dados);
            
            if (dados && dados.ativo) {
                cardAlerta.style.display = 'block';
                const lat = parseFloat(dados.latitude);
                const lng = parseFloat(dados.longitude);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    inicializarMapa(lat, lng);
                }
                return;
            } else {
                cardAlerta.style.display = 'none';
                if (map) {
                    map.remove();
                    map = null;
                    marker = null;
                }
            }
        } else if (response.status === 404) {
            cardAlerta.style.display = 'none';
            if (map) {
                map.remove();
                map = null;
                marker = null;
            }
            localStorage.removeItem('neurosync_sos_status');
        } else {
            console.warn('⚠️ Resposta inesperada SOS:', response.status);
        }
    } catch (error) {
        if (error.message !== 'Failed to fetch') {
            console.warn('⚠️ Erro ao verificar SOS:', error.message);
        }
    }
}

function inicializarMapa(lat, lng) {
    const container = document.getElementById('mapa-sos');
    if (!container) return;

    if (map) {
        map.remove();
        map = null;
        marker = null;
    }

    try {
        // Verificar se o Leaflet está disponível
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet não carregado!');
            return;
        }

        map = L.map('mapa-sos').setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        const redIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        marker = L.marker([lat, lng], { icon: redIcon })
            .addTo(map)
            .bindPopup('📍 <strong>ALERTA!</strong><br>Paciente em emergência!')
            .openPopup();

        setTimeout(() => { 
            if (map) map.invalidateSize(); 
        }, 300);
        
        console.log('✅ Mapa inicializado em:', lat, lng);
    } catch (error) {
        console.error('❌ Erro ao inicializar mapa:', error);
    }
}

// ============================================================
// 4. RESOLVER SOS
// ============================================================
async function resolverSOS() {
    try {
        const token = localStorage.getItem('token');
        console.log('🔴 Resolvendo SOS...');
        
        const response = await fetch('/localizacao', { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Resposta resolver SOS:', response.status);
        
        if (response.ok) {
            localStorage.removeItem('neurosync_sos_status');
            const cardAlerta = document.getElementById('card-alerta-sos');
            if (cardAlerta) cardAlerta.style.display = 'none';
            
            if (map) {
                map.remove();
                map = null;
                marker = null;
            }
            
            alert('✅ SOS marcado como resolvido com sucesso!');
            carregarPacientes(); // Atualiza contador
        } else {
            const erro = await response.json().catch(() => ({}));
            alert('❌ Erro ao resolver SOS: ' + (erro.mensagem || erro.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao resolver SOS:', error);
        alert('❌ Erro de conexão ao resolver SOS.');
    }
}

// ============================================================
// 5. ALTERAR PERMISSÃO
// ============================================================
async function alterarPermissao(ativado) {
    const idCuidador = localStorage.getItem('userId') || localStorage.getItem('usuarioId');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/cuidadores/permissao', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                cuidadorId: idCuidador,
                compartilhar: ativado
            })
        });

        if (response.ok) {
            const dados = await response.json();
            console.log(ativado ? '✅ Compartilhamento ativado!' : '🔒 Compartilhamento desativado.');
        } else {
            console.error('❌ Erro ao alterar permissão:', await response.text());
        }
    } catch (error) {
        console.error('❌ Erro ao alterar permissão:', error);
    }
}

// ============================================================
// 6. VER DETALHES DO PACIENTE
// ============================================================
window.verDetalhes = async function(idPaciente) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/usuarios/paciente/${idPaciente}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const paciente = await response.json();
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.id = 'modal-detalhes';
            modal.innerHTML = `
                <div class="modal-card">
                    <button class="modal-close" onclick="fecharModal('modal-detalhes')">&times;</button>
                    <div class="modal-header">
                        <h2><i class="fa-solid fa-user"></i> Detalhes do Paciente</h2>
                    </div>
                    <div style="margin: 16px 0;">
                        <p><strong>👤 Nome:</strong> ${paciente.nome || 'Não informado'}</p>
                        <p><strong>📧 E-mail:</strong> ${paciente.email || 'Não informado'}</p>
                        <p><strong>📋 Tipo:</strong> ${paciente.tipo_usuario || 'Não informado'}</p>
                        <p><strong>💊 Próxima Medicação:</strong> ${paciente.proxima_medicacao || 'Não informado'}</p>
                        <p><strong>📊 Status:</strong> ${paciente.status || 'Não informado'}</p>
                        <p><strong>👨‍⚕️ Cuidador:</strong> ${paciente.cuidador?.nome || 'Não vinculado'}</p>
                    </div>
                    <button class="btn-primary btn-full" onclick="fecharModal('modal-detalhes')">Fechar</button>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            alert('❌ Erro ao buscar detalhes do paciente.');
        }
    } catch (error) {
        console.error('❌ Erro ao buscar detalhes:', error);
        alert('❌ Erro de conexão ao carregar detalhes.');
    }
};

// ============================================================
// 7. VER HISTÓRICO SOS
// ============================================================
window.verHistoricoSOS = async function(idPaciente) {
    console.log('🔍 Buscando histórico SOS para paciente:', idPaciente);
    
    if (!idPaciente) {
        alert('❌ ID do paciente não encontrado.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        console.log('📤 Token:', token ? 'Presente' : 'Ausente');
        
        const response = await fetch(`/sos/historico/${idPaciente}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📥 Resposta do histórico:', response.status);
        
        if (response.ok) {
            const historico = await response.json();
            console.log('✅ Histórico carregado:', historico.length, 'registros');
            
            const modalExistente = document.getElementById('modal-historico');
            if (modalExistente) modalExistente.remove();
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.id = 'modal-historico';
            modal.innerHTML = `
                <div class="modal-card" style="max-width: 700px;">
                    <button class="modal-close" onclick="fecharModal('modal-historico')">&times;</button>
                    <div class="modal-header">
                        <h2><i class="fa-solid fa-clock-rotate-left"></i> Histórico SOS</h2>
                        <p>Registros de alertas do paciente</p>
                    </div>
                    <div style="max-height: 350px; overflow-y: auto; margin: 16px 0;">
                        ${historico.length === 0 ? `
                            <div style="text-align: center; color: var(--text-secondary); padding: 30px;">
                                <i class="fa-regular fa-face-smile" style="font-size: 48px; display: block; margin-bottom: 12px;"></i>
                                Nenhum registro SOS encontrado para este paciente.
                            </div>
                        ` : `
                            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: var(--background);">
                                        <th style="padding: 10px; text-align: left;">Data</th>
                                        <th style="padding: 10px; text-align: left;">Hora</th>
                                        <th style="padding: 10px; text-align: left;">Localização</th>
                                        <th style="padding: 10px; text-align: left;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${historico.map(item => `
                                        <tr style="border-bottom: 1px solid var(--border);">
                                            <td style="padding: 10px;">${item.data || '-'}</td>
                                            <td style="padding: 10px;">${item.hora || '-'}</td>
                                            <td style="padding: 10px; font-size: 12px;">
                                                ${item.latitude ? `${item.latitude}, ${item.longitude}` : '-'}
                                            </td>
                                            <td style="padding: 10px;">
                                                <span class="status-badge ${item.pushEnviado ? 'active' : 'pending'}">
                                                    ${item.pushEnviado ? '✅ Enviado' : '⏳ Pendente'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                    <button class="btn-primary btn-full" onclick="fecharModal('modal-historico')">
                        <i class="fa-solid fa-xmark"></i> Fechar
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
            
        } else if (response.status === 403) {
            alert('❌ Você não tem permissão para ver o histórico SOS deste paciente.');
        } else if (response.status === 404) {
            alert('❌ Nenhum registro SOS encontrado para este paciente.');
        } else {
            const erro = await response.json().catch(() => ({}));
            alert('❌ Erro ao carregar histórico: ' + (erro.mensagem || erro.message || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao buscar histórico SOS:', error);
        alert('❌ Erro de conexão ao carregar histórico SOS.');
    }
};

// ============================================================
// 8. CRIAR NOVA TAREFA
// ============================================================
window.abrirModalNovaTarefa = function(pacienteId, nomePaciente) {
    const existente = document.getElementById('modal-tarefa');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-tarefa';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 550px;">
            <button class="modal-close" onclick="fecharModal('modal-tarefa')">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-plus-circle"></i> Nova Tarefa</h2>
                <p>Paciente: <strong>${nomePaciente || 'Selecionado'}</strong></p>
            </div>
            <form id="form-nova-tarefa" onsubmit="salvarNovaTarefa(event, '${pacienteId}')">
                <div class="form-group">
                    <label>Título da Tarefa *</label>
                    <input type="text" id="tarefa-titulo" required placeholder="Ex: Tomar medicamento">
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="tarefa-descricao" rows="2" placeholder="Detalhes da tarefa..."></textarea>
                </div>
                <div class="form-group">
                    <label>Próxima Medicação</label>
                    <input type="text" id="tarefa-medicacao" placeholder="Ex: Paracetamol 500mg - 14:00">
                </div>
                <div class="form-group">
                    <label>Imagem (opcional)</label>
                    <input type="file" id="tarefa-imagem" accept="image/*">
                </div>
                <div class="form-group">
                    <label>Micro-passos (um por linha)</label>
                    <textarea id="tarefa-passos" rows="3" placeholder="1. Lavar as mãos&#10;2. Pegar o remédio&#10;3. Tomar com água"></textarea>
                </div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fa-solid fa-cloud-arrow-up"></i> Criar Tarefa
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
};

window.salvarNovaTarefa = async function(event, pacienteId) {
    event.preventDefault();

    const titulo = document.getElementById('tarefa-titulo').value.trim();
    const descricao = document.getElementById('tarefa-descricao').value.trim();
    const medicacao = document.getElementById('tarefa-medicacao').value.trim();
    const fileInput = document.getElementById('tarefa-imagem');
    const passosText = document.getElementById('tarefa-passos').value.trim();

    if (!titulo) {
        alert('⚠️ Digite o título da tarefa.');
        return;
    }

    const formData = new FormData();
    formData.append('tituloTarefa', titulo);
    formData.append('descriçaoTarefa', descricao || titulo);
    formData.append('idPaciente', pacienteId);
    if (fileInput.files.length > 0) {
        formData.append('imagem', fileInput.files[0]);
    }

    try {
        const token = localStorage.getItem('token');
        
        // 1. Criar a tarefa
        const response = await fetch('/tarefas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const dados = await response.json();

        if (response.ok) {
            const tarefaId = dados.dados?.idTarefa || dados.dados?.id;
            
            // 2. Se houver passos, criar micro-passos
            if (passosText && tarefaId) {
                const passos = passosText.split('\n')
                    .filter(p => p.trim())
                    .map((p, i) => ({
                        descricaoPasso: p.replace(/^\d+\.\s*/, '').trim(),
                        ordemPasso: i + 1,
                        idTarefa: tarefaId
                    }));

                for (const passo of passos) {
                    await fetch('/micro-passos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(passo)
                    });
                }
            }

            // 3. Atualizar medicação se informada
            if (medicacao) {
                await fetch(`/usuarios/${pacienteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ proxima_medicacao: medicacao })
                });
            }

            alert('✅ Tarefa criada com sucesso!');
            fecharModal('modal-tarefa');
            carregarPacientes();
        } else {
            alert('❌ Erro: ' + (dados.mensagem || dados.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        alert('❌ Erro de conexão ao criar tarefa.');
    }
};

// ============================================================
// 9. FECHAR MODAL
// ============================================================
window.fecharModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
};

// ============================================================
// 10. RECARREGAR PERIODICAMENTE
// ============================================================
setInterval(carregarPacientes, 30000);