#Detective Rocky

An interactive web-based game dedicated to the **Seismic** community. This project places the player in a virtual interrogation room with Detective "Rocky" to answer questions testing their knowledge of the community. The game concludes by generating a custom, shareable intelligence dossier (ID Card).

## Key Features
- **Cyberpunk Design:** A UI inspired by retro terminal systems with precise visual effects (Glitch, CRT, Dynamic Blur).
- **Dynamic Question System:** A database of 32 questions (with Base64 encrypted answers to prevent cheating), from which 8 are randomly selected per session.
- **Integrated Audio Engine:** Interactive sound effects (background music, typing sounds, correct/wrong answers, stamp effect) with a toggle button to mute/unmute.
- **Card Generation:** Creates a custom result card based on the player's alias and uploaded avatar, which can be downloaded as an image (PNG) or shared directly to X (Twitter).
- **Responsive Design:** Fully optimized and playable on both desktop and mobile devices.

## Tech Stack
- **Frontend & Logic:** HTML5, CSS3, JavaScript (Vanilla).
- **External Libraries:** `html2canvas` (for rendering HTML elements into downloadable images).

## How to Run
The game runs entirely on the client-side (browser) and requires no backend server.
1. Extract the project files.
2. Ensure the `images` and `audio` folders are located in the root directory.
3. Open `index.html` in any modern web browser.
