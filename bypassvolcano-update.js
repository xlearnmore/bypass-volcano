(() => {
    'use strict';

    const host = location.hostname; // check host
    const debug = true // enable debug logs (console)

    // Bahasa diatur ke 'en' secara permanen
    let currentLanguage = 'en';

    // Translations (hanya 'en' yang tersisa)
    const translations = {
        en: {
            title: "Xlearnmore Volcano",
            pleaseSolveCaptcha: "Please solve the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved successfully",
            redirectingToWork: "Redirecting to Work.ink...",
            bypassSuccessCopy: "Bypass successful! Key copied (click 'Allow' if prompted)",
            waitingCaptcha: "Waiting for CAPTCHA...",
            pleaseReload: "Please reload the page...(workink bugs)",
            bypassSuccess: "Bypass successful, waiting {time}s...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA solved successfully, bypassing...",
            version: "Version v1.6.2.9",
            madeBy: "Rework by Xlearnmore (based on IHaxU & DyRian)"
        }
    };

    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return text;
    }

    class BypassPanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.panel = null;
            this.statusText = null;
            this.statusDot = null;
            this.versionEl = null;
            this.creditEl = null;
            this.currentMessageKey = null;
            this.currentType = 'info';
            this.currentReplacements = {};
            this.isMinimized = false;
            this.body = null;
            this.minimizeBtn = null;
            this.init();
        }

        init() {
            this.createPanel();
            this.setupEventListeners();
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            const style = document.createElement('style');
            style.textContent = `
                * { margin: 0; padding: 0; box-sizing: border-box; }

                /* --- [START] MODERN UI: NEUMORPHISM + GLASS + SYSTEM THEME --- */

                .panel-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 400px;
                    z-index: 2147483647;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    
                    /* --- Variabel Tema Terang (LIGHT MODE) --- */
                    --glass-bg: rgba(255, 255, 255, 0.6);
                    --glass-border: rgba(255, 255, 255, 0.75);
                    --panel-shadow: 0 8px 32px 0 rgba(136, 136, 136, 0.3);
                    --text-primary: #1F1F1F;
                    --text-secondary: #4a4a4a;
                    --accent-color: #667eea;
                    
                    /* Variabel Neumorphism (Light) */
                    --neumorphism-base: #F0F2F5;
                    --neumorphism-shadow-dark: 5px 5px 10px #bebebe;
                    --neumorphism-shadow-light: -5px -5px 10px #ffffff;
                    --neumorphism-shadow-inset-dark: inset 5px 5px 10px #bebebe;
                    --neumorphism-shadow-inset-light: inset -5px -5px 10px #ffffff;
                }

                @media (prefers-color-scheme: dark) {
                    .panel-container {
                        /* --- Variabel Tema Gelap (DARK MODE) --- */
                        --glass-bg: rgba(30, 30, 45, 0.7);
                        --glass-border: rgba(255, 255, 255, 0.1);
                        --panel-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                        --text-primary: #EAEAEA;
                        --text-secondary: #a0a0a0;
                        --accent-color: #7699ff;

                        /* Variabel Neumorphism (Dark) */
                        --neumorphism-base: #252830;
                        --neumorphism-shadow-dark: 5px 5px 12px #1c1e24;
                        --neumorphism-shadow-light: -5px -5px 12px #2e323c;
                        --neumorphism-shadow-inset-dark: inset 5px 5px 12px #1c1e24;
                        --neumorphism-shadow-inset-light: inset -5px -5px 12px #2e323c;
                    }
                }

                .panel {
                    /* [STYLE] Glassmorphism */
                    background: var(--glass-bg);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--panel-shadow);
                    
                    border-radius: 16px;
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transition: all 0.3s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px) scale(0.9); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }

                .header {
                    background: transparent; /* Transparan agar efek glass terlihat */
                    padding: 16px 20px;
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--glass-border); /* Pemisah tipis */
                }

                .title {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-primary);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                .minimize-btn {
                    /* [STYLE] Neumorphism (Outset) */
                    background: var(--neumorphism-base);
                    box-shadow: var(--neumorphism-shadow-dark), var(--neumorphism-shadow-light);
                    border: none;
                    color: var(--text-secondary);
                    
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    font-size: 20px;
                    font-weight: 700;
                }

                .minimize-btn:hover {
                    color: var(--text-primary);
                }

                .minimize-btn:active {
                    /* [STYLE] Neumorphism (Inset - on click) */
                    box-shadow: var(--neumorphism-shadow-inset-dark), var(--neumorphism-shadow-inset-light);
                    transform: scale(0.95);
                }

                .status-section {
                    padding: 20px;
                    border-bottom: 1px solid var(--glass-border);
                }

                .status-box {
                    /* [STYLE] Neumorphism (Inset) */
                    background: var(--neumorphism-base);
                    box-shadow: var(--neumorphism-shadow-inset-dark), var(--neumorphism-shadow-inset-light);
                    
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                    z-index: 1;
                }

                .status-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                    box-shadow: 0 0 12px currentColor;
                    flex-shrink: 0;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.15); }
                }

                .status-dot.info { background: #60a5fa; }
                .status-dot.success { background: #4ade80; }
                .status-dot.warning { background: #facc15; }
                .status-dot.error { background: #f87171; }

                .status-text {
                    color: var(--text-primary);
                    font-size: 14px;
                    font-weight: 500;
                    flex: 1;
                    line-height: 1.5;
                }

                .panel-body {
                    max-height: 500px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    opacity: 1;
                }

                .panel-body.hidden {
                    max-height: 0;
                    opacity: 0;
                }

                .info-section {
                    padding: 16px 20px;
                    background: transparent;
                }

                .version, .credit {
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    text-align: center;
                }

                .credit-author {
                    color: var(--accent-color);
                    font-weight: 700;
                }

                .links {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    font-size: 11px;
                }

                .links a {
                    color: var(--accent-color);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .links a:hover {
                    text-decoration: underline;
                    opacity: 0.8;
                }

                @media (max-width: 480px) {
                    .panel-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        width: auto;
                    }
                }
                /* --- [END] MODERN UI --- */
            `;

            this.shadow.appendChild(style);

            const panelHTML = `
                <div class="panel-container">
                    <div class="panel">
                        <div class="header">
                            <div class="title">${t('title')}</div>
                            <button class="minimize-btn" id="minimize-btn">−</button>
                        </div>
                        <div class="status-section">
                            <div class="status-box">
                                <div class="status-content">
                                    <div class="status-dot info" id="status-dot"></div>
                                    <div class="status-text" id="status-text">${t('pleaseSolveCaptcha')}</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel-body" id="panel-body">
                            <div class="info-section">
                                <div class="version" id="version">${t('version')}</div>
                                <div class="credit" id="credit">
                                    ${t('madeBy')}
                                </div>
                                <div class="links">
                                    <a href="https://www.youtube.com/@dyydeptry" target="_blank">YouTube</a>
                                    <a href="https://discord.gg/DWyEfeBCzY" target="_blank">Discord</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = panelHTML;
            this.shadow.appendChild(wrapper.firstElementChild);

            this.panel = this.shadow.querySelector('.panel');
            this.statusText = this.shadow.querySelector('#status-text');
            this.statusDot = this.shadow.querySelector('#status-dot');
            this.versionEl = this.shadow.querySelector('#version');
            this.creditEl = this.shadow.querySelector('#credit');
            this.body = this.shadow.querySelector('#panel-body');
            this.minimizeBtn = this.shadow.querySelector('#minimize-btn');

            document.documentElement.appendChild(this.container);
        }

        setupEventListeners() {
            this.minimizeBtn.addEventListener('click', () => {
                this.isMinimized = !this.isMinimized;
                this.body.classList.toggle('hidden');
                this.minimizeBtn.textContent = this.isMinimized ? '+' : '−';
            });
        }

        show(messageKey, type = 'info', replacements = {}) {
            this.currentMessageKey = messageKey;
            this.currentType = type;
            this.currentReplacements = replacements;

            const message = t(messageKey, replacements);
            this.statusText.textContent = message;
            this.statusDot.className = `status-dot ${type}`;
        }
    }

    let panel = null;
    setTimeout(() => { panel = new BypassPanel(); panel.show('pleaseSolveCaptcha', 'info'); }, 100);

    
    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();

    function handleVolcano() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');
        if (debug) console.log('[Debug] Waiting Captcha');

        let alreadyDoneContinue = false;
        let alreadyDoneCopy = false;

        function actOnCheckpoint(node) {
            if (!alreadyDoneContinue) {
                const buttons = node && node.nodeType === 1
                    ? node.matches('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                        ? [node]
                        : node.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                    : document.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]');
                for (const btn of buttons) {
                    const text = (btn.innerText || btn.value || "").trim().toLowerCase();
                    if (text.includes("continue") || text.includes("next step")) {
                        const disabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";
                        const style = getComputedStyle(btn);
                        const visible = style.display !== "none" && style.visibility !== "hidden" && btn.offsetParent !== null;
                        if (visible && !disabled) {
                            alreadyDoneContinue = true;
                            if (panel) panel.show('captchaSuccess', 'success');
                            if (debug) console.log('[Debug] Captcha Solved');

                            for (const btn of buttons) {
                                const currentBtn = btn;
                                const currentPanel = panel;

                                setTimeout(() => {
                                    try {
                                        currentBtn.click();
                                        if (currentPanel) currentPanel.show('redirectingToWork', 'info');
                                        if (debug) console.log('[Debug] Clicking Continue');
                                    } catch (err) {
                                        if (debug) console.log('[Debug] No Continue Found', err);
                                    }
                                }, 300);
                            }
                            return true;
                        }
                    }
                }
            }

            const copyBtn = node && node.nodeType === 1
                ? node.matches("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                    ? node
                    : node.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                : document.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']");
            if (copyBtn) {
                setInterval(() => {
                    try {
                        copyBtn.click();
                        if (debug) console.log('[Debug] Copy button spam click');
                        if (panel) panel.show('bypassSuccessCopy', 'success');
                    } catch (err) {
                        if (debug) console.log('[Debug] No Copy Found', err);
                    }
                }, 500);
                return true;
            }

            return false;
        }

        const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (actOnCheckpoint(node)) {
                                if (alreadyDoneCopy) {
                                    mo.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                }
                if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                    if (actOnCheckpoint(mutation.target)) {
                        if (alreadyDoneCopy) {
                            mo.disconnect();
                            return;
                        }
                    }
                }
            }
        });

        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'style'] });

        if (actOnCheckpoint()) {
            if (alreadyDoneCopy) {
                mo.disconnect();
            }
        }
    }

    function handleWorkInk() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');

        const startTime = Date.now();
        let sessionController = undefined;
        let sendMessageA = undefined;
        let onLinkInfoA = undefined;
        let onLinkDestinationA = undefined;
        let bypassTriggered = false;
        let destinationReceived = false;

        const map = {
            onLI: ["onLinkInfo"],
            onLD: ["onLinkDestination"]
        };

        function resolveName(obj, candidates) {
            if (!obj || typeof obj !== "object") {
                return { fn: null, index: -1, name: null };
            }
            
            for (let i = 0; i < candidates.length; i++) {
                const name = candidates[i];
                if (typeof obj[name] === "function") {
                    return { fn: obj[name], index: i, name };
                }
            }
            return { fn: null, index: -1, name: null };
        }

        function resolveWriteFunction(obj) {
            if (!obj || typeof obj !== "object") {
                return { fn: null, index: -1, name: null };
            }
            
            for (let i in obj) {
                if (typeof obj[i] === "function" && obj[i].length === 2) {
                    return { fn: obj[i], name: i };
                }
            }
            return { fn: null, index: -1, name: null };
        }

        const types = {
            mo: 'c_monetization',
            ss: 'c_social_started',
            tr: 'c_turnstile_response',
            ad: 'c_adblocker_detected',
        };

        function triggerBypass(reason) {
            if (bypassTriggered) {
                if (debug) console.log('[Debug] trigger Bypass skipped, already triggered');
                return;
            }
            bypassTriggered = true;
            if (debug) console.log('[Debug] trigger Bypass via:', reason);
            if (panel) panel.show('captchaSuccessBypassing', 'success');
            
            let retryCount = 0;
            function keepSpoofing() {
                if (destinationReceived) {
                    if (debug) console.log('[Debug] Destination received, stopping spoofing after', retryCount, 'attempts');
                    return;
                }
                retryCount++;
                if (debug) console.log(`[Debug] Spoofing attempt #${retryCount}`);
                spoofWorkink();
                setTimeout(keepSpoofing, 3000);
            }
            keepSpoofing();
            if (debug) console.log('[Debug] Waiting for server to send destination data...');
        }

        function spoofWorkink() {
            if (!sessionController?.linkInfo) {
                if (debug) console.log('[Debug] spoof Workink skipped: no sessionController.linkInfo');
                return;
            }
            if (debug) console.log('[Debug] spoof Workink starting, linkInfo:', sessionController.linkInfo);
            
            const socials = sessionController.linkInfo.socials || [];
            if (debug) console.log('[Debug] Total socials to fake:', socials.length);
            
            for (let i = 0; i < socials.length; i++) {
                const soc = socials[i];
                try {
                    if (sendMessageA) {
                        sendMessageA.call(this, types.ss, { url: soc.url });
                        if (debug) console.log(`[Debug] Faked social [${i+1}/${socials.length}]:`, soc.url);
                    } else {
                        if (debug) console.warn(`[Debug] No send message for social [${i+1}/${socials.length}]:`, soc.url);
                    }
                } catch (e) {
                    if (debug) console.error(`[Debug] Error faking social [${i+1}/${socials.length}]:`, soc.url, e);
                }
            }
            
            const monetizations = sessionController.linkInfo.monetizations || [];
            if (debug) console.log('[Debug] Total monetizations to fake:', monetizations.length);
            
            for (let i = 0; i < monetizations.length; i++) {
                const monetization = monetizations[i];
                try {
                    switch (monetization) {
                        case 22:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'readArticles2', payload: { event: 'read' } });
                            if (debug) console.log(`[Debug] Faked readArticles2 [${i+1}/${monetizations.length}]`);
                            break;
                        case 25:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'operaGX', payload: { event: 'start' } });
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'operaGX', payload: { event: 'installClicked' } });
                            fetch('https://work.ink/_api/v2/callback/operaGX', {
                                method: 'POST',
                                mode: 'no-cors',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ noteligible: true })
                            }).catch((e) => { if (debug) console.warn('[Debug] operaGX fetch failed:', e); });
                            if (debug) console.log(`[Debug] Faked operaGX [${i+1}/${monetizations.length}]`);
                            break;
                        case 34:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'norton', payload: { event: 'start' } });
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'norton', payload: { event: 'installClicked' } });
                            if (debug) console.log(`[Debug] Faked norton [${i+1}/${monetizations.length}]`);
                            break;
                        case 71:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'externalArticles', payload: { event: 'start' } });
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'externalArticles', payload: { event: 'installClicked' } });
                            if (debug) console.log(`[Debug] Faked externalArticles [${i+1}/${monetizations.length}]`);
                            break;
                        case 45:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'pdfeditor', payload: { event: 'installed' } });
                            if (debug) console.log(`[Debug] Faked pdfeditor [${i+1}/${monetizations.length}]`);
                            break;
                        case 57:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'betterdeals', payload: { event: 'installed' } });
                            if (debug) console.log(`[Debug] Faked betterdeals [${i+1}/${monetizations.length}]`);
                            break;
                        default:
                            if (debug) console.log(`[Debug] Unknown monetization [${i+1}/${monetizations.length}]:`, monetization);
                    }
                } catch (e) {
                    if (debug) console.error(`[Debug] Error faking monetization [${i+1}/${monetizations.length}]:`, monetization, e);
                }
            }
            
            if (debug) console.log('[Debug] spoof Workink completed');
        }

        function createSendMessageProxy() {
            return function(...args) {
                const pt = args[0];
                const pd = args[1];
                
                if (pt !== types.ping) {
                    if (debug) console.log('[Debug] Message sent:', pt, pd);
                }
                
                if (pt === types.ad) {
                    if (debug) console.log('[Debug] Blocking adblocker message');
                    return;
                }
                
                if (sessionController?.linkInfo && pt == types.tr) {
                    if (debug) console.log('[Debug] Captcha bypassed via TR');
                    triggerBypass('tr');
                }
                
                return sendMessageA ? sendMessageA.apply(this, args) : undefined;
            };
        }

        function createLinkInfoProxy() {
            return function(...args) {
                const [info] = args;
                if (debug) console.log('[Debug] Link info:', info);
                try {
                    Object.defineProperty(info, 'isAdblockEnabled', {
                        get: () => false,
                        set: () => {},
                        configurable: false,
                        enumerable: true
                    });
                    if (debug) console.log('[Debug] Adblock disabled in linkInfo');
                } catch (e) {
                    if (debug) console.warn('[Debug] Define Property failed:', e);
                }
                return onLinkInfoA ? onLinkInfoA.apply(this, args): undefined;
            };
        }

        function redirect(url) {
            if (debug) console.log('[Debug] Redirecting to:', url);
            window.location.href = url;
        }

        function startCountdown(url, waitLeft) {
            if (debug) console.log('[Debug] startCountdown: Started with', waitLeft, 'seconds');
            if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });

            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (debug) console.log('[Debug] startCountdown: Time remaining:', waitLeft);
                    if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

