// Garantir acesso protegido
// (Mantenha a sua função de validarAcesso se já existir no escopo global)

document.addEventListener('DOMContentLoaded', () => {
    // Carrega o nome do usuário do localStorage
    const nome = localStorage.getItem('userName') || 'Paciente';
    const boasVindasEl = document.getElementById('boas-vindas-nome');
    if (boasVindasEl) {
        boasVindasEl.textContent = `Olá, ${nome}! 👋`;
    }
});

function marcarFeito(btn) {
    btn.textContent = '✓ Concluído';
    btn.style.background = '#2ecc71';
    btn.style.color = '#fff';
    btn.disabled = true;
}

function fazerLogout() {
    localStorage.clear();
    window.location.href = '/';
}