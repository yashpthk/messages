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

        if (failedAttempts === 1) hintEl.textContent = 'Not Quite. The mystery deepens.';
        else if (failedAttempts === 2) hintEl.textContent = 'This one is not easy.';
        else if (failedAttempts === 3) hintEl.textContent = 'This one is not a Cafè.';
        else if (failedAttempts === 4) hintEl.textContent = 'No any place.';
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
    const svgWidth = document.getElementById('constellationSvg').clientWidth;
    const svgHeight = document.getElementById('constellationSvg').clientHeight;

    // Simple Taurus-like points relative to center
    const cx = svgWidth * 0.5;
    const cy = svgHeight * 0.5;

    // Relative mapping for a recognizable Taurus shape
const points = [
    { x: cx, y: cy, name: "Aldebaran" },               // 0: The Eye (Orange-ish)
    { x: cx - 40, y: cy - 40, name: "Epsilon Tau" },   // 1: Top of the 'V'
    { x: cx - 20, y: cy + 50, name: "Gamma Tau" },     // 2: Bottom of the 'V'
    { x: cx - 70, y: cy + 30, name: "Delta Tau" },     // 3: Side of the 'V'
    { x: cx + 150, y: cy - 120, name: "El Nath" },     // 4: Tip of Upper Horn
    { x: cx + 180, y: cy + 20, name: "Zeta Tau" },     // 5: Tip of Lower Horn
    { x: cx - 200, y: cy - 80, name: "Pleiades" }      // 6: The Seven Sisters (Cluster)
];

    // Draw stars
    points.forEach((p, i) => {
        setTimeout(() => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", i === 0 ? "4" : "2"); // Make Aldebaran slightly bigger
            circle.setAttribute("fill", i === 0 ? "#ffccaa" : "#ffffff"); // Aldebaran color
            circle.style.opacity = '0';
            circle.style.transition = 'opacity 2s ease';
            starsGroup.appendChild(circle);

            // Trigger reflow
            void circle.offsetWidth;
            circle.style.opacity = '1';
        }, i * 500); // Stagger star appearance
    });

    // The connections that form the 'V' and the long horns
const connections = [
    [0, 2], [2, 3], [3, 1], // The Hyades 'V' shape
    [1, 4],                 // Connection to upper horn
    [0, 5],                 // Connection to lower horn
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

            // Calculate length for stroke-dasharray animation
            const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;

            setTimeout(() => {
                line.style.transition = 'stroke-dashoffset 2s ease';
                line.style.strokeDashoffset = '0';
            }, i * 400); // Stagger line drawing
        });

        // After constellation is drawn, show Uranus
        setTimeout(showUranus, 3000);

    }, points.length * 500);
}

function showUranus() {
    const uranus = document.getElementById('uranus');
    const residual = document.getElementById('uranusResidualGlow');

    // Set initial position near the constellation
    const svgWidth = document.getElementById('constellationSvg').clientWidth;
    const svgHeight = document.getElementById('constellationSvg').clientHeight;
    const startX = svgWidth * 0.5 + 40;
    const startY = svgHeight * 0.5 - 30;

    uranus.setAttribute('cx', startX);
    uranus.setAttribute('cy', startY);
    residual.setAttribute('cx', startX);
    residual.setAttribute('cy', startY);

    // Fade in
    uranus.style.opacity = '1';
    residual.style.opacity = '0.6';

    // Wait a moment, then drift away
    setTimeout(() => {
        uranus.classList.add('drift');
        uranus.style.opacity = '0'; // fade out as it drifts

        // After drifting starts, show final text
        setTimeout(() => {
            document.getElementById('finalTextContainer').style.opacity = '1';
        }, 4000);
    }, 2000);
}

function showAdventures() {
    const overlay = document.getElementById('adventuresOverlay');
    overlay.style.display = 'flex';

    fetch('adventures.svg')
        .then(response => response.text())
        .then(svgText => {
            document.getElementById('adventuresContent').innerHTML = svgText;
            // Trigger reflow
            void overlay.offsetWidth;
            overlay.style.opacity = '1';
        })
        .catch(error => {
            console.error("Error loading adventures SVG:", error);
        });
}
