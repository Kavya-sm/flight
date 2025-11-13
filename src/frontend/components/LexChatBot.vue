<template>
  <div class="chatbot-container">
    <div v-if="!isOpen" class="chatbot-button" @click="isOpen = true">
      <q-icon name="flight" size="28px" />
    </div>
    <div v-else class="chatbot-window">
      <div class="chatbot-header">
        <span>Flight Booking Assistant</span>
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
          placeholder="Ask about flight booking or travel tips..."
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
  name: "FlightBookingAssistant",
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [
        { text: "✈️ Welcome to Flight Booking Assistant!\n\nI can help you with:\n• Flight booking guidance\n• Travel tips\n• Baggage allowance information\n• Loyalty points & discounts\n\nHow can I assist with your flight today?", sender: "bot" }
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
        const response = await this.callAssistantAPI(text);
        if (response && response.ok) {
          const data = await response.json();
          let botReply = this.extractBotReply(data);
          this.messages.push({ text: botReply, sender: "bot" });
        } else {
          throw new Error('API unavailable');
        }
      } catch (error) {
        const assistantReply = this.generateAssistantReply(text);
        this.messages.push({ text: assistantReply, sender: "bot" });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    async callAssistantAPI(text) {
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
      return this.generateAssistantReply("help");
    },

    generateAssistantReply(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      
      // End conversation
      if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || 
          lowerMessage.includes('see you') || lowerMessage.includes('thanks bye')) {
        return `👋 Thank you for chatting with Flight Booking Assistant! \n\nSafe travels and have a wonderful journey! ✈️\n\nFeel free to ask if you need more help later.`;
      }

      // Flight booking guidance
      if (lowerMessage.includes('book') || lowerMessage.includes('how to book') ||
          lowerMessage.includes('want to book') || lowerMessage.includes('need to book') ||
          lowerMessage.includes('flight booking') || lowerMessage.includes('book flight')) {
        return `📖 **How to Book a Flight:**\n\nTo book a flight, please:\n\n1. Visit our "Book Flights" section\n2. Select your departure & destination cities\n3. Choose travel dates\n4. Choose your preferred flight\n5. Complete payment\n\nThat's it! You'll receive your booking confirmation instantly.`;
      }

      // Loyalty points and discounts
      if (lowerMessage.includes('loyalty') || lowerMessage.includes('points') || 
          lowerMessage.includes('reward') || lowerMessage.includes('discount') ||
          lowerMessage.includes('membership') || lowerMessage.includes('benefits')) {
        return `🏆 **Loyalty Points & Discounts**\n\n**Earn Points:**\n• Get 100 points for every flight booked\n• Extra 50 points for international flights\n• Bonus points on premium class bookings\n\n**Redeem Points:**\n• Use points for flight discounts\n• 100 points = $10 discount\n• Redeem for seat upgrades\n• Get priority boarding\n\n**Benefits:**\n• Exclusive member-only deals\n• Faster check-in process\n• Free baggage allowance increase\n• Access to airport lounges\n\nCheck your points balance in "My Account" section!`;
      }

      // Baggage allowance
      if (lowerMessage.includes('baggage') || lowerMessage.includes('luggage') || 
          lowerMessage.includes('bag') || lowerMessage.includes('allowance')) {
        return `🎒 **Baggage Allowance**\n\n**Carry-on Baggage:**\n• 1 cabin bag (7kg maximum)\n• 1 personal item (laptop bag/handbag)\n\n**Check-in Baggage:**\n• Economy: 15kg\n• Premium Economy: 20kg\n• Business Class: 30kg\n\n💡 **Loyalty members get extra 5kg baggage allowance!**`;
      }

      // Travel tips
      if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || 
          lowerMessage.includes('suggestion') || lowerMessage.includes('recommend')) {
        return `💡 **Travel Tips**\n\n**Before Flight:**\n• Check-in online 48 hours before\n• Arrive 2 hours before domestic flights\n• Keep ID and booking reference ready\n\n**At Airport:**\n• Have liquids in clear bags\n• Wear comfortable shoes\n• Charge your devices\n\n**Loyalty Benefits:**\n• Use points for discounts on next booking\n• Book flights on weekdays for better prices\n• Download our mobile app for exclusive deals`;
      }

      // Greetings
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
          lowerMessage.includes('hey') || lowerMessage === 'hey') {
        return `👋 Hello! I'm your Flight Booking Assistant.\n\nI specialize in:\n• ✈️ Flight booking guidance\n• 💡 Travel tips\n• 🎒 Baggage information\n• 🏆 Loyalty points & discounts\n\nHow can I help you with your flight today?`;
      }

      // Thanks
      if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return `😊 You're welcome! I'm happy to help with your flight planning.\n\nIs there anything else about flight booking or loyalty points you'd like to know?`;
      }

      // Help
      if (lowerMessage.includes('help')) {
        return `🆘 **I Can Help With:**\n\n✈️ **Flight Booking**\n• How to book flights step-by-step\n• Flight selection guidance\n\n🏆 **Loyalty Program**\n• Earning and redeeming points\n• Member benefits and discounts\n\n💡 **Travel Assistance**\n• Baggage allowance information\n• Airport and travel tips\n\nWhat specific help do you need?`;
      }

      // Default
      return `✈️ I understand you're asking about flight travel.\n\nI can help you with:\n• How to book flights step-by-step\n• Loyalty points and discount information\n• Baggage allowance details\n• Travel tips and preparation\n\nWould you like guidance on booking a flight or information about loyalty points?`;
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






