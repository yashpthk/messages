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
    
    // Get actual dimensions
    const svgWidth = svgElement.clientWidth;
    const svgHeight = svgElement.clientHeight;

    // We use a "scale" factor to keep the constellation proportional
    // This ensures it takes up roughly 80% of the smallest screen dimension
    const s = Math.min(svgWidth, svgHeight) * 0.8; 
    const cx = svgWidth * 0.5;
    const cy = svgHeight * 0.4; // Shifted up slightly to leave room for "Body"

    const points = [
        // Using s * decimal to make it responsive
        { x: cx - (s * 0.35), y: cy - (s * 0.25), r: 7,  color: "#ffffff", name: "Elnath" },      // 0
        { x: cx - (s * 0.40), y: cy + (s * 0.05), r: 4,  color: "#ffffff", name: "Lower Horn" },   // 1
        { x: cx - (s * 0.10), y: cy - (s * 0.05), r: 4,  color: "#ffffff", name: "Horn Mid" },     // 2
        { x: cx - (s * 0.02), y: cy + (s * 0.08), r: 4,  color: "#ffffff", name: "Hyades Top" },   // 3
        { x: cx - (s * 0.05), y: cy + (s * 0.20), r: 8,  color: "#ffccaa", name: "Aldebaran" },    // 4
        { x: cx + (s * 0.05), y: cy + (s * 0.21), r: 4,  color: "#ffffff", name: "V Point" },      // 5
        { x: cx + (s * 0.18), y: cy + (s * 0.32), r: 4,  color: "#ffffff", name: "Hyades Bot" },   // 6
        { x: cx + (s * 0.40), y: cy + (s * 0.42), r: 4,  color: "#ffffff", name: "Body Rear" },    // 7
        { x: cx + (s * 0.43), y: cy + (s * 0.47), r: 3,  color: "#ffffff", name: "Leg Tip" },      // 8
        { x: cx + (s * 0.23), y: cy - (s * 0.15), r: 3,  color: "#ccddff", name: "Pleiades 1" },   // 9
        { x: cx + (s * 0.27), y: cy - (s * 0.12), r: 3,  color: "#ccddff", name: "Pleiades 2" }    // 10
    ];

    // ... The rest of your star drawing and connection logic remains the same ...
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
