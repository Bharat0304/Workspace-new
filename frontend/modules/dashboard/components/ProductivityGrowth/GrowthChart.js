/* ============================================================
   PRODUCTIVITY GROWTH — Growth Chart Subcomponent
   Manually builds a responsive SVG visual graph matching the reference
   design layout: Study Time (orange bars), Focus Score (gray bars), and
   Productivity Index (white line).
   ============================================================ */

/**
 * Draws the SVG bar/line chart, axis, and labels.
 * @param {HTMLElement} container
 * @param {import('../../contracts/DashboardContracts.js').GrowthPoint[]} history
 */
export function renderGrowthChart(container, history) {
    if (!container || !history || history.length === 0) return;

    // ViewBox dimensions matching visual guidelines
    const W = 600;
    const H = 320;

    const padL = 60;
    const padR = 30;
    const padT = 30;
    const padB = 60;

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const bottomY = H - padB;

    // Y scaling helper (0 to 8 range)
    const getY = (val) => padT + plotH - (val / 8) * plotH;

    // Calculate cluster centers for 4 points
    const interval = plotW / 5;
    const pts = history.map((pt, i) => {
        const x = padL + (i + 1) * interval;
        const y = getY(pt.productivityIndex);
        return { x, y };
    });

    // Generate path for the white spline line (Productivity Index)
    let curvePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        curvePath += ` C ${cpX.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }

    // Horizontal dashed grid guidelines at values 0, 2, 4, 6, 8
    const yTicks = [0, 2, 4, 6, 8];
    const gridLines = yTicks.map(val => {
        const y = getY(val);
        return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" class="pg-grid-line" />`;
    }).join('');

    // Axis label values (Y-axis numbers)
    const yLabels = yTicks.map(val => {
        const y = getY(val);
        return `<text x="${padL - 10}" y="${y + 3}" class="pg-label-y">${val}</text>`;
    }).join('');

    // X-axis period ticks
    const xLabels = history.map((pt, i) => {
        const x = pts[i].x;
        return `<text x="${x}" y="${bottomY + 20}" class="pg-label-x">${pt.period}</text>`;
    }).join('');

    // Render bars and markers
    let barsHtml = '';
    let valueLabelsHtml = '';
    let markersHtml = '';
    let hoverZonesHtml = '';

    history.forEach((pt, i) => {
        const xCenter = pts[i].x;
        const hOrange = (pt.studyTime / 8) * plotH;
        const hGray = (pt.focusScore / 8) * plotH;

        const xOrange = xCenter - 22;
        const xGray = xCenter + 2;

        const yOrange = bottomY - hOrange;
        const yGray = bottomY - hGray;

        // Render orange bar (Study Time)
        barsHtml += `
            <rect
                x="${xOrange}" y="${yOrange}" width="20" height="${hOrange}"
                class="pg-bar pg-bar-orange" fill="url(#pgOrangeGrad)" rx="3"
            >
                <animate attributeName="height" from="0" to="${hOrange}" dur="0.9s" begin="0.1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4, 0, 0.2, 1" />
                <animate attributeName="y" from="${bottomY}" to="${yOrange}" dur="0.9s" begin="0.1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4, 0, 0.2, 1" />
            </rect>
        `;

        // Render dark gray bar (Focus Score)
        barsHtml += `
            <rect
                x="${xGray}" y="${yGray}" width="20" height="${hGray}"
                class="pg-bar pg-bar-gray" fill="url(#pgGrayGrad)" rx="3"
            >
                <animate attributeName="height" from="0" to="${hGray}" dur="0.9s" begin="0.15s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4, 0, 0.2, 1" />
                <animate attributeName="y" from="${bottomY}" to="${yGray}" dur="0.9s" begin="0.15s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4, 0, 0.2, 1" />
            </rect>
        `;

        // Value text labels above bars/dots (Day 1 studyTime above orange, others index above white dots)
        if (i === 0) {
            valueLabelsHtml += `
                <text x="${xOrange + 10}" y="${yOrange - 6}" class="pg-val-lbl pg-val-lbl-orange">${pt.studyTime}</text>
            `;
        } else {
            const yDot = pts[i].y;
            valueLabelsHtml += `
                <text x="${xCenter}" y="${yDot - 10}" class="pg-val-lbl pg-val-lbl-orange" text-anchor="middle">${pt.productivityIndex.toFixed(1)}</text>
            `;
        }

        // Render gray values above gray bars
        valueLabelsHtml += `
            <text x="${xGray + 10}" y="${yGray - 6}" class="pg-val-lbl pg-val-lbl-gray">${pt.focusScore.toFixed(1)}</text>
        `;

        // Render white circular markers for spline points
        markersHtml += `
            <circle
                cx="${pts[i].x.toFixed(1)}" cy="${pts[i].y.toFixed(1)}" r="4.5"
                class="pg-chart-marker"
            />
        `;

        // Transparent full-height hover hitboxes
        hoverZonesHtml += `
            <rect
                x="${xCenter - 30}" y="${padT}" width="60" height="${plotH}"
                class="pg-hover-hitbox"
                data-index="${i}"
            />
        `;
    });

    // Centered axis label math
    const centerY = padT + plotH / 2;
    const centerX = padL + plotW / 2;

    container.innerHTML = `
        <div class="pg-chart-container">
            <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" class="pg-svg">
                <defs>
                    <!-- Orange gradient for Study Time bars -->
                    <linearGradient id="pgOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ea580c" />
                        <stop offset="100%" stop-color="#7c2d12" />
                    </linearGradient>
                    <!-- Gray gradient for Focus Score bars -->
                    <linearGradient id="pgGrayGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#4b5563" />
                        <stop offset="100%" stop-color="#1f2937" />
                    </linearGradient>
                </defs>

                <!-- Guideline grid tracks -->
                <g>${gridLines}</g>

                <!-- Rotated Axis Labels -->
                <text x="-${centerY}" y="15" transform="rotate(-90)" class="pg-axis-title-y">STUDY HOURS / SCORE</text>
                <text x="${centerX}" y="${H - 12}" class="pg-axis-title-x">TIME PERIOD</text>

                <!-- Axis lines -->
                <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${bottomY}" class="pg-axis-line" />
                <line x1="${padL}" y1="${bottomY}" x2="${W - padR}" y2="${bottomY}" class="pg-axis-line" />

                <!-- Dual dataset bars -->
                <g>${barsHtml}</g>

                <!-- Connecting white spline line -->
                <path d="${curvePath}" class="pg-line-curve" />

                <!-- White circles markers -->
                <g>${markersHtml}</g>

                <!-- Direct value labels above items -->
                <g>${valueLabelsHtml}</g>

                <!-- Grid ticks axis labels -->
                <g>${yLabels}</g>
                <g>${xLabels}</g>

                <!-- Transparent hover zones -->
                <g>${hoverZonesHtml}</g>
            </svg>
            <div class="pg-tooltip" id="pgTooltip"></div>
        </div>
    `;

    // Bind hover details to overlay tooltip
    const tooltip = container.querySelector('#pgTooltip');
    const hitboxes = container.querySelectorAll('.pg-hover-hitbox');
    const markers = container.querySelectorAll('.pg-chart-marker');

    hitboxes.forEach(hitbox => {
        hitbox.addEventListener('mouseenter', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            const pt = history[idx];
            const p = pts[idx];

            // Highlights the active dot marker
            markers.forEach((m, mIdx) => {
                if (mIdx === idx) {
                    m.classList.add('active');
                } else {
                    m.classList.remove('active');
                }
            });

            // Calculate change variance compared to previous period index
            const isFirst = idx === 0;
            const diffText = isFirst 
                ? `Initial Checkpoint` 
                : `↑ +${pt.diff.toFixed(1)} from previous checkpoint`;

            tooltip.innerHTML = `
                <div class="pg-tooltip-time">${pt.period}</div>
                
                <div class="pg-tooltip-row">
                    <span class="pg-tooltip-label">Study Time</span>
                    <span class="pg-tooltip-val">${pt.studyTime} hrs</span>
                </div>
                <div class="pg-tooltip-row">
                    <span class="pg-tooltip-label">Focus Score</span>
                    <span class="pg-tooltip-val">${pt.focusScore.toFixed(1)}</span>
                </div>
                <div class="pg-tooltip-row">
                    <span class="pg-tooltip-label">Productivity Index</span>
                    <span class="pg-tooltip-val font-highlight">${pt.productivityIndex.toFixed(1)}</span>
                </div>
                
                <div class="pg-tooltip-badge">${diffText}</div>
            `;

            // Coordinate percentage alignments inside relative wrapper
            const xPct = (p.x / W) * 100;
            const yPct = (p.y / H) * 100;
            tooltip.style.left = `${xPct}%`;
            tooltip.style.top = `${yPct}%`;

            tooltip.classList.add('visible');
        });

        hitbox.addEventListener('mouseleave', () => {
            markers.forEach(m => m.classList.remove('active'));
            tooltip.classList.remove('visible');
        });
    });
}
