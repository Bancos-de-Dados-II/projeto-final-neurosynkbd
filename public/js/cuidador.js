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
function vincularPaciente() {
    const emailPaciente = prompt("Digite o e-mail do paciente que deseja vincular:");
    if (emailPaciente) {
        alert(`Solicitação enviada para vincular o paciente com e-mail: ${emailPaciente}`);
        // Aqui futuramente chamaremos um fetch POST para salvar o vínculo no MongoDB
    }
}

function verDetalhes(idPaciente) {
    alert(`Visualizando detalhes do paciente ID: ${idPaciente}`);
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