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
document.addEventListener('DOMContentLoaded', () => {
    carregarCuidadorDoBanco();
});

async function carregarCuidadorDoBanco() {
    const containerCuidador = document.getElementById('info-cuidador');
    if (!containerCuidador) return;

    try {
        const response = await fetch('/api/pacientes/meu-perfil');
        if (!response.ok) throw new Error('Não foi possível carregar os dados.');

        const paciente = await response.json();

        if (paciente.cuidador) {
            containerCuidador.innerHTML = `
                <p><strong>Nome:</strong> ${escapeHTML(paciente.cuidador.nome || 'Não informado')}</p>
                <p><strong>E-mail:</strong> ${escapeHTML(paciente.cuidador.email || 'Não informado')}</p>
            `;
        } else {
            containerCuidador.innerHTML = `
                <p style="color: #d97706;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Você ainda não está vinculado a nenhum cuidador no sistema.
                </p>`;
        }
    } catch (err) {
        console.error('Erro ao buscar cuidador:', err);
        containerCuidador.innerHTML = `<p style="color: red;">Erro ao carregar cuidador vinculado.</p>`;
    }
}

function dispararSOS() {
    const pacienteId = localStorage.getItem('paciente_id') || localStorage.getItem('usuarioId');

    if (!pacienteId) {
        alert('⚠️ Usuário não identificado. Faça login novamente.');
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const localizacaoGeoJSON = {
                    type: "Point",
                    coordinates: [longitude, latitude]};
                enviarAlertaSOS(pacienteId, localizacaoGeoJSON);
            },
            (error) => {
                console.warn('⚠️ Erro ao obter GPS, usando coordenadas fallback:', error.message);
                const fallbackGeoJSON = {
                    type: "Point",
                    coordinates: [-46.633308, -23.55052] 
                };

                enviarAlertaSOS(pacienteId, fallbackGeoJSON);
            }
        );
    } else {
        alert('Geolocalização não é suportada neste navegador.');
    }
}

async function enviarSOSParaBanco(lat, lng) {
    try {
        const response = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat: lat,
                lng: lng,
                dataHora: new Date().toISOString()
            })
        });

        if (response.ok) {
            alert('🚨 Alerta SOS registrado com sucesso no banco de dados!');
        } else {
            const err = await response.json();
            alert('❌ Erro ao enviar SOS: ' + (err.mensagem || 'Tente novamente.'));
        }
    } catch (err) {
        console.error('Erro ao conectar ao servidor para envio de SOS:', err);
        alert('Erro de conexão ao enviar SOS.');
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
async function enviarAlertaSOS(pacienteId, localizacaoGeoJSON) {
    const lng = localizacaoGeoJSON.coordinates[0];
    const lat = localizacaoGeoJSON.coordinates[1];

    // 1. Atualiza o localStorage em tempo real para o cuidador.js ler imediatamente
    const sosData = {
        ativo: true,
        lat: lat,
        lng: lng,
        pacienteId: pacienteId,
        dataHora: new Date().toLocaleTimeString('pt-BR')
    };
    localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));
    console.log('📍 SOS salvo no localStorage local:', sosData);

    // 2. Envia para o Backend com as chaves EXATAS que o localizacao-controller.ts espera
    try {
        const response = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: pacienteId,  // Exigido pelo controller
                latitude: lat,          // Exigido pelo controller
                longitude: lng          // Exigido pelo controller
            })
        });

        if (response.ok) {
            console.log('🚨 SOS registrado no MongoDB com sucesso!');
        } else {
            const errData = await response.json();
            console.warn('⚠️ Erro de validação da API:', errData);
        }
    } catch (err) {
        console.error('❌ Erro de conexão ao enviar SOS:', err);
    }
}
async function carregarDadosPaciente() {
  try {
    // Pega o ID do paciente salvo no login/localStorage (ou usa 1 como fallback)
    const pacienteId = localStorage.getItem('paciente_id') || localStorage.getItem('usuarioId');

    if (!pacienteId) {
      console.warn('⚠️ ID do paciente não encontrado no localStorage.');
      return;
    }

    // Faz a requisição para a rota que atualizamos no backend
    const response = await fetch(`/usuarios/paciente/${pacienteId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do paciente');
    }

    const paciente = await response.json();

    // Atualiza o nome do cuidador no HTML
    // (Ajuste 'nome-cuidador' para o ID correto do elemento no seu HTML se for diferente)
    const elNomeCuidador = document.getElementById('nome-cuidador');
    if (elNomeCuidador) {
      if (paciente.cuidador && paciente.cuidador.nome) {
        elNomeCuidador.innerText = paciente.cuidador.nome;
      } else {
        elNomeCuidador.innerText = 'Sem cuidador vinculado';
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados do paciente:', error);
  }
}