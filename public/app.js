// 1. Inicializa o mapa focado no Brasil (coordenadas padrão de exemplo)
const map = L.map('map').setView([-15.7801, -47.9292], 4);

// 2. Carrega a camada visual do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variável para guardar a referência do marcador que o usuário colocar
let marcadorAtual = null;

// 3. Detecta o clique no mapa para capturar as coordenadas
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Se já existir um marcador, move ele. Se não, cria um novo.
    if (marcadorAtual) {
        marcadorAtual.setLatLng(e.latlng);
    } else {
        marcadorAtual = L.marker(e.latlng).addTo(map);
    }

    // Preenche os campos do formulário (com 6 casas decimais)
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);
});

// 4. Envia os dados capturados para o seu Backend Express (CORRIGIDO)
document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Impede a página de recarregar

    const usuarioId = document.getElementById('usuarioId').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const mensagemStatus = document.getElementById('mensagem-status');

    try {
        const resposta = await fetch('/router/localizacao/atualizar', { 
            method: 'PUT', // Garante que enviará os dados usando PUT
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: usuarioId,
                latitude: latitude,
                longitude: longitude
            })
        });

        const dados = await resposta.json(); 

        if (resposta.ok) {
            mensagemStatus.className = 'sucesso';
            mensagemStatus.innerText = 'Localização GeoJSON salva com sucesso!';
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

// 5. Lógica para Alternar o Modo de Baixo Estímulo (Dark Mode)
const botaoTema = document.getElementById('toggle-theme');

if (botaoTema) {
    botaoTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            botaoTema.innerText = '☀️ Modo Normal';
        } else {
            botaoTema.innerText = '👁️ Modo Baixo Estímulo';
        }
    });
}

// 6. Criando Marcadores de Exemplo (Pontos de Apoio) no Mapa
const iconeVerde = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pontosDeApoio = [
    {
        nome: "Espaço Integrar - Clínica de Terapia Ocupacional",
        descricao: "Especialistas em integração sensorial e ambiente acolhedor.",
        lat: -15.7942,
        lng: -47.8822
    },
    {
        nome: "Parque da Cidade - Área Sensorial Silenciosa",
        descricao: "Espaço aberto sem poluição sonora para descompressão.",
        lat: -15.8030,
        lng: -47.9050
    },
    {
        nome: "Associação Neurodivergente",
        descricao: "Grupo de apoio mútuo, palestras e acolhimento.",
        lat: -15.7750,
        lng: -47.9250
    }
];

pontosDeApoio.forEach(ponto => {
    L.marker([ponto.lat, ponto.lng], { icon: iconeVerde })
        .addTo(map)
        .bindPopup(`
            <strong style="color: #2c7a7b;">${ponto.nome}</strong><br>
            <span style="font-size: 0.85rem; color: #4a5568;">${ponto.descricao}</span>
        `);
});

// 7. Lógica para Capturar a Localização Atual via GPS
const botaoGPS = document.getElementById('btn-gps');

if (botaoGPS) {
    botaoGPS.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Desculpe, seu navegador não suporta geolocalização.');
            return;
        }

        botaoGPS.innerText = '📍 Buscando sua localização...';
        botaoGPS.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                const lat = posicao.coords.latitude;
                const lng = posicao.coords.longitude;

                map.setView([lat, lng], 15);

                if (marcadorAtual) {
                    marcadorAtual.setLatLng([lat, lng]);
                } else {
                    marcadorAtual = L.marker([lat, lng]).addTo(map);
                }

                document.getElementById('latitude').value = lat.toFixed(6);
                document.getElementById('longitude').value = lng.toFixed(6);

                botaoGPS.innerText = '📍 Usar Minha Localização Atual';
                botaoGPS.disabled = false;
            },
            (erro) => {
                alert('Não foi possível obter sua localização. Verifique as permissões de GPS.');
                botaoGPS.innerText = '📍 Usar Minha Localização Atual';
                botaoGPS.disabled = false;
                console.error(erro);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}