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
      bookingState: {
        inProgress: false,
        departure: '',
        destination: '',
        dates: '',
        passengers: ''
      }
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
        // Try direct API call first
        const response = await this.makeDirectApiCall(text);
        
        if (response && response.ok) {
          const data = await response.json();
          console.log('Lex response:', data);
          let botReply = this.extractBotReply(data);
          this.messages.push({ text: botReply, sender: "bot" });
        } else {
          throw new Error('API call failed');
        }

      } catch (error) {
        console.log("Using smart reply system");
        const smartReply = this.generateSmartReply(text);
        this.messages.push({ text: smartReply, sender: "bot" });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    async makeDirectApiCall(text) {
      return new Promise((resolve, reject) => {
        // Create a timeout to avoid hanging
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000);

        // Try the direct call but don't wait for CORS
        fetch("https://sywyfyg7aj.execute-api.ap-south-1.amazonaws.com/1_aerochat_prod/lex/aerochat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            text: text,
            sessionId: `user-${Date.now()}`
          }),
        })
        .then(response => {
          clearTimeout(timeout);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    },

    extractBotReply(data) {
      if (data.messages && Array.isArray(data.messages)) {
        return data.messages.map(msg => msg.content).join(' ');
      } 
      if (data.reply) {
        return data.reply;
      }
      return "Thanks for your message! How can I assist you?";
    },

    generateSmartReply(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      
      // Flight booking conversation
      if (this.bookingState.inProgress) {
        return this.handleBookingConversation(userMessage);
      }
      
      // Start new booking
      if (lowerMessage.includes('book') && lowerMessage.includes('flight')) {
        this.startBooking();
        return "🚀 Great! Let's book your flight!\n\nPlease provide:\n• Departure city (e.g., Delhi)\n• Destination city (e.g., Mumbai)\n• Travel dates\n• Number of passengers";
      }
      
      // Airport codes
      if (lowerMessage.includes('del') || lowerMessage.includes('bom') || 
          lowerMessage.includes('maa') || lowerMessage.includes('blr')) {
        this.startBooking();
        return "✈️ I see airport codes! Let me help book your flight.\n\nPlease provide:\n• Departure city\n• Destination city\n• Travel dates\n• Number of passengers";
      }
      
      // Greetings
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! 👋 I'm AeroChat, your flight booking assistant!\n\nI can help you:\n• Book flights ✈️\n• Check flight status\n• Find best deals\n• Travel planning";
      }
      
      // Thanks
      if (lowerMessage.includes('thank')) {
        return "You're welcome! 😊 Happy to help!\n\nIs there anything else you'd like to know about flights?";
      }
      
      // Default
      return `✈️ I understand you're asking about "${userMessage}".\n\nI specialize in flight bookings and travel assistance! You can:\n\n• Say "book flight" to start booking\n• Ask about flight status\n• Get travel recommendations\n\nHow can I help with your travel plans today?`;
    },

    startBooking() {
      this.bookingState = {
        inProgress: true,
        departure: '',
        destination: '',
        dates: '',
        passengers: ''
      };
    },

    handleBookingConversation(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      
      // Departure city
      if (!this.bookingState.departure) {
        if (lowerMessage.includes('delhi') || lowerMessage === 'del') {
          this.bookingState.departure = 'Delhi (DEL)';
          return `📍 Departure: ${this.bookingState.departure}\n\nNow, where would you like to fly to? (Destination city)`;
        }
        if (lowerMessage.includes('mumbai') || lowerMessage === 'bom') {
          this.bookingState.departure = 'Mumbai (BOM)';
          return `📍 Departure: ${this.bookingState.departure}\n\nNow, where would you like to fly to? (Destination city)`;
        }
        if (lowerMessage.includes('chennai') || lowerMessage === 'maa') {
          this.bookingState.departure = 'Chennai (MAA)';
          return `📍 Departure: ${this.bookingState.departure}\n\nNow, where would you like to fly to? (Destination city)`;
        }
        if (lowerMessage.includes('bangalore') || lowerMessage === 'blr') {
          this.bookingState.departure = 'Bangalore (BLR)';
          return `📍 Departure: ${this.bookingState.departure}\n\nNow, where would you like to fly to? (Destination city)`;
        }
        return "✈️ Let's start with your departure city. Where are you flying from?\n\nPopular cities: Delhi, Mumbai, Bangalore, Chennai";
      }
      
      // Destination city
      if (!this.bookingState.destination) {
        if (lowerMessage.includes('delhi') || lowerMessage === 'del') {
          this.bookingState.destination = 'Delhi (DEL)';
        }
        else if (lowerMessage.includes('mumbai') || lowerMessage === 'bom') {
          this.bookingState.destination = 'Mumbai (BOM)';
        }
        else if (lowerMessage.includes('chennai') || lowerMessage === 'maa') {
          this.bookingState.destination = 'Chennai (MAA)';
        }
        else if (lowerMessage.includes('bangalore') || lowerMessage === 'blr') {
          this.bookingState.destination = 'Bangalore (BLR)';
        }
        else {
          this.bookingState.destination = userMessage;
        }
        
        return `🎯 Destination: ${this.bookingState.destination}\n\nGreat! When would you like to travel?\n\nPlease provide travel dates (e.g., "25 December 2024" or "next week")`;
      }
      
      // Travel dates
      if (!this.bookingState.dates) {
        this.bookingState.dates = userMessage;
        return `📅 Travel dates: ${this.bookingState.dates}\n\nHow many passengers?`;
      }
      
      // Passengers
      if (!this.bookingState.passengers) {
        this.bookingState.passengers = userMessage;
        
        const bookingSummary = `
✅ Flight Booking Summary:

📍 From: ${this.bookingState.departure}
🎯 To: ${this.bookingState.destination}
📅 Dates: ${this.bookingState.dates}
👥 Passengers: ${this.bookingState.passengers}

To complete your booking, please visit our booking page or contact our customer service for the best deals! 🎫

Would you like to search for another flight?
        `.trim();
        
        // Reset booking state
        this.bookingState.inProgress = false;
        
        return bookingSummary;
      }
      
      return "I'm here to help with your flight booking! What would you like to know?";
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




