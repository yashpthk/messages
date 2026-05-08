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
    const svgElement = document.getElementById('constellationSvg');
    
    // Get actual dimensions for centering or use fixed 800 if that's your viewBox
    const svgWidth = svgElement.clientWidth || 800;
    const svgHeight = svgElement.clientHeight || 800;

    // Use the middle of the SVG as your anchor
    const cx = svgWidth * 0.5;
    const cy = svgHeight * 0.5;

    // Points mapped relative to the center (cx, cy)
    const points = [
        { x: cx - 280, y: cy - 180, r: 9,  color: "#ffffff", name: "Elnath" },      // 0
        { x: cx - 340, y: cy + 30,  r: 5,  color: "#ffffff", name: "Lower Horn Tip"},// 1
        { x: cx - 80,  y: cy - 30,  r: 5,  color: "#ffffff", name: "Horn Mid 1" },    // 2
        { x: cx - 10,  y: cy + 60,  r: 5,  color: "#ffffff", name: "Hyades Top" },    // 3
        { x: cx - 40,  y: cy + 150, r: 10, color: "#ffccaa", name: "Aldebaran" },   // 4 (The Eye)
        { x: cx + 40,  y: cy + 160, r: 5,  color: "#ffffff", name: "V Point" },      // 5
        { x: cx + 140, y: cy + 240, r: 5,  color: "#ffffff", name: "Hyades Bottom"},// 6
        { x: cx + 320, y: cy + 320, r: 5,  color: "#ffffff", name: "Body Rear" },   // 7
        { x: cx + 340, y: cy + 350, r: 4,  color: "#ffffff", name: "Leg Tip" },     // 8
        { x: cx + 180, y: cy - 100, r: 3,  color: "#ccddff", name: "Pleiades 1" },  // 9
        { x: cx + 210, y: cy - 80,  r: 3,  color: "#ccddff", name: "Pleiades 2" }   // 10
    ];

    // Draw stars
    points.forEach((p, i) => {
        setTimeout(() => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", p.r); 
            circle.setAttribute("fill", p.color);
            circle.style.opacity = '0';
            circle.style.transition = 'opacity 2s ease';
            starsGroup.appendChild(circle);

            // Trigger reflow
            void circle.offsetWidth;
            circle.style.opacity = '1';
        }, i * 300); // Slightly faster stagger for stars
    });

    // Connections
    const connections = [
        [0, 2], [2, 3],         // Upper horn
        [1, 5],                 // Lower horn (connecting to V-apex)
        [3, 5], [4, 5], [5, 6], // The Hyades V
        [6, 7], [7, 8]          // The Body extension
    ];

    // Wait for stars to be mostly visible before drawing lines
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

        // Trigger Uranus after lines start drawing
        setTimeout(showUranus, 3000);

    }, points.length * 300);
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
