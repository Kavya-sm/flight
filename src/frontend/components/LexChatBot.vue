<template>
  <div class="chatbot-container">
    <div v-if="!isOpen" class="chatbot-button" @click="isOpen = true">
      <q-icon name="support_agent" size="28px" />
    </div>
    <div v-else class="chatbot-window">
      <div class="chatbot-header">
        <span>Travel Assistant</span>
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
          placeholder="Ask about flights, bookings, or travel..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading">
          <q-icon name="send" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TravelAssistant",
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [
        { text: "👋 Hello! I'm your Travel Assistant. I can help you with:\n\n• Flight information ✈️\n• Booking assistance\n• Travel tips\n• Airport guides\n• Baggage queries\n\nHow can I help you today?", sender: "bot" }
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
        // Try to get response from your API
        const response = await this.callAssistantAPI(text);
        if (response && response.ok) {
          const data = await response.json();
          let botReply = this.extractBotReply(data);
          this.messages.push({ text: botReply, sender: "bot" });
        } else {
          throw new Error('API unavailable');
        }
      } catch (error) {
        // Use smart assistant replies
        const assistantReply = this.generateAssistantReply(text);
        this.messages.push({ text: assistantReply, sender: "bot" });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    async callAssistantAPI(text) {
      // Your existing API call
      try {
        return await fetch(
          "https://sywyfyg7aj.execute-api.ap-south-1.amazonaws.com/1_aerochat_prod/lex/aerochat",
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              text: text,
              sessionId: `user-${Date.now()}`
            }),
          }
        );
      } catch (error) {
        throw error;
      }
    },

    extractBotReply(data) {
      if (data.messages && Array.isArray(data.messages)) {
        return data.messages.map(msg => msg.content).join(' ');
      } 
      if (data.reply) {
        return data.reply;
      }
      return this.generateAssistantReply("general help");
    },

    generateAssistantReply(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      
      // Booking assistance
      if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('reservation')) {
        return `📖 **Booking Assistance**\n\nTo book a flight, please:\n\n1. Visit our "Book Flights" section\n2. Select your departure & destination cities\n3. Choose travel dates\n4. Select number of passengers\n5. Choose your preferred flight\n6. Complete payment\n\nNeed help with any specific step?`;
      }
      
      // Flight information
      if (lowerMessage.includes('flight') && (lowerMessage.includes('status') || lowerMessage.includes('track'))) {
        return `✈️ **Flight Status**\n\nTo check your flight status:\n\n• Visit "Flight Status" page\n• Enter your flight number\n• Or check by route and date\n\nYou can also check your booking confirmation email for real-time updates.`;
      }
      
      // Check-in
      if (lowerMessage.includes('check') && lowerMessage.includes('in')) {
        return `🎫 **Online Check-in**\n\nOnline check-in opens 48 hours before departure:\n\n1. Go to "Manage Booking"\n2. Enter your booking reference\n3. Select passengers to check-in\n4. Choose seats\n5. Download boarding pass\n\nMobile boarding passes are available!`;
      }
      
      // Baggage
      if (lowerMessage.includes('baggage') || lowerMessage.includes('luggage') || lowerMessage.includes('bag')) {
        return `🎒 **Baggage Information**\n\n**Carry-on:** 1 bag + 1 personal item (7kg total)\n**Check-in:** 15-30kg depending on fare class\n\n• Extra baggage can be purchased online\n• Sports equipment requires advance notice\n• Prohibited items list available on our website`;
      }
      
      // Airport information
      if (lowerMessage.includes('airport') || lowerMessage.includes('terminal')) {
        return `🏢 **Airport Guide**\n\n**General Tips:**\n• Arrive 2 hours before domestic flights\n• Arrive 3 hours before international flights\n• Have ID and booking reference ready\n• Check security guidelines before packing`;
      }
      
      // Travel requirements
      if (lowerMessage.includes('visa') || lowerMessage.includes('passport') || lowerMessage.includes('document')) {
        return `📄 **Travel Documents**\n\n**Domestic:** Government photo ID\n**International:** Valid passport + visa if required\n\n• Check visa requirements for your destination\n• Ensure passport validity (6+ months)\n• Keep digital copies of documents`;
      }
      
      // Payment and pricing
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('payment')) {
        return `💰 **Pricing & Payment**\n\n• Prices vary by route, date, and demand\n• Multiple payment methods accepted\n• Price includes base fare + taxes\n• Seat selection may have additional cost\n\nCheck our website for current deals!`;
      }
      
      // Cancellation and changes
      if (lowerMessage.includes('cancel') || lowerMessage.includes('change') || lowerMessage.includes('modify')) {
        return `🔄 **Changes & Cancellations**\n\n**Manage your booking online:**\n• Change flight dates/times\n• Cancel with refund (if eligible)\n• Add extra services\n• Update passenger details\n\nFees may apply based on fare rules.`;
      }
      
      // Greetings
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return `👋 Hello! I'm your Travel Assistant!\n\nI can help you with:\n• ✈️ Flight information\n• 📖 Booking guidance\n• 🎒 Baggage queries\n• 🏢 Airport tips\n• 📄 Travel documents\n• 💰 Pricing questions\n\nWhat would you like to know?`;
      }
      
      // Thanks
      if (lowerMessage.includes('thank')) {
        return `😊 You're welcome! I'm happy to help.\n\nIs there anything else about your travel plans you'd like to know?`;
      }
      
      // Help
      if (lowerMessage.includes('help')) {
        return `🆘 **How I Can Help You:**\n\n✈️ **Flight Assistance**\n• Booking guidance\n• Flight status\n• Check-in help\n• Baggage information\n\n📋 **Travel Planning**\n• Airport information\n• Document requirements\n• Travel tips\n• Payment questions\n\n💼 **Booking Management**\n• Changes & cancellations\n• Seat selection\n• Extra services\n• Refund information\n\nWhat specific area do you need help with?`;
      }
      
      // Default response
      return `🤔 I understand you're asking about: "${userMessage}"\n\nAs your Travel Assistant, I can help with:\n\n• Flight booking guidance ✈️\n• Travel information and tips\n• Airport and baggage queries\n• Booking management help\n• General travel advice\n\nCould you tell me more specifically what you need help with?`;
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
  background-color: #1976d2;
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;
}

