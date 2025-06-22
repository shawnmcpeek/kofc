// Custom KofC Chatbot using DOCX files as source data
class KofCDocxChatbot {
  constructor() {
    this.documents = {};
    this.chunks = [];
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  async initialize() {
    if (this.loadingPromise) return this.loadingPromise;
    
    this.loadingPromise = this.loadDocuments();
    return this.loadingPromise;
  }

  async loadDocuments() {
    try {
      console.log('Loading KofC documents...');
      
      // Load each DOCX file
      const documents = [
        { name: 'fourthdegree', file: 'fourthdegree.docx' },
        { name: 'council15857', file: 'council15857.docx' },
        { name: 'knights', file: 'knights.docx' }
      ];

      for (const doc of documents) {
        await this.loadDocument(doc.name, doc.file);
      }

      // Process documents into searchable chunks
      this.processDocuments();
      this.isLoaded = true;
      
      console.log('KofC documents loaded successfully!');
      return true;
    } catch (error) {
      console.error('Error loading documents:', error);
      return false;
    }
  }

  async loadDocument(name, filename) {
    try {
      const response = await fetch(filename);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const text = await this.extractTextFromDocx(arrayBuffer, name);
      
      this.documents[name] = {
        filename: filename,
        content: text,
        name: name
      };
      
      console.log(`Loaded ${filename}: ${text.length} characters`);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      // Create a fallback entry
      this.documents[name] = {
        filename: filename,
        content: `Information from ${filename} is currently unavailable.`,
        name: name
      };
    }
  }

  async extractTextFromDocx(arrayBuffer, documentName) {
    try {
      // Check if mammoth is available
      if (typeof mammoth !== 'undefined') {
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log(`[Chatbot] Extracted ${result.value.length} chars from ${documentName}`);
        return result.value;
      } else {
        // Fallback to simple extraction
        console.warn(`[Chatbot] Mammoth.js not found. Using fallback extraction for ${documentName}.`);
        return await this.simpleDocxExtraction(arrayBuffer, documentName);
      }
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      return await this.simpleDocxExtraction(arrayBuffer, documentName);
    }
  }

  async simpleDocxExtraction(arrayBuffer, documentName) {
    try {
      // Try to extract text using a simple approach
      // DOCX files are ZIP files with XML content
      const textDecoder = new TextDecoder('utf-8');
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Look for common DOCX patterns
      const content = textDecoder.decode(uint8Array);
      
      // Extract text between common DOCX tags (simplified)
      const textMatches = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches) {
        const extractedText = textMatches
          .map(match => match.replace(/<w:t[^>]*>([^<]+)<\/w:t>/, '$1'))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extractedText.length > 50) {
          return extractedText;
        }
      }
      
      // If simple extraction fails, return a placeholder
      return `Content from ${documentName} would be extracted here. The document contains information about the Knights of Columbus.`;
    } catch (error) {
      console.error('Simple extraction failed:', error);
      return `Content from ${documentName} is available but could not be extracted. Please ensure the document is properly formatted.`;
    }
  }

  processDocuments() {
    this.chunks = [];
    
    for (const [name, doc] of Object.entries(this.documents)) {
      // Split document by paragraphs. This is more robust for Q&A content.
      const paragraphs = doc.content.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim());
      
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.length > 15) { // Only include substantial paragraphs
          this.chunks.push({
            text: paragraph,
            source: doc.name,
            filename: doc.filename,
            index: index
          });
        }
      });
    }
    
    console.log(`[Chatbot] Processed ${this.chunks.length} paragraph chunks from documents`);
  }

  async respond(userMessage) {
    if (!this.isLoaded) {
      await this.initialize();
    }

    const message = userMessage.toLowerCase().replace(/[?.,!]/g, '');
    console.log(`[Chatbot] Sanitized message: "${message}"`);
    
    // Find relevant chunks
    const relevantChunks = this.findRelevantChunks(message);
    
    if (relevantChunks.length > 0) {
      // Combine relevant information
      const response = this.generateResponse(relevantChunks, message);
      return response;
    } else {
      return this.getDefaultResponse(message);
    }
  }

  findRelevantChunks(message) {
    const keywords = this.extractKeywords(message);
    console.log('[Chatbot] Extracted keywords:', keywords);
    const scoredChunks = [];

    this.chunks.forEach(chunk => {
      const score = this.calculateRelevanceScore(chunk.text, keywords);
      if (score > 0.1) { // Minimum relevance threshold
        scoredChunks.push({ ...chunk, score });
      }
    });

    console.log('[Chatbot] Found scored chunks:', scoredChunks.length, scoredChunks.map(c => ({ text: c.text, score: c.score, source: c.source })));

    // Sort by relevance and return top matches
    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 most relevant chunks
  }

  extractKeywords(message) {
    // Extract important words from user message
    const words = message.split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'that', 'this', 'these', 'those'];
    
    const keywords = words.filter(word => 
      word.length > 2 && 
      !stopWords.includes(word) &&
      !/^\d+$/.test(word) // Not just numbers
    );

    // Expand keywords to include singular/plural forms for better matching
    const expandedKeywords = [];
    keywords.forEach(kw => {
        expandedKeywords.push(kw); // add original
        if (kw.endsWith('s')) {
            expandedKeywords.push(kw.slice(0, -1)); // add singular
        } else if (kw.length > 3) { // Avoid making "is" into "iss"
            expandedKeywords.push(kw + 's'); // add plural
        }
    });

    // Return unique keywords
    return [...new Set(expandedKeywords)];
  }

  calculateRelevanceScore(text, keywords) {
    let score = 0;
    if (!keywords || keywords.length === 0) return 0;
  
    const lowerCaseText = text.toLowerCase();
  
    keywords.forEach(keyword => {
      // Use a regex to match the keyword as a whole word
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = lowerCaseText.match(regex);
      if (matches) {
        score += matches.length; // Add 1 for each occurrence of the keyword
      }
    });
  
    // Normalize score by the text length to factor in keyword density
    // Shorter chunks with the same number of keywords are more relevant.
    const density = score / (Math.log(lowerCaseText.length + 1) || 1);
    
    return density;
  }

  generateResponse(relevantChunks, userMessage) {
    if (relevantChunks.length === 0) {
      return this.getDefaultResponse(userMessage);
    }

    // Return the single most relevant paragraph to avoid combining unrelated topics.
    const bestChunk = relevantChunks[0];
    
    return bestChunk.text;
  }

  getDefaultResponse(userMessage) {
    const fallbackResponses = [
      "I don't have specific information about that in our documents. Could you try rephrasing your question or ask about something else?",
      "That information isn't available in our current documents. You might want to check our Contact page or attend a council meeting for more details.",
      "I'm not sure about that specific topic. Our documents cover information about the Knights of Columbus, council activities, and membership details. What would you like to know about those topics?",
      "I don't have that information in our records. Please contact us directly or check our website for more details."
    ];

    // Simple keyword matching for better fallback responses
    const message = userMessage.toLowerCase();
    
    if (message.includes('meeting') || message.includes('when') || message.includes('schedule')) {
      return "For information about council meetings, please check our calendar or contact us directly. Meeting schedules may vary.";
    }
    
    if (message.includes('join') || message.includes('member') || message.includes('application')) {
      return "For membership information, please contact our Grand Knight or attend a council meeting. You can find contact information on our Contact page.";
    }
    
    if (message.includes('contact') || message.includes('who') || message.includes('phone') || message.includes('email')) {
      return "You can contact us through our Contact page, or attend a council meeting to speak with members directly.";
    }

    // Return random fallback response
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  // Get document statistics
  getStats() {
    return {
      documentsLoaded: Object.keys(this.documents).length,
      totalChunks: this.chunks.length,
      isLoaded: this.isLoaded
    };
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.kofcChatbot = new KofCDocxChatbot();
  
  // Initialize in background
  window.kofcChatbot.initialize().then(() => {
    console.log('KofC Chatbot ready!');
  });
}); 