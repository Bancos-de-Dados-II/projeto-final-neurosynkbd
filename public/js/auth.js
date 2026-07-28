const API_URL = '/usuarios';

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
        const response = await fetch(`${API_URL}/login`, {
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
            const idEncontrado = data.userId || data.id || data._id || data.usuario?.id || data.usuario?._id || '';
            const nomeEncontrado = data.userName || data.nome || data.usuario?.nome || '';
            localStorage.setItem('userRole', roleParaSalvar);
            localStorage.setItem('userName', nomeEncontrado);
            localStorage.setItem('userId', idEncontrado);
            localStorage.setItem('usuarioId', idEncontrado);
            localStorage.setItem('paciente_id', idEncontrado);

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
    const tipo_usuario = tipoEl ? tipoEl.value.toLowerCase() : '';

    if (!nome || !email || !senha || !tipo_usuario) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, tipo_usuario })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Usuário cadastrado com sucesso!");
            const formCad = document.getElementById('form-cadastro');
            if (formCad) formCad.reset();
        } else {
            alert("❌ Erro ao cadastrar: " + (data.error || data.mensagem || "Tente novamente."));
        }
    } catch (err) {
        console.error("❌ Erro na requisição:", err);
        alert("Erro ao conectar ao servidor.");
    }
};