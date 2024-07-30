
/********************************************************************
// Палитра chosen
********************************************************************/
// Get DOM elements
const colorPicker = document.getElementById('colorPicker');
const alphaPicker = document.getElementById('alphaSlider');
const alphaValue = document.getElementById('alphaValue');
const saveButton = document.getElementById('saveColor');
const savedColorDiv = document.getElementById('savedColor');

// Load saved color from localStorage if it exists
window.addEventListener('load', () => {
    const savedColor = localStorage.getItem('selectedColor');
    const savedAlpha = localStorage.getItem('selectedAlpha');
    if (savedColor) {
        savedColorDiv.style.backgroundColor = savedColor;
        colorPicker.value = savedColor.slice(0, 7);
        alphaPicker.value = savedAlpha ? savedAlpha : 100;
        alphaValue.textContent = `${alphaPicker.value}%`;
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
alphaPicker.addEventListener('input', () => {
    alphaValue.textContent = `${alphaPicker.value}%`;
});

// Save the selected color and alpha to localStorage and show alert with RGBA value
saveButton.addEventListener('click', () => {
    const selectedColor = colorPicker.value;
    const selectedAlpha = alphaPicker.value;
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('selectedAlpha', selectedAlpha);
    const rgbaColor = hexToRgba(selectedColor, selectedAlpha);
    savedColorDiv.style.backgroundColor = rgbaColor;
    // alert(rgbaColor);
});
// ********************************************************************

/********************************************************************
// Отрисовка границ вокруг области
********************************************************************/
const hairIndex = 1;  // Assuming the index for hair

export const drawContoursAroundRegion = (mask, width, height, ctx) => {
    const savedColor = localStorage.getItem('selectedColor');
    const savedAlpha = localStorage.getItem('selectedAlpha');
    const rgbaColor = hexToRgba(savedColor, savedAlpha);
    ctx.strokeStyle = rgbaColor;
    // ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    // ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
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