function createDestinationProxy() {
            return function(...args) {
                const [data] = args;
                const secondsPassed = (Date.now() - startTime) / 1000;
                destinationReceived = true;
                if (debug) console.log('[Debug] Destination data:', data);

                // --- MODIFIKASI: PAKSA 5 DETIK ---
                let waitTimeSeconds = 5; // Selalu diatur ke 5 detik
                // const url = location.href; // Baris ini tidak diperlukan lagi
                // Logika 'if' untuk 38 detik dihapus
                // --- AKHIR MODIFIKASI ---

                if (secondsPassed >= waitTimeSeconds) {
                    if (panel) panel.show('backToCheckpoint', 'info');
                    redirect(data.url);
                } else {
                    startCountdown(data.url, waitTimeSeconds - secondsPassed);
                }
                return onLinkDestinationA ? onLinkDestinationA.apply(this, args): undefined;
            };
        }

        function setupProxies() {
            const send = resolveWriteFunction(sessionController);
            const info = resolveName(sessionController, map.onLI);
            const dest = resolveName(sessionController, map.onLD);

            if (!send.fn || !info.fn || !dest.fn) return;

            sendMessageA = send.fn;
            onLinkInfoA = info.fn;
            onLinkDestinationA = dest.fn;

            try {
                Object.defineProperty(sessionController, send.name, {
                    get: createSendMessageProxy,
                    set: v => (sendMessageA = v),
                    configurable: true
                });
                Object.defineProperty(sessionController, info.name, {
                    get: createLinkInfoProxy,
                    set: v => (onLinkInfoA = v),
                    configurable: true
                });
                Object.defineProperty(sessionController, dest.name, {
                    get: createDestinationProxy,
                    set: v => (onLinkDestinationA = v),
                    configurable: true
                });
                if (debug) console.log('[Debug] setupProxies: Proxies set successfully');
            } catch (e) {
                if (debug) console.warn('[Debug] setupProxies: Failed to set proxies:', e);
            }
        }

        function checkController(target, prop, value) {
            if (value &&
                typeof value === 'object' &&
                resolveWriteFunction(value).fn &&
                resolveName(value, map.onLI).fn &&
                resolveName(value, map.onLD).fn &&
                !sessionController) {
                sessionController = value;
                if (debug) console.log('[Debug] Controller detected:', sessionController);
                setupProxies();
            } else {
                if (debug) console.log('[Debug] checkController: No controller found for prop:', prop);
            }
            return Reflect.set(target, prop, value);
        }

        function createComponentProxy(comp) {
            return new Proxy(comp, {
                construct(target, args) {
                    const instance = Reflect.construct(target, args);
                    if (instance.$$.ctx) {
                        instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController });
                    }
                    return instance;
                }
            });
        }

        function createNodeProxy(node) {
            return async (...args) => {
                const result = await node(...args);
                return new Proxy(result, {
                    get: (t, p) => p === 'component' ? createComponentProxy(t.component) : Reflect.get(t, p)
                });
            };
        }

        function createKitProxy(kit) {
            if (!kit?.start) return [false, kit];
            return [
                true,
                new Proxy(kit, {
                    get(target, prop) {
                        if (prop === 'start') {
                            return function(...args) {
                                const [nodes, , opts] = args;
                                if (nodes?.nodes && opts?.node_ids) {
                                    const idx = opts.node_ids[1];
                                    if (nodes.nodes[idx]) {
                                        nodes.nodes[idx] = createNodeProxy(nodes.nodes[idx]);
                                    }
                                }
                                return kit.start.apply(this, args);
                            };
                        }
                        return Reflect.get(target, prop);
                    }
                })
            ];
        }

        function setupInterception() {
            const origPromiseAll = unsafeWindow.Promise.all;
            let intercepted = false;

            unsafeWindow.Promise.all = async function(promises) {
                const result = origPromiseAll.call(this, promises);
                if (!intercepted) {
                    intercepted = true;
                    return await new Promise((resolve) => {
                        result.then(([kit, app, ...args]) => {
                            if (debug) console.log('[Debug]: Set up Interception!');

                            const [success, created] = createKitProxy(kit);
                            if (success) {
                                unsafeWindow.Promise.all = origPromiseAll;
                                if (debug) console.log('[Debug]: Kit ready', created, app);
                            }
                            resolve([created, app, ...args]);
                        });
                    });
                }
                return await result;
            };
        }

        window.googletag = {cmd: [], _loaded_: true};

        const blockedClasses = [
            "adsbygoogle",
            "adsense-wrapper",
            "inline-ad",
            "gpt-billboard-container"
        ];

        const blockedIds = [
            "billboard-1",
            "billboard-2",
            "billboard-3",
            "sidebar-ad-1",
            "skyscraper-ad-1"
        ];

        setupInterception();

        const ob = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1) {
                        blockedClasses.forEach((cls) => {
                            if (node.classList?.contains(cls)) {
                                node.remove();
                                if (debug) console.log('[Debug]: Removed ad by class:', cls, node);
                            }
                            node.querySelectorAll?.(`.${cls}`).forEach((el) => {
                                el.remove();
                                if (debug) console.log('[Debug]: Removed nested ad by class:', cls, el);
                            });
                        });
                        
                        blockedIds.forEach((id) => {
                            if (node.id === id) {
                                node.remove();
                                if (debug) console.log('[Debug]: Removed ad by id:', id, node);
                            }
                            node.querySelectorAll?.(`#${id}`).forEach((el) => {
                                el.remove();
                                if (debug) console.log('[Debug]: Removed nested ad by id:', id, el);
                            });
                        });
                        
                        if (node.matches('.button.large.accessBtn.pos-relative.svelte-bv7qlp') && node.textContent.includes('Go To Destination')) {
                            if (debug) console.log('[Debug] GTD button detected');
                            
                            if (!bypassTriggered) {
                                if (debug) console.log('[Debug] GTD: Waiting for linkInfo...');
                                
                                let gtdRetryCount = 0;
                                
                                function checkAndTriggerGTD() {
                                    const ctrl = sessionController;
                                    const dest = resolveName(ctrl, map.onLD);
                                    
                                    if (ctrl && ctrl.linkInfo && dest.fn) {
                                        triggerBypass('gtd');
                                        if (debug) console.log('[Debug] Captcha bypassed via GTD after', gtdRetryCount, 'seconds');
                                    } else {
                                        gtdRetryCount++;
                                        if (debug) console.log(`[Debug] GTD retry ${gtdRetryCount}s: Still waiting for linkInfo...`);
                                        if (panel) panel.show('pleaseReload', 'info');
                                        setTimeout(checkAndTriggerGTD, 1000);
                                    }
                                }
                                
                                checkAndTriggerGTD();
                                
                            } else {
                                if (debug) console.log('[Debug] GTD ignored: bypass already triggered via TR');
                            }
                        }
                    }
                }
            }
        });
        ob.observe(document.documentElement, { childList: true, subtree: true });
    }

})();