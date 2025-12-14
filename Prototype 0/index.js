import React, { useState } from 'react';
import { Camera, Copy, CheckCircle, Dumbbell, Loader2, FileText, Sparkles, Youtube } from 'lucide-react';

export default function WorkoutConverter() {
  const [videoUrl, setVideoUrl] = useState('');
  const [workoutInput, setWorkoutInput] = useState('');
  const [mode, setMode] = useState('url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /youtube\.com\/shorts\/([^&\s?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const analyzeVideoUrl = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please use a valid YouTube video link.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setWorkout(null);
    setStatusMessage('Extracting workout information...');

    try {
      const response = await fetch('http://localhost:3001/extract-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract workout');
      }

      if (!data.exercises || data.exercises.length === 0) {
        setError('Found the video but could not extract detailed workout information. Try Manual Input mode and describe what you see in the video.');
        return;
      }
      
      setWorkout(data);
      setStatusMessage('');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Could not extract workout details from this video. Please try Manual Input mode and describe the workout yourself.');
      setStatusMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatManualInput = async () => {
    if (!workoutInput.trim()) {
      setError('Please describe the workout');
      return;
    }

    setIsProcessing(true);
    setError('');
    setWorkout(null);

    try {
      const response = await fetch('http://localhost:3001/extract-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: workoutInput })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to format workout');
      }

      if (!data.exercises || data.exercises.length === 0) {
        throw new Error('No exercises found. Please provide more details.');
      }
      
      setWorkout(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to format workout. Please check your input.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'url') {
      analyzeVideoUrl();
    } else {
      formatManualInput();
    }
  };

  const formatForHevy = (workout) => {
    let text = `${workout.title}\n`;
    text += `Duration: ${workout.duration}\n`;
    text += `Equipment: ${Array.isArray(workout.equipment) ? workout.equipment.join(', ') : workout.equipment}\n\n`;
    
    workout.exercises.forEach((exercise, index) => {
      text += `${index + 1}. ${exercise.name}\n`;
      if (exercise.sets && exercise.sets !== 'N/A') text += `   Sets: ${exercise.sets}\n`;
      if (exercise.reps && exercise.reps !== 'N/A') text += `   Reps: ${exercise.reps}\n`;
      if (exercise.notes) text += `   Notes: ${exercise.notes}\n`;
      text += '\n';
    });
    
    return text;
  };

  const copyToClipboard = () => {
    const formatted = formatForHevy(workout);
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Dumbbell className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Workout Formatter</h1>
          </div>
          <p className="text-gray-600 text-lg">Convert YouTube videos into structured workout plans</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('url')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2 ${
                mode === 'url'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Youtube className="w-4 h-4" />
              YouTube URL
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2 ${
                mode === 'manual'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Manual Input
            </button>
          </div>

          {mode === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                disabled={isProcessing}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-2">
                The app will search for video information and extract workout details
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Workout
              </label>
              <textarea
                value={workoutInput}
                onChange={(e) => setWorkoutInput(e.target.value)}
                placeholder="Example: 30 min core workout - plank holds 3x45sec, bicycle crunches 4x20, leg raises 3x15..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-2">
                Watch the video and type what you see: exercises, sets, reps, form cues
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {statusMessage || 'Processing...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {mode === 'url' ? 'Extract from Video' : 'Format Workout'}
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-900 text-sm font-medium">⚠️ {error}</p>
              {mode === 'url' && (
                <p className="text-amber-700 text-xs mt-2">
                  Tip: Switch to Manual Input mode for reliable results
                </p>
              )}
            </div>
          )}
        </div>

        {workout && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{workout.title}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span>⏱️ {workout.duration}</span>
                  <span>🏋️ {Array.isArray(workout.equipment) ? workout.equipment.join(', ') : workout.equipment}</span>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex-shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy for Hevy
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4 py-3 hover:bg-gray-50 transition rounded-r">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {index + 1}. {exercise.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    {exercise.sets && exercise.sets !== 'N/A' && (
                      <p className="text-gray-700">
                        <span className="font-medium">Sets:</span> {exercise.sets}
                      </p>
                    )}
                    {exercise.reps && exercise.reps !== 'N/A' && (
                      <p className="text-gray-700">
                        <span className="font-medium">Reps:</span> {exercise.reps}
                      </p>
                    )}
                    {exercise.notes && (
                      <p className="text-gray-600 italic mt-2">💡 {exercise.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-900">
                ✅ <span className="font-semibold">Ready!</span> Your workout is formatted for Hevy, Strong, or any tracking app.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}