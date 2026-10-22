/* ============================================================
   TIMETABLE — Confirm Dialog Component
   A native in-app modal dialog that replaces window.confirm/alert/prompt.
   Renders into a dedicated overlay portal and resolves a Promise<boolean|string>.
   ============================================================ */

const DIALOG_PORTAL_ID = 'wsDialogPortal';

/**
 * Ensures a single shared dialog portal node exists in the DOM.
 * @returns {HTMLElement}
 */
function _getPortal() {
    let portal = document.getElementById(DIALOG_PORTAL_ID);
    if (!portal) {
        portal = document.createElement('div');
        portal.id = DIALOG_PORTAL_ID;
        document.body.appendChild(portal);
    }
    return portal;
}

/**
 * Shows a confirmation dialog and returns a Promise<boolean>.
 * @param {Object} options
 * @param {string}  options.title       - Dialog heading text
 * @param {string}  options.message     - Body message (supports HTML)
 * @param {string}  [options.confirmLabel='Confirm']    - Confirm button label
 * @param {string}  [options.cancelLabel='Cancel']      - Cancel button label
 * @param {'danger'|'warn'|'default'} [options.variant='default'] - Button color variant
 * @returns {Promise<boolean>}
 */
export function showConfirm({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default' }) {
    return new Promise((resolve) => {
        const portal = _getPortal();

        const overlay = document.createElement('div');
        overlay.className = 'ws-dialog-overlay';
        overlay.innerHTML = `
            <div class="ws-dialog" role="dialog" aria-modal="true" aria-labelledby="wsDlgTitle">
                <div class="ws-dialog-header">
                    <h2 class="ws-dialog-title" id="wsDlgTitle">${title}</h2>
                </div>
                <div class="ws-dialog-body">
                    <p class="ws-dialog-message">${message}</p>
                </div>
                <div class="ws-dialog-footer">
                    <button type="button" class="ws-dlg-btn ws-dlg-cancel" id="wsDlgCancel">${cancelLabel}</button>
                    <button type="button" class="ws-dlg-btn ws-dlg-confirm ws-dlg-confirm--${variant}" id="wsDlgConfirm">${confirmLabel}</button>
                </div>
            </div>
        `;

        portal.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('ws-dialog-overlay--visible');
        });

        function _close(result) {
            overlay.classList.remove('ws-dialog-overlay--visible');
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
            }, { once: true });
            resolve(result);
        }

        overlay.querySelector('#wsDlgConfirm').addEventListener('click', () => _close(true));
        overlay.querySelector('#wsDlgCancel').addEventListener('click', () => _close(false));

        // Click outside to dismiss (cancel)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) _close(false);
        });

        // Keyboard support
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') _close(false);
            if (e.key === 'Enter') _close(true);
        });

        // Focus the confirm button
        overlay.querySelector('#wsDlgConfirm').focus();
    });
}

/**
 * Shows a simple prompt dialog and returns a Promise<string|null>.
 * Resolves with the entered string, or null if cancelled.
 * @param {Object} options
 * @param {string}  options.title        - Dialog heading
 * @param {string}  options.message      - Label above input
 * @param {string}  [options.placeholder=''] - Input placeholder
 * @param {string}  [options.confirmLabel='OK']
 * @param {string}  [options.cancelLabel='Cancel']
 * @returns {Promise<string|null>}
 */
export function showPrompt({ title, message, placeholder = '', confirmLabel = 'OK', cancelLabel = 'Cancel' }) {
    return new Promise((resolve) => {
        const portal = _getPortal();

        const overlay = document.createElement('div');
        overlay.className = 'ws-dialog-overlay';
        overlay.innerHTML = `
            <div class="ws-dialog" role="dialog" aria-modal="true" aria-labelledby="wsDlgTitle">
                <div class="ws-dialog-header">
                    <h2 class="ws-dialog-title" id="wsDlgTitle">${title}</h2>
                </div>
                <div class="ws-dialog-body">
                    <label class="ws-dialog-message" for="wsDlgInput">${message}</label>
                    <input type="text" id="wsDlgInput" class="ws-dlg-input" placeholder="${placeholder}" autocomplete="off" />
                </div>
                <div class="ws-dialog-footer">
                    <button type="button" class="ws-dlg-btn ws-dlg-cancel" id="wsDlgCancel">${cancelLabel}</button>
                    <button type="button" class="ws-dlg-btn ws-dlg-confirm ws-dlg-confirm--default" id="wsDlgConfirm">${confirmLabel}</button>
                </div>
            </div>
        `;

        portal.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('ws-dialog-overlay--visible');
        });

        const input = overlay.querySelector('#wsDlgInput');

        function _close(result) {
            overlay.classList.remove('ws-dialog-overlay--visible');
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
            }, { once: true });
            resolve(result);
        }

        overlay.querySelector('#wsDlgConfirm').addEventListener('click', () => {
            const val = input.value.trim();
            _close(val.length > 0 ? val : null);
        });

        overlay.querySelector('#wsDlgCancel').addEventListener('click', () => _close(null));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) _close(null);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.trim();
                _close(val.length > 0 ? val : null);
            }
            if (e.key === 'Escape') _close(null);
        });

        // Focus the input
        input.focus();
    });
}
