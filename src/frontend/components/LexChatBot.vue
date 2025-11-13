<template>
  <div class="chatbot-container">
    <div v-if="!isOpen" class="chatbot-button" @click="isOpen = true">💬</div>
    <div v-else class="chatbot-window">
      <div class="chatbot-header">
        <span>AeroChat Assistant</span>
        <button class="close-btn" @click="isOpen = false">×</button>
      </div>
      <div class="chatbot-messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender]">
          {{ msg.text }}
        </div>
        <div v-if="isLoading" class="message bot">Typing...</div>
      </div>
      <div class="chatbot-input">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LexChatBot",
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [
        { text: "Hi! I'm AeroChat 🤖 How can I help you today?", sender: "bot" }
      ],
      isLoading: false,
    };
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    async sendMessage() {
      const text = this.userInput.trim();
      if (!text || this.isLoading) return;

      this.messages.push({ text, sender: "user" });
      this.userInput = "";
      this.isLoading = true;
      this.scrollToBottom();

      try {
        const response = await fetch(
          "https://sywyfyg7aj.execute-api.ap-south-1.amazonaws.com/1_aerochat_prod/lex/aerochat",
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              text: text,  // ✅ Changed to 'text' to match Lambda
              sessionId: `user-${Date.now()}`
            }),
          }
        );

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Lex response:', data);
          let botReply = this.extractBotReply(data);
          this.messages.push({ text: botReply, sender: "bot" });
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }

      } catch (error) {
        console.log("Chatbot error:", error.message);
        const smartReply = this.generateSmartReply(text);
        this.messages.push({ text: smartReply, sender: "bot" });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    extractBotReply(data) {
      console.log('Extracting reply from:', data);
      
      // Handle Lex V2 response format
      if (data.messages && Array.isArray(data.messages)) {
        return data.messages.map(msg => msg.content).join(' ');
      } 
      
      // Handle interpretations if messages is empty
      if (data.interpretations && data.interpretations.length > 0) {
        const intent = data.interpretations[0].intent;
        if (intent && intent.name) {
          return `I understand you want to use the ${intent.name}. How can I help you with that?`;
        }
      }
      
      // Fallback
      if (data.reply) {
        return data.reply;
      }
      
      return "Thanks for your message! How can I assist you with your flight booking?";
    },

    generateSmartReply(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('book') && lowerMessage.includes('flight')) {
        if (lowerMessage.includes('del') && lowerMessage.includes('bom')) {
          return "I can help you book a flight from Delhi to Mumbai! Please provide:\n• Travel dates\n• Number of passengers\n• Preferred time";
        }
        if (lowerMessage.includes('del') || lowerMessage.includes('bom') || lowerMessage.includes('maa') || lowerMessage.includes('blr')) {
          return "I can help with flight booking! Please specify:\n• Departure city\n• Destination city\n• Travel dates\n• Number of passengers";
        }
        return "I'd be happy to help you book a flight! Please tell me:\n• Departure city\n• Destination city\n• Travel dates\n• Number of passengers";
      }
      else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm AeroChat 🤖 I can help you with:\n• Flight bookings\n• Flight status\n• Booking management\n• Travel information\n\nHow can I assist you today?";
      }
      else if (lowerMessage.includes('thank')) {
        return "You're welcome! 😊 Is there anything else I can help you with?";
      }
      else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fare')) {
        return "I can check flight prices for you! Please specify:\n• Route (e.g., Delhi to Mumbai)\n• Travel dates\n• Number of passengers";
      }
      else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
        return "To check your booking status, please visit the 'My Bookings' section in your account or provide your booking reference number.";
      }
      else if (lowerMessage.includes('cancel')) {
        return "I can help with cancellation! Please provide your booking reference number or visit the 'My Bookings' section.";
      }
      else {
        return `I understand you're asking about: "${userMessage}". I'm AeroChat, your flight booking assistant. I can help you with:\n\n• Booking new flights\n• Checking flight status\n• Managing existing bookings\n• Flight information\n\nHow can I assist you with your travel plans?`;
      }
    }
  },
  watch: {
    messages() {
      this.scrollToBottom();
    },
  },
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.chatbot-button {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.chatbot-button:hover {
  transform: scale(1.05);
}

.chatbot-window {
  width: 350px;
  height: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-header {
  background: #007bff;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chatbot-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fa;
}

.message {
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 8px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.4;
  white-space: pre-line;
}

.message.user {
  background-color: #007bff;
  color: white;
  margin-left: auto;
  text-align: right;
}

.message.bot {
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  margin-right: auto;
  text-align: left;
}

.chatbot-input {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 12px;
  background: white;
  gap: 8px;
}

.chatbot-input input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  padding: 10px 16px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.chatbot-input input:focus {
  border-color: #007bff;
}

.chatbot-input input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chatbot-input button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.chatbot-input button:hover:not(:disabled) {
  background-color: #0056b3;
}

.chatbot-input button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>



