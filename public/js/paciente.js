// js/paciente.js - VERSÃO COMPLETA COM TAREFAS + MICRO-PASSOS
// ============================================================

// ============================================================
// 1. VALIDAÇÃO DE ACESSO
// ============================================================
function validarAcessoPaciente() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') || '';
    const userId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    if (!token) {
        alert('Faça login para acessar o sistema.');
        window.location.href = '/index.html';
        return false;
    }

    if (role.toLowerCase() !== 'paciente') {
        alert(`Acesso negado! Você é um(a) ${role}, não um paciente.`);
        window.location.href = '/index.html';
        return false;
    }

    if (!userId) {
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '/index.html';
        return false;
    }

    const nome = localStorage.getItem('userName') || 'Paciente';
    const el = document.getElementById('user-name');
    if (el) {
        el.innerHTML = `<i class="fa-regular fa-circle-user"></i> Olá, ${nome}`;
    }

    return true;
}

// ============================================================
// 2. LOGOUT
// ============================================================
function fazerLogout() {
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
// 3. INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!validarAcessoPaciente()) return;

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            fazerLogout();
        });
    }

    carregarCuidador();
    carregarTarefas();
    configurarBotaoSOS();
});

// ============================================================
// 4. CARREGAR CUIDADOR
// ============================================================
async function carregarCuidador() {
    const container = document.getElementById('info-cuidador');
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        container.innerHTML = `<p style="color: var(--text-secondary);">ID do paciente não encontrado.</p>`;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pacientes/perfil/${pacienteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

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
                        <i class="fa-solid fa-triangle-exclamation"></i> Você ainda não está vinculado a nenhum cuidador.
                    </p>
                `;
            }
        } else {
            container.innerHTML = `<p style="color: var(--text-secondary);">Erro ao carregar cuidador.</p>`;
        }
    } catch (error) {
        console.error('Erro ao buscar cuidador:', error);
        container.innerHTML = `<p style="color: var(--danger);">Erro de conexão.</p>`;
    }
}

// ============================================================
// 5. CARREGAR TAREFAS + MICRO-PASSOS
// ============================================================
async function carregarTarefas() {
    const container = document.getElementById('tasks-container');
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">ID do paciente não encontrado.</p>`;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/tarefas/paciente/${pacienteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const tarefas = await response.json();

            if (!tarefas || tarefas.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-secondary); padding: 30px;">
                        <i class="fa-regular fa-face-smile" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
                        Nenhuma tarefa cadastrada para você ainda.
                        <br><small>Seu cuidador irá adicionar suas atividades em breve.</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = tarefas.map(tarefa => {
                const titulo = tarefa.tituloTarefa || 'Tarefa';
                const descricao = tarefa.descriçaoTarefa || '';
                const imagem = tarefa.imagem_Url || '';
                const id = tarefa.idTarefa || tarefa.id;
                const statusTravado = tarefa.statusTravado || false;
                const microPassos = tarefa.microPassos || [];

                return `
                    <div class="task-card" data-tarefa-id="${id}" style="
                        background: var(--card-bg);
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 16px;
                        border: 1px solid var(--border);
                        box-shadow: var(--shadow);
                        ${statusTravado ? 'border-left: 4px solid var(--danger);' : ''}
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
                                    color: var(--primary-dark);
                                    font-size: 28px;
                                ">
                                    <i class="fa-solid fa-clipboard-list"></i>
                                </div>
                            `}
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h4 style="margin: 0; font-size: 16px;">${titulo}</h4>
                                    ${statusTravado ? `
                                        <span style="
                                            background: var(--danger);
                                            color: white;
                                            padding: 2px 10px;
                                            border-radius: 12px;
                                            font-size: 11px;
                                            font-weight: 600;
                                        ">
                                            <i class="fa-solid fa-hand"></i> Travado
                                        </span>
                                    ` : ''}
                                </div>
                                ${descricao ? `<p style="margin: 4px 0 8px 0; font-size: 13px; color: var(--text-secondary);">${descricao}</p>` : ''}
                                
                                <!-- Micro-passos -->
                                ${microPassos.length > 0 ? `
                                    <div style="margin-top: 10px;">
                                        <p style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                                            <i class="fa-solid fa-list-check"></i> Passos:
                                        </p>
                                        <div style="display: flex; flex-direction: column; gap: 4px;">
                                            ${microPassos.sort((a, b) => a.ordemPasso - b.ordemPasso).map(passo => `
                                                <div style="
                                                    display: flex;
                                                    align-items: center;
                                                    gap: 8px;
                                                    font-size: 13px;
                                                    padding: 4px 8px;
                                                    border-radius: 6px;
                                                    background: ${passo.concluido ? 'var(--primary-light)' : 'var(--background)'};
                                                    color: ${passo.concluido ? 'var(--primary-dark)' : 'var(--text-primary)'};
                                                ">
                                                    <input type="checkbox" 
                                                        ${passo.concluido ? 'checked' : ''} 
                                                        onchange="toggleMicroPasso('${passo.idMicroPassos || passo.id}', this)"
                                                        style="accent-color: var(--primary); width: 16px; height: 16px; cursor: pointer;">
                                                    <span style="${passo.concluido ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
                                                        ${passo.descricaoPasso}
                                                    </span>
                                                    ${passo.imagemPassos ? `
                                                        <img src="${passo.imagemPassos}" alt="passo" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover;">
                                                    ` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : `
                                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                                        <i class="fa-regular fa-circle"></i> Nenhum passo definido
                                    </p>
                                `}

                                <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
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
                                        <i class="fa-solid fa-check"></i> Concluir Tudo
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

            // Event listeners
            document.querySelectorAll('.btn-concluir').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    concluirTarefaCompleta(id);
                });
            });

            document.querySelectorAll('.btn-travado').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    registrarTravamento(id);
                });
            });

        } else {
            container.innerHTML = `<p style="text-align: center; color: var(--danger);">Erro ao carregar tarefas.</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        container.innerHTML = `<p style="text-align: center; color: var(--danger);">Erro de conexão.</p>`;
    }
}

// ============================================================
// 6. ALTERNAR MICRO-PASSO
// ============================================================
window.toggleMicroPasso = async function(microPassoId, checkbox) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/micro-passos/${microPassoId}/toggle-concluido`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const dados = await response.json();
            mostrarToast(dados.mensagem || 'Passo atualizado!', 'success');
            // Recarregar as tarefas
            setTimeout(carregarTarefas, 500);
        } else {
            checkbox.checked = !checkbox.checked;
            mostrarToast('Erro ao atualizar passo.', 'error');
        }
    } catch (error) {
        console.error('Erro ao alternar micro-passo:', error);
        checkbox.checked = !checkbox.checked;
        mostrarToast('Erro de conexão.', 'error');
    }
};

