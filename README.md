# 🎵 SoundFlow - Music Discovery & Streaming Platform

SoundFlow is a modern, responsive, and legal music discovery web application built using **pure HTML5, CSS3, and Vanilla JavaScript**. It integrates the official **YouTube Data API v3**, the **YouTube IFrame Player API**, and **Spotify Web Links** to deliver an authentic, interactive music streaming experience directly in the browser.

Designed with clean, modular architecture, SoundFlow serves as an ideal academic and portfolio project for **Computer Science students**, software engineering evaluators, and web developers.

---

## 🚀 Key Features

* **Instant Out-of-the-Box Playback**: Includes a rich, curated catalog of real verified tracks across Pop, Hip-Hop, Rock, EDM, R&B, Classical, Jazz, Bollywood, and Pakistani music (Coke Studio, Atif Aslam, Ali Sethi) that streams immediately without requiring a Google Cloud key to start testing.
* **Official YouTube Embedded Playback**: Uses YouTube's official IFrame Player API for playback, adhering strictly to content licensing and developer policies.
* **Spotify Integration**: Direct links to open songs and artists in Spotify Web Player for cross-platform music exploration.
* **Persistent Library Management**:
  * **Favorites**: Save tracks to your personal library with one click, stored persistently in `localStorage`.
  * **Custom Playlists**: Create, rename, edit, and delete custom playlists, and add any track from cards or the player.
  * **Playback History**: Automatically keeps track of your recently played songs.
* **Live Global Search**:
  * Real-time debounced search bar (400ms delay to conserve API quota).
  * Category filter chips: All, Songs, Artists, Genres.
  * Loading skeleton placeholders and graceful error states.
* **Universal Media Player**:
  * Fixed bottom player bar with Play, Pause, Previous, Next, Shuffle, Repeat (Off / All / One), volume control with mute, and responsive seek progress bar.
  * Floating Picture-in-Picture (PiP) YouTube video drawer.
  * Full-screen swipeable mobile expanded player sheet.
* **Simulated Client-Side Authentication**:
  * Register, login, user avatar display, and session management using local client storage.
  * Pre-filled with demo credentials (`demo@soundflow.app` / `soundflow123`).
* **Settings & Customization**:
  * In-app Google Cloud YouTube Data API Key configuration dialog.

---

## 📁 Project Structure

```text
soundflow/
├── index.html            # Primary entry point & discovery dashboard
├── search.html           # Dedicated search engine & results browser
├── trending.html         # Global and regional trending music charts
├── artist.html           # Artist discography & biography viewer
├── album.html            # Album detail & tracklist player
├── genres.html           # Visual genres explorer (Pop, Rock, Hip-Hop, Pakistani...)
├── playlist.html         # User playlist organizer & detail player
├── favorites.html        # Personal saved tracks collection
├── css/
│   ├── style.css         # Design system, CSS variables, typography & layout
│   ├── player.css        # Dedicated bottom player & floating PiP styles
│   └── responsive.css    # Mobile, tablet, and ultra-wide media queries
├── js/
│   ├── storage.js        # Data layer for localStorage persistence & custom events
│   ├── auth.js           # Client-side user auth & session management
│   ├── api.js            # YouTube Data API v3 & Spotify links client
│   ├── player.js         # YouTube IFrame Player API controller & state machine
│   ├── search.js         # Search engine, debounce handler & cards renderer
│   ├── playlist.js       # Playlist creation, modification & detail rendering
│   ├── favorites.js      # Favorites manager & batch actions
│   └── app.js            # Global navigation, modals, toasts & UI controllers
└── README.md             # Complete documentation and setup guide
```

---

## 🛠️ How to Run the Project Locally

Because SoundFlow is built with standard web standards, you can run it using any method below:

### Method 1: Direct File / Live Server (No build tools needed)
1. Double-click `index.html` to open it in Google Chrome, Edge, Safari, or Firefox.
2. Or use VS Code's **Live Server** extension: right-click `index.html` and choose **"Open with Live Server"**.

### Method 2: Node.js / NPX HTTP Server
```bash
# Run any lightweight static server
npx serve .
# Or with python
python3 -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Method 3: Development Server (Included Vite Environment)
```bash
npm install
npm run dev
```

---

## 🔑 YouTube Data API v3 Key Setup

SoundFlow operates in **Curated Library Mode** by default so that evaluators can experience audio playback immediately. To connect live worldwide YouTube searches:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services > Library**.
3. Search for **"YouTube Data API v3"** and click **Enable**.
4. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
5. **Security Best Practice for Frontends**:
   - In Google Cloud, edit your API key and set **Application restrictions** to **HTTP referrers (web sites)**.
   - Add your development URL (`http://localhost:*`) and production domain (e.g., `https://your-username.github.io/*`).
   - Under **API restrictions**, restrict the key to only call the **YouTube Data API v3**.
6. **Adding the Key in SoundFlow**:
   - In SoundFlow, click the **Settings** icon in the sidebar or the status badge in the header.
   - Paste your API key into the field and click **Save Changes**.
   - Your key is saved locally in your browser session.

---

## 🌐 Deployment Instructions

SoundFlow is a 100% static frontend application and can be hosted for free on all major static hosting platforms:

### Option A: GitHub Pages
1. Push this repository to GitHub.
2. Go to your repository's **Settings > Pages**.
3. Under **Source**, select `Deploy from a branch` and choose the `main` branch with folder `/ (root)`.
4. Click **Save**. Your site will be published at `https://<username>.github.io/<repository-name>/`.

### Option B: Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Drag and drop the SoundFlow folder into the Netlify dashboard, or connect your GitHub repository.
3. Leave build command empty and set publish directory to `.` (or `dist` if built via `npm run build`).
4. Click **Deploy Site**.

### Option C: Vercel
1. Install Vercel CLI: `npm i -g vercel` and run `vercel` inside the project folder.
2. Or import your Git repository on [Vercel](https://vercel.com/) with default static settings.

---

## ⚖️ Legal & Compliance Notice

* **Compliance**: SoundFlow utilizes the official, public [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) and [YouTube Data API](https://developers.google.com/youtube/v3).
* **No Piracy or DRM Circumvention**: SoundFlow does **NOT** download, convert, extract, cache, or redistribute audio or video streams. All playback occurs via YouTube's official player with view tracking, advertisement attribution, and creator rights preserved.
* **Third-Party Services**: YouTube and Spotify are trademarks of their respective owners. Music playback and content are subject to YouTube's and Spotify's respective terms of service.
