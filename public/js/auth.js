const API_URL = 'http://localhost:3000/api';

window.fazerLoginDireto = async function(e) {
    if (e) e.preventDefault();

    const emailEl = document.getElementById('login-email');
    const senhaEl = document.getElementById('login-senha');

    const email = emailEl ? emailEl.value.trim() : '';
    const senha = senhaEl ? senhaEl.value.trim() : '';

    if (!email || !senha) {
        alert("Preencha e-mail e senha!");
        return;
    }

    try {
        const response = await fetch('/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            let tipoBruto = data.userRole || data.tipo_usuario || data.usuario?.tipo_usuario || '';
            const tipoNormalizado = tipoBruto.trim().toLowerCase();

            let roleParaSalvar = 'Paciente';
            if (tipoNormalizado === 'cuidador') roleParaSalvar = 'Cuidador';
            if (tipoNormalizado === 'terapeuta' || tipoNormalizado === 'medico') roleParaSalvar = 'Terapeuta';

            localStorage.setItem('userRole', roleParaSalvar);
            localStorage.setItem('userName', data.userName || data.usuario?.nome || '');
            localStorage.setItem('userId', data.usuario?._id || data.usuario?.id || '');

            if (tipoNormalizado === 'paciente') {
                window.location.href = '/dashboards/paciente.html';
            } else if (tipoNormalizado === 'cuidador') {
                window.location.href = '/dashboards/cuidador.html';
            } else if (tipoNormalizado === 'terapeuta' || tipoNormalizado === 'medico') {
                window.location.href = '/dashboards/medico.html';
            } else {
                alert('Tipo de usuário não reconhecido!');
            }
        } else {
            alert(data.error || data.mensagem || 'Erro ao realizar login.');
        }
    } catch (err) {
        console.error('Erro na requisição de login:', err);
        alert('Erro ao conectar ao servidor.');
    }
};
window.fazerCadastro = async function(e) {
    if (e) e.preventDefault();

    const nomeEl = document.getElementById('cad-nome');
    const emailEl = document.getElementById('cad-email');
    const senhaEl = document.getElementById('cad-senha');
    const tipoEl = document.getElementById('cad-role');

    const nome = nomeEl ? nomeEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const senha = senhaEl ? senhaEl.value.trim() : '';
    const tipo_usuario = tipoEl ? tipoEl.value : '';

    if (!nome || !email || !senha || !tipo_usuario) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    try {
        // Colocando a URL direta e absoluta para evitar qualquer erro de prefixo
        const response = await fetch('/usuarios/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, tipo_usuario })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Usuário cadastrado com sucesso!");
            document.getElementById('form-cadastro').reset();
        } else {
            alert("❌ Erro ao cadastrar: " + (data.error || data.mensagem || "Tente novamente."));
        }
    } catch (err) {
        console.error("❌ Erro na requisição:", err);
        alert("Erro ao conectar ao servidor.");
    }
};