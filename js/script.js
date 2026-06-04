const gird = document.getElementById('pixelGird');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

const GRID_SIZE = 16;
let isDrawing = false;

function creatGird() {
    gird.innerHTML = '';
    for (let i = 0; i < GIRD_SIZE * GIRD_SIZE; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.addEventListener('mouseenter', (e) => {
            if (isDrawing) colorPixel(e.target);
        });
        gird.appendChild(pixel);
    }
}

window.addEventListener('mouseup', () => isDrawing = false);

function colorPixel(pixel) {
    pixel.style.backgroundColor = colorPicker.value;
}

clearBtn.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(pixel => pixel.style.backgroundColor = '#ffffff')
});

exportBtn.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    const colorArray = [];
    pixels.forEach(pixel => {
        const color = pixel.style.backgroundColor || 'rgba(255, 255,255)';
        colorArray.push(color);
    });
    const jsonOutput = {
        girdSize: GIRD_SIZE,
        pixels: colorArray
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonOutput, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "pixel-art.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

importBtn.addEventListener('click', () => fileInput.click());