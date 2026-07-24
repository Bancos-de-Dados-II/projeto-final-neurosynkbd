
// Validar acesso para o Painel do Médico/Terapeuta
validarAcesso('Terapeuta');

function validarAcesso(roleEsperado) {
    // 1. Pega o role do localStorage e normaliza para minúsculas para não ter erro de caixa alta/baixa
    const roleSalvo = (localStorage.getItem('userRole') || '').trim().toLowerCase();
    const nome = localStorage.getItem('userName');

    // 2. Se não estiver logado, redireciona
    if (!roleSalvo) {
        window.location.href = '../index.html';
        return;
    }

    // 3. Verifica se o usuário logado é Terapeuta ou Médico
    const ePermitido = roleSalvo === 'terapeuta' || roleSalvo === 'medico';

    if (!ePermitido) {
        alert('Acesso não autorizado!');
        window.location.href = '../index.html';
        return;
    }

    // 4. Exibe o nome na interface
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.innerHTML = `<i class="fa-solid fa-user-doctor"></i> Dr(a). ${nome || 'Médico'}`;
    }
}
  

document.addEventListener('DOMContentLoaded', () => {
    carregarPacientesMedico();
    configurarLogout();
});

async function carregarPacientesMedico() {
    const tabelaBody = document.getElementById('lista-pacientes-medico');
    const countElement = document.getElementById('count-pacientes');

    try {
        // Envia 'Paciente' no padrão PascalCase correto do backend
        const response = await fetch('/usuarios?tipo=Paciente');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar pacientes no servidor');
        }

        const pacientes = await response.json();

        if (countElement) countElement.textContent = pacientes.length || 0;

        if (!pacientes || pacientes.length === 0) {
            if (tabelaBody) {
                tabelaBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #64748b;">
                            Nenhum paciente vinculado ao seu CRM até o momento.
                        </td>
                    </tr>`;
            }
            return;
        }

        // Se houver pacientes, renderiza na tabela
        if (tabelaBody) {
            tabelaBody.innerHTML = pacientes.map(p => `
                <tr>
                    <td><strong>${p.nome || 'Paciente'}</strong><br><small style="color:#64748b">${p.email || ''}</small></td>
                    <td>${p.diagnostico || 'Não informado'}</td>
                    <td>${p.ultimaRevisao || 'Pendente'}</td>
                    <td><button class="btn-acao">Ver Prontuário</button></td>
                </tr>
            `).join('');
        }

    } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        
        // Exibe mensagem de erro na própria tabela SEM deslogar o médico!
        if (tabelaBody) {
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #e74c3c;">
                        Não foi possível carregar os pacientes no momento.
                    </td>
                </tr>`;
        }
    }
}
function verProntuario(id) {
    alert(`Abrindo Prontuário do Paciente ID: ${id}`);
}

function prescreverMedication(id) {
    alert(`Abrindo módulo de prescrição/medicação para o Paciente ID: ${id}`);
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