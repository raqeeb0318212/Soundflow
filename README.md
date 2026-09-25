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

## ⚖️ Legal & Compliance Notice

* **Compliance**: SoundFlow utilizes the official, public [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) and [YouTube Data API](https://developers.google.com/youtube/v3).
* **No Piracy or DRM Circumvention**: SoundFlow does **NOT** download, convert, extract, cache, or redistribute audio or video streams. All playback occurs via YouTube's official player with view tracking, advertisement attribution, and creator rights preserved.
* **Third-Party Services**: YouTube and Spotify are trademarks of their respective owners. Music playback and content are subject to YouTube's and Spotify's respective terms of service.
