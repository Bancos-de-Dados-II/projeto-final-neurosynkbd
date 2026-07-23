// Proteção exclusiva para a página do Paciente
validarAcesso('PACIENTE');

function validarAcesso(roleEsperado) {
  const role = localStorage.getItem('userRole');
  const nome = localStorage.getItem('userName');

  if (!role) {
    window.location.href = '/index.html';
    return;
  }

  if (role !== roleEsperado) {
    alert('Acesso negado para o seu perfil!');
    window.location.href = '/index.html';
    return;
  }

  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = `Olá, ${nome || 'Paciente'}`;
  }
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/index.html';
  });
}