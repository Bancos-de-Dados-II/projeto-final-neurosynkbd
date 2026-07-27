// Global Lista de Pacientes
let pacientesCarregados = [];

// Proteção de Rota
validarAcesso();

function validarAcesso() {
    const roleSalvo = (localStorage.getItem('userRole') || '').trim().toLowerCase();
    const nome = localStorage.getItem('userName');

    if (!roleSalvo) {
        window.location.href = '../index.html';
        return;
    }

    const ePermitido = roleSalvo === 'terapeuta' || roleSalvo === 'medico';

    if (!ePermitido) {
        alert('Acesso não autorizado!');
        window.location.href = '../index.html';
        return;
    }

    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.innerHTML = `<i class="fa-solid fa-user-doctor"></i> Dr(a). ${nome || 'Médico'}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPacientesMedico();
    configurarLogout();
});

// 1. Carregar Pacientes
async function carregarPacientesMedico() {
    const tabelaBody = document.getElementById('lista-pacientes-medico');
    const countElement = document.getElementById('count-pacientes');
    const countLaudos = document.getElementById('count-laudos');

    try {
        const response = await fetch('/usuarios');
        
        if (!response.ok) throw new Error('Erro ao buscar pacientes');

        const usuarios = await response.json();
        
        // Filtra os usuários que são pacientes
        pacientesCarregados = usuarios.filter(u => 
            (u.tipo_usuario || '').toUpperCase() === 'PACIENTE'
        );

        if (countElement) countElement.textContent = pacientesCarregados.length;

        // Atualiza contagem de laudos
        let laudosAtivos = pacientesCarregados.filter(p => p.diagnostico && p.diagnostico !== 'Não informado').length;
        if (countLaudos) countLaudos.textContent = laudosAtivos;

        // Atualiza Select do Modal
        popularSelectPacientes(pacientesCarregados);

        if (pacientesCarregados.length === 0) {
            if (tabelaBody) {
                tabelaBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">
                            Nenhum paciente cadastrado até o momento.
                        </td>
                    </tr>`;
            }
            return;
        }

        // Renderizar Tabela
        if (tabelaBody) {
            tabelaBody.innerHTML = pacientesCarregados.map(p => {
                const id = p._id || p.id;
                const nome = escapeHTML(p.nome || p.email);
                const diagnostico = escapeHTML(p.diagnostico || 'Não informado');
                const ultimaRevisao = escapeHTML(p.ultimaRevisao || p.ultima_revisao || 'Hoje');

                return `
                    <tr>
                        <td><strong>${nome}</strong><br><small style="color:#64748b">${escapeHTML(p.email || '')}</small></td>
                        <td>${diagnostico}</td>
                        <td>${ultimaRevisao}</td>
                        <td>
                            <button class="btn-acao" onclick="abrirModalDiagnostico('${id}')">
                                📄 Diagnóstico
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        if (tabelaBody) {
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #e74c3c; padding: 20px;">
                        Erro ao carregar pacientes da API.
                    </td>
                </tr>`;
        }
    }
}

// 2. Preencher Select do Modal
function popularSelectPacientes(pacientes) {
    const select = document.getElementById('select-paciente');
    if (!select) return;

    if (pacientes.length === 0) {
        select.innerHTML = '<option value="">Nenhum paciente disponível</option>';
        return;
    }

    select.innerHTML = '<option value="">-- Selecione um paciente --</option>' + 
        pacientes.map(p => `<option value="${p._id || p.id}">${escapeHTML(p.nome || p.email)}</option>`).join('');
}

// 3. Funções do Modal
window.abrirModalDiagnostico = function(idPaciente = '') {
    const modal = document.getElementById('modal-diagnostico');
    const select = document.getElementById('select-paciente');
    const textarea = document.getElementById('input-diagnostico');

    if (textarea) textarea.value = '';

    if (idPaciente && select) {
        select.value = idPaciente;
    }

    if (modal) modal.style.display = 'flex';
};

window.fecharModalDiagnostico = function() {
    const modal = document.getElementById('modal-diagnostico');
    if (modal) modal.style.display = 'none';
};

// 4. Salvar Diagnóstico (Envio para o Backend)
window.salvarDiagnostico = async function(e) {
    if (e) e.preventDefault();

    const idPaciente = document.getElementById('select-paciente').value;
    const diagnosticoTexto = document.getElementById('input-diagnostico').value.trim();

    if (!idPaciente || !diagnosticoTexto) {
        alert('Por favor, selecione o paciente e digite o diagnóstico!');
        return;
    }

    try {
        const response = await fetch(`/usuarios/${idPaciente}/diagnostico`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                diagnostico: diagnosticoTexto,
                ultimaRevisao: new Date().toLocaleDateString('pt-BR')
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Diagnóstico salvo com sucesso!');
            fecharModalDiagnostico();
            carregarPacientesMedico(); // Recarrega a tabela na hora
        } else {
            alert('❌ Erro ao salvar: ' + (data.mensagem || data.error || 'Erro inesperado.'));
        }
    } catch (err) {
        console.error('Erro ao enviar diagnóstico:', err);
        alert('Erro de conexão ao salvar diagnóstico.');
    }
};

// Logout
function configurarLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}

// Helper para evitar XSS
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}