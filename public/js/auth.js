// js/auth.js - VERSÃO COMPLETA

// ============================================================
// 1. ALTERNÂNCIA DE ABAS
// ============================================================
window.alternarAba = function(aba) {
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const tabLogin = document.getElementById('tab-login');
    const tabCadastro = document.getElementById('tab-cadastro');
    const msgBox = document.getElementById('auth-message');

    if (msgBox) {
        msgBox.style.display = 'none';
        msgBox.textContent = '';
    }

    if (aba === 'cadastro') {
        if (formLogin) formLogin.classList.remove('active');
        if (formCadastro) formCadastro.classList.add('active');
        if (tabLogin) tabLogin.classList.remove('active');
        if (tabCadastro) tabCadastro.classList.add('active');
    } else {
        if (formCadastro) formCadastro.classList.remove('active');
        if (formLogin) formLogin.classList.add('active');
        if (tabCadastro) tabCadastro.classList.remove('active');
        if (tabLogin) tabLogin.classList.add('active');
    }
};

// ============================================================
// 2. EXIBIR MENSAGEM
// ============================================================
function exibirMensagem(texto, tipo) {
    const msgBox = document.getElementById('auth-message');
    if (!msgBox) {
        alert(texto);
        return;
    }
    msgBox.className = `auth-message ${tipo}`;
    msgBox.innerText = texto;
    msgBox.style.display = 'block';
    
    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 5000);
}

// ============================================================
// 3. FAZER LOGOUT - ✅ FUNÇÃO GLOBAL
// ============================================================
window.fazerLogout = function() {
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
};

// ============================================================
// 4. OBTER TOKEN
// ============================================================
window.obterToken = function() {
    return localStorage.getItem('token') || '';
};

// ============================================================
// 5. REALIZAR LOGIN
// ============================================================
window.realizarLogin = async function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value.trim();

    if (!email || !senha) {
        exibirMensagem('Preencha e-mail e senha!', 'error');
        return;
    }

    try {
        const response = await fetch('/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            let mensagem = data.message || data.error || 'E-mail ou senha inválidos.';
            if (data.errors) {
                mensagem = data.errors.map(e => `${e.path}: ${e.message}`).join('\n');
            }
            exibirMensagem(mensagem, 'error');
            return;
        }

        const usuario = data.usuario || data;
        const token = data.token;

        console.log('🔑 Login bem-sucedido:', { usuario, token });

        // Salva no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', usuario.tipo_usuario || usuario.userRole || '');
        localStorage.setItem('userName', usuario.nome || usuario.userName || '');
        localStorage.setItem('userId', usuario._id || usuario.id || '');
        localStorage.setItem('usuarioId', usuario._id || usuario.id || '');
        localStorage.setItem('paciente_id', usuario._id || usuario.id || '');

        exibirMensagem('✅ Login realizado com sucesso!', 'success');

        setTimeout(() => {
            const tipo = (usuario.tipo_usuario || usuario.userRole || '').toLowerCase();
            console.log('🔄 Redirecionando para:', tipo);
            
            if (tipo === 'paciente') {
                window.location.href = '/dashboards/paciente.html';
            } else if (tipo === 'cuidador') {
                window.location.href = '/dashboards/cuidador.html';
            } else if (tipo === 'medico' || tipo === 'terapeuta') {
                window.location.href = '/dashboards/medico.html';
            } else {
                window.location.href = '/dashboards/paciente.html';
            }
        }, 1500);

    } catch (error) {
        console.error('❌ Erro no login:', error);
        exibirMensagem('Erro de conexão com o servidor.', 'error');
    }
};

// ============================================================
// 6. REALIZAR CADASTRO
// ============================================================
window.realizarCadastro = async function(event) {
    event.preventDefault();

    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value.trim();
    const tipo_usuario = document.getElementById('cad-tipo').value;

    console.log('📤 Enviando cadastro:', { nome, email, senha, tipo_usuario });

    if (!nome || !email || !senha || !tipo_usuario) {
        exibirMensagem('Preencha todos os campos!', 'error');
        return;
    }

    if (senha.length < 6) {
        exibirMensagem('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    try {
        const response = await fetch('/usuarios/cadastro', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha, tipo_usuario })
        });

        const data = await response.json();
        console.log('📥 Resposta do servidor:', data);

        if (!response.ok) {
            let mensagem = data.message || data.error || 'Erro ao cadastrar.';
            if (data.errors) {
                mensagem = data.errors.map(e => `${e.path}: ${e.message}`).join('\n');
            }
            exibirMensagem(mensagem, 'error');
            return;
        }

        exibirMensagem('✅ Conta criada com sucesso! Faça login.', 'success');
        document.getElementById('form-cadastro').reset();

        setTimeout(() => {
            window.alternarAba('login');
            document.getElementById('login-email').value = email;
        }, 1500);

    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        exibirMensagem('Erro de conexão com o servidor.', 'error');
    }
};

// ============================================================
// 7. VERIFICAR SE A FUNÇÃO FOI DEFINIDA
// ============================================================
console.log('✅ auth.js carregado!');
console.log('✅ fazerLogout disponível:', typeof window.fazerLogout === 'function');