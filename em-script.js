const PASSWORD_HASH = '8156126c0dd2672e7cf9b979908147fbab77f24f2e333c69fd4b75fcba400691'; // endearing

let failedAttempts = 0;

/* =========================
   PASSWORD
========================= */

async function sha256(text) {
    const data = new TextEncoder().encode(text);

    const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    return hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function checkPassword() {

    try {

        const input = document
            .getElementById('passwordInput')
            .value
            .trim()
            .toLowerCase();

        const enteredHash = await sha256(input);

        if (enteredHash === PASSWORD_HASH) {
            triggerEndgameTransition();
            return;
        }

        failedAttempts += 1;

        const hintEl =
            document.getElementById('hint');

        const errors = [
            'Not Quite. The mystery deepens.',
            'This one is not easy.',
            'This one is not a Cafè.',
            'No any place.',
            'Last try or this locks forever.',
            'You were bold with choosing to guess. And I was kidding.'
        ];

        hintEl.textContent =
            errors[
                Math.min(
                    failedAttempts - 1,
                    errors.length - 1
                )
            ];

    } catch (e) {

        document.getElementById('error')
            .textContent =
            'Error checking password.';
    }
}

document
    .getElementById('passwordInput')
    .addEventListener('keydown', (e) => {

        if (e.key === 'Enter') {
            checkPassword();
        }

    });

/* =========================
   TRANSITION
========================= */

function triggerEndgameTransition() {

    document.body.classList.add(
        'transitioning'
    );

    const mainCard =
        document.getElementById('mainCard');

    mainCard.style.transition =
        'opacity 2.2s ease, transform 2.2s ease, filter 2.2s ease';

    mainCard.style.opacity = '0';
    mainCard.style.transform = 'scale(0.96)';
    mainCard.style.filter = 'blur(10px)';

    setTimeout(() => {

        mainCard.style.display = 'none';

        const skyScene =
            document.getElementById('skyScene');

        skyScene.style.display = 'block';

        requestAnimationFrame(() => {

            skyScene.style.opacity = '1';

            generateStars();

            animateConstellation();

        });

    }, 2200);
}

/* =========================
   STARS
========================= */

function generateStars() {

    const container =
        document.getElementById('starsContainer');

    container.innerHTML = '';

    const numStars = 150;

    for (let i = 0; i < numStars; i++) {

        const star =
            document.createElement('div');

        star.className = 'star';

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        const size =
            1 + Math.random() * 2.5;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.opacity =
            0.2 + Math.random() * 0.8;

        star.style.animationDelay =
            `${Math.random() * 5}s`;

        star.style.animationDuration =
            `${4 + Math.random() * 6}s`;

        container.appendChild(star);
    }
}

/* =========================
   CONSTELLATION
========================= */

function animateConstellation() {

    const svg =
        document.getElementById(
            'constellationSvg'
        );

    const linesGroup =
        document.getElementById('lines');

    const starsGroup =
        document.getElementById('stars');

    linesGroup.innerHTML = '';
    starsGroup.innerHTML = '';

    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;

    const cx = svgWidth * 0.5;
    const cy = svgHeight * 0.48;

    /* =========================
       TAURUS LAYOUT
    ========================= */

    const points = [

        // horns
        {
            x: cx - 180,
            y: cy - 120,
            r: 2
        },

        {
            x: cx - 110,
            y: cy - 30,
            r: 2.5
        },

        // Aldebaran
        {
            x: cx - 20,
            y: cy + 20,
            r: 4.5,
            fill: '#ffd2a6'
        },

        {
            x: cx + 80,
            y: cy - 10,
            r: 2.5
        },

        {
            x: cx + 170,
            y: cy - 110,
            r: 2
        },

        // lower stars
        {
            x: cx - 60,
            y: cy + 120,
            r: 1.8
        },

        {
            x: cx + 70,
            y: cy + 110,
            r: 1.8
        },

        // Pleiades cluster
        {
            x: cx + 240,
            y: cy - 170,
            r: 1.3
        },

        {
            x: cx + 255,
            y: cy - 150,
            r: 1.1
        },

        {
            x: cx + 225,
            y: cy - 145,
            r: 1.1
        },

        {
            x: cx + 245,
            y: cy - 130,
            r: 1
        }
    ];

    const connections = [
        [0,1],
        [1,2],
        [2,3],
        [3,4],
        [1,5],
        [3,6]
    ];

    /* =========================
       DRAW STARS
    ========================= */

    points.forEach((p, i) => {

        setTimeout(() => {

            const circle =
                document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'circle'
                );

            circle.setAttribute('cx', p.x);
            circle.setAttribute('cy', p.y);

            circle.setAttribute(
                'r',
                p.r || 2
            );

            circle.setAttribute(
                'fill',
                p.fill || '#ffffff'
            );

            circle.style.opacity = '0';

            circle.style.transition =
                'opacity 2.8s ease, transform 3s ease';

            circle.style.transformOrigin =
                'center';

            circle.style.transform =
                'scale(0.6)';

            circle.style.filter =
                'drop-shadow(0 0 6px rgba(255,255,255,0.5))';

            starsGroup.appendChild(circle);

            requestAnimationFrame(() => {

                circle.style.opacity = '1';

                circle.style.transform =
                    'scale(1)';
            });

            /* subtle twinkle */

            circle.animate(
                [
                    { opacity: 0.7 },
                    { opacity: 1 },
                    { opacity: 0.7 }
                ],
                {
                    duration:
                        4000 +
                        Math.random() * 3000,

                    iterations: Infinity
                }
            );

        }, i * 380);
    });

   /* =========================
   SHOW URANUS FIRST
========================= */

setTimeout(() => {

    showUranus(
        cx + 120,
        cy - 70
    );

}, 1800);

/* =========================
   DRAW LINES AFTER
========================= */

setTimeout(() => {

    connections.forEach((conn, i) => {

        const p1 = points[conn[0]];
        const p2 = points[conn[1]];

        const line =
            document.createElementNS(
                'http://www.w3.org/2000/svg',
                'line'
            );

        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);

        line.classList.add(
            'constellation-line'
        );

        linesGroup.appendChild(line);

        const length = Math.hypot(
            p2.x - p1.x,
            p2.y - p1.y
        );

        line.style.strokeDasharray =
            length;

        line.style.strokeDashoffset =
            length;

        setTimeout(() => {

            line.style.transition =
                'stroke-dashoffset 2.5s ease';

            line.style.strokeDashoffset =
                '0';

        }, i * 450);

    });

}, 3200);

