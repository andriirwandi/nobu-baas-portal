/* =============================================
   PAYOUT PAGE — payout.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    /* ----------------------------------------
       NAVBAR SCROLL + ACTIVE LINK
    ---------------------------------------- */
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const pageNavLinks = document.querySelectorAll('.qp-nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        updatePageNav();
    }, { passive: true });

    function updatePageNav() {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 160) current = s.getAttribute('id');
        });
        pageNavLinks.forEach(link => {
            link.classList.remove('active-pn');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active-pn');
        });
    }

    updatePageNav();

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

    document.addEventListener('click', e => {
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
                const top = target.getBoundingClientRect().top + window.scrollY - 130;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ----------------------------------------
       REVEAL ON SCROLL
    ---------------------------------------- */
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-section').forEach(el => revealObs.observe(el));

    /* ----------------------------------------
       FEATURE TABS
    ---------------------------------------- */
    const tabs   = document.querySelectorAll('.qp-tab');
    const panels = document.querySelectorAll('.qp-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');

            const activePanel = document.querySelector('.qp-tab-panel.active-panel');
            if (!activePanel) return;

            activePanel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            activePanel.style.opacity    = '0';
            activePanel.style.transform  = 'translateY(8px)';

            setTimeout(() => {
                activePanel.classList.remove('active-panel');
                activePanel.style.cssText = '';

                const next = document.querySelector(`.qp-tab-panel[data-panel="${target}"]`);
                if (!next) return;

                next.style.opacity   = '0';
                next.style.transform = 'translateY(8px)';
                next.classList.add('active-panel');

                requestAnimationFrame(() => {
                    next.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                    next.style.opacity    = '1';
                    next.style.transform  = 'translateY(0)';
                    setTimeout(() => { next.style.cssText = ''; }, 260);
                });
            }, 200);
        });
    });

    /* ----------------------------------------
       FAQ ACCORDION
    ---------------------------------------- */
    document.querySelectorAll('.faq-item').forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const body    = item.querySelector('.faq-body');

        // Wrap inner content
        if (body && !body.querySelector('.faq-body-inner')) {
            const inner = document.createElement('div');
            inner.className = 'faq-body-inner';
            inner.innerHTML = body.innerHTML;
            body.innerHTML  = '';
            body.appendChild(inner);
        }

        if (!trigger || !body) return;

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all others
            document.querySelectorAll('.faq-item.open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    other.querySelector('.faq-body').style.maxHeight = '0';
                }
            });

            if (isOpen) {
                item.classList.remove('open');
                body.style.maxHeight = '0';
            } else {
                item.classList.add('open');
                const inner = body.querySelector('.faq-body-inner');
                body.style.maxHeight = (inner ? inner.scrollHeight + 32 : 300) + 'px';
            }
        });
    });

    // Open first FAQ in each group
    document.querySelectorAll('.qp-faq-group').forEach(group => {
        const first = group.querySelector('.faq-item');
        if (!first) return;
        first.classList.add('open');
        const body  = first.querySelector('.faq-body');
        const inner = first.querySelector('.faq-body-inner');
        if (body && inner) body.style.maxHeight = (inner.scrollHeight + 32) + 'px';
    });

    /* ----------------------------------------
       CODE COPY BUTTONS
    ---------------------------------------- */
    document.querySelectorAll('.qp-copy-code').forEach(btn => {
        btn.addEventListener('click', () => {
            const pre = btn.closest('.qp-code-block')?.querySelector('pre');
            if (!pre) return;
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
        });
    });

    /* ============================================
       SINGLE TRANSFER SIMULATOR
       ============================================ */
    let selectedBank    = 'BCA';
    let selectedChannel = 'BI-FAST';
    let selectedAmount  = 5000000;
    let simRunning      = false;

    const FEE_MAP = { 'BI-FAST': 2500, 'RTOL': 6500, 'SKN': 2900 };
    const SPEED_MAP = { 'BI-FAST': '< 3 detik', 'RTOL': 'Real-time', 'SKN': 'D+1 Batch' };

    const poSimBtn    = document.getElementById('poSimBtn');
    const poResultIcon   = document.getElementById('poResultIcon');
    const poResultStatus = document.getElementById('poResultStatus');
    const rStatus   = document.getElementById('rStatus');
    const rChannel  = document.getElementById('rChannel');
    const rAmount   = document.getElementById('rAmount');
    const rFee      = document.getElementById('rFee');
    const rBank     = document.getElementById('rBank');
    const rDuration = document.getElementById('rDuration');
    const rTrxId    = document.getElementById('rTrxId');

    // Bank buttons
    document.querySelectorAll('.po-bank-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (simRunning) return;
            document.querySelectorAll('.po-bank-btn').forEach(b => b.classList.remove('active-bank'));
            btn.classList.add('active-bank');
            selectedBank = btn.dataset.bank;
        });
    });

    // Channel buttons
    document.querySelectorAll('.po-ch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (simRunning) return;
            document.querySelectorAll('.po-ch-btn').forEach(b => b.classList.remove('active-ch'));
            btn.classList.add('active-ch');
            selectedChannel = btn.dataset.channel;
        });
    });

    // Amount buttons
    document.querySelectorAll('.po-amt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (simRunning) return;
            document.querySelectorAll('.po-amt-btn').forEach(b => b.classList.remove('active-amt'));
            btn.classList.add('active-amt');
            selectedAmount = parseInt(btn.dataset.amount);
        });
    });

    function formatRp(num) {
        return 'Rp ' + num.toLocaleString('id-ID');
    }

    function randomTrxId() {
        return 'NBK-PAY-' + Math.floor(1000 + Math.random() * 8999);
    }

    function setResultState(state) {
        // state: idle | processing | success | failed
        poResultIcon.className = 'po-result-icon ' + (state === 'idle' ? '' : state);
        const icons = {
            idle: 'clock',
            processing: 'loader',
            success: 'check-circle',
            failed: 'x-circle'
        };
        const labels = {
            idle: 'Menunggu...',
            processing: 'Memproses transfer...',
            success: 'Transfer Berhasil ✓',
            failed: 'Transfer Gagal'
        };
        poResultIcon.innerHTML = `<i data-lucide="${icons[state]}" size="13"></i>`;
        poResultStatus.textContent = labels[state];
        poResultStatus.style.color = state === 'success' ? 'var(--green)' : state === 'failed' ? '#EF4444' : 'var(--text-secondary)';
        lucide.createIcons();
    }

    async function runSingleSim() {
        if (simRunning) return;
        simRunning = true;
        poSimBtn.disabled = true;

        const t0 = performance.now();
        setResultState('processing');
        rStatus.textContent   = 'Processing...';
        rChannel.textContent  = selectedChannel;
        rAmount.textContent   = formatRp(selectedAmount);
        rFee.textContent      = formatRp(FEE_MAP[selectedChannel]);
        rBank.textContent     = selectedBank;
        rDuration.textContent = '...';
        rTrxId.textContent    = '...';

        // Simulate processing time — BI-FAST fastest
        const delay = selectedChannel === 'BI-FAST' ? 1800
                    : selectedChannel === 'RTOL'    ? 2400
                    : 3200;

        await new Promise(r => setTimeout(r, delay));

        // 95% success rate simulation
        const success = Math.random() > 0.05;
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

        if (success) {
            setResultState('success');
            rStatus.textContent   = 'SUCCESS';
            rStatus.style.color   = 'var(--green)';
            rDuration.textContent = elapsed + 's';
            rTrxId.textContent    = randomTrxId();
        } else {
            setResultState('failed');
            rStatus.textContent  = 'FAILED — Bank timeout';
            rStatus.style.color  = '#EF4444';
            rDuration.textContent = elapsed + 's';
            rTrxId.textContent   = '-';
        }

        simRunning = false;
        poSimBtn.disabled = false;
    }

    if (poSimBtn) poSimBtn.addEventListener('click', runSingleSim);

    /* ============================================
       BULK DISBURSEMENT SIMULATOR
       ============================================ */
    let bulkRunning = false;

    const poBulkBtn      = document.getElementById('poBulkBtn');
    const poBulkProgress = document.getElementById('poBulkProgress');
    const poBpLabel      = document.getElementById('poBpLabel');
    const poBpCount      = document.getElementById('poBpCount');
    const poBpFill       = document.getElementById('poBpFill');

    const bulkRows = document.querySelectorAll('.po-bulk-row');
    const TOTAL    = bulkRows.length;

    function resetBulk() {
        bulkRows.forEach(row => {
            const status = row.querySelector('.po-bulk-status');
            status.textContent = 'Pending';
            status.className   = 'po-bulk-status idle';
            row.classList.remove('processing', 'done');
        });
        poBpFill.style.width = '0%';
        poBpCount.textContent = `0/${TOTAL}`;
        poBpLabel.textContent = 'Menunggu...';
        poBulkProgress.style.display = 'none';
    }

    async function runBulkSim() {
        if (bulkRunning) return;
        bulkRunning = true;
        poBulkBtn.disabled = true;

        resetBulk();
        poBulkProgress.style.display = 'flex';
        poBpLabel.textContent = 'Validasi batch...';

        await new Promise(r => setTimeout(r, 800));
        poBpLabel.textContent = 'Memproses transfer...';

        let done = 0;

        for (let i = 0; i < TOTAL; i++) {
            const row    = bulkRows[i];
            const status = row.querySelector('.po-bulk-status');

            // Set processing
            status.textContent = 'Processing';
            status.className   = 'po-bulk-status processing';
            row.classList.add('processing');

            // Random delay per row 400–900ms
            const delay = 400 + Math.random() * 500;
            await new Promise(r => setTimeout(r, delay));

            // 96% success
            const ok = Math.random() > 0.04;
            row.classList.remove('processing');

            if (ok) {
                status.textContent = 'Sent';
                status.className   = 'po-bulk-status sent';
                row.classList.add('done');
            } else {
                status.textContent = 'Failed';
                status.className   = 'po-bulk-status failed';
            }

            done++;
            const pct = Math.round((done / TOTAL) * 100);
            poBpFill.style.width  = pct + '%';
            poBpCount.textContent = `${done}/${TOTAL}`;
        }

        poBpLabel.textContent = `Selesai — ${TOTAL} transaksi diproses`;

        await new Promise(r => setTimeout(r, 2500));

        // Reset after showing result
        bulkRunning = false;
        poBulkBtn.disabled = false;
        resetBulk();
    }

    if (poBulkBtn) poBulkBtn.addEventListener('click', runBulkSim);

    /* ============================================
       LIVE TICKER — Hero dashboard
       ============================================ */
    const poTrxData = [
        { name: 'PT Mitra Sejahtera',  bank: 'BCA', amount: 'Rp 15.500.000', channel: 'BI-FAST', ok: true  },
        { name: 'CV Teknologi Nusa',   bank: 'BNI', amount: 'Rp 7.200.000',  channel: 'RTOL',    ok: true  },
        { name: 'Gaji Karyawan Batch', bank: 'MDR', amount: 'Rp 250.000.000',channel: 'Bulk',    ok: false },
        { name: 'Dewi Rahayu',         bank: 'BRI', amount: 'Rp 4.750.000',  channel: 'BI-FAST', ok: true  },
        { name: 'PT Sinar Digital',    bank: 'BSI', amount: 'Rp 32.000.000', channel: 'RTOL',    ok: true  },
        { name: 'CV Maju Bersama',     bank: 'BCA', amount: 'Rp 12.300.000', channel: 'BI-FAST', ok: true  },
    ];

    const poTrxList = document.getElementById('poTrxList');
    let poTrxIdx    = 2;   // start after pre-rendered 3
    let poTrxBusy   = false;

    function buildPoRow(d) {
        const el = document.createElement('div');
        el.className = 'payout-row';
        el.innerHTML = `
            <div class="payout-avatar">${d.bank}</div>
            <div class="payout-detail">
                <span class="payout-name">${d.name}</span>
                <span class="payout-meta">${d.channel} · ****${Math.floor(1000+Math.random()*8999)}</span>
            </div>
            <div class="payout-right">
                <span class="payout-amount">${d.amount}</span>
                <span class="payout-status ${d.ok ? 'sent' : 'processing'}">${d.ok ? 'Sent' : 'Processing'}</span>
            </div>`;
        return el;
    }

    if (poTrxList) {
        // Lock height
        requestAnimationFrame(() => {
            const firstRow = poTrxList.querySelector('.payout-row');
            if (firstRow) {
                const h = firstRow.offsetHeight;
                poTrxList.style.overflow = 'hidden';
                poTrxList.style.height   = (h * 3 + 6 * 2) + 'px'; // 3 rows + 2 gaps
            }
            setInterval(rotatePo, 3200);
        });
    }

    function rotatePo() {
        if (!poTrxList || poTrxBusy) return;
        poTrxBusy = true;
        poTrxIdx  = (poTrxIdx + 1) % poTrxData.length;

        const DURATION = 360;
        const old = poTrxList.querySelector('.payout-row');
        if (old) {
            old.style.transition  = `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1), opacity ${DURATION}ms, margin-top ${DURATION}ms`;
            old.style.transform   = 'translateY(-10px)';
            old.style.opacity     = '0';
            old.style.marginTop   = -(old.offsetHeight + 6) + 'px';
        }

        const neo = buildPoRow(poTrxData[poTrxIdx]);
        neo.style.transform  = 'translateY(12px)';
        neo.style.opacity    = '0';
        neo.style.transition = 'none';
        poTrxList.appendChild(neo);

        setTimeout(() => {
            if (old) old.remove();
            poTrxList.querySelectorAll('.payout-row').forEach(r => {
                r.style.marginTop  = '';
                r.style.transition = 'none';
            });
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    neo.style.transition = `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1), opacity ${DURATION}ms`;
                    neo.style.transform  = 'translateY(0)';
                    neo.style.opacity    = '1';
                });
            });
            setTimeout(() => { poTrxBusy = false; }, DURATION + 20);
        }, DURATION);
    }

});
