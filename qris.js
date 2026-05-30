/* =============================================
   QRIS DETAIL PAGE — qris.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    /* ----------------------------------------
       NAVBAR SCROLL
    ---------------------------------------- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        updatePageNav();
    }, { passive: true });

    /* ----------------------------------------
       HAMBURGER MOBILE
    ---------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });

    /* ----------------------------------------
       SMOOTH SCROLL
    ---------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 130; // navbar + page nav height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ----------------------------------------
       STICKY PAGE NAV — active link tracking
    ---------------------------------------- */
    const pageNavLinks = document.querySelectorAll('.qp-nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updatePageNav() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 160;
            if (window.scrollY >= top) current = section.getAttribute('id');
        });

        pageNavLinks.forEach(link => {
            link.classList.remove('active-pn');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active-pn');
            }
        });
    }

    updatePageNav();

    /* ----------------------------------------
       REVEAL ON SCROLL
    ---------------------------------------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-section').forEach(el => {
        revealObserver.observe(el);
    });

    /* ----------------------------------------
       FEATURE TABS
    ---------------------------------------- */
    const tabs    = document.querySelectorAll('.qp-tab');
    const panels  = document.querySelectorAll('.qp-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Update tabs
            tabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');

            // Fade out → swap → fade in
            const activePanel = document.querySelector('.qp-tab-panel.active-panel');
            if (activePanel) {
                activePanel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                activePanel.style.opacity    = '0';
                activePanel.style.transform  = 'translateY(8px)';

                setTimeout(() => {
                    activePanel.classList.remove('active-panel');
                    activePanel.style.opacity   = '';
                    activePanel.style.transform = '';
                    activePanel.style.transition = '';

                    const nextPanel = document.querySelector(`.qp-tab-panel[data-panel="${target}"]`);
                    if (nextPanel) {
                        nextPanel.style.opacity   = '0';
                        nextPanel.style.transform = 'translateY(8px)';
                        nextPanel.classList.add('active-panel');

                        requestAnimationFrame(() => {
                            nextPanel.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                            nextPanel.style.opacity    = '1';
                            nextPanel.style.transform  = 'translateY(0)';
                            setTimeout(() => {
                                nextPanel.style.transition = '';
                                nextPanel.style.opacity    = '';
                                nextPanel.style.transform  = '';
                            }, 260);
                        });
                    }
                }, 200);
            }
        });
    });

    /* ----------------------------------------
       FAQ ACCORDION
    ---------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const body    = item.querySelector('.faq-body');

        // Wrap inner content for padding
        if (body && !body.querySelector('.faq-body-inner')) {
            const inner = document.createElement('div');
            inner.className = 'faq-body-inner';
            inner.innerHTML = body.innerHTML;
            body.innerHTML  = '';
            body.appendChild(inner);
        }

        if (trigger && body) {
            trigger.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all others
                faqItems.forEach(other => {
                    if (other !== item && other.classList.contains('open')) {
                        other.classList.remove('open');
                        const otherBody = other.querySelector('.faq-body');
                        if (otherBody) otherBody.style.maxHeight = '0';
                    }
                });

                // Toggle current
                if (isOpen) {
                    item.classList.remove('open');
                    body.style.maxHeight = '0';
                } else {
                    item.classList.add('open');
                    // Measure real height
                    const inner = body.querySelector('.faq-body-inner');
                    body.style.maxHeight = (inner ? inner.scrollHeight + 32 : 300) + 'px';
                }
            });
        }
    });

    /* ----------------------------------------
       LIVE TICKER (reuse same logic as index)
    ---------------------------------------- */
    const trxData = [
        { label: 'Issuer E-Wallet — Toko ABC',   amount: 'Rp 125.000',   time: 'baru saja' },
        { label: 'Issuer Bank — Cross-border',    amount: 'Rp 890.000',   time: '5s ago'    },
        { label: 'Issuer E-Wallet — Merchant B',  amount: 'Rp 340.000',   time: '11s ago'   },
        { label: 'Issuer Fintech — Online Shop',  amount: 'Rp 2.150.000', time: '18s ago'   },
        { label: 'Issuer E-Wallet — F&B',         amount: 'Rp 67.500',    time: '27s ago'   },
        { label: 'Issuer Bank — Cross-border SGD', amount: 'Rp 1.420.000', time: '33s ago'  },
    ];

    const trxList   = document.getElementById('qpTrxLive');
    const MAX_ITEMS = 2;
    let trxIndex    = MAX_ITEMS - 1;
    let trxBusy     = false;

    function buildItem(data) {
        const el = document.createElement('div');
        el.className = 'trx-item';
        el.innerHTML = `
            <div class="trx-dot success"></div>
            <div class="trx-info">
                <span>${data.label}</span>
                <span class="trx-amt">${data.amount}</span>
            </div>
            <span class="trx-time">${data.time}</span>`;
        return el;
    }

    if (trxList) {
        trxList.style.overflow = 'hidden';
        trxList.style.position = 'relative';

        requestAnimationFrame(() => {
            const firstItem = trxList.querySelector('.trx-item');
            if (firstItem) {
                const itemH  = firstItem.offsetHeight;
                const gap    = 8;
                const locked = itemH * MAX_ITEMS + gap * (MAX_ITEMS - 1);
                trxList.style.height = locked + 'px';
            }
            setInterval(rotateTicker, 3500);
        });
    }

    function rotateTicker() {
        if (!trxList || trxBusy) return;
        trxBusy = true;

        trxIndex = (trxIndex + 1) % trxData.length;
        const data     = trxData[trxIndex];
        const DURATION = 380;

        const oldItem = trxList.querySelector('.trx-item');
        if (oldItem) {
            oldItem.style.transition  = `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1), opacity ${DURATION}ms cubic-bezier(0.4,0,0.2,1), margin-top ${DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
            oldItem.style.transform   = 'translateY(-12px)';
            oldItem.style.opacity     = '0';
            oldItem.style.marginTop   = -(oldItem.offsetHeight + 8) + 'px';
        }

        const newItem = buildItem(data);
        newItem.style.transform  = 'translateY(14px)';
        newItem.style.opacity    = '0';
        newItem.style.transition = 'none';
        trxList.appendChild(newItem);

        setTimeout(() => {
            if (oldItem) oldItem.remove();
            trxList.querySelectorAll('.trx-item').forEach(el => {
                el.style.marginTop  = '';
                el.style.transition = 'none';
            });

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    newItem.style.transition = `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1), opacity ${DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
                    newItem.style.transform  = 'translateY(0)';
                    newItem.style.opacity    = '1';
                });
            });

            setTimeout(() => { trxBusy = false; }, DURATION + 20);
        }, DURATION);
    }

    /* ----------------------------------------
       CODE COPY BUTTONS
    ---------------------------------------- */
    document.querySelectorAll('.qp-copy-code').forEach(btn => {
        btn.addEventListener('click', () => {
            const pre = btn.closest('.qp-code-block').querySelector('pre');
            if (pre) {
                navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
                    btn.innerHTML = '<i data-lucide="check" size="12"></i>';
                    btn.style.color = 'var(--green)';
                    lucide.createIcons();
                    setTimeout(() => {
                        btn.innerHTML = '<i data-lucide="copy" size="12"></i>';
                        btn.style.color = '';
                        lucide.createIcons();
                    }, 2000);
                }).catch(() => {});
            }
        });
    });

    /* ----------------------------------------
       OPEN FIRST FAQ IN EACH GROUP BY DEFAULT
    ---------------------------------------- */
    document.querySelectorAll('.qp-faq-group').forEach(group => {
        const firstItem = group.querySelector('.faq-item');
        if (firstItem) {
            firstItem.classList.add('open');
            const body  = firstItem.querySelector('.faq-body');
            const inner = firstItem.querySelector('.faq-body-inner');
            if (body && inner) {
                body.style.maxHeight = (inner.scrollHeight + 32) + 'px';
            }
        }
    });

    /* ============================================
       QRIS SOUNDBOX SIMULATOR
       ============================================ */

    // ── State ──────────────────────────────────
    let sbSelectedAmount = 75000;
    let sbSelectedMethod = 'NOBU QRIS';
    let sbVolume         = 0.8;
    let sbIsRunning      = false;
    let sbAudioCtx       = null;

    // ── DOM refs ──────────────────────────────
    const sbTriggerBtn    = document.getElementById('sbTriggerBtn');
    const sbLogBody       = document.getElementById('sbLogBody');
    const sbLogClear      = document.getElementById('sbLogClear');
    const sbProgressFill  = document.getElementById('sbProgressFill');
    const sbSoundWaves    = document.getElementById('sbSoundWaves');
    const sbSoundBadge    = document.getElementById('sbSoundBadge');
    const sbLed           = document.getElementById('sbLed');
    const sbVolSlider     = document.getElementById('sbVolume');
    const sbVolPct        = document.getElementById('sbVolPct');

    if (!sbTriggerBtn) { return; }

    // ── AudioContext (lazy) ────────────────────
    function getSbAudioCtx() {
        if (!sbAudioCtx || sbAudioCtx.state === 'closed') {
            sbAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (sbAudioCtx.state === 'suspended') sbAudioCtx.resume();
        return sbAudioCtx;
    }

    // ── Helpers ───────────────────────────────
    function formatRp(num) {
        return 'Rp ' + num.toLocaleString('id-ID');
    }

    function randomTrxId() {
        return Math.floor(1000 + Math.random() * 8999).toString();
    }

    function sbWait(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    // ── Log ───────────────────────────────────
    function sbLog(msg, type = 'info') {
        const time  = new Date().toTimeString().slice(0, 8);
        const entry = document.createElement('div');
        entry.className = `sb-log-entry ${type}`;
        entry.innerHTML = `<span class="sb-log-time">${time}</span><span class="sb-log-msg">${msg}</span>`;
        sbLogBody.appendChild(entry);
        sbLogBody.scrollTop = sbLogBody.scrollHeight;
    }

    // ── Switch screen state ───────────────────
    function sbShowState(stateId) {
        document.querySelectorAll('.sb-state').forEach(s => s.classList.add('hidden'));
        const el = document.getElementById(stateId);
        if (!el) return;

        if (stateId === 'sbStateSuccess') {
            // Clone to re-trigger CSS animations
            const clone = el.cloneNode(true);
            el.parentNode.replaceChild(clone, el);
            clone.classList.remove('hidden');
            // Populate values
            const amtEl = clone.querySelector('#sbSuccessAmount');
            const viaEl = clone.querySelector('#sbSuccessVia');
            const tidEl = clone.querySelector('#sbTrxId');
            if (amtEl) amtEl.textContent = formatRp(sbSelectedAmount);
            if (viaEl) viaEl.textContent = 'via ' + sbSelectedMethod;
            if (tidEl) tidEl.textContent = randomTrxId();
        } else {
            el.classList.remove('hidden');
        }
    }

    // ── Step indicator ────────────────────────
    function sbSetStep(n) {
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById(`sbStep${i}`);
            if (!el) continue;
            el.classList.remove('active-step', 'done-step');
            if (i < n)   el.classList.add('done-step');
            if (i === n) el.classList.add('active-step');
        }
    }

    // ── Audio: chime ──────────────────────────
    function playSbChime() {
        try {
            const ctx    = getSbAudioCtx();
            const master = ctx.createGain();
            master.gain.setValueAtTime(sbVolume * 0.55, ctx.currentTime);
            master.connect(ctx.destination);

            const notes = [
                { freq: 523.25, t: 0,    dur: 0.25 },
                { freq: 659.25, t: 0.15, dur: 0.25 },
                { freq: 783.99, t: 0.30, dur: 0.25 },
                { freq: 1046.5, t: 0.48, dur: 0.55 },
            ];

            notes.forEach(({ freq, t, dur }) => {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
                gain.gain.setValueAtTime(0, ctx.currentTime + t);
                gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + t + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
                osc.connect(gain);
                gain.connect(master);
                osc.start(ctx.currentTime + t);
                osc.stop(ctx.currentTime + t + dur + 0.05);
            });
        } catch(e) { console.warn('Audio error', e); }
    }

    // ── Audio: attention beep ─────────────────
    function playSbBeep() {
        try {
            const ctx    = getSbAudioCtx();
            const master = ctx.createGain();
            master.gain.setValueAtTime(sbVolume * 0.35, ctx.currentTime);
            master.connect(ctx.destination);

            [0, 0.13].forEach(t => {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, ctx.currentTime + t);
                gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.09);
                osc.connect(gain);
                gain.connect(master);
                osc.start(ctx.currentTime + t);
                osc.stop(ctx.currentTime + t + 0.1);
            });
        } catch(e) {}
    }

    // ── TTS Speech ────────────────────────────
    // iOS 17 Safari Fix:
    // speak() WAJIB dipanggil synchronous dalam gesture handler.
    // Trick: speak() langsung dengan rate sangat lambat & volume=0 (diam)
    // — ini "membuka kunci" izin TTS di iOS Safari.
    // Setelah animasi selesai (~5.5s): cancel, tunggu 80ms, speak asli.
    // iOS mengizinkan speak() di setTimeout karena izin sudah terbuka.

    let sbTtsTimer = null;

    function scheduleSbTts(amount, method) {
        if (!window.speechSynthesis) return;

        if (sbTtsTimer) { clearTimeout(sbTtsTimer); sbTtsTimer = null; }
        window.speechSynthesis.cancel();

        const amountWords = amount.toLocaleString('id-ID').replace(/\./g, ' ');
        const text = `Pembayaran diterima. ${amountWords} rupiah. Melalui ${method}. Terima kasih.`;

        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('ms'));

        function buildUtter(vol) {
            const u = new SpeechSynthesisUtterance(text);
            u.lang   = 'id-ID';
            u.rate   = 0.88;
            u.pitch  = 1.05;
            u.volume = vol;
            if (idVoice) u.voice = idVoice;
            return u;
        }

        // LANGKAH 1 — Speak diam (volume 0, rate sangat lambat) SEKARANG dalam gesture
        // iOS membuka izin TTS saat speak() dipanggil synchronous di sini
        const silentUtter = buildUtter(0);
        silentUtter.rate = 0.1;
        window.speechSynthesis.speak(silentUtter);

        // LANGKAH 2 — Setelah animasi (~5.5s): cancel silent, speak asli
        sbTtsTimer = setTimeout(() => {
            sbTtsTimer = null;
            window.speechSynthesis.cancel();

            // iOS perlu jeda 80ms setelah cancel sebelum speak baru
            setTimeout(() => {
                const realUtter = buildUtter(sbVolume);

                // iOS keepalive: cegah Safari memotong TTS di tengah jalan
                const keepAlive = setInterval(() => {
                    if (!window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }, 5000);
                realUtter.onend   = () => clearInterval(keepAlive);
                realUtter.onerror = () => clearInterval(keepAlive);

                window.speechSynthesis.speak(realUtter);
            }, 80);
        }, 5500);
    }

        // ── Main simulation ───────────────────────
    async function runSbSimulation() {
        if (sbIsRunning) return;
        sbIsRunning = true;
        sbTriggerBtn.disabled = true;
        lucide.createIcons();

        // Reset UI
        sbShowState('sbStateIdle');
        sbSetStep(1);
        sbSoundWaves.classList.remove('playing');
        sbSoundBadge.classList.remove('visible');
        sbLed.className = 'sb-led';
        sbProgressFill.style.width = '0%';

        // STEP 1 — Idle / awaiting scan
        sbLog('[QRIS] Nobu Acquirer active · QR displayed on screen', 'info');
        sbLog('[QRIS] Awaiting Issuer scan...', 'info');
        await sbWait(1400);

        // STEP 2 — QR scanned
        sbSetStep(2);
        sbLog(`[SCAN] QR scanned by ${sbSelectedMethod}`, 'system');
        sbLog(`[QRIS] Dynamic token validated · amount ${formatRp(sbSelectedAmount)}`, 'system');
        await sbWait(700);

        // STEP 3 — Processing
        sbSetStep(3);
        sbShowState('sbStateScanning');
        sbLed.className = 'sb-led processing';
        sbLog(`[NET]  Payment forwarded to ${sbSelectedMethod} gateway`, 'process');
        sbLog('[BI]   SNAP BI Acquirer validation in progress...', 'process');

        // Animate progress bar over 2.4s
        const PROG_MS = 2400;
        const t0 = performance.now();
        await new Promise(resolve => {
            (function tick(now) {
                const pct = Math.min(((now - t0) / PROG_MS) * 100, 100);
                sbProgressFill.style.width = pct + '%';
                if (pct < 100) requestAnimationFrame(tick);
                else resolve();
            })(performance.now());
        });

        sbLog('[BI]   SNAP BI validation · PASSED ✓', 'success');
        sbLog(`[NET]  Settlement queued · T+1 · NBK-TRX-${randomTrxId()}`, 'success');
        await sbWait(280);

        // STEP 4 — Success + Sound
        sbSetStep(4);
        sbShowState('sbStateSuccess');
        sbLed.className = 'sb-led success';
        sbLog(`[PAID] ${formatRp(sbSelectedAmount)} · ${sbSelectedMethod} · SUCCESS ✓`, 'success');
        sbLog('[TTS]  Playing audio announcement...', 'system');

        // Sounds
        playSbBeep();
        await sbWait(300);
        playSbChime();
        await sbWait(450);
        // TTS sudah dijadwalkan via scheduleSbTts() saat tombol diklik

        // Animate sound waves + badge
        sbSoundWaves.classList.add('playing');
        sbSoundBadge.classList.add('visible');

        await sbWait(3400);
        sbSoundWaves.classList.remove('playing');
        sbSoundBadge.classList.remove('visible');

        sbLog('[SYS]  Audio complete · resetting to idle...', 'info');
        await sbWait(1000);

        // Back to idle
        sbShowState('sbStateIdle');
        sbSetStep(1);
        sbLed.className = 'sb-led';

        sbIsRunning = false;
        sbTriggerBtn.disabled = false;
        lucide.createIcons();
    }

    // ── Amount buttons ────────────────────────
    document.querySelectorAll('.sb-amt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (sbIsRunning) return;
            document.querySelectorAll('.sb-amt-btn').forEach(b => b.classList.remove('active-amt'));
            btn.classList.add('active-amt');
            sbSelectedAmount = parseInt(btn.dataset.amount);
        });
    });

    // ── Method buttons ────────────────────────
    document.querySelectorAll('.sb-method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (sbIsRunning) return;
            document.querySelectorAll('.sb-method-btn').forEach(b => b.classList.remove('active-method'));
            btn.classList.add('active-method');
            sbSelectedMethod = btn.dataset.method;
        });
    });

    // ── Volume slider ─────────────────────────
    if (sbVolSlider) {
        sbVolSlider.addEventListener('input', () => {
            sbVolume = parseFloat(sbVolSlider.value);
            if (sbVolPct) sbVolPct.textContent = Math.round(sbVolume * 100) + '%';
        });
    }

    // ── Trigger button ────────────────────────
    // scheduleSbTts() HARUS dipanggil synchronous di sini (dalam gesture)
    // sebelum runSbSimulation() yang async. Ini satu-satunya cara TTS
    // bekerja di iOS Safari & Android Chrome.
    sbTriggerBtn.addEventListener('click', () => {
        if (sbIsRunning) return;
        scheduleSbTts(sbSelectedAmount, sbSelectedMethod); // ← sync, dalam gesture
        runSbSimulation();                                  // ← async, mulai animasi
    });

    // ── Log clear button ─────────────────────
    if (sbLogClear) {
        sbLogClear.addEventListener('click', () => {
            sbLogBody.innerHTML = '';
            sbLog('Log cleared · Nobu Soundbox v2.1 ready', 'info');
        });
    }

    // ── Preload TTS voices ────────────────────
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            window.speechSynthesis.getVoices();
        });
    }

    // ── Timestamp initial log entries ─────────
    const nowStr = new Date().toTimeString().slice(0, 8);
    document.querySelectorAll('#sbLogBody .sb-log-time').forEach(el => {
        el.textContent = nowStr;
    });

});
