const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Ollama API call function
async function callOllama(prompt) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: prompt,
      stream: false,
      format: "json"
    })
  });

  if (!response.ok) {
    throw new Error('Ollama API request failed. Make sure Ollama is running.');
  }

  const data = await response.json();
  const text = data.response;
  
  const cleanText = text.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(cleanText);
}

app.post('/extract-workout', async (req, res) => {
  const { url, input } = req.body;

  try {
    if (url) {
      // Handle YouTube URL
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?#]+)/);
      if (!videoIdMatch) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }
      const videoId = videoIdMatch[1];

      console.log(`📺 Fetching transcript for video: ${videoId}`);

      // Get video title
      let videoTitle = 'Workout Video';
      try {
        const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (oembedResponse.ok) {
          const oembedData = await oembedResponse.json();
          videoTitle = oembedData.title;
          console.log(`📝 Video title: ${videoTitle}`);
        }
      } catch (e) {
        console.log('Could not fetch video title');
      }

      // Get transcript - try multiple methods
      let transcript = '';
      let transcriptMethod = 'none';
      
      try {
        // Try default language first
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        transcript = transcriptData.map(item => item.text).join(' ');
        transcriptMethod = 'auto';
        console.log(`✅ Transcript fetched (auto): ${transcript.length} characters`);
      } catch (err1) {
        console.log('Auto transcript failed, trying English...');
        try {
          // Try with explicit English language
          const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
          transcript = transcriptData.map(item => item.text).join(' ');
          transcriptMethod = 'en';
          console.log(`✅ Transcript fetched (en): ${transcript.length} characters`);
        } catch (err2) {
          console.error('❌ All transcript methods failed');
          console.error('Error details:', err2.message);
          
          return res.status(404).json({
            error: 'Could not extract transcript from this video. This could be because:\n\n1. The video has no captions/subtitles\n2. Captions are auto-generated and not accessible\n3. The video is private or restricted\n\nPlease:\n- Try a different video with manual captions, OR\n- Use Manual Input mode and type the exercises you see in the video'
          });
        }
      }

      // Check if transcript is meaningful
      if (!transcript || transcript.trim().length < 50) {
        return res.status(404).json({
          error: 'Transcript is too short or empty. Please use Manual Input mode and describe what you see in the video.'
        });
      }

      console.log('🤖 Sending to Ollama for analysis...');
      console.log(`📊 Transcript preview: ${transcript.substring(0, 200)}...`);

      const prompt = `You are a fitness expert. Analyze this workout video transcript and extract the ACTUAL exercises mentioned.

Video Title: ${videoTitle}

Transcript (first 8000 chars):
${transcript.substring(0, 8000)}

Extract all exercises, sets, reps, and form cues mentioned in the transcript. Return ONLY a valid JSON object with this exact structure (no extra text):
{
  "title": "workout name from the video",
  "duration": "X minutes" (extract from transcript if mentioned, otherwise "N/A"),
  "equipment": "equipment mentioned or Bodyweight only",
  "exercises": [
    {
      "name": "exact exercise name from transcript",
      "sets": "number of sets mentioned or typical default",
      "reps": "reps or time mentioned or typical default",
      "notes": "any form cues or tips mentioned"
    }
  ]
}

IMPORTANT: 
- Only include exercises that are ACTUALLY mentioned in the transcript
- Extract the actual sets/reps if mentioned
- Include all exercises from start to finish of the workout
- Do not make up exercises that aren't in the transcript`;

      const workoutData = await callOllama(prompt);

      if (!workoutData.exercises || workoutData.exercises.length === 0) {
        return res.status(404).json({
          error: 'Could not extract exercises from transcript. The transcript might not contain clear workout instructions. Please try Manual Input mode.'
        });
      }

      console.log(`✅ Extracted ${workoutData.exercises.length} exercises`);
      res.json(workoutData);

    } else if (input) {
      // Handle manual input
      console.log('📝 Processing manual input...');
      
      const prompt = `You are a fitness expert. Parse this workout description into a structured format: "${input}"

Return ONLY a valid JSON object with this exact structure (no extra text):
{
  "title": "descriptive workout name",
  "duration": "X minutes" or "N/A",
  "equipment": "equipment needed or Bodyweight only",
  "exercises": [
    {
      "name": "exercise name",
      "sets": "number",
      "reps": "number or time",
      "notes": "form cues or tips"
    }
  ]
}

Extract all exercises mentioned. If sets/reps aren't clear, use typical defaults for that exercise.`;

      const workoutData = await callOllama(prompt);
      
      if (!workoutData.exercises || workoutData.exercises.length === 0) {
        return res.status(400).json({ 
          error: 'Could not parse exercises from input. Please provide clearer exercise descriptions with sets/reps.'
        });
      }

      console.log(`✅ Formatted ${workoutData.exercises.length} exercises from manual input`);
      res.json(workoutData);

    } else {
      res.status(400).json({ error: 'Either URL or input is required' });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process workout' 
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Workout Formatter API with Transcript Extraction',
    endpoints: {
      'POST /extract-workout': 'Extract workout from YouTube transcript or manual input'
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Backend server running on http://localhost:${port}`);
  console.log(`📝 API endpoint: http://localhost:${port}/extract-workout`);
  console.log(`🤖 Using Ollama (FREE local AI) + YouTube Transcript`);
  console.log(`\n💡 Make sure Ollama is running: ollama serve`);
});