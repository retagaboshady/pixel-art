const grid = document.getElementById('pixelGrid');
const colorPicker = document.getElementById('colorPicker');
const sizeSelector = document.getElementById('sizeSelector');
const togglegridBtn = document.getElementById('toggleGrid');
const clearBtn = document.getElementById('clearbtn');
const drawTool = document.getElementById('drawtool');
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

function creatGrid() {
    grid.innerHTML = '';
    grid.style.gridTamplateColumns = `repeat(${currentGridSize}, ${Math.floor(550 / currentGridSize)}px)`;
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
            }
        });
        grid.appendChild(pixel);
    }
}

function useActivetool(pixel) {
    const activeColor = colorPicker.ariaValueMax;
    if (currentTool === 'draw') {
        pixel.style.backgroundColor = activeColor;
    }
    else if (currentTool === 'erase') {
        pixel.style.backgroundColor = '#ffffff';
    }
    else if (currentTool === 'picker') {
        const pixelColor = pixel.style.background;
        colorPicker.value = convertrgbToHex(pixelColor);
        setActiveTool('draw');
    }
    else if (currentTool === 'fill') {
        const allPixels = Array.from(document.querySelectorAll('.pixel'));
        const targrtIndex = parseInt(pixel.dataset.index);
        const startingColor = pixel.style.backgroundColor || 'rgb(255, 255, 255';
        runPaintbucket(allPixels, targetIndex, startingColor, convertHexTorgb(activeColor));
    }
}


function runPaintaBaucket(allPixels, startIndex, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    if (allPixels[startindex].style.backgroundColor !== targetColor &&
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
        if (col > 0) checkNeighbor(current -1);
        if (col < currentGridSize - 1) checkNeighbor(current +1);
        if (row > 0) checkNeighbor(current - currentGridSize);
        if (row < currentGridSize - 1) checkNeighbor(current + currentGridSize);
    }
    function checkNeighbor(index) {
        const pixColor = allPixels[index].style.backgroundColor || 'rgb(255, 255, 255';
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
