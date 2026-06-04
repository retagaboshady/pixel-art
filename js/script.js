const grid = document.getElementById('pixelGrid');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

const GRID_SIZE = 16;
let isDrawing = false;

function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.addEventListener('dragstart', (e) => e.preventDefault());
        pixel.addEventListener('mousedown', (e) => {
            isDrawing = true;
            colorPixel(e.target);
        });
        pixel.addEventListener('mouseenter', (e) => {
            if (isDrawing) colorPixel(e.target);
        });
        grid.appendChild(pixel);
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
        gridSize: GRID_SIZE,
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
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.pixels && data.pixels.length === GRID_SIZE * GRID_SIZE) {
                const pixels = document.querySelectorAll('.pixel');
                pixels.forEach((pixel, index) => {
                    pixel.style.backgroundColor = data.pixels[index];
                });
            } else {
                alert("Invaild JSON file")
            }
        } catch (error) {
            alert("Error reaing JSON file");
        }
    };
    reader.readAsText(file);
});

createGrid();