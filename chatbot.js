// Initialize Botpress WebChat
function initChatbot() {
  window.botpressWebChat.init({
    composerPlaceholder: "Chat with KnightBot",
    botConversationDescription:
      "This is a bot to help answer questions about the Knights of Columbus",
    botId: "0da3a3d7-4c53-4306-96e9-e5f0ab02ebf2",
    hostUrl: "https://cdn.botpress.cloud/webchat/v1",
    messagingUrl: "https://messaging.botpress.cloud",
    clientId: "0da3a3d7-4c53-4306-96e9-e5f0ab02ebf2",
    webhookId: "a2b46e26-a6b5-4c7c-a542-a1f1f4f35d8e",
    lazySocket: true,
    themeName: "prism",
    frontendVersion: "v1",
    showPoweredBy: true,
    theme: "prism",
    themeColor: "#2563eb",
    botAvatar: "Untitled.png",
  });
}

// Load Botpress WebChat scripts and initialize
function loadChatbot() {
  const script1 = document.createElement('script');
  script1.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
  script1.async = true;
  
  const script2 = document.createElement('script');
  script2.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
  script2.id = 'botpress-webchat';
  script2.async = true;
  
  script2.onload = initChatbot;
  
  document.body.appendChild(script1);
  document.body.appendChild(script2);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadChatbot); 