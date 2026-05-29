/* =============================================
   MADERA PAGE — madera.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    /* ── NAVBAR SCROLL ── */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        updatePageNav();
        updateJourney();
    }, { passive: true });

    /* ── HAMBURGER ── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });
    document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
    }));
    document.addEventListener('click', e => {
        if (!navbar.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });

    /* ── SMOOTH SCROLL ── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 130, behavior: 'smooth' });
            }
        });
    });

    /* ── PAGE NAV ACTIVE ── */
    const pnavLinks = document.querySelectorAll('.md-pnav-link');
    function updatePageNav() {
        let current = '';
        document.querySelectorAll('section[id]').forEach(s => {
            if (window.scrollY >= s.offsetTop - 160) current = s.getAttribute('id');
        });
        pnavLinks.forEach(l => {
            l.classList.remove('active-pnav');
            if (l.getAttribute('href') === `#${current}`) l.classList.add('active-pnav');
        });
    }
    updatePageNav();

    /* ── REVEAL ON SCROLL ── */
    const revObs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('md-visible'), i * 80);
                revObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    // Stagger children in grids
    document.querySelectorAll('.md-value-cards, .md-feat-grid, .md-uc-grid, .md-rev-grid').forEach(grid => {
        const children = grid.querySelectorAll('.md-reveal, .md-vc, .md-feat-card, .md-uc-card, .md-rev-card');
        children.forEach((el, i) => {
            el.style.transitionDelay = `${i * 70}ms`;
            revObs.observe(el);
        });
    });

    document.querySelectorAll('.md-reveal').forEach(el => revObs.observe(el));

    /* ── COUNTER ANIMATION ── */
    const statNums = document.querySelectorAll('.md-stat-num[data-target]');
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            if (prefix) { el.textContent = prefix + suffix; return; }
            let start = 0;
            const dur = 1600;
            const t0  = performance.now();
            (function tick(now) {
                const p = Math.min((now - t0) / dur, 1);
                const e = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(e * target) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            })(performance.now());
            counterObs.unobserve(el);
        });
    }, { threshold: 0.5 });
    statNums.forEach(el => counterObs.observe(el));

    /* ── LIVE BALANCE TICKER ── */
    let balance     = 4250000;
    const perSec    = (balance * 0.025) / 365 / 86400;
    const balanceEl = document.getElementById('mdPhoneBalance');
    if (balanceEl) {
        setInterval(() => {
            balance += perSec;
            balanceEl.textContent = 'Rp ' + Math.floor(balance).toLocaleString('id-ID');
        }, 1000);
    }

    /* ── JOURNEY SCROLL INTERACTION ── */
    const journeySteps = document.querySelectorAll('.md-tj-step');
    const jvLabel      = document.getElementById('mdJvLabel');
    const jvScreen     = document.getElementById('mdJvScreen');
    const jvDots       = document.querySelectorAll('.md-jv-dot');

    const journeyContent = [
        {
            label: 'Step 01 — Buka Aplikasi Partner',
            html: `<div class="md-jv-screen-inner">
                <div class="md-jv-app-icon">P</div>
                <div class="md-jv-app-name">PartnerApp</div>
                <div class="md-jv-app-sub">Buka aplikasi seperti biasa</div>
                <div class="md-jv-loading"><div class="md-jv-bar"></div><div class="md-jv-bar short"></div><div class="md-jv-bar"></div></div>
            </div>`
        },
        {
            label: 'Step 02 — Temukan Fitur Madera',
            html: `<div class="md-jv-screen-inner">
                <div style="background:rgba(0,212,143,0.12);border:1px solid rgba(0,212,143,0.3);border-radius:12px;padding:16px 20px;text-align:center;width:100%;">
                    <div style="font-size:1.5rem;margin-bottom:6px;">🏦</div>
                    <div style="font-family:var(--font-display);font-weight:700;color:rgba(255,255,255,0.85);font-size:0.82rem;margin-bottom:4px;">Madera Saving</div>
                    <div style="font-size:0.68rem;color:rgba(255,255,255,0.45);margin-bottom:10px;">Tabungan berbunga langsung di app ini</div>
                    <div style="background:var(--green);color:#fff;border-radius:8px;padding:6px 14px;font-size:0.7rem;font-weight:700;display:inline-block;">Buka Sekarang →</div>
                </div>
                <div style="font-size:0.68rem;color:rgba(255,255,255,0.35);">Muncul di halaman utama aplikasi</div>
            </div>`
        },
        {
            label: 'Step 03 — e-KYC Cepat',
            html: `<div class="md-jv-screen-inner">
                <div style="background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);border-radius:10px;padding:14px 18px;width:100%;text-align:left;">
                    <div style="font-size:0.65rem;font-weight:700;color:#A5B4FC;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Nobu Webview · eKYC</div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:rgba(255,255,255,0.6);">
                            <span style="color:var(--green)">✓</span> Foto KTP / e-KTP
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:rgba(255,255,255,0.6);">
                            <span style="color:var(--green)">✓</span> Selfie Liveness
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:rgba(255,255,255,0.6);">
                            <div style="width:10px;height:10px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);animation:spin 1s linear infinite;"></div> Verifikasi Data
                        </div>
                    </div>
                </div>
                <div style="font-size:0.65rem;color:rgba(255,255,255,0.3);">Proses selesai &lt; 5 menit</div>
            </div>`
        },
        {
            label: 'Step 04 — Rekening Aktif Instan',
            html: `<div class="md-jv-screen-inner">
                <div style="width:52px;height:52px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,212,143,0.4);">
                    <svg width="24" height="24" viewBox="0 0 52 52"><circle cx="26" cy="26" r="25" fill="none" stroke="white" stroke-width="2" stroke-dasharray="157" stroke-dashoffset="0"/><path d="M14 27l8 8 16-16" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>
                </div>
                <div style="font-family:var(--font-display);font-weight:700;color:#fff;font-size:0.88rem;">Rekening Aktif!</div>
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;width:100%;text-align:left;">
                    <div style="font-size:0.6rem;color:rgba(255,255,255,0.4);margin-bottom:3px;">Nomor Rekening</div>
                    <div style="font-family:monospace;font-size:0.8rem;color:var(--green);font-weight:700;">8013 4567 8901 2345</div>
                </div>
            </div>`
        },
        {
            label: 'Step 05 — Saldo Berbunga 🎉',
            html: `<div class="md-jv-screen-inner">
                <div style="font-size:1.8rem;">🎉</div>
                <div style="font-family:var(--font-display);font-weight:800;color:var(--green);font-size:1.1rem;letter-spacing:-0.5px;">Rp 4.250.000</div>
                <div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">Saldo Madera Saving</div>
                <div style="background:rgba(0,212,143,0.1);border:1px solid rgba(0,212,143,0.2);border-radius:8px;padding:8px 12px;width:100%;text-align:center;">
                    <div style="font-size:0.68rem;color:var(--green);font-weight:600;">+Rp 290 <span style="color:rgba(255,255,255,0.35);font-weight:400;">bunga hari ini</span></div>
                </div>
                <div style="font-size:0.62rem;color:rgba(255,255,255,0.3);">2.5% p.a. · Dijamin LPS</div>
            </div>`
        }
    ];

    let currentJvStep = 0;

    function setJvStep(step) {
        if (!jvLabel || !jvScreen) return;
        currentJvStep = step;

        // Update label
        jvLabel.textContent = journeyContent[step].label;

        // Fade screen
        jvScreen.style.opacity = '0';
        jvScreen.style.transform = 'translateY(8px)';
        setTimeout(() => {
            jvScreen.innerHTML = journeyContent[step].html;
            jvScreen.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            jvScreen.style.opacity = '1';
            jvScreen.style.transform = 'translateY(0)';
        }, 200);

        // Update dots
        jvDots.forEach((d, i) => {
            d.classList.toggle('active-jvdot', i === step);
        });

        // Update journey steps
        journeySteps.forEach((s, i) => {
            s.classList.remove('active-tj');
            if (i === step) {
                s.classList.add('active-tj');
                s.style.opacity = '1';
                s.style.transform = 'translateX(0)';
            } else if (i < step) {
                s.style.opacity = '0.45';
            } else {
                s.style.opacity = '0.2';
            }
        });
    }

    // Dot click
    jvDots.forEach((d, i) => d.addEventListener('click', () => setJvStep(i)));

    // Auto-advance
    let jvTimer = setInterval(() => {
        setJvStep((currentJvStep + 1) % journeyContent.length);
    }, 3000);

    // Pause on hover
    const jvCard = document.getElementById('mdJvCard');
    if (jvCard) {
        jvCard.addEventListener('mouseenter', () => clearInterval(jvTimer));
        jvCard.addEventListener('mouseleave', () => {
            jvTimer = setInterval(() => {
                setJvStep((currentJvStep + 1) % journeyContent.length);
            }, 3000);
        });
    }

    // Scroll-based journey step activation
    function updateJourney() {
        if (!journeySteps.length) return;
        journeySteps.forEach((step, i) => {
            const rect = step.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.55 && rect.bottom > 0) {
                if (currentJvStep !== i) setJvStep(i);
            }
        });
    }

    // Journey steps reveal observer
    const tjObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0.3';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.2 });
    journeySteps.forEach(s => tjObs.observe(s));

    /* ── FAQ ACCORDION ── */
    document.querySelectorAll('.md-faq-item').forEach(item => {
        const trigger = item.querySelector('.md-faq-trigger');
        const body    = item.querySelector('.md-faq-body');
        if (!trigger || !body) return;

        // Wrap inner
        if (!body.querySelector('.md-faq-inner')) {
            const inner = document.createElement('div');
            inner.className = 'md-faq-inner';
            inner.innerHTML = body.innerHTML;
            body.innerHTML = '';
            body.appendChild(inner);
        }

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('md-faq-open');

            // Close all
            document.querySelectorAll('.md-faq-item.md-faq-open').forEach(o => {
                if (o !== item) {
                    o.classList.remove('md-faq-open');
                    o.querySelector('.md-faq-body').style.maxHeight = '0';
                }
            });

            if (isOpen) {
                item.classList.remove('md-faq-open');
                body.style.maxHeight = '0';
            } else {
                item.classList.add('md-faq-open');
                const inner = body.querySelector('.md-faq-inner');
                body.style.maxHeight = (inner ? inner.scrollHeight + 32 : 300) + 'px';
            }
        });
    });

    // Open first FAQ
    const firstFaq = document.querySelector('.md-faq-item');
    if (firstFaq) {
        firstFaq.classList.add('md-faq-open');
        const b = firstFaq.querySelector('.md-faq-body');
        const i = firstFaq.querySelector('.md-faq-inner') || firstFaq.querySelector('.md-faq-body');
        if (b && i) b.style.maxHeight = (i.scrollHeight + 32) + 'px';
    }

    /* ── FEATURE CARD HOVER TILT ── */
    document.querySelectorAll('.md-feat-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
            const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -6;
            card.style.transform = `translateY(-4px) rotateX(${y}deg) rotateY(${x}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ── USE CASE CARD HOVER ACCENT ── */
    document.querySelectorAll('.md-uc-card').forEach(card => {
        const accent = card.dataset.accent || 'var(--green)';
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = accent;
            card.style.boxShadow   = `0 20px 50px rgba(0,0,0,0.12)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = '';
            card.style.boxShadow   = '';
        });
    });

    /* ── INIT ── */
    setJvStep(0);

    // Add spin keyframe for KYC screen
    const styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(styleEl);
});
