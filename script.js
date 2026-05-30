/* =============================================
   NOBU BANK BaaS PORTAL — script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // Init Lucide Icons
    lucide.createIcons();

    /* ----------------------------------------
       NAVBAR: Scroll shadow + active links
    ---------------------------------------- */
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    }, { passive: true });

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    /* ----------------------------------------
       HAMBURGER MENU (Mobile)
    ---------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });

    /* ----------------------------------------
       SMOOTH SCROLL for anchor links
    ---------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 72;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ----------------------------------------
       INTERSECTION OBSERVER: Reveal Sections
    ---------------------------------------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '0px 0px 0px 0px' });

    document.querySelectorAll('.reveal-section').forEach(el => {
        // If already in viewport on load, make visible immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        } else {
            revealObserver.observe(el);
        }
    });

    /* ----------------------------------------
       STEP ITEMS: Staggered reveal
    ---------------------------------------- */
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const steps = entry.target.querySelectorAll('.step-item');
                steps.forEach((step, i) => {
                    setTimeout(() => {
                        step.classList.add('visible');
                    }, i * 120);
                });
                stepObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const stepsRow = document.querySelector('.steps-row');
    if (stepsRow) stepObserver.observe(stepsRow);

    /* ----------------------------------------
       VA COPY BUTTON
    ---------------------------------------- */
    const vaCopyBtn = document.querySelector('.va-copy-btn');
    if (vaCopyBtn) {
        vaCopyBtn.addEventListener('click', () => {
            const vaNumber = document.querySelector('.va-number');
            if (vaNumber) {
                const text = vaNumber.textContent.replace(/\s+/g, '').trim();
                navigator.clipboard.writeText(text).then(() => {
                    vaCopyBtn.innerHTML = '<i data-lucide="check" size="13"></i> Tersalin!';
                    vaCopyBtn.style.color = '#00D48F';
                    lucide.createIcons();
                    setTimeout(() => {
                        vaCopyBtn.innerHTML = '<i data-lucide="copy" size="13"></i> Salin Nomor';
                        lucide.createIcons();
                        vaCopyBtn.style.color = '';
                    }, 2000);
                }).catch(() => {
                    // Fallback for non-secure contexts
                    vaCopyBtn.innerHTML = '<i data-lucide="check" size="13"></i> Tersalin!';
                    lucide.createIcons();
                    setTimeout(() => {
                        vaCopyBtn.innerHTML = '<i data-lucide="copy" size="13"></i> Salin Nomor';
                        lucide.createIcons();
                    }, 2000);
                });
            }
        });
    }

    /* ----------------------------------------
       LIVE TRANSACTION TICKER (QRIS)
       Fix: fixed-height slots, no layout jump
    ---------------------------------------- */
    const trxData = [
        { label: 'Issuer E-Wallet — Toko ABC',    amount: 'Rp 250.000',   time: 'baru saja' },
        { label: 'Issuer Bank — Cross-border SGD', amount: 'Rp 1.200.000', time: '5s ago'    },
        { label: 'Issuer E-Wallet — Merchant A',  amount: 'Rp 75.500',    time: '12s ago'   },
        { label: 'Issuer Bank — Merchant B',       amount: 'Rp 480.000',   time: '20s ago'   },
        { label: 'Issuer Fintech — Cross-border',  amount: 'Rp 3.100.000', time: '35s ago'   },
        { label: 'Issuer E-Wallet — Store C',      amount: 'Rp 128.000',   time: '42s ago'   },
    ];

    const trxList = document.querySelector('.trx-live');
    const MAX_VISIBLE = 2;   // always keep exactly 2 rows
    let trxIndex = MAX_VISIBLE - 1;   // start after pre-rendered items
    let trxBusy  = false;

    function buildTrxItem(data) {
        const el = document.createElement('div');
        el.className = 'trx-item';
        el.innerHTML = `
            <div class="trx-dot success"></div>
            <div class="trx-info">
                <span>${data.label}</span>
                <span class="trx-amt">${data.amount}</span>
            </div>
            <span class="trx-time">${data.time}</span>
        `;
        return el;
    }

    if (trxList) {
        // Lock the container height so it never reflows
        trxList.style.overflow  = 'hidden';
        trxList.style.position  = 'relative';

        // Measure one item height after first render, then lock
        const firstItem = trxList.querySelector('.trx-item');
        if (firstItem) {
            // Wait one frame so browser has painted
            requestAnimationFrame(() => {
                const itemH   = firstItem.offsetHeight;
                const gap     = 8; // matches CSS gap: 8px
                const locked  = itemH * MAX_VISIBLE + gap * (MAX_VISIBLE - 1);
                trxList.style.height = locked + 'px';

                // Give all pre-existing items a stable transition
                trxList.querySelectorAll('.trx-item').forEach(el => {
                    el.style.transition = 'none';
                });

                // Kick off the ticker
                setInterval(rotateTicker, 3500);
            });
        }
    }

    function rotateTicker() {
        if (!trxList || trxBusy) return;
        trxBusy = true;

        trxIndex = (trxIndex + 1) % trxData.length;
        const data     = trxData[trxIndex];
        const DURATION = 380; // ms — must match CSS transition below

        // ── Step 1: slide OLD top item out upward ──
        const oldItem = trxList.querySelector('.trx-item');
        if (oldItem) {
            oldItem.style.transition  = `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1),
                                         opacity   ${DURATION}ms cubic-bezier(0.4,0,0.2,1),
                                         margin-top ${DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
            oldItem.style.transform   = 'translateY(-12px)';
            oldItem.style.opacity     = '0';
            oldItem.style.marginTop   = -(oldItem.offsetHeight + 8) + 'px';
        }

        // ── Step 2: append NEW item (starts below, invisible) ──
        const newItem = buildTrxItem(data);
        newItem.style.transform  = 'translateY(14px)';
        newItem.style.opacity    = '0';
        newItem.style.transition = 'none';          // no transition while positioning
        trxList.appendChild(newItem);

        // ── Step 3: after old item has left, clean up & slide new one in ──
        setTimeout(() => {
            if (oldItem) oldItem.remove();

            // Reset margin that was animating
            trxList.querySelectorAll('.trx-item').forEach(el => {
                el.style.marginTop  = '';
                el.style.transition = 'none';
            });

            // Trigger slide-in on new item next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    newItem.style.transition = `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1),
                                                opacity   ${DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
                    newItem.style.transform  = 'translateY(0)';
                    newItem.style.opacity    = '1';
                });
            });

            setTimeout(() => { trxBusy = false; }, DURATION + 20);
        }, DURATION);
    }

    /* ----------------------------------------
       PAYOUT COUNTER ANIMATION
    ---------------------------------------- */
    function animateCounter(el, target, prefix = '', suffix = '') {
        let start = 0;
        const duration = 1800;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = prefix + current.toLocaleString('id-ID') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    const statNums = document.querySelectorAll('.stat-num');
    let countersDone = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersDone) {
                countersDone = true;
                statNums.forEach(el => {
                    const text = el.textContent.trim();
                    if (text === '150+') animateCounter(el, 150, '', '+');
                    else if (text === '99.9%') {
                        let s = 0;
                        const d = 1800;
                        const step = (ts) => {
                            if (!s) s = ts;
                            const p = Math.min((ts - s) / d, 1);
                            el.textContent = (p * 99.9).toFixed(1) + '%';
                            if (p < 1) requestAnimationFrame(step);
                        };
                        requestAnimationFrame(step);
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) counterObserver.observe(heroStats);

    /* ----------------------------------------
       CARD 3D TILT EFFECT (Madera Card)
    ---------------------------------------- */
    const card = document.querySelector('.credit-card-mockup');
    if (card) {
        const wrapper = card.closest('.card-3d-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                card.style.transition = 'transform 0.1s ease';
            });

            wrapper.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
                card.style.transition = 'transform 0.5s ease';
            });
        }
    }

    /* ----------------------------------------
       TABLE ROW HOVER HIGHLIGHT
    ---------------------------------------- */
    document.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transition = 'background 0.2s ease';
        });
    });

    /* ----------------------------------------
       HUBUNGI / CTA BUTTONS (dummy handler)
    ---------------------------------------- */
    document.querySelectorAll('.btn-contact, .cta-btns .btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            // Scroll to footer contact area or trigger modal
            const footer = document.querySelector('.footer');
            if (footer) {
                const top = footer.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ----------------------------------------
       STRIP ITEMS: active state on scroll
    ---------------------------------------- */
    function updateStripItems() {
        const sections = ['qr-section', 'payout-section', 'madera-section', 'va-section'];
        const stripItems = document.querySelectorAll('.strip-item');

        sections.forEach((id, i) => {
            const section = document.getElementById(id);
            if (!section || !stripItems[i]) return;
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
                stripItems[i].style.borderColor = 'var(--green)';
                stripItems[i].style.color = 'var(--green)';
                stripItems[i].style.background = 'var(--green-dim)';
            } else {
                stripItems[i].style.borderColor = '';
                stripItems[i].style.color = '';
                stripItems[i].style.background = '';
            }
        });
    }

    window.addEventListener('scroll', updateStripItems, { passive: true });

    /* ----------------------------------------
       INIT
    ---------------------------------------- */
    updateActiveNavLink();
});
