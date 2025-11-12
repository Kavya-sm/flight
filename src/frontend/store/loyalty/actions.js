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

  console.group("store/loyalty/actions/fetchLoyalty");
  try {
    console.log("Fetching loyalty data via REST API");

    const response = await API.get("loyaltyAPI", "/loyalty");
    const loyaltyData = response;

    const loyalty = new Loyalty(loyaltyData);
    console.log("Loyalty data:", loyalty);
    commit("SET_LOYALTY", loyalty);

    Loading.hide();
    console.groupEnd();
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
export async function addLoyaltyPoints({ commit }, points) {
  try {
    console.log(`Adding ${points} loyalty points`);

    const response = await API.post("loyaltyAPI", "/loyalty/points", {
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
