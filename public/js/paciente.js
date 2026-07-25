// =========================================================
// NEUROSYNC - PAINEL DO PACIENTE (LOGICA UNIFICADA)
// =========================================================

// PASSOS PADRÃO DO TÔ TRAVADO
const passosPadrao = [
  "1. Respire fundo e pegue a escova de dentes na pia.",
  "2. Abra a pasta de dentes e coloque uma quantidade pequena.",
  "3. Molhe a escova na torneira e escove os dentes com calma.",
  "4. Enxágue a boca com água e limpe a escova."
];

let passosAtuais = [];
let indiceAtual = 0;

// =========================================================
// TA.2: REGISTRO DE TRAVAMENTO NO BANCO DE DADOS
// =========================================================
async function registrarEventoTravamento(tarefaId) {
  try {
    const payload = {
      tarefa_id: tarefaId,
      paciente_id: localStorage.getItem('paciente_id') || 1, // Obtém id do paciente logado
      data_hora: new Date().toISOString()
    };

    // Chamada à API/Backend
    const response = await fetch('/api/travamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`✅ Evento de travamento registrado no banco para a tarefa ID: ${tarefaId}`);
    } else {
      console.warn('⚠️ Não foi possível salvar o registro de travamento no backend.');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com a API de travamentos:', error);
  }
}

// Atualização da função "iniciarToTravado"
window.iniciarToTravado = function() {
  console.log('🚀 Executando iniciarToTravado...');

  // 1. Identifica a tarefa ativa (ex: id da tarefa visível na tela)
  const tarefaElemento = document.querySelector('.tarefa-item');
  const tarefaId = tarefaElemento ? tarefaElemento.getAttribute('data-tarefa-id') : '101';

  // 2. Registra o evento no banco de dados (TA.2)
  registrarEventoTravamento(tarefaId);

  // 3. Esconde a lista e o botão "Tô Travado"
  const lista = document.getElementById('lista-lembretes');
  const btnContainer = document.getElementById('btn-to-travado-container');
  const pasosContainer = document.getElementById('micro-passos-container');

  if (lista) lista.style.display = 'none';
  if (btnContainer) btnContainer.style.display = 'none';

  // 4. Exibe o container de micro-passos
  if (pasosContainer) {
    pasosContainer.style.display = 'block';
    console.log('✅ Container de passos forçado para visível!');
  }

  // 5. Inicia os passos
  if (typeof renderizarPasso === 'function') {
    renderizarPasso();
  }
};
// FUNÇÃO: PRÓXIMO PASSO
window.proximoMicroPasso = function() {
  indiceAtual++;

  if (indiceAtual < passosAtuais.length) {
    const txtNumero = document.getElementById('passo-numero');
    const txtComando = document.getElementById('micro-passo-comando');

    if (txtNumero) txtNumero.innerText = `Passo ${indiceAtual + 1} de ${passosAtuais.length}`;
    if (txtComando) txtComando.innerText = passosAtuais[indiceAtual];
  } else {
    alert('🎉 Parabéns! Você concluiu todas as etapas!');
    
    const containerPassos = document.getElementById('micro-passos-container');
    const listaLembretes = document.getElementById('lista-lembretes');
    const btnContainer = document.getElementById('btn-to-travado-container');

    if (containerPassos) containerPassos.style.display = 'none';
    if (listaLembretes) listaLembretes.style.display = 'block';
    if (btnContainer) btnContainer.style.display = 'block';
  }
};

// FUNÇÃO: SOS / EMERGÊNCIA
let sosInterval = null;
let sosSegundos = 0;

window.acionarSOS = function() {
  const banner = document.getElementById('sos-alert-banner');
  const timer = document.getElementById('sos-timer');
  
  if (banner) banner.style.display = 'block';

  if (!sosInterval) {
    sosSegundos = 0;
    sosInterval = setInterval(() => {
      sosSegundos++;
      if (timer) timer.innerText = `Tempo ativo: ${sosSegundos}s`;
    }, 1000);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log('📍 SOS Geolocalização enviada:', lat, lng);

        // Salva as coordenadas para o Cuidador conseguir ler
        const sosData = {
          ativo: true,
          lat: lat,
          lng: lng,
          dataHora: new Date().toLocaleTimeString('pt-BR')
        };
        localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));
      },
      (error) => {
        console.warn('⚠️ Erro ao obter geolocalização:', error.message);
        
        // Coordenadas de contingência (fallback) caso dê erro
        const sosData = {
          ativo: true,
          lat: -23.55052,
          lng: -46.633308,
          dataHora: new Date().toLocaleTimeString('pt-BR')
        };
        localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));
      }
    );
  }
};
function carregarFotosSalvas() {
    // Busca todos os elementos que possuem o atributo data-tarefa-id
    const tarefas = document.querySelectorAll('[data-tarefa-id]');

    tarefas.forEach(tarefa => {
        const id = tarefa.getAttribute('data-tarefa-id');
        const img = tarefa.querySelector('img');
        
        // Busca a foto salva no localStorage
        const fotoSalva = localStorage.getItem(`foto_tarefa_${id}`);

        if (fotoSalva && img) {
            img.src = fotoSalva;
            console.log(`✅ Foto carregada com sucesso para a tarefa ID: ${id}`);
        } else {
            console.warn(`⚠️ Nenhuma foto encontrada no localStorage para a tarefa ID: ${id}`);
        }
    });
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', carregarFotosSalvas);