const grid = document.getElementById('pixelGrid');
const colorPicker = document.getElementById('colorPicker');
const sizeSelector = document.getElementById('sizeSelector');
const togglegridBtn = document.getElementById('toggleGrid');
const clearBtn = document.getElementById('clearBtn');
const drawTool = document.getElementById('drawTool');   
const eraseTool = document.getElementById('eraseTool');
const fillTool = document.getElementById('fillTool');
const pickerTool = document.getElementById('pickerTool');
const exportPngBtn = document.getElementById('exportPngBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const fileInput = document.getElementById('fileInput');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

let currentGridSize = 32;
let currentTool = 'draw';
let isDrawing = false;
let undoStack = [];
let redoStack = [];

function createGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${currentGridSize}, ${Math.floor(550 / currentGridSize)}px)`;
    grid.style.gridTemplateRows = `repeat(${currentGridSize}, ${Math.floor(550 / currentGridSize)}px)`;
    
    for (let i = 0; i < currentGridSize * currentGridSize; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.style.backgroundColor = '#ffffff';
        pixel.dataset.index = i;
        
        pixel.addEventListener('dragstart', (e) => e.preventDefault());
        
        pixel.addEventListener('mousedown', (e) => {
            isDrawing = true;
            saveHistoryState();
            useActiveTool(e.target);
        });
        
        pixel.addEventListener('mouseenter', (e) => {
            if (isDrawing && (currentTool === 'draw' || currentTool === 'erase')) {
                useActiveTool(e.target);
            }
        });
        grid.appendChild(pixel);
    }
}

function useActiveTool(pixel) {
    const activeColor = colorPicker.value;
    
    if (currentTool === 'draw') {
        pixel.style.backgroundColor = activeColor;
    }
    else if (currentTool === 'erase') {
        pixel.style.backgroundColor = '#ffffff';
    }
    else if (currentTool === 'picker') {
        const pixelColor = pixel.style.backgroundColor;
        colorPicker.value = convertRgbToHex(pixelColor);
        setActiveTool('draw');
    }
    else if (currentTool === 'fill') {
        const allPixels = Array.from(document.querySelectorAll('.pixel'));
        const targetIndex = parseInt(pixel.dataset.index);
        const startingColor = pixel.style.backgroundColor || 'rgb(255, 255, 255)';
        runPaintBucket(allPixels, targetIndex, startingColor, convertHexToRgb(activeColor));
    }
}

function runPaintBucket(allPixels, startIndex, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    if (allPixels[startIndex].style.backgroundColor !== targetColor &&
    !(targetColor === 'rgb(255, 255, 255)' && !allPixels[startIndex].style.backgroundColor)) {
        return;
    }
    
    const pixelQueue = [startIndex];
    const scannedSet = new Set();
    
    while (pixelQueue.length > 0) {
        const current = pixelQueue.shift();
        if (scannedSet.has(current)) continue;
        scannedSet.add(current);
        
        allPixels[current].style.backgroundColor = colorPicker.value;
        
        const row = Math.floor(current / currentGridSize);
        const col = current % currentGridSize;
        
        if (col > 0) checkNeighbor(current - 1);
        if (col < currentGridSize - 1) checkNeighbor(current + 1);
        if (row > 0) checkNeighbor(current - currentGridSize);
        if (row < currentGridSize - 1) checkNeighbor(current + currentGridSize);
    }
    
    function checkNeighbor(index) {
        const pixColor = allPixels[index].style.backgroundColor || 'rgb(255, 255, 255)';
        if (pixColor === targetColor) {
            pixelQueue.push(index);
        }
    }
}

function setActiveTool(toolName) {
    currentTool = toolName;
    drawTool.classList.remove('active');
    eraseTool.classList.remove('active');
    fillTool.classList.remove('active');
    pickerTool.classList.remove('active');
    if (toolName === 'draw') drawTool.classList.add('active');
    if (toolName === 'erase') eraseTool.classList.add('active');
    if (toolName === 'fill') fillTool.classList.add('active');
    if (toolName === 'picker') pickerTool.classList.add('active');
}

drawTool.addEventListener('click', () => setActiveTool('draw'));
eraseTool.addEventListener('click', () => setActiveTool('erase'));
fillTool.addEventListener('click', () => setActiveTool('fill'));
pickerTool.addEventListener('click', () => setActiveTool('picker'));

function saveHistoryState() {
    const pixels = document.querySelectorAll('.pixel');
    const colorState = Array.from(pixels).map(p => p.style.backgroundColor || '#ffffff');
    undoStack.push(colorState);
    redoStack = [];
}

undoBtn.addEventListener('click', () => {
    if (undoStack.length === 0) return;
    const pixels = document.querySelectorAll('.pixel');
    const currentState = Array.from(pixels).map(p => p.style.backgroundColor || '#ffffff');
    redoStack.push(currentState);
    const previousState = undoStack.pop();
    pixels.forEach((pixel, i) => pixel.style.backgroundColor = previousState[i]);
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length === 0) return;
    const pixels = document.querySelectorAll('.pixel');
    const currentState = Array.from(pixels).map(p => p.style.backgroundColor || '#ffffff');
    undoStack.push(currentState);
    const nextState = redoStack.pop();
    pixels.forEach((pixel, i) => pixel.style.backgroundColor = nextState[i]);
});

togglegridBtn.addEventListener('click', () => grid.classList.toggle('show-grid'));

clearBtn.addEventListener('click', () => {
    saveHistoryState();
    document.querySelectorAll('.pixel').forEach(p => p.style.backgroundColor = '#ffffff');
});

sizeSelector.addEventListener('change', (e) => {
    currentGridSize = parseInt(e.target.value);
    undoStack = [];
    redoStack = [];
    createGrid();
});

document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        colorPicker.value = convertRgbToHex(e.target.style.backgroundColor);
    });
});

window.addEventListener('mouseup', () => isDrawing = false);

exportJsonBtn.addEventListener('click', () => {
    const colorArray = Array.from(document.querySelectorAll('.pixel')).map(p => p.style.backgroundColor || 'rgb(255, 255, 255)');
    const fileContents = { gridSize: currentGridSize, pixels: colorArray };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fileContents, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "my-pixel-art.json");
    dlAnchor.click();
});

importJsonBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = JSON.parse(evt.target.result);
            sizeSelector.value = data.gridSize;
            currentGridSize = data.gridSize;
            createGrid();
            const pixels = document.querySelectorAll('.pixel');
            pixels.forEach((pixel, i) => {
                if (data.pixels[i]) pixel.style.backgroundColor = data.pixels[i];
            });
        } catch (err) {
            alert("Oops! Something went wrong. Try checking your file.");
        }
    };
    reader.readAsText(file);
});

exportPngBtn.addEventListener('click', () => {
    const hiddenCanvas = document.createElement('canvas');
    const drawingContext = hiddenCanvas.getContext('2d');
    const crispScaleMultiplier = 16;
    
    hiddenCanvas.width = currentGridSize * crispScaleMultiplier;
    hiddenCanvas.height = currentGridSize * crispScaleMultiplier;
    
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach((pixel, index) => {
        const coordinateX = (index % currentGridSize) * crispScaleMultiplier;
        const coordinateY = Math.floor(index / currentGridSize) * crispScaleMultiplier;
        drawingContext.fillStyle = pixel.style.backgroundColor || '#ffffff';
        drawingContext.fillRect(coordinateX, coordinateY, crispScaleMultiplier, crispScaleMultiplier);
    });
    
    const triggerDownload = document.createElement('a');
    triggerDownload.download = 'my-pixel-masterpiece.png';
    triggerDownload.href = hiddenCanvas.toDataURL('image/png');
    triggerDownload.click();
});

function convertHexToRgb(hex) {
    if(!hex.startsWith('#')) return 'rgb(255, 255, 255)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function convertRgbToHex(rgb) {
    if (!rgb || rgb.startsWith('#')) return rgb || '#ffffff';
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    return "#" + ("0" + parseInt(match[1],10).toString(16)).slice(-2) +
                ("0" + parseInt(match[2],10).toString(16)).slice(-2) +
                ("0" + parseInt(match[3],10).toString(16)).slice(-2);
}

createGrid();