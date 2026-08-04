// js/paciente.js - VERSÃO COMPLETA CORRIGIDA

// ============================================================
// PACIENTE - DASHBOARD
// ============================================================

function validarAcessoPaciente() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') || '';
    const userId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    console.log('🔍 Verificando acesso paciente:', { token: !!token, role, userId });

    if (!token) {
        console.warn('❌ Token não encontrado');
        alert('Faça login para acessar o sistema.');
        window.location.href = '/index.html';
        return false;
    }

    if (role.toLowerCase() !== 'paciente') {
        console.warn('❌ Role inválida:', role);
        alert(`Acesso negado! Você é um(a) ${role}, não um paciente.`);
        window.location.href = '/index.html';
        return false;
    }

    if (!userId) {
        console.warn('❌ userId não encontrado');
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '/index.html';
        return false;
    }

    const nome = localStorage.getItem('userName') || 'Paciente';
    const el = document.getElementById('user-name');
    if (el) {
        el.innerHTML = `<i class="fa-regular fa-circle-user"></i> Olá, ${nome}`;
    }

    console.log('✅ Acesso validado para paciente:', nome);
    return true;
}

// ============================================================
// FUNÇÃO DE LOGOUT DIRETA (SEM DEPENDER DO auth.js)
// ============================================================
function fazerLogout() {
    console.log('🔴 Fazendo logout...');
    
    // Limpa todos os dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('paciente_id');
    localStorage.removeItem('neurosync_sos_status');
    
    // Redireciona para o login
    window.location.href = '/index.html';
}

// ✅ INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Página do paciente carregada');
    
    if (!validarAcessoPaciente()) return;

    // ✅ BOTÃO LOGOUT - USANDO A FUNÇÃO LOCAL
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔴 Botão de sair clicado!');
            fazerLogout();
        });
    } else {
        console.warn('⚠️ Botão de logout não encontrado na página');
    }

    // Carregar dados
    carregarCuidador();
    carregarRotinas();
    configurarBotaoSOS();
});

// ============================================================
// 1. CARREGAR CUIDADOR RESPONSÁVEL
// ============================================================
async function carregarCuidador() {
    const container = document.getElementById('info-cuidador');
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        container.innerHTML = `<p style="color: var(--text-secondary);">ID do paciente não encontrado.</p>`;
        return;
    }

    try {
        const response = await fetch(`/api/pacientes/perfil/${pacienteId}`);
        
        if (response.ok) {
            const dados = await response.json();
            
            if (dados.cuidador) {
                container.innerHTML = `
                    <p><strong>👤 Nome:</strong> ${dados.cuidador.nome || 'Não informado'}</p>
                    <p><strong>📧 E-mail:</strong> ${dados.cuidador.email || 'Não informado'}</p>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
                        <i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Cuidador vinculado
                    </p>
                `;
            } else {
                container.innerHTML = `
                    <p style="color: var(--warning);">
                        <i class="fa-solid fa-triangle-exclamation"></i> 
                        Você ainda não está vinculado a nenhum cuidador.
                    </p>
                `;
            }
        } else if (response.status === 404) {
            container.innerHTML = `
                <p style="color: var(--warning);">
                    <i class="fa-solid fa-triangle-exclamation"></i> 
                    Você ainda não está vinculado a nenhum cuidador.
                </p>
            `;
        } else {
            container.innerHTML = `<p style="color: var(--text-secondary);">Erro ao carregar cuidador.</p>`;
        }
    } catch (error) {
        console.error('Erro ao buscar cuidador:', error);
        container.innerHTML = `<p style="color: var(--danger);">Erro de conexão ao buscar cuidador.</p>`;
    }
}

