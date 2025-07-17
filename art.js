<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo to Sketch Converter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f4f8;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background-color: #ffffff;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .input-section, .output-section {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        .image-preview-container {
            width: 100%;
            max-width: 400px;
            min-height: 200px;
            border: 2px dashed #cbd5e1;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background-color: #f8fafc;
        }
        .image-preview {
            max-width: 100%;
            max-height: 200px;
            object-fit: contain;
            border-radius: 8px;
        }
        .canvas-container {
            width: 100%;
            max-width: 500px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        canvas {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            width: 100%;
        }
        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background-image: linear-gradient(to right, #6366f1, #8b5cf6);
            color: white;
            border: none;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
            background-image: linear-gradient(to right, #4f46e5, #7c3aed);
        }
        .btn-secondary {
            background-color: #e2e8f0;
            color: #475569;
            box-shadow: none;
            background-image: none;
            border: 1px solid #cbd5e1;
        }
        .btn-secondary:hover {
            background-color: #cbd5e1;
            color: #1e293b;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        input[type="file"] {
            display: none;
        }
        .custom-file-upload {
            border: 2px solid #6366f1;
            display: inline-block;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 8px;
            font-weight: 600;
            color: #6366f1;
            background-color: #e0e7ff;
            transition: all 0.2s ease-in-out;
        }
        .custom-file-upload:hover {
            background-color: #c7d2fe;
            border-color: #4f46e5;
            color: #4f46e5;
        }
        @media (min-width: 768px) {
            .container {
                flex-direction: row;
                align-items: flex-start;
            }
            .input-section, .output-section {
                width: 50%;
            }
        }
    </style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
    <div class="container">
        <!-- Input Section -->
        <div class="input-section">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Upload Your Photo</h2>
            <div class="image-preview-container">
                <img id="imagePreview" class="image-preview" src="" alt="Image Preview" style="display: none;">
                <span id="placeholderText" class="text-gray-400">No image selected</span>
            </div>
            <label for="imageUpload" class="custom-file-upload">
                Choose Image
            </label>
            <input type="file" id="imageUpload" accept="image/*">
        </div>

        <!-- Output Section -->
        <div class="output-section">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Sketch Output</h2>
            <div class="canvas-container">
                <canvas id="sketchCanvas"></canvas>
            </div>
            <div class="button-group">
                <button id="pencilSketchBtn" class="btn">Pencil Sketch</button>
                <button id="colorSketchBtn" class="btn">Color Sketch</button>
                <button id="invertedSketchBtn" class="btn">Inverted Sketch</button>
                <button id="downloadBtn" class="btn btn-secondary" style="display: none;">Download Sketch</button>
            </div>
        </div>
    </div>

    <script>
        const imageUpload = document.getElementById('imageUpload');
        const imagePreview = document.getElementById('imagePreview');
        const placeholderText = document.getElementById('placeholderText');
        const sketchCanvas = document.getElementById('sketchCanvas');
        const ctx = sketchCanvas.getContext('2d');
        const pencilSketchBtn = document.getElementById('pencilSketchBtn');
        const colorSketchBtn = document.getElementById('colorSketchBtn');
        const invertedSketchBtn = document.getElementById('invertedSketchBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        let originalImage = new Image();
        let currentEffect = null;

        // Function to load image and display preview
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    placeholderText.style.display = 'none';
                    originalImage.onload = () => {
                        // Set canvas dimensions to match image
                        sketchCanvas.width = originalImage.width;
                        sketchCanvas.height = originalImage.height;
                        ctx.drawImage(originalImage, 0, 0, sketchCanvas.width, sketchCanvas.height);
                        downloadBtn.style.display = 'none'; // Hide download button until an effect is applied
                        currentEffect = null; // Reset current effect
                    };
                    originalImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
                placeholderText.style.display = 'block';
                ctx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
                downloadBtn.style.display = 'none';
                currentEffect = null;
            }
        });

        // Function to apply a sketch effect
        function applySketchEffect(effectType) {
            if (!originalImage.src) {
                alert('Please upload an image first!');
                return;
            }

            // Clear canvas and draw original image
            ctx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
            ctx.drawImage(originalImage, 0, 0, sketchCanvas.width, sketchCanvas.height);

            const imageData = ctx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
            const data = imageData.data;

            // Convert to grayscale for initial processing
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;     // Red
                data[i + 1] = avg; // Green
                data[i + 2] = avg; // Blue
            }
            ctx.putImageData(imageData, 0, 0);

            // Apply Gaussian blur (simulated)
            // A more accurate Gaussian blur would involve convolution with a kernel.
            // For simplicity and performance, this is a basic approximation.
            const blurRadius = 2; // Adjust for desired blur intensity
            const blurredImageData = ctx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
            const blurredData = blurredImageData.data;

            for (let y = 0; y < sketchCanvas.height; y++) {
                for (let x = 0; x < sketchCanvas.width; x++) {
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < sketchCanvas.width && ny >= 0 && ny < sketchCanvas.height) {
                                const index = (ny * sketchCanvas.width + nx) * 4;
                                r += data[index];
                                g += data[index + 1];
                                b += data[index + 2];
                                count++;
                            }
                        }
                    }
                    const currentIndex = (y * sketchCanvas.width + x) * 4;
                    blurredData[currentIndex] = r / count;
                    blurredData[currentIndex + 1] = g / count;
                    blurredData[currentIndex + 2] = b / count;
                }
            }
            ctx.putImageData(blurredImageData, 0, 0);

            // Invert the blurred image
            const invertedImageData = ctx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
            const invertedData = invertedImageData.data;
            for (let i = 0; i < invertedData.length; i += 4) {
                invertedData[i] = 255 - invertedData[i];
                invertedData[i + 1] = 255 - invertedData[i + 1];
                invertedData[i + 2] = 255 - invertedData[i + 2];
            }
            ctx.putImageData(invertedImageData, 0, 0);

            // Blend with original grayscale using Color Dodge (simulated)
            // This is a simplified blend for demonstration.
            const finalImageData = ctx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
            const finalData = finalImageData.data;

            for (let i = 0; i < finalData.length; i += 4) {
                const originalGray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const invertedGray = (invertedData[i] + invertedData[i + 1] + invertedData[i + 2]) / 3;

                let sketchValue;
                if (invertedGray === 255) { // Avoid division by zero
                    sketchValue = originalGray;
                } else {
                    sketchValue = Math.min(255, originalGray + (originalGray * invertedGray) / (255 - invertedGray));
                }

                finalData[i] = sketchValue;
                finalData[i + 1] = sketchValue;
                finalData[i + 2] = sketchValue;
            }

            // Apply different effects based on type
            if (effectType === 'pencil') {
                // Pencil sketch is the base effect applied above
            } else if (effectType === 'color') {
                // Re-apply original color with a blend mode
                ctx.globalCompositeOperation = 'color';
                ctx.drawImage(originalImage, 0, 0, sketchCanvas.width, sketchCanvas.height);
                ctx.globalCompositeOperation = 'source-over'; // Reset blend mode
            } else if (effectType === 'inverted') {
                // Invert the final sketch output
                for (let i = 0; i < finalData.length; i += 4) {
                    finalData[i] = 255 - finalData[i];
                    finalData[i + 1] = 255 - finalData[i + 1];
                    finalData[i + 2] = 255 - finalData[i + 2];
                }
            }

            ctx.putImageData(finalImageData, 0, 0);
            downloadBtn.style.display = 'inline-block';
            currentEffect = effectType;
        }

        pencilSketchBtn.addEventListener('click', () => applySketchEffect('pencil'));
        colorSketchBtn.addEventListener('click', () => applySketchEffect('color'));
        invertedSketchBtn.addEventListener('click', () => applySketchEffect('inverted'));

        // Function to download the sketch
        downloadBtn.addEventListener('click', () => {
            if (currentEffect) {
                const link = document.createElement('a');
                link.download = `sketch-${currentEffect}.png`;
                link.href = sketchCanvas.toDataURL('image/png');
                link.click();
            } else {
                alert('Please apply a sketch effect first!');
            }
        });
    </script>
</body>
</html>
