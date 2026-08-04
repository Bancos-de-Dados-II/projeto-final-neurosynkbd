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
// FUNÇÃO DE LOGOUT DIRETA
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
    }

    // Botões
    document.getElementById('btn-vincular')?.addEventListener('click', vincularPaciente);
    document.getElementById('email-paciente-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') vincularPaciente();
    });

    document.getElementById('btn-resolver-sos')?.addEventListener('click', resolverSOS);

    document.getElementById('toggle-permissao')?.addEventListener('change', (e) => {
        alterarPermissao(e.target.checked);
    });

    // Carregar dados
    carregarPacientes();
    iniciarMonitoramentoSOS();
});
// js/cuidador.js - PARTE CORRIGIDA DO carregarPacientes

// ============================================================
// 1. CARREGAR PACIENTES DO CUIDADOR
// ============================================================
async function carregarPacientes() {
    const tbody = document.getElementById('lista-pacientes');
    const countEl = document.getElementById('count-pacientes');

    if (!tbody) return;

    try {
        const token = localStorage.getItem('token');
        console.log('📤 Buscando pacientes do cuidador...');
        
        const response = await fetch('/usuarios/meus-pacientes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📥 Resposta:', response.status);
        
        if (response.ok) {
            const pacientes = await response.json();
            console.log('✅ Pacientes carregados:', pacientes.length);
            
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

            const medicacoes = pacientes.filter(p => p.proxima_medicacao).length;
            document.getElementById('count-medicacoes').textContent = medicacoes || 0;

            tbody.innerHTML = pacientes.map(p => {
                const id = p._id || p.id;
                const nome = p.nome || 'Paciente';
                const email = p.email || '';
                const medicacao = p.proxima_medicacao || 'Sem medicação';

                return `
                    <tr>
                        <td>
                            <strong>${nome}</strong>
                            <br><small style="color: var(--text-secondary);">${email}</small>
                        </td>
                        <td>
                            <span class="status-badge active">Ativo</span>
                        </td>
                        <td>${medicacao}</td>
                        <td>
                            <button class="btn-icon" onclick="verDetalhes('${id}')" title="Ver Detalhes">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="abrirModalRotina('${id}', '${nome}')" title="Registrar Rotina">
                                <i class="fa-solid fa-notes-medical"></i>
                            </button>
                            <button class="btn-icon" onclick="verHistoricoSOS('${id}')" title="Histórico SOS">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

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
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--danger); padding: 20px;">
                        ❌ Erro ao carregar pacientes: ${erro.mensagem || 'Tente novamente.'}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--danger); padding: 20px;">
                    ❌ Erro de conexão ao carregar pacientes.
                </td>
            </tr>
        `;
    }
}
// ============================================================
// 2. VINCULAR PACIENTE - CORRIGIDO
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
        console.error('Erro ao vincular:', error);
        alert('❌ Erro de conexão ao vincular paciente.');
    }
}

// ============================================================
// 3. VER DETALHES DO PACIENTE
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
                        <p><strong>📋 Diagnóstico:</strong> ${paciente.diagnostico || 'Não informado'}</p>
                        <p><strong>💊 Próxima Medicação:</strong> ${paciente.proxima_medicacao || 'Não informado'}</p>
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
        console.error('Erro ao buscar detalhes:', error);
        alert('Erro ao carregar detalhes do paciente.');
    }
};

// ============================================================
// 4. SALVAR ROTINA (UPLOAD)
// ============================================================
window.abrirModalRotina = function(idPaciente, nomePaciente) {
    const existente = document.getElementById('modal-rotina');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-rotina';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card">
            <button class="modal-close" onclick="fecharModal('modal-rotina')">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-calendar-plus"></i> Registrar Rotina</h2>
                <p>Paciente: <strong>${nomePaciente}</strong></p>
            </div>
            <form id="form-rotina" onsubmit="salvarRotina(event, '${idPaciente}')">
                <div class="form-group">
                    <label>Título da Tarefa</label>
                    <input type="text" id="rotina-titulo" placeholder="Ex: Tomar remédio" required>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="rotina-descricao" rows="2" placeholder="Detalhes da tarefa..."></textarea>
                </div>
                <div class="form-group">
                    <label>Próxima Medicação</label>
                    <input type="text" id="rotina-medicacao" placeholder="Ex: Paracetamol 500mg - 14:00">
                </div>
                <div class="form-group">
                    <label>Foto (opcional)</label>
                    <input type="file" id="rotina-foto" accept="image/*">
                </div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fa-solid fa-cloud-arrow-up"></i> Salvar Rotina
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
};

window.salvarRotina = async function(event, idPaciente) {
    event.preventDefault();

    const titulo = document.getElementById('rotina-titulo').value.trim();
    const descricao = document.getElementById('rotina-descricao').value.trim();
    const medicacao = document.getElementById('rotina-medicacao').value.trim();
    const fileInput = document.getElementById('rotina-foto');

    if (!titulo) {
        alert('⚠️ Digite o título da tarefa.');
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao || titulo);
    formData.append('proxima_medicacao', medicacao);
    if (fileInput.files.length > 0) {
        formData.append('foto', fileInput.files[0]);
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pacientes/${idPaciente}/rotina`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const dados = await response.json();

        if (response.ok) {
            alert('✅ Rotina registrada com sucesso!');
            fecharModal('modal-rotina');
            carregarPacientes();
        } else {
            alert('❌ Erro: ' + (dados.mensagem || dados.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Erro ao salvar rotina:', error);
        alert('❌ Erro de conexão ao salvar rotina.');
    }
};

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
            
            // Remove modal existente
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
// 6. MONITORAMENTO SOS (COM MAPA) - CORRIGIDO
// ============================================================
function iniciarMonitoramentoSOS() {
    console.log('🔄 Iniciando monitoramento SOS...');
    verificarSOS();
    if (intervaloMonitoramento) clearInterval(intervaloMonitoramento);
    intervaloMonitoramento = setInterval(verificarSOS, 10000); // ✅ 10 segundos
}

async function verificarSOS() {
    const cardAlerta = document.getElementById('card-alerta-sos');
    if (!cardAlerta) return;
    const hasPacientes = document.getElementById('lista-pacientes')?.children.length > 0;
    
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/localizacao', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const dados = await response.json();
            
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
        map = L.map('mapa-sos').setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        marker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map)
            .bindPopup('📍 <strong>ALERTA!</strong><br>Paciente em emergência!')
            .openPopup();

        setTimeout(() => { 
            if (map) map.invalidateSize(); 
        }, 300);
    } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
    }
}

// ============================================================
// 7. RESOLVER SOS
// ============================================================
async function resolverSOS() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/localizacao', { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
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
        } else {
            alert('❌ Erro ao resolver SOS.');
        }
    } catch (error) {
        console.error('Erro ao resolver SOS:', error);
        alert('❌ Erro de conexão ao resolver SOS.');
    }
}

// ============================================================
// 8. ALTERAR PERMISSÃO
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
            console.log(ativado ? '✅ Compartilhamento ativado!' : '🔒 Compartilhamento desativado.');
        }
    } catch (error) {
        console.error('Erro ao alterar permissão:', error);
    }
}

// ============================================================
// 9. FECHAR MODAL
// ============================================================
window.fecharModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
};