// ============================================================
// 2. CARREGAR ROTINAS DO PACIENTE
// ============================================================
async function carregarRotinas() {
    const container = document.getElementById('tasks-container');
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">ID do paciente não encontrado.</p>`;
        return;
    }

    try {
        const response = await fetch(`/api/pacientes/${pacienteId}/rotinas`);
        
        if (response.ok) {
            const tarefas = await response.json();
            
            if (!tarefas || tarefas.length === 0) {
                container.innerHTML = `
                    <p style="text-align: center; color: var(--text-secondary); padding: 20px;">
                        <i class="fa-regular fa-face-smile" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
                        Nenhuma tarefa cadastrada para você ainda.
                    </p>
                `;
                return;
            }

            container.innerHTML = tarefas.map((tarefa, index) => {
                const titulo = tarefa.tituloTarefa || tarefa.descriçaoTarefa || 'Tarefa';
                const imagem = tarefa.imagem_Url || '';
                const id = tarefa.idTarefa || tarefa.id || `tarefa-${index}`;

                return `
                    <div class="task-item" data-tarefa-id="${id}" style="
                        background: var(--background);
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 12px;
                        border: 1px solid var(--border);
                        transition: var(--transition);
                    ">
                        <div style="display: flex; gap: 16px; align-items: flex-start;">
                            ${imagem ? `
                                <img src="${imagem}" alt="${titulo}" style="
                                    width: 80px;
                                    height: 80px;
                                    object-fit: cover;
                                    border-radius: 8px;
                                    flex-shrink: 0;
                                ">
                            ` : `
                                <div style="
                                    width: 80px;
                                    height: 80px;
                                    background: var(--primary-light);
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    flex-shrink: 0;
                                    color: white;
                                    font-size: 28px;
                                ">
                                    <i class="fa-solid fa-clipboard-list"></i>
                                </div>
                            `}
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 4px 0; font-size: 16px;">${titulo}</h4>
                                <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                                    ${tarefa.descriçaoTarefa || ''}
                                </p>
                                <div style="display: flex; gap: 10px; margin-top: 12px;">
                                    <button class="btn-concluir" data-id="${id}" style="
                                        padding: 6px 16px;
                                        border: none;
                                        border-radius: 6px;
                                        background: var(--success);
                                        color: white;
                                        cursor: pointer;
                                        font-size: 13px;
                                        transition: var(--transition);
                                    ">
                                        <i class="fa-solid fa-check"></i> Concluir
                                    </button>
                                    <button class="btn-travado" data-id="${id}" style="
                                        padding: 6px 16px;
                                        border: none;
                                        border-radius: 6px;
                                        background: var(--danger);
                                        color: white;
                                        cursor: pointer;
                                        font-size: 13px;
                                        transition: var(--transition);
                                    ">
                                        <i class="fa-solid fa-hand"></i> Tô Travado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.btn-concluir').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    marcarConcluido(id, btn);
                });
            });

            document.querySelectorAll('.btn-travado').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    registrarTravamento(id);
                });
            });

        } else {
            container.innerHTML = `<p style="text-align: center; color: var(--danger);">Erro ao carregar rotinas.</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar rotinas:', error);
        container.innerHTML = `<p style="text-align: center; color: var(--danger);">Erro de conexão ao carregar rotinas.</p>`;
    }
}

// ============================================================
// 3. MARCAR TAREFA COMO CONCLUÍDA
// ============================================================
function marcarConcluido(id, btn) {
    btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Concluído!';
    btn.style.background = '#065F46';
    btn.style.cursor = 'default';
    btn.disabled = true;
    mostrarToast('✅ Tarefa concluída com sucesso!', 'success');
}

// ============================================================
// 4. REGISTRAR TRAVAMENTO
// ============================================================
async function registrarTravamento(tarefaId) {
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        alert('ID do paciente não encontrado.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/botao-travado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pacienteId: pacienteId,
                tarefaId: tarefaId
            })
        });

        if (response.ok) {
            mostrarToast('🔄 Travamento registrado! Vamos te ajudar.', 'warning');
            abrirModalTravado(tarefaId);
        } else {
            const erro = await response.json();
            alert('❌ Erro ao registrar travamento: ' + (erro.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Erro ao registrar travamento:', error);
        alert('Erro de conexão ao registrar travamento.');
    }
}

// ============================================================
// 5. MODAL TÔ TRAVADO
// ============================================================
function abrirModalTravado(tarefaId) {
    const modalExistente = document.getElementById('modal-travado');
    if (modalExistente) modalExistente.remove();

    const passos = [
        '1. Respire fundo e conte até 10.',
        '2. Peça ajuda para alguém próximo.',
        '3. Tente novamente com calma.',
        '4. Se ainda estiver difícil, chame seu cuidador.'
    ];

    let passoAtual = 0;

    const modal = document.createElement('div');
    modal.id = 'modal-travado';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card">
            <button class="modal-close" onclick="fecharModalTravado()">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-hand-holding-heart"></i> Vamos te ajudar!</h2>
                <p>Siga os passos com calma</p>
            </div>
            <div id="passos-container" style="margin: 20px 0;">
                <div style="
                    background: var(--primary-light);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                ">
                    <span id="passo-numero" style="font-weight: 600;">Passo 1 de ${passos.length}</span>
                </div>
                <div id="passo-conteudo" style="
                    font-size: 18px;
                    text-align: center;
                    padding: 20px;
                    background: var(--background);
                    border-radius: 8px;
                    min-height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    ${passos[0]}
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="fecharModalTravado()" style="
                    padding: 10px 20px;
                    border: 1px solid var(--border);
                    background: transparent;
                    border-radius: 6px;
                    cursor: pointer;
                ">Fechar</button>
                <button id="btn-proximo-passo" style="
                    padding: 10px 24px;
                    border: none;
                    border-radius: 6px;
                    background: var(--primary);
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    Próximo passo <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-proximo-passo')?.addEventListener('click', () => {
        passoAtual++;
        if (passoAtual < passos.length) {
            document.getElementById('passo-numero').textContent = `Passo ${passoAtual + 1} de ${passos.length}`;
            document.getElementById('passo-conteudo').textContent = passos[passoAtual];
        } else {
            document.getElementById('passo-conteudo').innerHTML = `
                <div style="text-align: center;">
                    <i class="fa-solid fa-circle-check" style="font-size: 48px; color: var(--success);"></i>
                    <p style="margin-top: 12px; font-size: 18px; font-weight: 600; color: var(--success);">
                        🎉 Parabéns! Você concluiu todas as etapas!
                    </p>
                </div>
            `;
            document.getElementById('btn-proximo-passo').style.display = 'none';
            document.getElementById('passo-numero').textContent = '✅ Concluído!';
            salvarProgressoTravado(tarefaId);
        }
    });
}

