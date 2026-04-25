# Interactive Web Card

A personalized, password-protected interactive web application built with HTML, CSS, and vanilla JavaScript. This project is a digital "card" that allows users to unlock various interactive messages, animations, and mini-games by entering a specific password.

## Features

- **Password Protection**: Uses the Web Crypto API (`crypto.subtle`) to hash the password on the client side, ensuring that only users with the correct password can access the content. The hash is compared against a pre-defined SHA-256 hash.
- **Dynamic Messaging**: Loads messages randomly from JSON files (`messages.json`, `rare.json`, `chaos.json`, etc.), ensuring a unique experience for each interaction.
- **Card Customization**: Supports different "styles" for the cards, dynamically applying CSS classes (e.g., `specialCard`, `rareCard`) to alter the visual presentation.
- **Interactive Actions**: Certain messages include custom actions, such as:
  - Links to external apps (e.g., WhatsApp).
  - Animations and mini-games (e.g., Charisma meter, chaotic emoji pop-ups, slot-machine style message rerolls).
- **Persistent State**: Utilizes `localStorage` to remember if the user has already unlocked the card, bypassing the login screen on subsequent visits.
- **Responsive Design**: The UI is built to be responsive and accessible across different screen sizes.

## File Structure

- `index.html`: The main HTML document containing the structure of the login page, message display, and overlay containers for animations.
- `styles.css`: The stylesheet defining the layout, colors, typography, and animations for the card and its various states.
- `script.js`: The core JavaScript logic that handles password validation, message fetching, DOM manipulation, animations, and state management.
- `*.json` (e.g., `messages.json`, `chaos.json`, `charisma.json`, `validation.json`, `rare.json`): Data files containing the text, styles, and action definitions for the various messages displayed in the app.

## Setup and Hosting

This project consists entirely of static files. However, because it utilizes the `fetch` API to load JSON data and the Web Crypto API (`crypto.subtle`) for secure password hashing, it **must** be served over a secure context.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Local Development**:
    To run the app locally, you need a local web server. Opening `index.html` directly via the `file://` protocol will result in CORS errors for the `fetch` calls and may prevent the Web Crypto API from working.

    You can use Python's built-in HTTP server:
    ```bash
    # For Python 3
    python -m http.server 8000
    ```
    Then, navigate to `http://localhost:8000` in your browser.

3.  **Deployment**:
    The app can be deployed to any static site hosting service, such as:
    - GitHub Pages
    - Vercel
    - Netlify
    - Cloudflare Pages

    Ensure that the deployed site is served over HTTPS to guarantee full functionality of the security and fetch features.

## Note

If you forget the password or need to test the login screen again, you can use the lock icon 🔒 on the main message page to clear your local storage and return to the login prompt.
