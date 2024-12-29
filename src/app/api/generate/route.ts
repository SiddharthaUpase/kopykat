import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import User from '@/app/models/User';


const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, tone, includeCallToAction } = await req.json();
    const session = await getServerSession(authOptions);
    
    let systemPrompt = 'You are an expert LinkedIn content writer.REMEMBER NO INTRODUCTIONS OR EXPLANATIONS. JUST THE POST CONTENT DIRECTLY. NO EMOJIS unless mentioned in the rough draft. Well spaced out lines.';
    switch (tone) {
        case 'naval':
            systemPrompt += `Write with Naval Ravikant's signature style:
            - Short, profound observations
            - Focus on wealth, happiness, and wisdom
            - Philosophical yet practical insights
            - Clear, timeless principles
            - Tweet-worthy, quotable statements
            - Blend of science, tech, and ancient wisdom
            - Emphasis on mental models`;
            break;
    
        case 'paras':
            systemPrompt += `Write with Paras Chopra's signature style:
            - Start with counterintuitive observations
            - Break down to first principles
            - Use data and frameworks
            - Focus on practical business insights
            - Connect seemingly unrelated concepts
            - Question assumptions with logic
            - End with actionable takeaways`;
            break;
    
        case 'rahul':
            systemPrompt += `Write with Rahul Subramanian's signature style:
            - Use witty one-liners (one per line)
            - Include relatable Indian cultural references
            - Mix Hinglish phrases naturally
            - Self-deprecating professional humor
            - End with funny hashtags
            - Reference tech/startup life
            - Keep it LinkedIn-appropriate`;
            break;
    
        case 'ankur':
            systemPrompt += `Write with Ankur Warikoo's signature style:
            - Start with a personal story
            - Focus on learning from failures
            - Provide clear, actionable steps
            - Use simple, accessible language
            - Include practical examples
            - End with key takeaways
            - Maintain motivational tone`;
            break;
    
        case 'kunal':
            systemPrompt += `Write with Kunal Shah's signature style:
            - Start with provocative insights
            - Use behavioral economics principles
            - Challenge common assumptions
            - Focus on 'why' questions
            - Analyze societal patterns
            - Reference Indian market dynamics
            - End with broader implications`;
            break;

            case 'shashi':
                systemPrompt += `Write with Shashi Tharoor's signature style:
                - Use eloquent language
                - Focus on Indian culture and history
                - Include literary references
                - End with a powerful conclusion
                - Maintain a motivational tone`;
                break;
    
        default:
            return NextResponse.json({ error: 'Unknown tone' }, { status: 400 });
    }
      

    let userPrompt = `Write a LinkedIn post about ${content}. Target length: 200-300 words. 
    Format: One sentence per line, with strategic line breaks for emphasis. 
    Style: ${tone}.
    Each line around 7 words.
    Hook in the first 2 lines.
    Core message/insight.
    Supporting points or story.
    Clear takeaway.
    Include 2-3 relevant hashtags.
    Language easy to digest.
    DO NOT ADD FAKE INFORMATION.    

    Required components:
    - PERSONAL NARRATIVE ANGLE.
    - SPECIFIC NUMBERS/DATA POINTS.
    - ONE KEY INSIGHT OR LEARNING.
    - CALL-TO-ACTION.
    
    Things to keep in mind:
    -This post is being written for a professional audience.
    -It is being written by an individual unless otherwise specified.
    -It should be engaging and interesting.
    -High conversion rate.
    -KEEP IT AROUND 200-300 words.
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