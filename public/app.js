// 1. Inicializa o mapa com foco no Brasil (Padrão)
const map = L.map('map').setView([-15.7801, -47.9292], 4);

// 2. Adiciona a camada de visualização OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marcador dinâmico do clique ou GPS
let marcadorAtual = null;

// 3. Ouvinte de evento de clique no mapa para capturar coordenadas manuais
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;

    if (marcadorAtual) {
        marcadorAtual.setLatLng(e.latlng);
    } else {
        marcadorAtual = L.marker(e.latlng).addTo(map).bindPopup("Local selecionado").openPopup();
    }
});

// 4. Funcionalidade de captura de Geolocalização nativa via GPS do navegador
document.getElementById('btn-gps').addEventListener('click', function() {
    const btn = this;
    
    if (!navigator.geolocation) {
        alert("A geolocalização não é suportada pelo seu navegador.");
        return;
    }

    btn.innerText = "⏳ Capturando localização...";
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);

            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;

            const novasCoordenadas = [lat, lng];
            map.setView(novasCoordenadas, 16);

            if (marcadorAtual) {
                marcadorAtual.setLatLng(novasCoordenadas);
            } else {
                marcadorAtual = L.marker(novasCoordenadas).addTo(map).bindPopup("Você está aqui!").openPopup();
            }

            btn.innerText = "📍 Usar Minha Localização Atual";
            btn.disabled = false;
        },
        function(error) {
            alert("Não foi possível obter sua localização. Selecione manualmente no mapa.");
            btn.innerText = "📍 Usar Minha Localização Atual";
            btn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

// 5. Pontos de Apoio Amigáveis Estáticos
const pontosDeApoio = [
    { nome: "Centro do Desenvolvimento Neurodivergente", lat: -15.7941, lng: -47.8825 },
    { nome: "Clínica de Atendimento Especializado", lat: -23.5505, lng: -46.6333 }
];

pontosDeApoio.forEach(ponto => {
    const iconeVerde = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    L.marker([ponto.lat, ponto.lng], { icon: iconeVerde }).addTo(map).bindPopup(`<b>${ponto.nome}</b><br>Ponto Amigável`);
});

// 6. Envia os dados capturados para o seu Backend Express (INTEGRADO COM BACK-END - Arthur)
document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const usuarioId = document.getElementById('usuarioId').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const mensagemStatus = document.getElementById('mensagem-status');

    try {
        // CORREÇÃO DA ROTA: Agora aponta exatamente para o seu back-end Express
        const resposta = await fetch('/usuarios/localizacao', { 
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: usuarioId, // Enviado no corpo da requisição
                latitude: latitude,
                longitude: longitude
            })
        });

        const dados = await resposta.json(); 

        if (resposta.ok) {
            mensagemStatus.className = 'sucesso';
            mensagemStatus.innerText = 'Localização GeoJSON salva com sucesso no MongoDB!';
            mensagemStatus.style.display = 'block';
        } else {
            throw new Error(dados.error || 'Erro desconhecido');
        }

    } catch (erro) {
        mensagemStatus.className = 'erro';
        mensagemStatus.innerText = 'Erro ao salvar: ' + erro.message;
        mensagemStatus.style.display = 'block';
    }
});

// 7. Integração do fluxo transacional de cadastro com o MongoDB Primário (Arthur)
document.getElementById('registro-usuario-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;
    const tipo_usuario = document.getElementById('reg-tipo').value;
    
    // Captura as coordenadas atuais do formulário ou define um padrão caso o mapa não tenha sido clicado ainda
    const latitude = document.getElementById('latitude').value || "-15.7801";
    const longitude = document.getElementById('longitude').value || "-47.9292";
    
    const registroStatus = document.getElementById('registro-status');

    try {
        const resposta = await fetch('/usuarios/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                email,
                senha,
                tipo_usuario,
                latitude,
                longitude
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            registroStatus.className = 'sucesso';
            registroStatus.innerText = 'Conta criada com sucesso no MongoDB Primário!';
            registroStatus.style.display = 'block';

            // Preenche automaticamente o campo ID do formulário de mapa para facilitar a vida do usuário!
            if (dados.usuario && dados.usuario._id) {
                document.getElementById('usuarioId').value = dados.usuario._id;
            } else if (dados._id) {
                document.getElementById('usuarioId').value = dados._id;
            }
        } else {
            throw new Error(dados.error || 'Erro ao registrar usuário.');
        }
    } catch (erro) {
        registroStatus.className = 'erro';
        registroStatus.innerText = erro.message;
        registroStatus.style.display = 'block';
    }
});