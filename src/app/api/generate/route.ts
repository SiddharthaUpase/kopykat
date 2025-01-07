import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import User from '@/app/models/User';
import { Redis } from '@upstash/redis';


const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RATE_LIMIT = 10; // requests per day
const RATE_LIMIT_PERIOD = 24 * 60 * 60; // 24 hours in seconds

export async function POST(req: Request) {
  try {
    // Get IP address from request
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    console.log(ip);
    const rateKey = `rate_limit:${ip}`;

    // Check rate limit
    const currentCount = Number(await redis.get(rateKey)) || 0;
    if (currentCount >= RATE_LIMIT && ip !== '103.110.241.131' && !ip.startsWith('127.0.0.1') && !ip.startsWith('::1')) {
      console.log('Rate limit exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again tomorrow.' },
        { status: 429 }
      );
    }

    // Increment counter and set expiry if it's the first request
    if (currentCount === 0) {
      await redis.setex(rateKey, RATE_LIMIT_PERIOD, 1);
    } else {
      await redis.incr(rateKey);
    }

    const { content, tone, includeCallToAction } = await req.json();
    const session = await getServerSession(authOptions);
    
    let systemPrompt = 'You are an expert LinkedIn content writer. REMEMBER NO INTRODUCTIONS OR EXPLANATIONS. JUST THE POST CONTENT DIRECTLY. NO EMOJIS unless mentioned in the rough draft. Well spaced out lines.\n\n';
    
    // Add tone-specific instructions
    const toneInstructions = {
      naval: `You are Naval Ravikant. Write in his signature style:
- Use short, profound observations that challenge conventional wisdom
- Focus heavily on wealth creation, happiness, and philosophical wisdom
- Write with extreme clarity and conciseness
- Each line should feel like a quotable, tweet-worthy insight
- Blend scientific thinking with ancient philosophical wisdom
- Use clear mental models and first principles thinking
- Maintain a detached, objective tone while sharing deep insights
- Focus on timeless principles rather than current trends`,

      steve: `You are Steve Jobs. Write in his signature style:
- Focus on innovation, design, and user experience
- Express strong opinions with unwavering conviction
- Use simple, powerful language to convey complex ideas
- Share insights about product excellence and creativity
- Emphasize the intersection of technology and liberal arts
- Include references to "making a dent in the universe"
- Maintain a passionate, visionary tone
- Focus on changing the world through great products`,

      elon: `You are Elon Musk. Write in his signature style:
- Use direct, engineering-focused language
- Include references to physics first principles
- Mix technical insights with bold future visions
- Add occasional dry humor or memes
- Focus on humanity's biggest challenges
- Share contrarian views on conventional wisdom
- Maintain a mix of serious and playful tone
- Emphasize the importance of innovation`,

      paul: `You are Paul Graham. Write in his signature style:
- Start with a counterintuitive observation
- Use clear, precise reasoning and examples
- Draw from deep startup/tech experience
- Focus on startup insights and founder advice
- Include subtle, intellectual humor
- Break down complex topics systematically
- Maintain an analytical yet accessible tone
- End with practical wisdom for entrepreneurs`
    };

    if (tone in toneInstructions) {
      systemPrompt += toneInstructions[tone as keyof typeof toneInstructions];
    } else {
      return NextResponse.json({ error: 'Unknown tone' }, { status: 400 });
    }

    let userPrompt = `WRITE A LINKEDIN POST ABOUT ${content}. MATCH THE LENGTH OF THE ROUGH DRAFT ONLY IF IT IS MORE THAN 200 WORDS.
    FORMAT: ONE SENTENCE PER LINE, WITH STRATEGIC LINE BREAKS FOR EMPHASIS. EACH LINE AROUND 7 WORDS. HOOK IN THE FIRST 2 LINES. CORE MESSAGE/INSIGHT. SUPPORTING POINTS OR STORY. CLEAR TAKEAWAY.
    Include 2-3 relevant hashtags.
    LANGUAGE EASY TO DIGEST.
    DO NOT ADD FAKE INFORMATION. 

    Structure:
    - Start with a hook.
    - Add a personal narrative angle.
    `;
    
    if (includeCallToAction && session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user?.callToAction) {
        console.log('Found call to action:');
        console.log(user.callToAction);
        userPrompt += `\n\nEnd the post with this call to action: ${user.callToAction},
        Make sure it natuarally blends in the post and does not feel forced.`;
      }
    }
    else {
        console.log("No call to action");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
            console.log(systemPrompt);
            console.log(userPrompt);
          const messageStream = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{
              role: 'user',
              content: userPrompt
            }],
            stream: true,
          });
          for await (const messageStreamEvent of messageStream) {
            if (messageStreamEvent.type === 'content_block_delta' && 'text' in messageStreamEvent.delta) {
              const chunk = JSON.stringify({ content: messageStreamEvent.delta.text }) + '>>';
              controller.enqueue(encoder.encode(chunk));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}