const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const objectsList = document.getElementById('objectsList');
const detectedObjects = {};

async function init() {
    try {
        // Solicitar acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // Ajustar el tamaño del canvas al tamaño del video
        video.addEventListener('loadeddata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

        // Cargar el modelo COCO-SSD
        const model = await cocoSsd.load();
        detectFrame(video, model);
    } catch (error) {
        alert('Error al acceder a la cámara o al cargar el modelo.');
        console.error(error);
    }
}

async function detectFrame(video, model) {
    const predictions = await model.detect(video);
    drawPredictions(predictions);
    setTimeout(() => {
        detectFrame(video, model);
    }, 500); // 500ms es igual a 2 FPS
}

function drawPredictions(predictions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        const text = `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`;

        // Dibujar cuadro delimitador
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Dibujar etiqueta
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px Arial';
        ctx.fillText(text, x, y > 10 ? y - 5 : 10);

        // Registrar objeto detectado
        if (!detectedObjects[prediction.class]) {
            detectedObjects[prediction.class] = new Date().toLocaleTimeString();
            updateObjectList();
        }
    });
}

function updateObjectList() {
    objectsList.innerHTML = '';
    for (const [objectClass, detectedAt] of Object.entries(detectedObjects)) {
        const listItem = document.createElement('div');
        listItem.className = 'object-item';
        listItem.textContent = `${objectClass} detectado a las ${detectedAt}`;
        objectsList.appendChild(listItem);
    }
}

window.addEventListener('load', init);