.chatbot-button:hover {
  transform: scale(1.1);
  box-shadow: 0px 6px 16px rgba(25, 118, 210, 0.4);
}

.chatbot-window {
  width: 380px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.chatbot-header {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafbfc;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

.message {
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.5;
  white-space: pre-line;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  margin-left: auto;
  text-align: right;
  box-shadow: 0px 2px 8px rgba(25, 118, 210, 0.3);
}

.message.bot {
  background: white;
  color: #2c3e50;
  border: 1px solid #e1e8ed;
  margin-right: auto;
  text-align: left;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
}

.chatbot-input {
  display: flex;
  border-top: 1px solid #e1e8ed;
  padding: 16px;
  background: white;
  gap: 12px;
  align-items: center;
}

.chatbot-input input {
  flex: 1;
  border: 2px solid #e1e8ed;
  border-radius: 24px;
  outline: none;
  padding: 12px 18px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.chatbot-input input:focus {
  border-color: #1976d2;
  background: white;
  box-shadow: 0px 0px 0px 3px rgba(25, 118, 210, 0.1);
}

.chatbot-input input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.chatbot-input button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0px 2px 8px rgba(25, 118, 210, 0.3);
}

.chatbot-input button:hover:not(:disabled) {
  background: #1565c0;
  transform: scale(1.05);
  box-shadow: 0px 4px 12px rgba(25, 118, 210, 0.4);
}

.chatbot-input button:disabled {
  background: #90caf9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>





