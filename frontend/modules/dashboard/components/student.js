/* ============================================
   DASHBOARD MODULE — Student Canvas Rendering
   ============================================ */

export function initStudent() {
    const studentCanvas = document.getElementById('studentCanvas');
    if (!studentCanvas) return;
    const studentCtx = studentCanvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        studentCanvas.width = img.width;
        studentCanvas.height = img.height;
        studentCtx.drawImage(img, 0, 0);
        const d = studentCtx.getImageData(0, 0, studentCanvas.width, studentCanvas.height);
        const px = d.data;
        for (let i = 0; i < px.length; i += 4) {
            const r = px[i], g = px[i+1], b = px[i+2];
            const br = (r + g + b) / 3;
            const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
            const sat = mx === 0 ? 0 : (mx - mn) / mx;
            if (br > 180 && sat < 0.15) {
                px[i+3] = 0;
            } else if (br > 140 && sat < 0.2) {
                px[i+3] = Math.floor(px[i+3] * Math.max(0, Math.min(1, 1 - (br - 140) / 40)));
            }
        }
        studentCtx.putImageData(d, 0, 0);
    };
    img.src = 'modules/dashboard/assets/student2.png';
}