/* ============================================================
   FOCUS MONITORING — Face Landmark Overlay Subcomponent
   Renders the canvas overlay directly on top of the video feed.
   Calculates coordinates and draws a futuristic facial landmark mesh.
   ============================================================ */

/**
 * Draws the face landmarker connections and landmark dots on top of the webcam feed.
 * @param {HTMLElement} container
 * @param {import('../../contracts/FocusMonitoringContract.js').LandmarkPoint[]} landmarks
 * @param {boolean} faceDetected
 * @param {HTMLVideoElement|null} video - Used to match clientWidth/clientHeight dimensions.
 */
export function renderFaceLandmarkOverlay(container, landmarks, faceDetected, video) {
    if (!container) return;

    let canvas = container.querySelector('#fmCanvas');
    if (!canvas) {
        container.innerHTML = `<canvas id="fmCanvas" class="fm-canvas"></canvas>`;
        canvas = container.querySelector('#fmCanvas');
    }

    const ctx = canvas.getContext('2d');

    // Sync canvas sizing with the actual HTML video container
    if (video && video.clientWidth > 0 && video.clientHeight > 0) {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
    } else {
        canvas.width = 320;
        canvas.height = 240;
    }

    // Always clear previous frame before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!faceDetected || !landmarks || landmarks.length === 0) {
        return;
    }

    const W = canvas.width;
    const H = canvas.height;

    // Project normalized 0.0 - 1.0 coordinates to absolute canvas pixel values
    const pts = landmarks.map(p => ({
        x: p.x * W,
        y: p.y * H
    }));

    // Draw main contour connecting lines
    ctx.save();
    ctx.strokeStyle = 'rgba(80, 190, 255, 0.65)';
    ctx.lineWidth = 1.0;

    const drawContour = (indices, close = false) => {
        if (indices.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(pts[indices[0]].x, pts[indices[0]].y);
        for (let i = 1; i < indices.length; i++) {
            if (pts[indices[i]]) {
                ctx.lineTo(pts[indices[i]].x, pts[indices[i]].y);
            }
        }
        if (close) {
            ctx.closePath();
        }
        ctx.stroke();
    };

    // 1. Jawline Face Outline
    const jawline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    drawContour(jawline, true);

    // 2. Left Eye Loop
    const leftEye = [33, 160, 158, 133, 153, 144];
    drawContour(leftEye, true);

    // 3. Right Eye Loop
    const rightEye = [263, 385, 387, 362, 373, 380];
    drawContour(rightEye, true);

    // 4. Eyebrows
    const leftEyebrow = [70, 63, 105, 66, 107];
    const rightEyebrow = [300, 293, 334, 296, 336];
    drawContour(leftEyebrow, false);
    drawContour(rightEyebrow, false);

    // 5. Nose Bridge and bottom base
    const noseVert = [168, 6, 197, 195, 94];
    const noseBase = [98, 97, 2, 327, 326];
    drawContour(noseVert, false);
    drawContour(noseBase, false);

    // 6. Lips Outline
    const lips = [61, 37, 0, 267, 291, 314, 17, 84, 61];
    drawContour(lips, true);

    // 7. Futuristic cross connections
    const crossEdges = [
        [107, 168], [300, 168], // Eyebrow corners to bridge
        [133, 168], [362, 168], // Eye inner corners to bridge
        [107, 197], [336, 197], // Eyebrows to mid nose
        [58, 2], [288, 2],       // Cheek points to nose tip
        [61, 152], [291, 152],   // Mouth corners to chin
        [132, 61], [361, 291],   // Jaw margins to mouth corners
        [10, 168], [94, 152]     // Forehead to nose and nose base to chin
    ];

    ctx.strokeStyle = 'rgba(80, 190, 255, 0.35)';
    ctx.beginPath();
    crossEdges.forEach(([a, b]) => {
        if (pts[a] && pts[b]) {
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
        }
    });
    ctx.stroke();

    ctx.restore();

    // Draw landmark dots
    ctx.save();
    ctx.fillStyle = 'rgba(140, 220, 255, 0.85)';
    const dotIndices = [
        ...jawline, ...leftEye, ...rightEye, ...leftEyebrow, ...rightEyebrow, ...noseVert, ...noseBase, ...lips
    ];
    // Deduplicate array values
    const uniqueIndices = Array.from(new Set(dotIndices));
    uniqueIndices.forEach(idx => {
        const p = pts[idx];
        if (p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();
}
