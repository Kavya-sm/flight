// @ts-ignore
import { date } from "quasar";

export default class Flight {
  constructor({
    id,
    departureCity,
    departureDate,
    departureAirportCode,
    departureAirportName,
    departureLocale,
    arrivalCity,
    arrivalDate,
    arrivalAirportCode,
    arrivalAirportName,
    arrivalLocale,
    ticketPrice,
    ticketCurrency,
    flightNumber
  }) {
    this.id = id;
    this.departureCity = departureCity;
    this.departureDate = new Date(departureDate);
    this.departureAirportCode = departureAirportCode;
    this.departureAirportName = departureAirportName;
    this.departureLocale = departureLocale || "UTC"; // Default to UTC
    this.arrivalCity = arrivalCity;
    this.arrivalDate = new Date(arrivalDate);
    this.arrivalAirportCode = arrivalAirportCode;
    this.arrivalAirportName = arrivalAirportName;
    this.arrivalLocale = arrivalLocale || "UTC"; // Default to UTC
    this.ticketPrice = ticketPrice;
    this.ticketCurrency = ticketCurrency;
    this.flightNumber = flightNumber;
  }

  get flightDuration() {
    let unit = "minutes";
    let timeDiffInMinutes = Math.abs(
      date.getDateDiff(this.departureDate, this.arrivalDate, unit)
    );

    let hours = Math.floor(timeDiffInMinutes / 60);
    let minutes = timeDiffInMinutes - hours * 60;

    return `${hours}h${minutes}m`;
  }

  get departureTime() {
    // If no timezone is specified, use UTC time directly
    if (!this.departureLocale || this.departureLocale === "UTC") {
      // Extract time from UTC date without timezone conversion
      return date.formatDate(this.departureDate, "HH:mm");
    }

    var options = {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.departureLocale
    };

    let departureTime = this.departureDate.toLocaleString("en-GB", options);
    return departureTime;
  }

  get arrivalTime() {
    // If no timezone is specified, use UTC time directly
    if (!this.arrivalLocale || this.arrivalLocale === "UTC") {
      // Extract time from UTC date without timezone conversion
      return date.formatDate(this.arrivalDate, "HH:mm");
    }

    var options = {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.arrivalLocale
    };

    let arrivalTime = this.arrivalDate.toLocaleString("en-GB", options);
    return arrivalTime;
  }

  get departureDayMonthYear() {
    let departureDayMonthYear = date.formatDate(
      this.departureDate,
      "DD MMM YYYY"
    );
    return departureDayMonthYear;
  }
}
    return departureDayMonthYear;
  }
}
