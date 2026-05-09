const PASSWORD_HASH = '8156126c0dd2672e7cf9b979908147fbab77f24f2e333c69fd4b75fcba400691'; // 'endearing'

let failedAttempts = 0;

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    try {
        const entered = document.getElementById('passwordInput').value.trim();
        const enteredHash = await sha256(entered.toLowerCase());

        if (enteredHash === PASSWORD_HASH) {
            triggerEndgameTransition();
            return;
        }

        failedAttempts += 1;
        document.getElementById('error').textContent = '';
        const hintEl = document.getElementById('hint');

        if (failedAttempts === 1) hintEl.textContent = 'Not Quite. You have found all cards...';
        else if (failedAttempts === 2) hintEl.textContent = 'This one is not easy.';
        else if (failedAttempts === 3) hintEl.textContent = 'Is not a Cafè.';
        else if (failedAttempts === 4) hintEl.textContent = 'Nor any place.';
        else if (failedAttempts === 5) hintEl.textContent = 'Last try or this locks forever.';
        else if (failedAttempts >= 6) {
            hintEl.textContent = 'You were bold with choosing to guess. And I was kidding.';
        }
    } catch (e) {
        document.getElementById('error').textContent = 'Error checking password.';
    }
}

document.getElementById('passwordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

function triggerEndgameTransition() {
    // Fade out main card
    const mainCard = document.getElementById('mainCard');
    mainCard.style.transition = 'opacity 2s ease-in-out';
    mainCard.style.opacity = '0';

    setTimeout(() => {
        mainCard.style.display = 'none';

        // Show and fade in sky scene
        const skyScene = document.getElementById('skyScene');
        skyScene.style.display = 'block';
        setTimeout(() => {
            skyScene.style.opacity = '1';
            generateStars();
            animateConstellation();
        }, 100);
    }, 2000);
}

function generateStars() {
    const container = document.getElementById('starsContainer');
    const numStars = 150;
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${3 + Math.random() * 4}s`;
        container.appendChild(star);
    }
}

function animateConstellation() {
    const linesGroup = document.getElementById('lines');
    const starsGroup = document.getElementById('stars');
    const svg = document.getElementById('constellationSvg');
    
    // 1. Get dynamic dimensions
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;

    // 2. Establish a scale factor (80% of the smaller dimension)
    // This prevents the "too big" problem on mobile.
    const scale = Math.min(svgWidth, svgHeight) * 0.8;
    
    // 3. Center point
    const cx = svgWidth * 0.5;
    const cy = svgHeight * 0.45; // Slightly above true center to account for the "body"

    // 4. Points mapped as fractions of 'scale'
    const points = [
        { x: cx - (scale * 0.35), y: cy - (scale * 0.25), r: 6, color: "#ffffff" }, // 0: Elnath (Top Horn)
        { x: cx - (scale * 0.42), y: cy + (scale * 0.05), r: 4, color: "#ffffff" }, // 1: Lower Horn Tip
        { x: cx - (scale * 0.10), y: cy - (scale * 0.05), r: 4, color: "#ffffff" }, // 2: Horn Mid
        { x: cx - (scale * 0.02), y: cy + (scale * 0.08), r: 4, color: "#ffffff" }, // 3: Hyades Top
        { x: cx - (scale * 0.05), y: cy + (scale * 0.20), r: 7, color: "#ffccaa" }, // 4: Aldebaran
        { x: cx + (scale * 0.05), y: cy + (scale * 0.21), r: 4, color: "#ffffff" }, // 5: V Point
        { x: cx + (scale * 0.18), y: cy + (scale * 0.32), r: 4, color: "#ffffff" }, // 6: Hyades Bot
        { x: cx + (scale * 0.40), y: cy + (scale * 0.42), r: 4, color: "#ffffff" }, // 7: Body Rear
        { x: cx + (scale * 0.43), y: cy + (scale * 0.47), r: 3, color: "#ffffff" }, // 8: Leg Tip
        { x: cx + (scale * 0.23), y: cy - (scale * 0.15), r: 3, color: "#ccddff" }, // 9: Pleiades 1
        { x: cx + (scale * 0.27), y: cy - (scale * 0.12), r: 3, color: "#ccddff" }  // 10: Pleiades 2
    ];

    // Draw stars
    points.forEach((p, i) => {
        setTimeout(() => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", p.r); // Use the radius from our points array
            circle.setAttribute("fill", p.color); // Use the specific color
            circle.style.opacity = '0';
            circle.style.transition = 'opacity 2s ease';
            starsGroup.appendChild(circle);

            void circle.offsetWidth;
            circle.style.opacity = '1';
        }, i * 300);
    });

    // Connections following the EarthSky layout
    const connections = [
        [0, 2], [2, 3],         // Upper horn
        [1, 4],                 // Lower horn
        [3, 5], [4, 5], [5, 6], // The Hyades V
        [6, 7], [7, 8]          // The Body extension
    ];

    setTimeout(() => {
        connections.forEach((conn, i) => {
            const p1 = points[conn[0]];
            const p2 = points[conn[1]];

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", p1.x);
            line.setAttribute("y1", p1.y);
            line.setAttribute("x2", p2.x);
            line.setAttribute("y2", p2.y);
            line.classList.add('constellation-line');
            linesGroup.appendChild(line);

            const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;

            setTimeout(() => {
                line.style.transition = 'stroke-dashoffset 2s ease-in-out';
                line.style.strokeDashoffset = '0';
            }, i * 400);
        });

        // Trigger Uranus after drawing starts
        setTimeout(showUranus, 3000);

    }, points.length * 300);
}



function showUranus() {
    const uranus = document.getElementById('uranus');
    
    // Set initial position near the constellation
    const svgWidth = document.getElementById('constellationSvg').clientWidth;
    const svgHeight = document.getElementById('constellationSvg').clientHeight;
    const startX = svgWidth * 0.5 - 40;
    const startY = svgHeight * 0.5 - 30;

    uranus.setAttribute('cx', startX);
    uranus.setAttribute('cy', startY);

    // Fade in
    uranus.style.opacity = '1';

    // Wait a moment, then drift away
    setTimeout(() => {
        uranus.classList.add('drift');

        // After drifting starts, show final text
        setTimeout(() => {
            document.getElementById('finalTextContainer').style.opacity = '1';
        }, 4000);
    }, 2000);
}

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
                src="PICT0055.jpg"
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