/* =========================
   URANUS
========================= */

function showUranus(x, y) {

    const uranus =
        document.getElementById('uranus');

    const residual =
        document.getElementById(
            'uranusResidualGlow'
        );

    /* =========================
       POSITION
    ========================= */

    // Near Aldebaran
    const startX = x - 42;
    const startY = y + 78;

    uranus.setAttribute('cx', startX);
    uranus.setAttribute('cy', startY);

    residual.setAttribute('cx', startX);
    residual.setAttribute('cy', startY);

    /* =========================
       APPEAR
    ========================= */

    uranus.style.opacity = '1';

    residual.style.opacity = '0';

    uranus.style.transform =
        'translate(0px, 0px)';

    /* =========================
       DRIFT
    ========================= */

    setTimeout(() => {

        uranus.style.transition =
            'transform 14s ease-in-out';

        uranus.style.transform =
            'translate(260px, -160px)';

        residual.style.transition =
            'opacity 8s ease';

        residual.style.opacity = '0.38';

        /* =========================
           FINAL TEXT
        ========================= */

        setTimeout(() => {

            document.getElementById(
                'starsContainer'
            ).style.opacity = '0.72';

            const finalText =
                document.getElementById(
                    'finalTextContainer'
                );

            finalText.style.opacity = '1';

        }, 7000);

    }, 1800);
}

/* =========================
   ADVENTURES
========================= */

function showAdventures() {

    const overlay =
        document.getElementById(
            'adventuresOverlay'
        );

    const content =
        document.getElementById(
            'adventuresContent'
        );

    overlay.style.display = 'flex';

    content.innerHTML = `
        <div class="adventure-scene">
            <img
                src="adventures.jpg"
                alt="Adventures"
                class="adventure-image"
            />

            <div class="adventure-text">
                example text
            </div>
        </div>
    `;

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';

        const text =
            document.querySelector(
                '.adventure-text'
            );

        setTimeout(() => {
            text.classList.add('visible');
        }, 1200);
    });
}

/* =========================
   RESIZE RESILIENCE
========================= */

window.addEventListener(
    'resize',
    debounce(() => {

        const skyScene =
            document.getElementById(
                'skyScene'
            );

        if (
            skyScene &&
            skyScene.style.display === 'block'
        ) {
            animateConstellation();
        }

    }, 250)
);

/* =========================
   HELPERS
========================= */

function debounce(fn, delay) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            fn(...args);
        }, delay);

    };
}