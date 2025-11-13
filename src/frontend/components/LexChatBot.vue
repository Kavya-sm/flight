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
        const response = await fetch(
          "https://sywyfyg7aj.execute-api.ap-south-1.amazonaws.com/1_aerochat_prod/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text }),
          }
        );

        let data = {};
        try {
          data = await response.json();
        } catch (jsonError) {
          console.warn("Failed to parse bot response JSON:", jsonError);
        }

        const botReply = data?.reply || "Sorry, I couldn’t get that.";
        this.messages.push({ text: botReply, sender: "bot" });

      } catch (error) {
        console.error("Chatbot fetch error:", error);
        this.messages.push({ text: "Error connecting to the bot.", sender: "bot" });
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

// --- HACK: Intercept fetch to fix body key 'message' → 'text' for Lex Lambda ---
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  if (
    args[0] ===
    "https://sywyfyg7aj.execute-api.ap-south-1.amazonaws.com/1_aerochat_prod/chat"
  ) {
    try {
      let options = args[1] || {};
      if (options.body) {
        let bodyObj = JSON.parse(options.body);
        // Rename 'message' to 'text'
        if (bodyObj.message) {
          bodyObj.text = bodyObj.message;
          delete bodyObj.message;
          options.body = JSON.stringify(bodyObj);
        }
      }
      args[1] = options;
    } catch (e) {
      console.warn("Fetch body hack failed:", e);
    }
  }
  return originalFetch(...args);
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

.chatbot-window {
  width: 320px;
  height: 420px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.chatbot-header {
  background: #007bff;
  color: white;
  padding: 10px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.chatbot-messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.message {
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  max-width: 80%;
}

.message.user {
  background-color: #e1f5fe;
  align-self: flex-end;
  text-align: right;
}

.message.bot {
  background-color: #f1f1f1;
  align-self: flex-start;
  text-align: left;
}

.chatbot-input {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 10px;
}

.chatbot-input input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
}

.chatbot-input button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>

