# 🎧 Discord Music Bot — YouTube Player

This is a Discord bot that plays music from YouTube directly in your server.  
The bot supports a music queue, skipping tracks, pause/resume, and stable playback.

> ⚠️ The bot uses a YouTube cookies file for stable streaming — make sure to configure it in your `.env`.

---

## 🚀 Features

- 🎵 Play music from YouTube
- 📃 Track queue system
- ⏯️ Pause / Resume
- ⏭️ Skip tracks
- 🧹 Clear queue
- 🔊 Stable streaming
- 📝 Error logging to files and database

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-name/your-repo.git
cd your-repo
npm install 
```
Environment configuration
```
DISCORD_BOT_TOKEN=your_discord_bot_token
YT_COOKIES_PATH=./cookies.txt
ERROR_COMMITS_FILE=./error_commits.log
SYSTEM_ERRORS_FILE=./system_errors.log
MONGO_DB_URI=mongodb+srv://user:password@cluster/dbname
```

```bash
npm run dev
```
