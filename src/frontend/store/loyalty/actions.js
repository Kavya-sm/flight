import Loyalty from "../../shared/models/LoyaltyClass";
import { Loading } from "quasar";

const LOYALTY_API_URL = "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod";

/**
 * Fetch loyalty data for current user
 */
export async function fetchLoyalty({ commit, rootState }) {
  Loading.show({
    message: "Loading loyalty data..."
  });

  try {
    console.log("Fetching loyalty data via REST API");

    // Get the actual user from profile store
    const user = rootState.profile?.user;
    const userId = user?.id || user?.sub || user?.username;

    console.log("User from profile:", user);
    console.log("Extracted user ID:", userId);

    if (!userId) {
      throw new Error("User not authenticated - no user ID found");
    }

    // Use fetch with userId parameter
    const response = await fetch(`${LOYALTY_API_URL}/loyalty?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Loyalty API error response:", errorText);
      throw new Error(`Failed to fetch loyalty info: ${response.status} ${response.statusText}`);
    }

    const loyaltyData = await response.json();
    console.log("Loyalty data:", loyaltyData);
    
    const loyalty = new Loyalty(loyaltyData);
    commit("SET_LOYALTY", loyalty);

    Loading.hide();
    return loyalty;
  } catch (err) {
    Loading.hide();
    console.error("Error fetching loyalty:", err);
    throw new Error("Failed to fetch loyalty data");
  }
}

/**
 * Add points to user's loyalty account
 */
export async function addLoyaltyPoints({ commit, rootState }, points) {
  try {
    console.log(`Adding ${points} loyalty points`);

    // Get the actual user from profile store
    const user = rootState.profile?.user;
    const userId = user?.id || user?.sub || user?.username;

    if (!userId) {
      throw new Error("User not authenticated - no user ID found");
    }

    const response = await fetch(`${LOYALTY_API_URL}/loyalty?userId=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pointsToAdd: points
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add points: ${response.status} ${response.statusText}`);
    }

    const loyaltyData = await response.json();
    const loyalty = new Loyalty(loyaltyData);
    commit("SET_LOYALTY", loyalty);

    return loyalty;
  } catch (err) {
    console.error("Error adding loyalty points:", err);
    throw new Error("Failed to add loyalty points");
  }
}
