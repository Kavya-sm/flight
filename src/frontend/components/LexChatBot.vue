<template>
  <div class="chatbot-container">
    <!-- Chat button -->
    <div v-if="!isOpen" class="chatbot-button" @click="isOpen = true">
      💬
    </div>

    <!-- Chat window -->
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

      // Add user message
      this.messages.push({ text, sender: "user" });
      this.userInput = "";
      this.isLoading = true;
      this.scrollToBottom();

      try {
        // Use the CORRECT endpoint that matches your API Gateway routes
        const apiUrl = "https://sywyfyg7aj.execute-api.ap-south-1.amazonaws.com/1_aerochat_prod/lex/aerochat";
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full response data:', data);

        // Extract message from Lex response structure
        let botReply = "I'm here to help with flight bookings!";
        
        if (data.messages && data.messages.length > 0) {
          botReply = data.messages.map(msg => msg.content).join(' ');
        } else if (data.reply) {
          botReply = data.reply;
        }

        this.messages.push({ text: botReply, sender: "bot" });

      } catch (error) {
        console.error("Chatbot fetch error:", error);
        
        // Fallback response
        this.messages.push({ 
          text: "I can help you book flights! Try: 'Book a flight from Delhi to Mumbai'", 
          sender: "bot" 
        });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },
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
}

.chatbot-input input:focus {
  border-color: #007bff;
}

.chatbot-input input:disabled {
  background-color: #f5f5f5;
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



