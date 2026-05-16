// Reusable web search function for all API routes
export const searchWeb = async (query, maxResults = 5) => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return { answer: '', results: [] };

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        max_results: maxResults,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!response.ok) return { answer: '', results: [] };

    const data = await response.json();
    return {
      answer: data.answer || '',
      results: data.results?.map((result) => ({
        title: result.title,
        content: String(result.content || '').slice(0, 500),
        url: result.url,
      })) || [],
    };
  } catch {
    return { answer: '', results: [] };
  }
};