// ============================================================
// 7. CONCLUIR TAREFA COMPLETA
// ============================================================
async function concluirTarefaCompleta(tarefaId) {
    try {
        // Buscar todos os micro-passos da tarefa
        const token = localStorage.getItem('token');
        const response = await fetch(`/micro-passos/tarefa/${tarefaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const passos = await response.json();

            // Marcar todos como concluídos
            for (const passo of passos) {
                if (!passo.concluido) {
                    await fetch(`/micro-passos/${passo.idMicroPassos || passo.id}/toggle-concluido`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }
            }

            mostrarToast('✅ Todas as tarefas concluídas! Parabéns!', 'success');
            setTimeout(carregarTarefas, 500);
        }
    } catch (error) {
        console.error('Erro ao concluir tarefa:', error);
        mostrarToast('Erro ao concluir tarefa.', 'error');
    }
}

// ============================================================
// 8. REGISTRAR TRAVAMENTO
// ============================================================
async function registrarTravamento(tarefaId) {
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        mostrarToast('ID do paciente não encontrado.', 'error');
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
            abrirModalAjuda(tarefaId);
        } else {
            const erro = await response.json();
            mostrarToast('❌ Erro: ' + (erro.error || 'Tente novamente.'), 'error');
        }
    } catch (error) {
        console.error('Erro ao registrar travamento:', error);
        mostrarToast('Erro de conexão.', 'error');
    }
}

// ============================================================
// 9. MODAL DE AJUDA (Tô Travado)
// ============================================================
function abrirModalAjuda(tarefaId) {
    const existente = document.getElementById('modal-ajuda');
    if (existente) existente.remove();

    const passos = [
        { icon: 'fa-solid fa-breath', text: 'Respire fundo e conte até 10.' },
        { icon: 'fa-solid fa-hand', text: 'Peça ajuda para alguém próximo.' },
        { icon: 'fa-solid fa-arrows-rotate', text: 'Tente novamente com calma.' },
        { icon: 'fa-solid fa-phone', text: 'Se ainda estiver difícil, chame seu cuidador.' }
    ];

    let passoAtual = 0;

    const modal = document.createElement('div');
    modal.id = 'modal-ajuda';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 500px;">
            <button class="modal-close" onclick="fecharModalAjuda()">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-hand-holding-heart" style="color: var(--primary);"></i> Vamos te ajudar!</h2>
                <p>Siga os passos com calma</p>
            </div>
            <div style="margin: 20px 0;">
                <div style="
                    background: var(--primary);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                ">
                    <span id="passo-numero" style="font-weight: 600;">Passo 1 de ${passos.length}</span>
                </div>
                <div id="passo-conteudo" style="
                    text-align: center;
                    padding: 30px 20px;
                    background: var(--background);
                    border-radius: 8px;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="${passos[0].icon}" style="font-size: 32px; color: var(--primary); margin-bottom: 12px;"></i>
                    <p style="font-size: 18px; margin: 0;">${passos[0].text}</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="fecharModalAjuda()" style="
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
            const passo = passos[passoAtual];
            document.getElementById('passo-numero').textContent = `Passo ${passoAtual + 1} de ${passos.length}`;
            document.getElementById('passo-conteudo').innerHTML = `
                <i class="${passo.icon}" style="font-size: 32px; color: var(--primary); margin-bottom: 12px;"></i>
                <p style="font-size: 18px; margin: 0;">${passo.text}</p>
            `;
        } else {
            document.getElementById('passo-conteudo').innerHTML = `
                <i class="fa-solid fa-circle-check" style="font-size: 48px; color: var(--success);"></i>
                <p style="margin-top: 12px; font-size: 18px; font-weight: 600; color: var(--success);">
                    🎉 Parabéns! Você concluiu todas as etapas!
                </p>
            `;
            document.getElementById('btn-proximo-passo').style.display = 'none';
            document.getElementById('passo-numero').textContent = '✅ Concluído!';
            salvarAjudaConcluida(tarefaId);
        }
    });
}

window.fecharModalAjuda = function() {
    const modal = document.getElementById('modal-ajuda');
    if (modal) modal.remove();
};

async function salvarAjudaConcluida(tarefaId) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/tarefas/${tarefaId}/toggle-travado`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Ajuda concluída para tarefa:', tarefaId);
        setTimeout(carregarTarefas, 500);
    } catch (error) {
        console.error('Erro ao salvar ajuda concluída:', error);
    }
}

// ============================================================
// 10. BOTÃO SOS
// ============================================================
function configurarBotaoSOS() {
    const btn = document.getElementById('btn-sos');
    if (btn) {
        btn.addEventListener('click', dispararSOS);
    }
}

async function dispararSOS() {
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        mostrarToast('⚠️ ID do paciente não encontrado.', 'error');
        return;
    }

    mostrarToast('📍 Buscando sua localização...', 'info');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await enviarSOS(pacienteId, position.coords.latitude, position.coords.longitude);
            },
            async () => {
                await enviarSOS(pacienteId, -15.7801, -47.9292);
            }
        );
    } else {
        mostrarToast('Geolocalização não suportada.', 'error');
    }
}
async function enviarSOS(pacienteId, latitude, longitude) {
    try {
        const token = localStorage.getItem('token');
        
        // Salvar localmente para o cuidador
        const sosData = {
            ativo: true,
            lat: latitude,
            lng: longitude,
            pacienteId: pacienteId,
            dataHora: new Date().toLocaleString('pt-BR')
        };
        localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));

        console.log('📤 Enviando SOS para:', { pacienteId, latitude, longitude });
        
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

        console.log('📥 Resposta SOS:', response.status);
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            mostrarToast('🚨 SOS enviado com sucesso! Cuidador notificado.', 'danger');
        } else {
            mostrarToast('⚠️ Erro ao enviar SOS: ' + (data.error || 'Tente novamente.'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao enviar SOS:', error);
        mostrarToast('❌ Erro de conexão ao enviar SOS.', 'error');
    }
}
// ============================================================
// 11. TOAST (NOTIFICAÇÕES)
// ============================================================
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('sos-toast');
    if (!toast) {
        // Criar toast se não existir
        const newToast = document.createElement('div');
        newToast.id = 'sos-toast';
        newToast.style.cssText = `
            display: block;
            position: fixed;
            bottom: 100px;
            right: 30px;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 60;
            max-width: 350px;
            font-size: 14px;
        `;
        document.body.appendChild(newToast);
        const toastEl = document.getElementById('sos-toast');
        toastEl.textContent = mensagem;
        const cores = {
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            error: '#EF4444',
            info: '#4F46E5'
        };
        toastEl.style.background = cores[tipo] || cores.info;
        toastEl.style.color = 'white';

        setTimeout(() => {
            toastEl.style.display = 'none';
        }, 5000);
        return;
    }

    const cores = {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        error: '#EF4444',
        info: '#4F46E5'
    };

    toast.textContent = mensagem;
    toast.style.background = cores[tipo] || cores.info;
    toast.style.color = 'white';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

// ============================================================
// 12. RECARREGAR PERIODICAMENTE
// ============================================================
setInterval(carregarTarefas, 30000);