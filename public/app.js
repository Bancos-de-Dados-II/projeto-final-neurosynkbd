// 1. Inicializa o mapa focado no Brasil (coordenadas padrão de exemplo)
const map = L.map('map').setView([-15.7801, -47.9292], 4);

// 2. Adiciona os blocos de mapa (OpenStreetMap) no container do Leaflet
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marcadorAtual = null;

// 3. Captura o clique do usuário no mapa
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Preenche automaticamente as caixas de texto ocultas ou readonly no formulário
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    // Remove o marcador anterior, se houver, e adiciona um novo no ponto clicado
    if (marcadorAtual) {
        map.removeLayer(marcadorAtual);
    }
    marcadorAtual = L.marker([lat, lng]).addTo(map);
});

// 4. Envia os dados capturados para o seu Backend Express
document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Impede a página de recarregar

    const usuarioId = document.getElementById('usuarioId').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const mensagemStatus = document.getElementById('mensagem-status');

    try {
        
        const resposta = await fetch('/router/localizacao/atualizar', { 
            method: 'PUT', 
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