window.fecharModalTravado = function() {
    const modal = document.getElementById('modal-travado');
    if (modal) modal.remove();
};

async function salvarProgressoTravado(tarefaId) {
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');
    try {
        const token = localStorage.getItem('token');
        await fetch('/botao-travado/progresso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pacienteId,
                tarefaId,
                concluido: true,
                dataHora: new Date().toISOString()
            })
        });
        console.log('✅ Progresso do travado salvo!');
    } catch (error) {
        console.error('Erro ao salvar progresso:', error);
    }
}

// ============================================================
// 6. BOTÃO SOS
// ============================================================
function configurarBotaoSOS() {
    const btn = document.getElementById('btn-sos');
    if (!btn) return;
    btn.addEventListener('click', dispararSOS);
}

async function dispararSOS() {
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        alert('⚠️ ID do paciente não encontrado. Faça login novamente.');
        return;
    }

    mostrarToast('📍 Buscando sua localização...', 'info');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await enviarSOS(pacienteId, position.coords.latitude, position.coords.longitude);
            },
            async (error) => {
                console.warn('Erro no GPS, usando fallback:', error.message);
                await enviarSOS(pacienteId, -15.7801, -47.9292);
            }
        );
    } else {
        alert('Geolocalização não suportada no navegador.');
    }
}

async function enviarSOS(pacienteId, latitude, longitude) {
    try {
        const sosData = {
            ativo: true,
            lat: latitude,
            lng: longitude,
            pacienteId: pacienteId,
            dataHora: new Date().toLocaleString('pt-BR')
        };
        localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));

        const token = localStorage.getItem('token');
        const response = await fetch('/localizacao', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                usuarioId: pacienteId,
                latitude: latitude,
                longitude: longitude
            })
        });

        if (response.ok) {
            mostrarToast('🚨 SOS enviado com sucesso! Cuidador notificado.', 'danger');
        } else {
            const erro = await response.json();
            mostrarToast('⚠️ Erro ao enviar SOS: ' + (erro.error || 'Tente novamente.'), 'error');
        }
    } catch (error) {
        console.error('Erro ao enviar SOS:', error);
        mostrarToast('❌ Erro de conexão ao enviar SOS.', 'error');
    }
}

// ============================================================
// 7. TOAST (Notificações)
// ============================================================
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('sos-toast');
    if (!toast) return;

    const cores = {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        error: '#EF4444',
        info: '#4F46E5'
    };

    toast.textContent = mensagem;
    toast.style.background = cores[tipo] || cores.info;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

// ============================================================
// 8. RECARREGAR ROTINAS PERIODICAMENTE
// ============================================================
setInterval(() => {
    carregarRotinas();
}, 30000);