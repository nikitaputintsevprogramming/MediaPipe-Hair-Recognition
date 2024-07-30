// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { ImageSegmenter, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";
// Get DOM elements
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const webcamPredictions = document.getElementById("webcamPredictions");
const demosSection = document.getElementById("demos");
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
let runningMode = "IMAGE";
const resultWidthHeigth = 256;
let imageSegmenter;
let labels;
const legendColors = [
    [255, 197, 0, 255], // 0 - background
    [128, 62, 117, 255], // 1 - hair
    [255, 104, 0, 255], // 2 - body-skin
    [166, 189, 215, 255], // 3 - face-skin
    [193, 0, 32, 255], // 4 - clothes
    [206, 162, 98, 255], // 5 - others (accessories)
    [129, 112, 102, 255],
    [0, 125, 52, 255],
    [246, 118, 142, 255],
    [0, 83, 138, 255],
    [255, 112, 92, 255],
    [83, 55, 112, 255],
    [255, 142, 0, 255],
    [179, 40, 81, 255],
    [244, 200, 0, 255],
    [127, 24, 13, 255],
    [147, 170, 0, 255],
    [89, 51, 21, 255],
    [241, 58, 19, 255], 
    [35, 44, 22, 255],
    [0, 161, 194, 255] // Vivid Blue
];
const createImageSegmenter = async () => {
    const audio = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm");
    imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
        baseOptions: {
            modelAssetPath: "../selfie_multiclass_256x256.tflite",
            // modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite",
            delegate: "GPU"
        },
        runningMode: runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: false
    });
    labels = imageSegmenter.getLabels();
    demosSection.classList.remove("invisible");
};
createImageSegmenter();
const imageContainers = document.getElementsByClassName("segmentOnClick");
// Add click event listeners for the img elements.
for (let i = 0; i < imageContainers.length; i++) {
    imageContainers[i]
        .getElementsByTagName("img")[0]
        .addEventListener("click", handleClick);
}
/**
 * Demo 1: Segmented images on click and display results.
 */
let canvasClick;
async function handleClick(event) {
    // Do not segmented if imageSegmenter hasn't loaded
    if (imageSegmenter === undefined) {
        return;
    }
    canvasClick = event.target.parentElement.getElementsByTagName("canvas")[0];
    canvasClick.classList.remove("removed");
    canvasClick.width = event.target.naturalWidth;
    canvasClick.height = event.target.naturalHeight;
    const cxt = canvasClick.getContext("2d");
    cxt.clearRect(0, 0, canvasClick.width, canvasClick.height);
    cxt.drawImage(event.target, 0, 0, canvasClick.width, canvasClick.height);
    event.target.style.opacity = 0;
    // if VIDEO mode is initialized, set runningMode to IMAGE
    if (runningMode === "VIDEO") {
        runningMode = "IMAGE";
        await imageSegmenter.setOptions({
            runningMode: runningMode
        });
    }
    // imageSegmenter.segment() when resolved will call the callback function.
    imageSegmenter.segment(event.target, callback);
}

const hairIndex = 1;  // Assuming the index for hair

function callback(result) {
    const cxt = canvasClick.getContext("2d");
    const { width, height } = result.categoryMask;
    let imageData = cxt.getImageData(0, 0, width, height).data;
    canvasClick.width = width;
    canvasClick.height = height;
    let category = "";
    const mask = result.categoryMask.getAsUint8Array();
    for (let i in mask) {
        if (mask[i] > 0) {
            category = labels[mask[i]];
        }
        const legendColor = legendColors[mask[i] % legendColors.length];
        imageData[i * 4] = (legendColor[0] + imageData[i * 4]) / 2;
        imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
        imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
        imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, width, height);
    cxt.putImageData(dataNew, 0, 0);

    // Find and draw hair contours
    drawContoursAroundRegion(mask, width, height, cxt);

    const p = event.target.parentNode.getElementsByClassName("classification")[0];
    p.classList.remove("removed");
    p.innerText = "Category: " + category;
}


/********************************************************************
// Палитра chosen
********************************************************************/
// Get DOM elements
const colorPicker = document.getElementById('colorPicker');
const alphaPicker = document.getElementById('alphaPicker');
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
    alert(rgbaColor);
});
// ********************************************************************

/********************************************************************
// Отрисовка границ вокруг области
********************************************************************/
function drawContoursAroundRegion(mask, width, height, ctx) {
    ctx.strokeStyle = "green";
    // ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

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

function callbackForVideo(result) {
    let imageData = canvasCtx.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
    const mask = result.categoryMask.getAsFloat32Array();
    let j = 0;
    for (let i = 0; i < mask.length; ++i) {
        const maskVal = Math.round(mask[i] * 255.0);
        const legendColor = legendColors[maskVal % legendColors.length];
        imageData[j] = (legendColor[0] + imageData[j]) / 2;
        imageData[j + 1] = (legendColor[1] + imageData[j + 1]) / 2;
        imageData[j + 2] = (legendColor[2] + imageData[j + 2]) / 2;
        imageData[j + 3] = (legendColor[3] + imageData[j + 3]) / 2;
        j += 4;
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, video.videoWidth, video.videoHeight);
    canvasCtx.putImageData(dataNew, 0, 0);
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and segmented it.
********************************************************************/
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// Get segmentation from the webcam
let lastWebcamTime = -1;
async function predictWebcam() {
    if (video.currentTime === lastWebcamTime) {
        if (webcamRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        }
        return;
    }
    lastWebcamTime = video.currentTime;
    canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    // Do not segmented if imageSegmenter hasn't loaded
    if (imageSegmenter === undefined) {
        return;
    }
    // if image mode is initialized, create a new segmented with video runningMode
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await imageSegmenter.setOptions({
            runningMode: runningMode
        });
    }
    let startTimeMs = performance.now();
    // Start segmenting the stream.
    imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
}
// Enable the live webcam view and start imageSegmentation.
async function enableCam(event) {
    if (imageSegmenter === undefined) {
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE SEGMENTATION";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE SEGMENTATION";
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
    video.addEventListener("loadeddata", predictWebcam);
}
// If webcam supported, add event listener to button.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}