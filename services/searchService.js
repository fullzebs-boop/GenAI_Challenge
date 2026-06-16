// services/searchService.js
require('dotenv').config();

/**
 * Perform a live web search using Tavily API.
 */
async function performWebSearchRAG(query) {
    try {
        console.log(`[SearchService] Executing Tavily Search for: "${query}"`);
        
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
            },
            body: JSON.stringify({
                query: query,
                search_depth: "advanced",
                include_answer: false,
                include_images: false,
                include_raw_content: false,
                max_results: 15
            })
        });
        
        if (!response.ok) {
            throw new Error(`Tavily HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let contextText = "--- SEARCH RESULTS ---\n";
        
        if (data.results && data.results.length > 0) {
            data.results.forEach((res, i) => {
                contextText += `Result ${i + 1}:\nTitle: ${res.title}\nSnippet: ${res.content}\n\n`;
            });
        } else {
            contextText += "No detailed search results found. Try using general knowledge.\n";
        }
        
        return contextText;
    } catch (error) {
        console.error("[SearchService] Error:", error.message);
        return "Search failed. Please rely on fallback internal knowledge.";
    }
}

module.exports = {
    performWebSearchRAG
};
