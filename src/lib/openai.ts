import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: true
})

export async function generateAIResponse(query: string, subject: string): Promise<string> {
  try {
    const systemPrompt = `You are an AI tutor helping a school student with their academic questions. 
    Subject: ${subject}
    
    Provide clear, educational explanations that are appropriate for school-level students. 
    Be encouraging and supportive. If the question is complex, break it down into simple steps.
    Keep responses concise but comprehensive.`

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time. Please try again or contact your teacher for help.'
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return 'I apologize, but I am currently unable to process your question. Please try again later or contact your teacher for assistance.'
  }
}