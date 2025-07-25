import { OpenAI } from 'openai';
import { create, find } from '../models/summaryController';
import { YouTubeTranscript } from 'youtube-transcript';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function createSummary(req, res) {
  try {
    const { url, language } = req.body;
    
    // Validate input
    if (!url || !language) {
      return res.status(400).json({ 
        success: false,
        message: 'URL and language are required' 
      });
    }

    // Validate YouTube URL
   // In summaryController.js
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid YouTube URL' 
      });
    }

    // Get YouTube transcript
    let transcriptText = '';
    try {
      const transcripts = await YouTubeTranscript.fetchTranscript(url);
      transcriptText = transcripts.map(t => t.text).join(' ');
      
      if (!transcriptText || transcriptText.length < 50) {
        return res.status(400).json({ 
          success: false,
          message: 'No transcript available for this video' 
        });
      }
    } catch (transcriptError) {
      return res.status(400).json({ 
        success: false,
        message: 'Could not fetch transcript: ' + transcriptError.message 
      });
    }

    // Generate summary using OpenAI
    let summaryContent;
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `Generate a concise summary in ${language} highlighting key points in bullet points.`
              },
              {
                role: 'user',
                content: `Summarize this video transcript in ${language}:\n\n${transcriptText}`
              }
              
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      summaryContent = response.choices[0]?.message?.content;
      if (!summaryContent) {
        throw new Error('No summary content generated');
      }
    } catch (aiError) {
      return res.status(500).json({ 
        success: false,
        message: 'AI summary generation failed: ' + aiError.message 
      });
    }

    // Save to database
    try {
      const summary = await create({
        user: req.user.id,
        url,
        language,
        content: summaryContent
      });

      res.status(201).json({
        success: true,
        data: {
          id: summary._id,
          url: summary.url,
          language: summary.language,
          content: summary.content,
          createdAt: summary.createdAt
        }
      });
    } catch (dbError) {
      return res.status(500).json({ 
        success: false,
        message: 'Database error: ' + dbError.message 
      });
    }

  } catch (error) {
    console.error('Summary creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
}

export async function getHistory(req, res) {
  try {
    const summaries = await find({ user: req.user.id })
      .sort('-createdAt')
      .select('-__v');

    res.json({
      success: true,
      count: summaries.length,
      data: summaries
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch history' 
    });
  }
}