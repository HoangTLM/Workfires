# 🎆 Fireworks Simulator 🎆

A web-based interactive fireworks simulator that allows users to create and customize dazzling pyrotechnic displays. Click to launch fireworks, or enable auto-mode for a continuous show!

## Features

*   **Interactive Launching:** Click anywhere on the canvas to launch a firework rocket to that point.
*   **Variety of Firework Types:**
    *   Burst (Classic)
    *   Chrysanthemum (Dense with trails)
    *   Peony (Large spherical break)
    *   Willow (Drooping trails)
    *   Palm (Rising, curving trails)
    *   Ring (Circular pattern)
    *   Heart (Heart-shaped explosion)
    *   Random (Cycles through types)
*   **Customizable Colors:** Choose from a range of colors based on real firework chemistry (e.g., Red - Strontium, Green - Barium) or select "Random" for varied hues.
*   **Physics Controls:** Adjust settings like:
    *   Gravity
    *   Launch Velocity
    *   Particle Count
    *   Explosion Radius
    *   Particle Lifetime
*   **Visual Effects:** Fine-tune the look with:
    *   Brightness
    *   Trail Length
    *   Fade Speed
    *   Sparkle Effect (toggle)
*   **Auto Mode:**
    *   Enable automatic launching of fireworks.
    *   Control launch frequency.
    *   Set the number of rockets per auto-launch.
    *   Toggle random launch positions.
*   **YouTube Audio Integration:**
    *   Play background audio directly from a YouTube video link (audio only, no video displayed).
    *   Enable/disable music.
    *   Control music volume (0-100%).
*   **Presets:** Quickly switch between pre-configured settings:
    *   Spectacular
    *   Gentle
    *   Rapid Fire
    *   Giant Bursts
*   **Responsive Design:** Adapts to different screen sizes.
*   **Settings Panel:** A collapsible panel to control all aspects of the simulation.

## How to Use

1.  Open `index.html` in a modern web browser.
2.  **Launch Fireworks:** Click anywhere on the dark canvas area.
3.  **Customize:**
    *   Open the "Settings" panel (usually on the right, click the `+` or `−` button to expand/collapse).
    *   Adjust the various sliders, dropdowns, and checkboxes to change the firework appearance, physics, and behavior.
    *   Try out the different "Presets".
4.  **Auto Fire:**
    *   Use the "Start Auto Fire" button (usually at the top center) to begin automatic launching.
    *   Adjust "Rockets/Launch" to control how many fireworks are launched at once during auto mode.
5.  **YouTube Audio:**
    *   In the "YouTube Audio" section of the settings panel:
        *   Paste a YouTube video link into the input field.
        *   Click "Load/Play YouTube Audio".
        *   Use the "Enable Music" checkbox and "Music Volume" slider to control playback.

## Project Structure

*   `index.html`: The main HTML file that structures the page.
*   `style.css`: Contains all the CSS for styling the application, including the settings panel and responsive design.
*   `app.js`: The core JavaScript file containing the `FireworksSimulator` class, `Rocket` class, and `Particle` class. It handles:
    *   Canvas setup and animation loop.
    *   Firework physics and rendering.
    *   User interaction and event handling.
    *   Settings management.
    *   YouTube Iframe API integration for audio.