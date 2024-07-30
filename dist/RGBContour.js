
/********************************************************************
// Палитра chosen
********************************************************************/
// Get DOM elements
const colorPicker = document.getElementById('colorPicker');
const alphaSlider = document.getElementById('alphaSlider');
const alphaValue = document.getElementById('alphaValue');
const widthSlider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');
const saveButton = document.getElementById('saveColor');
const savedColorDiv = document.getElementById('savedColor');

// Load saved color from localStorage if it exists
window.addEventListener('load', () => {
    const savedColor = localStorage.getItem('selectedColor');
    const savedAlpha = localStorage.getItem('selectedAlpha');
    const savedWidth = localStorage.getItem('selectedWidth');
    // alert(savedWidth);
    if (savedColor) {
        savedColorDiv.style.backgroundColor = savedColor;
        colorPicker.value = savedColor.slice(0, 7);
        alphaSlider.value = savedAlpha ? savedAlpha : 100;
        widthSlider.value = savedWidth ? savedWidth : 2;
        alphaValue.textContent = `${alphaSlider.value}%`;
        widthValue.textContent = `${widthSlider.value}%`;
        savedColorDiv.style.height = savedWidth + 'px';
    }
});

// Convert HEX to RGBA
function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
}

// Update alpha value label
alphaSlider.addEventListener('input', () => {
    alphaValue.textContent = `${alphaSlider.value}%`;
});

widthSlider.addEventListener('input', () => {
    const selectedWidth = widthSlider.value;
    widthValue.textContent = `${selectedWidth}%`;
    savedColorDiv.style.height = selectedWidth + 'px';
});

// Save the selected color and alpha to localStorage and show alert with RGBA value
saveButton.addEventListener('click', () => {
    const selectedColor = colorPicker.value;
    const selectedAlpha = alphaSlider.value;
    const selectedWidth = widthSlider.value;
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('selectedAlpha', selectedAlpha);
    localStorage.setItem('selectedWidth', selectedWidth);
    const rgbaColor = hexToRgba(selectedColor, selectedAlpha);
    savedColorDiv.style.backgroundColor = rgbaColor;
    savedColorDiv.style.height = selectedWidth + 'px';
    // alert(savedColorDiv.height);
});
// ********************************************************************

/********************************************************************
// Отрисовка границ вокруг области
********************************************************************/
const hairIndex = 1;  // Assuming the index for hair

export const drawContoursAroundRegion = (mask, width, height, ctx) => {
    const savedColor = localStorage.getItem('selectedColor');
    const savedAlpha = localStorage.getItem('selectedAlpha');
    const savedWidth = localStorage.getItem('selectedWidth');
    const rgbaColor = hexToRgba(savedColor, 100-savedAlpha);
    ctx.strokeStyle = rgbaColor;
    // ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    // ctx.strokeStyle = "green";
    ctx.lineWidth = savedWidth;
    console.log('Mask:', mask);
    console.log('Width:', width);
    console.log('Height:', height);
    // Simplified contour detection
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let index = y * width + x;
            if (mask[index] == hairIndex) {
                if (mask[index - 1] != hairIndex || mask[index + 1] != hairIndex ||
                    mask[index - width] != hairIndex || mask[index + width] != hairIndex) {
                    ctx.strokeRect(x, y, 1, 1);
                }
            }
        }
    }
}
// ********************************************************************