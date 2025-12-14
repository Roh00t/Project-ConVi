# Workout Formatter - Local Setup Guide (Ollama Edition)

## 📁 Project Structure

Create a folder called `workout-formatter` with these files:

```
workout-formatter/
├── package.json
├── backend.js
└── index.html
```

## 🚀 Step-by-Step Setup

### 1. Install Ollama (Required)

Ollama is a free, local AI that runs on your computer - no API keys or costs!

**On Mac:**
```bash
# Using Homebrew (recommended)
brew install ollama

# OR download from https://ollama.ai/download
```

**On Windows/Linux:**
Download from: https://ollama.ai/download

### 2. Start Ollama

Open a terminal window and run:
```bash
ollama serve
```

Keep this terminal window open! You should see:
```
Ollama is running
```

### 3. Download an AI Model

Open a **NEW** terminal window and download a model:

```bash
# Recommended: Llama 3.2 (2GB, good quality)
ollama pull llama3.2

# OR Mistral (smaller, faster)
ollama pull mistral

# OR Gemma 2 (good balance)
ollama pull gemma2
```

This will take a few minutes. Wait for it to complete.

**Test it works:**
```bash
ollama run llama3.2 "What is a burpee exercise?"
```

If you get a response, Ollama is working! ✅

### 4. Create package.json

Create a file called `package.json` with this content:

```json
{
  "name": "workout-formatter",
  "version": "1.0.0",
  "description": "Convert YouTube workout videos to structured plans using free local AI",
  "main": "backend.js",
  "scripts": {
    "start": "node backend.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "youtube-transcript": "^1.0.6"
  }
}
```

### 5. Copy the Backend Code

Copy the `backend.js` code (Ollama version) into a file called `backend.js`

### 6. Copy the Frontend Code

Copy the `index.html` code into a file called `index.html`

### 7. Install Dependencies

Open your terminal in the `workout-formatter` folder and run:

```bash
npm install
```

This will install Express, CORS, and YouTube Transcript extractor.

### 8. Start the Backend Server

Make sure Ollama is still running in another terminal, then:

```bash
npm start
```

You should see:
```
✅ Backend server running on http://localhost:3001
📝 API endpoint: http://localhost:3001/extract-workout
🤖 Using Ollama (FREE local AI) + YouTube Transcript
```

### 9. Open the Frontend

**Option A: Double-click the file**
Just double-click `index.html` to open it in your browser.

**Option B: Use a local server (recommended)**

In a NEW terminal window (keep the backend running):

```bash
# Using Python (pre-installed on Mac)
python3 -m http.server 8000

# OR using Node.js http-server
npx http-server -p 8000
```

Then open: `http://localhost:8000/index.html`

## ✅ Testing

1. You should see a **green "Backend connected ✓"** message at the top

2. **Try Manual Input mode:**
   - Type: `20 min HIIT - burpees 3x10, mountain climbers 3x30sec, jump squats 3x15`
   - Click "Format Workout"
   - Watch it format beautifully!

3. **Try YouTube URL mode:**
   - Paste a workout video URL (must have captions/subtitles)
   - Click "Extract from Video"
   - Wait 10-20 seconds for transcript extraction + AI processing

## 🔧 Troubleshooting

### Backend not connecting?
- Make sure Ollama is running: `ollama serve` in another terminal
- Check the backend is running: `npm start`
- Look for errors in the terminal

### "Ollama API request failed"?
- Make sure Ollama is running: `ollama serve`
- Test Ollama directly: `ollama run llama3.2 "hello"`
- Restart Ollama if needed

### "Transcript is too short or unavailable"?
- The video might not have captions enabled
- Try a different video with captions, OR
- Use **Manual Input mode** and type what you see in the video

### Slow responses?
- First request takes 10-20 seconds (model loading)
- After that, responses are faster (3-5 seconds)
- This is normal for local AI!

## 📝 Running the App (Summary)

You need **3 terminals** running:

1. **Terminal 1 - Ollama:**
   ```bash
   ollama serve
   ```

2. **Terminal 2 - Backend:**
   ```bash
   cd /path/to/workout-formatter
   npm start
   ```

3. **Terminal 3 - Frontend (optional):**
   ```bash
   python3 -m http.server 8000
   # OR just double-click index.html
   ```

Then open in browser:
- If using local server: `http://localhost:8000/index.html`
- If double-clicked: Just open from browser

## 🔄 How to Start/Stop

### Starting Everything:

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start backend (in project folder)
npm start

# Terminal 3: Start frontend (optional)
python3 -m http.server 8000
```

### Stopping Everything:

Press `Ctrl+C` in each terminal window to stop the servers.

## 💡 Switching AI Models

You can change which AI model to use by editing `backend.js`:

```javascript
// Find this line in backend.js:
model: "llama3.2",

// Change to:
model: "mistral",     // Faster, smaller
model: "gemma2",      // Good balance
model: "llama3.2",    // Recommended (default)
```

Then restart the backend: `npm start`

## 🎯 Tips for Best Results

### For YouTube URL Mode:
- ✅ Use videos with **English captions/subtitles**
- ✅ Fitness channels with clear instructions work best
- ✅ First request takes 10-20 seconds (normal!)
- ❌ Videos without captions won't work - use Manual Input instead

### For Manual Input Mode:
- ✅ Works with ANY video (no captions needed!)
- ✅ Just watch the video and type what you see
- ✅ Example: `30 min abs - plank 3x45sec, crunches 4x20, leg raises 3x15`
- ✅ Faster processing (5-10 seconds)

## 🆓 Why Ollama?

- ✅ **100% FREE** - No API costs ever
- ✅ **Private** - Everything runs on your computer
- ✅ **No internet needed** - Works offline (after model download)
- ✅ **No API keys** - No sign-ups or accounts needed
- ❌ Slower than cloud APIs (but good enough!)

## 🎉 You're All Set!

Your app is running with:
- **Ollama**: `http://localhost:11434` (background)
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:8000/index.html` (or just open the file)

Enjoy formatting your workouts with free local AI! 💪

---

## 📚 Additional Resources

- Ollama documentation: https://ollama.ai/
- Available models: https://ollama.ai/library
- YouTube Transcript docs: https://www.npmjs.com/package/youtube-transcript