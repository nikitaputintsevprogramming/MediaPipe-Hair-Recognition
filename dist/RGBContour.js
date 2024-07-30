
/********************************************************************
// Палитра chosen
********************************************************************/
// Get DOM elements
const colorPickerContour = document.getElementById('colorPickerContour');
const alphaSliderContour = document.getElementById('alphaSliderContour');
const alphaValueContour = document.getElementById('alphaValueContour');
const widthSliderContour = document.getElementById('widthSliderContour');
const widthValueContour = document.getElementById('widthValueContour');
const saveButton = document.getElementById('saveColor');
const savedColorDivContour = document.getElementById('savedColorContour');

// Load saved color from localStorage if it exists
window.addEventListener('load', () => {
    const savedColorContour = localStorage.getItem('selectedColorContour');
    const savedAlpha = localStorage.getItem('selectedAlpha');
    const savedWidth = localStorage.getItem('selectedWidth');
    // alert(savedWidth);
    if (savedColorContour) {
        savedColorDivContour.style.backgroundColor = savedColorContour;
        colorPickerContour.value = savedColorContour.slice(0, 7);
        alphaSliderContour.value = savedAlpha ? savedAlpha : 100;
        widthSliderContour.value = savedWidth ? savedWidth : 2;
        alphaValueContour.textContent = `${alphaSliderContour.value}%`;
        widthValueContour.textContent = `${widthSliderContour.value}%`;
        savedColorDivContour.style.height = savedWidth + 'px';
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
alphaSliderContour.addEventListener('input', () => {
    alphaValueContour.textContent = `${alphaSliderContour.value}%`;
});

widthSliderContour.addEventListener('input', () => {
    const selectedWidth = widthSliderContour.value;
    widthValueContour.textContent = `${selectedWidth}%`;
    savedColorDivContour.style.height = selectedWidth + 'px';
});

// Save the selected color and alpha to localStorage and show alert with RGBA value
saveButton.addEventListener('click', () => {
    const selectedColorContour = colorPickerContour.value;
    const selectedAlpha = alphaSliderContour.value;
    const selectedWidth = widthSliderContour.value;
    localStorage.setItem('selectedColorContour', selectedColorContour);
    localStorage.setItem('selectedAlpha', selectedAlpha);
    localStorage.setItem('selectedWidth', selectedWidth);
    const rgbaColor = hexToRgba(selectedColorContour, selectedAlpha);
    savedColorDivContour.style.backgroundColor = rgbaColor;
    savedColorDivContour.style.height = selectedWidth + 'px';
    // alert(savedColorDivContour.height);
});
// ********************************************************************

/********************************************************************
// Отрисовка границ вокруг области
********************************************************************/
const hairIndex = 1;  // Assuming the index for hair

export const drawContoursAroundRegion = (mask, width, height, ctx) => {
    const savedColorContour = localStorage.getItem('selectedColorContour');
    const savedAlpha = localStorage.getItem('selectedAlpha');
    const savedWidth = localStorage.getItem('selectedWidth');
    const rgbaColor = hexToRgba(savedColorContour, 100-savedAlpha);
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