// Chatbot Component for KofC Website
class Chatbot {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.chatHistory = [];
    this.init();
  }

  init() {
    this.createChatbotHTML();
    this.bindEvents();
    this.loadChatHistory();
  }

  createChatbotHTML() {
    const chatbotHTML = `
      <div id="chatbot-container" class="chatbot-container">
        <div id="chatbot-tooltip" class="chatbot-tooltip">Have a question? Ask me, Knightbot!</div>
        <div id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat">
          <img src="Untitled.png" alt="Chat" class="chatbot-icon" />
        </div>
        
        <div id="chatbot-window" class="chatbot-window" style="display: none;">
          <div class="chatbot-header">
            <h3>KofC Assistant</h3>
            <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">×</button>
          </div>
          
          <div id="chatbot-messages" class="chatbot-messages">
            <div class="message bot-message">
              <div class="message-content">
                Hello! I'm your KofC assistant. I can help answer questions about the Knights of Columbus, Council 15857, and our activities. What would you like to know?
              </div>
            </div>
          </div>
          
          <div class="chatbot-input-container">
            <input 
              type="text" 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Type your question here..."
              aria-label="Type your message"
            />
            <button id="chatbot-send" class="chatbot-send" aria-label="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
          
          <div id="chatbot-loading" class="chatbot-loading" style="display: none;">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const send = document.getElementById('chatbot-send');
    const window = document.getElementById('chatbot-window');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.closeChat());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    send.addEventListener('click', () => this.sendMessage());
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
  }

  initTooltip() {
    const container = document.getElementById('chatbot-container');
    const toggle = document.getElementById('chatbot-toggle');
    const tooltip = document.getElementById('chatbot-tooltip');

    if (!container || !toggle || !tooltip) return;

    // Show tooltip after a delay on page load
    const initialShowTimeout = setTimeout(() => {
        container.classList.add('show-tooltip');
    }, 2000);

    // Hide it after a while
    const initialHideTimeout = setTimeout(() => {
        container.classList.remove('show-tooltip');
    }, 7000); // Stays for 5 seconds

    // Show on hover
    toggle.addEventListener('mouseenter', () => {
        // Clear initial timeouts if user interacts early
        clearTimeout(initialShowTimeout);
        clearTimeout(initialHideTimeout);
        container.classList.add('show-tooltip');
    });

    // Hide on mouse leave
    toggle.addEventListener('mouseleave', () => {
        container.classList.remove('show-tooltip');
    });

    // Hide tooltip when chatbot is opened
    toggle.addEventListener('click', () => {
        container.classList.remove('show-tooltip');
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    document.getElementById('chatbot-window').style.display = 'block';
    document.getElementById('chatbot-toggle').style.display = 'none';
    document.getElementById('chatbot-input').focus();
    
    // Initialize DOCX chatbot if not already done
    if (window.kofcChatbot && !window.kofcChatbot.isLoaded) {
      this.addMessage('Loading documents...', 'bot');
      window.kofcChatbot.initialize().then(() => {
        this.addMessage('Documents loaded! I can now answer questions about the Knights of Columbus.', 'bot');
      });
    }
  }

  closeChat() {
    this.isOpen = false;
    document.getElementById('chatbot-window').style.display = 'none';
    document.getElementById('chatbot-toggle').style.display = 'block';
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'user');
    input.value = '';
    
    // Show loading
    this.showLoading(true);
    
    try {
      // Get response from DOCX chatbot
      let response;
      if (window.kofcChatbot) {
        response = await window.kofcChatbot.respond(message);
      } else {
        response = "I'm still loading. Please try again in a moment.";
      }
      
      // Add bot response
      this.addMessage(response, 'bot');
      
      // Save to history
      this.saveToHistory(message, response);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      this.addMessage("I'm sorry, I encountered an error. Please try again.", 'bot');
    } finally {
      this.showLoading(false);
    }
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom, using setTimeout to ensure it runs after DOM update
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
  }

  showLoading(show) {
    const loading = document.getElementById('chatbot-loading');
    loading.style.display = show ? 'block' : 'none';
  }

  saveToHistory(userMessage, botResponse) {
    this.chatHistory.push({
      user: userMessage,
      bot: botResponse,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 messages
    if (this.chatHistory.length > 50) {
      this.chatHistory = this.chatHistory.slice(-50);
    }
    
    localStorage.setItem('kofc-chat-history', JSON.stringify(this.chatHistory));
  }

  loadChatHistory() {
    try {
      const saved = localStorage.getItem('kofc-chat-history');
      if (saved) {
        this.chatHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const chatbot = new Chatbot();
  chatbot.initTooltip();
}); 