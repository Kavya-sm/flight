import Loyalty from "../../shared/models/LoyaltyClass";
import { Loading } from "quasar";
import { API } from "aws-amplify";

/**
 * Fetch loyalty data for current user
 */
export async function fetchLoyalty({ commit }) {
  Loading.show({
    message: "Loading loyalty data..."
  });

  try {
    console.log("Fetching loyalty data via REST API");

    const response = await API.get("loyaltyAPI", "/loyalty", {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const loyalty = new Loyalty(response);
    console.log("Loyalty data:", loyalty);
    commit("SET_LOYALTY", loyalty);

    Loading.hide();
    return loyalty;
  } catch (err) {
    Loading.hide();
    console.error("Error fetching loyalty:", err);
    
    // If CORS error, try alternative approach
    if (err.message.includes('Network Error') || err.message.includes('CORS')) {
      return await fetchLoyaltyWithProxy({ commit });
    }
    
    throw new Error("Failed to fetch loyalty data");
  }
}

/**
 * Alternative method using proxy to bypass CORS
 */
async function fetchLoyaltyWithProxy({ commit }) {
  try {
    console.log("Trying CORS proxy approach");
    
    // Use a CORS proxy service - UPDATED TO /prod
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/loyalty'; // ← Changed to /prod
    
    const response = await fetch(proxyUrl + targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://main.d1r4zkv0u7sfsi.amplifyapp.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const loyaltyData = await response.json();
    const loyalty = new Loyalty(loyaltyData);
    commit("SET_LOYALTY", loyalty);
    
    return loyalty;
  } catch (error) {
    console.error("Proxy method also failed:", error);
    throw error;
  }
}

/**
 * Add points to user's loyalty account
 */
export async function addLoyaltyPoints({ commit }, points) {
  try {
    console.log(`Adding ${points} loyalty points`);

    const response = await API.post("loyaltyAPI", "/loyalty", {
      body: {
        pointsToAdd: points
      }
    });

    const loyalty = new Loyalty(response);
    commit("SET_LOYALTY", loyalty);

    return loyalty;
  } catch (err) {
    console.error("Error adding loyalty points:", err);
    throw new Error("Failed to add loyalty points");
  }
}
