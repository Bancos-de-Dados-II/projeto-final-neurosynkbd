const API_URL = 'http://localhost:3000/usuarios';

window.fazerLoginDireto = async function(e) {
    if (e) e.preventDefault();
    console.log("🚀 Executando login com sucesso (sem recarregar a página)...");

    const email = document.getElementById('login-email')?.value;
    const senha = document.getElementById('login-senha')?.value;

    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        console.log("📦 Resposta do Servidor:", data);

        if (response.ok) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            // Garante que o tipo fique sempre em maiúsculas ('CUIDADOR')
const tipoTratado = data.usuario.tipo_usuario ? data.usuario.tipo_usuario.toString().trim().toUpperCase() : '';

localStorage.setItem('userRole', tipoTratado);
localStorage.setItem('userName', data.usuario.nome);
            
            
            const tipo = data.usuario.tipo_usuario ? data.usuario.tipo_usuario.toString().trim().toUpperCase() : '';
            console.log("👤 Perfil do Usuário:", tipo);

            if (tipo === 'CUIDADOR') {
                window.location.href = 'dashboards/cuidador.html';
            } else if (tipo === 'PACIENTE') {
                window.location.href = 'dashboards/paciente.html';
            } else if (tipo === 'TERAPEUTA' || tipo === 'MEDICO' || tipo === 'MEDICO/TERAPEUTA') {
                window.location.href = 'dashboards/medico.html';
            } else {
                alert('Tipo não reconhecido: ' + data.usuario.tipo_usuario);
            }
        } else {
            alert(data.error || 'Login ou senha incorretos.');
        }
    } catch (err) {
        console.error("❌ Erro ao conectar:", err);
        alert('Erro ao conectar ao servidor. Verifique se o Node.js está rodando no terminal!');
    }
};