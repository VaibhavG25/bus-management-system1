const busNames = {
  private: ["Private Express", "Star Travels", "Speed liner"],
  government: ["Metro Bus", "State Express", "Govt Rapid"],
};

const routeDetails = {
  "City Center - Airport": { price: 150, timings: ["9:00 AM", "12:00 PM", "6:00 PM"], conductor: "Mr. Kumar" },
  "Downtown - University": { price: 100, timings: ["8:00 AM", "1:00 PM", "5:30 PM"], conductor: "Ms. Rao" },
  "Station - Business Park": { price: 120, timings: ["7:30 AM", "11:00 AM", "4:00 PM"], conductor: "Mr. Verma" },
};

let selectedBus = null;
let ticketId = 0;
let tickets = [];

function openCustomerModal() {
  resetCustomerModal();
  const modal = new bootstrap.Modal(document.getElementById("customerModal"));
  modal.show();
}

function openConductorModal() {
  populateConductorTickets();
  const modal = new bootstrap.Modal(document.getElementById("conductorModal"));
  modal.show();
}

function showBusNames(type) {
  document.getElementById("busTypeStep").classList.add("d-none");
  document.getElementById("busNameStep").classList.remove("d-none");

  document.getElementById("busListTitle").textContent = `Select a ${type === "private" ? "Private" : "Government"} Bus:`;

  const container = document.getElementById("busListButtons");
  container.innerHTML = "";

  busNames[type].forEach((bus) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-dark m-1";
    btn.textContent = bus;
    btn.onclick = () => showBusDetails(bus);
    container.appendChild(btn);
  });
}

function goBackToBusType() {
  document.getElementById("busTypeStep").classList.remove("d-none");
  document.getElementById("busNameStep").classList.add("d-none");
  document.getElementById("busListButtons").innerHTML = "";
}

function resetCustomerModal() {
  goBackToBusType();
  document.getElementById("routeSelect").selectedIndex = 0;
  document.getElementById("busDetailsStep").classList.add("d-none");
}

function showBusDetails(bus) {
  selectedBus = bus;
  document.getElementById("selectedBusName").textContent = bus;
  document.getElementById("busNameStep").classList.add("d-none");
  document.getElementById("busDetailsStep").classList.remove("d-none");
}

function updateDetails() {
  const route = document.getElementById("routeSelect").value;
  const details = routeDetails[route];

  if (details) {
    document.getElementById("priceDisplay").textContent = details.price;
    document.getElementById("conductorName").textContent = details.conductor;

    const timingList = document.getElementById("timingList");
    timingList.innerHTML = "";
    details.timings.forEach((time) => {
      const li = document.createElement("li");
      li.textContent = time;
      timingList.appendChild(li);
    });
  }
}

function goBackToBusNames() {
  document.getElementById("busDetailsStep").classList.add("d-none");
  document.getElementById("busNameStep").classList.remove("d-none");
}

// Navigation logic for switching pages
function navigateTo(pageId) {
  document.querySelectorAll(".page").forEach((el) => el.classList.add("d-none"));
  document.getElementById(pageId).classList.remove("d-none");
}

// Utility to get tickets from localStorage
function getStoredTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}

// Utility to save ticket to localStorage
function saveTicket(ticket) {
  const tickets = getStoredTickets();
  tickets.push(ticket);
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

// Update conductor modal ticket list
function populateConductorTickets() {
  const ticketList = document.querySelector("#conductorModal .list-group");
  const tickets = getStoredTickets();

  document.querySelector("#conductorModal .modal-body p strong").textContent = tickets.length;
  ticketList.innerHTML = "";

  if (tickets.length === 0) {
    ticketList.innerHTML = "<li class='list-group-item'>No tickets found.</li>";
    return;
  }

  tickets.forEach((ticket, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
      <strong>ID:</strong> T${index + 1 < 10 ? "00" : "0"}${index + 1} <br />
      <strong>Name:</strong> ${ticket.name} <br />
      <strong>Route:</strong> ${ticket.route} <br />
      <strong>Timing:</strong> ${ticket.timing} <br />
      <strong>Booked At:</strong> ${ticket.timestamp}
    `;
    ticketList.appendChild(li);
  });
}

// Ticket booking handler
document.getElementById("ticket-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const email = document.getElementById("email").value.trim();
  const timing = document.querySelector('input[name="timing"]:checked')?.value || "Not Selected";

  if (!name || !from || !to || !email) {
    alert("Please fill in all fields correctly.");
    return;
  }

  const route = `${from} - ${to}`;
  const timestamp = new Date().toLocaleString();
  const ticket = { name, from, to, email, route, timing, timestamp };

  saveTicket(ticket);

  alert(`Ticket booked successfully for ${name} from ${from} to ${to}!`);
  this.reset();
  navigateTo("home-page");
});

// Conductor ticket verification
document.getElementById("verify-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const ticketNum = document.getElementById("ticket-number").value.trim().toUpperCase();
  const tickets = getStoredTickets();
  const ticketIndex = parseInt(ticketNum.replace("T", "")) - 1;

  if (!isNaN(ticketIndex) && tickets[ticketIndex]) {
    const ticket = tickets[ticketIndex];
    alert(`Verified: ${ticket.name}, Route: ${ticket.from} - ${ticket.to}`);
  } else {
    alert("Invalid ticket number.");
  }

  this.reset();
});

function proceedToBooking() {
  const route = document.getElementById("routeSelect").value;
  if (!route) {
    alert("Please select a route first.");
    return;
  }

  // Parse 'from - to'
  const [from, to] = route.split(" - ");
  document.getElementById("from").value = from;
  document.getElementById("to").value = to;

  // Optional: preselect timing radio buttons
  const details = routeDetails[route];
  if (details) {
    const timingOptions = details.timings.map(time => `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="timing" value="${time}" id="timing-${time.replace(/[:\s]/g, "")}">
        <label class="form-check-label" for="timing-${time.replace(/[:\s]/g, "")}">${time}</label>
      </div>
    `).join("");
    document.getElementById("timing-options").innerHTML = timingOptions;
  }

  // Hide modal and show booking page
  const modal = bootstrap.Modal.getInstance(document.getElementById("customerModal"));
  modal.hide();

  navigateTo("customer-page");
}

function proceedToPayment() {
  const name = document.getElementById("name").value;
  const route = document.getElementById("routeSelect").value;
  const timingList = document.querySelectorAll("#timingList li");

  if (!route || timingList.length === 0) {
    alert("Please select a route and ensure timings are loaded.");
    return;
  }

  document.getElementById("busDetailsStep").classList.add("d-none");
  document.getElementById("paymentStep").classList.remove("d-none");

  ticketId++;
  tickets.push({id: ticketId, name: name, route: route});
  console.log(unverifiedTickets);
}

function goBackToDetails() {
  document.getElementById("paymentStep").classList.add("d-none");
  document.getElementById("busDetailsStep").classList.remove("d-none");
}

function confirmBooking() {
  const route = document.getElementById("routeSelect").value;
  const timing = document.querySelector("#timingList li")?.textContent || "Not Selected";

  if (!selectedBus || !route || timing === "Not Selected") {
    alert("Booking info incomplete.");
    return;
  }

  const ticket = {
    name: "Guest",
    from: route.split(" - ")[0],
    to: route.split(" - ")[1],
    route,
    timing,
    timestamp: new Date().toLocaleString(),
  };

  saveTicket(ticket);

  alert("✅ Ticket Booked! Check it in the Conductor view.");
  const modalEl = document.getElementById("customerModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
  resetCustomerModal();
}
function confirmBooking() {
  const bookingData = window.bookingData;

  if (!bookingData || !bookingData.name || !bookingData.route || !bookingData.bus) {
    alert("Booking failed. Missing information.");
    return;
  }

  alert(`Ticket booked successfully for ${bookingData.name} on ${bookingData.bus} via ${bookingData.route}`);

  // Optionally reset modal
  resetCustomerModal();
  const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
  if (modal) modal.hide();
}



function resetCustomerModal() {
  // Hide all steps
  document.getElementById("busTypeStep").classList.remove("d-none");
  document.getElementById("busNameStep").classList.add("d-none");
  document.getElementById("busDetailsStep").classList.add("d-none");
  document.getElementById("paymentStep").classList.add("d-none");

  // Clear selected values
  document.getElementById("selectedBusName").textContent = "";
  document.getElementById("routeSelect").value = "";
  document.getElementById("priceDisplay").textContent = "-";
  document.getElementById("conductorName").textContent = "-";
  document.getElementById("timingList").innerHTML = "";
  document.getElementById("busListButtons").innerHTML = "";
  document.getElementById("busListTitle").textContent = "";

  // Reset selectedBus global variable if used
  if (typeof selectedBus !== 'undefined') {
    selectedBus = null;
  }
}

document.getElementById('customerModal').addEventListener('hidden.bs.modal', resetCustomerModal);


function submitBooking(event) {
  event.preventDefault(); // Prevent the form from submitting to the server

  // Get values from the form
  var customerName = document.getElementById('customerName').value;
  var selectedRoute = document.getElementById('routeSelect').value;
  var selectedTime = document.getElementById('timeSelect').value;

  // Display confirmation message
  alert("Booking submitted for manual verification.\n" +
    "Customer: " + customerName + "\n" +
    "Route: " + selectedRoute + "\n" +
    "Time: " + selectedTime);

  // Update ticket details
  document.getElementById('ticketDetails').innerHTML = `
<h5>Ticket Details:</h5>
<p><strong>Price:</strong> <span id="priceDisplay">-</span></p>
<p><strong>Conductor:</strong> <span id="conductorName">-</span></p>
<p><strong>Selected Time:</strong> <span id="timeDisplay">${selectedTime}</span></p>
<p><strong>Available Timings:</strong></p>
<ul id="timingList"></ul>
`;

  // Manually verifying the booking (could also trigger a status update)
  manualVerification(customerName, selectedRoute, selectedTime);
}


function updateDetails() {
  var selectedRoute = document.getElementById('routeSelect').value;
  var timingSelect = document.getElementById('timeSelect');

  // Dynamically change available timings based on selected route
  if (selectedRoute === "Jalandhar Bus Stand - Lovely Professional University") {
    timingSelect.innerHTML = `
        <option value="8:00 AM">8:00 AM</option>
        <option value="12:00 PM">12:00 PM</option>
        <option value="4:00 PM">4:00 PM</option>
      `;
  } else if (selectedRoute === "Lovely Professional University - Rama Mandi") {
    timingSelect.innerHTML = `
        <option value="9:00 AM">9:00 AM</option>
        <option value="1:00 PM">1:00 PM</option>
        <option value="5:00 PM">5:00 PM</option>
      `;
  } else if (selectedRoute === "Rama Mandi - Jalandhar Bus Stand") {
    timingSelect.innerHTML = `
        <option value="10:00 AM">10:00 AM</option>
        <option value="2:00 PM">2:00 PM</option>
        <option value="6:00 PM">6:00 PM</option>
      `;
  }
}

function submitBooking(event) {
  event.preventDefault(); // Prevent the form from submitting to the server

  // Get values from the form
  var customerName = document.getElementById('customerName').value;
  var selectedRoute = document.getElementById('routeSelect').value;
  var selectedTime = document.getElementById('timeSelect').value;

  // Display confirmation message
  alert("Booking submitted for manual verification.\n" +
    "Customer: " + customerName + "\n" +
    "Route: " + selectedRoute + "\n" +
    "Time: " + selectedTime);

  // Update ticket details
  document.getElementById('ticketDetails').innerHTML = `
<h5>Ticket Details:</h5>
<p><strong>Price:</strong> <span id="priceDisplay">-</span></p>
<p><strong>Conductor:</strong> <span id="conductorName">-</span></p>
<p><strong>Selected Time:</strong> <span id="timeDisplay">${selectedTime}</span></p>
<p><strong>Available Timings:</strong></p>
<ul id="timingList"></ul>
`;

  // Manually verifying the booking (could also trigger a status update)
  manualVerification(customerName, selectedRoute, selectedTime);
}

// Initialize Popovers
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
popoverTriggerList.forEach(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

// Typeahead Initialization
$(document).ready(function () {
  var busNames = ['Bus A', 'Bus B', 'Bus C', 'Bus D', 'Private Bus 1', 'Private Bus 2', 'Gov Bus X'];
  $('#busNameInput').typeahead({
    source: busNames
  });
});


// Functions for Conductor Modal Navigation
function openManualVerification() {
  document.getElementById('conductorMainMenu').classList.add('d-none');
  document.getElementById('manualVerification').classList.remove('d-none');
}

function openQRScanner() {
  document.getElementById('conductorMainMenu').classList.add('d-none');
  document.getElementById('qrScannerVerification').classList.remove('d-none');
  startQRScanner();
}

function updateDetails() {
  var route = document.getElementById('routeSelect').value;
  var priceDisplay = document.getElementById('priceDisplay');
  var conductorName = document.getElementById('conductorName');
  var timingList = document.getElementById('timingList');

  // Example dummy logic (you can customize later)
  if (route === "Jalandhar Bus Stand - Lovely Professional University") {
    priceDisplay.textContent = " ₹30";
    conductorName.textContent = " Mr. Shivam Sharma";
    timingList.innerHTML = "<li>9:00 AM</li><li>11:00 AM</li><li>2:00 PM</li>";
  } else if (route === "Lovely Professional University - Rama Mandi") {
    priceDisplay.textContent = " ₹20";
    conductorName.textContent = " Ms. Anjali Mehra";
    timingList.innerHTML = "<li>10:00 AM</li><li>1:00 PM</li><li>4:00 PM</li>";
  } else if (route === "Rama Mandi - Jalandhar Bus Stand") {
    priceDisplay.textContent = " ₹25";
    conductorName.textContent = " Mr. Rahul Singh";
    timingList.innerHTML = "<li>8:30 AM</li><li>12:30 PM</li><li>5:00 PM</li>";
  } else {
    priceDisplay.textContent = "-";
    conductorName.textContent = "-";
    timingList.innerHTML = "";
  }
}

function goBackToConductorMenu() {
  document.getElementById('manualVerification').classList.add('d-none');
  document.getElementById('qrScannerVerification').classList.add('d-none');
  document.getElementById('conductorMainMenu').classList.remove('d-none');
}

function verifyTicketManually() {
  var input = document.getElementById('manualTicketInput').value.trim();
  console.log(input);
  // Make sure the input is not empty
  if (input === '') {
    document.getElementById('manualVerifyResult').innerHTML = "<span class='text-warning'>Please enter a ticket ID.</span>";
    return;
  }
  console.log(unverifiedTickets);
  // Check if the ticket is in the unverifiedTickets array
  if (!unverifiedTickets.includes(input)) {
    // Remove the ticket from unverifiedTickets
    unverifiedTickets = unverifiedTickets.filter(ticket => ticket !== input);

    // Add the ticket to the verifiedTickets array
    verifiedTickets.push(input);

    // Show success message
    document.getElementById('manualVerifyResult').innerHTML = "<span class='text-success'>Ticket Verified</span>";
    // Display ticket details (this is where you can show the ticket details)

    const ticketDetails = getTicketDetails(input);
    const detailsHTML = `
      <p><strong>Ticket ID:</strong> ${ticketDetails.id}</p>
      <p><strong>Passenger Name:</strong> ${ticketDetails.name}</p>
      <p><strong>Route:</strong> ${ticketDetails.route}</p>
      <p><strong>Seat Number:</strong> ${ticketDetails.seat}</p>
    `;
    document.getElementById('manualVerifyResult').innerHTML += detailsHTML;
    // Optionally, log to the console for debugging
    console.log("Unverified Tickets:", unverifiedTickets);
    console.log("Verified Tickets:", verifiedTickets);
  } else {
    document.getElementById('manualVerifyResult').innerHTML = "<span class='text-danger'>Ticket Not Found</span>";
  }
}
function verifyTicketManually() {
  const input = document.getElementById("manualTicketInput").value.trim().toLowerCase();
  const resultArea = document.getElementById("manualVerifyResult");

  const ticket = tickets.find(t =>
    t.id.toLowerCase() === input || t.name.toLowerCase() === input
  );

  if (ticket) {
    resultArea.innerHTML = `✅ Ticket Found<br>Bus: ${ticket.bus}<br>Route: ${ticket.route}`;
    resultArea.classList.remove("text-danger");
    resultArea.classList.add("text-success");
  } else {
    resultArea.innerHTML = "❌ Ticket not found";
    resultArea.classList.remove("text-success");
    resultArea.classList.add("text-danger");
  }
}



function getTicketDetails(ticketId) {
  // Here, you would normally retrieve this from a database or other source
  let ticket = tickets.filter(ticket => ticket.id == ticketId);
  const ticketDetails = {
    id: ticket.id,
    name: ticket.name,  // Replace with actual data
    route: ticket.route,  // Replace with actual data
  };

  return ticketDetails;
}

// Go back to the Conductor Main Menu
function goBackToConductorMenu() {
  // Show main menu and hide other sections
  document.getElementById('conductorMainMenu').classList.remove('d-none');
  document.getElementById('manualVerification').classList.add('d-none');
  document.getElementById('verifiedTickets').classList.add('d-none');
}

// Open the Manual Verification section
function openManualVerification() {
  document.getElementById('conductorMainMenu').classList.add('d-none');
  document.getElementById('manualVerification').classList.remove('d-none');
  document.getElementById('verifiedTickets').classList.add('d-none');
}

// QR Scanner Initialization
let scanner;
function startQRScanner() {
  scanner = new Instascan.Scanner({ video: document.getElementById('scannerPreview') });
  scanner.addListener('scan', function (content) {
    document.getElementById('qrResult').innerHTML = "Scanned: " + content;
  });
  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      alert('No cameras found');
    }
  }).catch(function (e) {
    console.error(e);
  });
}

function stopQRScanner() {
  if (scanner) {
    scanner.stop();
  }
}

function openConductorModal() {
  var conductorModal = new bootstrap.Modal(document.getElementById('conductorModal'));
  conductorModal.show();
}


// Initialize Popovers
const popover = document.querySelectorAll('[data-bs-toggle="popover"]');
popoverTriggerList.forEach(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

// Typeahead Initialization
$(document).ready(function () {
  var buses = ['Alpha Travels', 'City Express', 'LPU Shuttle', 'Jalandhar Express', 'Govt Route A', 'Govt Route B'];

  $('#busNameInput').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'buses',
    source: substringMatcher(buses)
  });

  function substringMatcher(strs) {
    return function findMatches(q, cb) {
      var matches = [];
      var substrRegex = new RegExp(q, 'i');
      $.each(strs, function (i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });
      cb(matches);
    };
  }
});



function saveTicket(ticket) {
  const tickets = getStoredTickets();
  tickets.push(ticket);
  localStorage.setItem("tickets", JSON.stringify(tickets));

  // Add the ticket ID to the unverified tickets list
  unverifiedTickets.push(ticket.id);  // Save the ticket ID for verification later
}

function getStoredTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}

function populateConductorTickets() {
  const ticketList = document.querySelector("#conductorModal .list-group");
  const tickets = getStoredTickets();

  document.querySelector("#conductorModal .modal-body p strong").textContent = tickets.length;
  ticketList.innerHTML = "";

  if (unverifiedTickets.length === 0) {
    ticketList.innerHTML = "<li class='list-group-item'>No unverified tickets found.</li>";
    return;
  }

  unverifiedTickets.forEach((ticketId) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
      <strong>ID:</strong> ${ticketId} <br />
      <strong>Status:</strong> Unverified
    `;
    ticketList.appendChild(li);
  });
}

document.getElementById("ticket-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const email = document.getElementById("email").value.trim();
  const timing = document.querySelector('input[name="timing"]:checked')?.value || "Not Selected";

  if (!name || !from || !to || !email) {
    alert("Please fill in all fields correctly.");
    return;
  }

  const route = `${from} - ${to}`;
  const timestamp = new Date().toLocaleString();
  const ticketId = `T${getStoredTickets().length + 1}`.padStart(3, '0');  // Ticket ID T001, T002, ...
  const ticket = { id: ticketId, name, from, to, email, route, timing, timestamp };

  saveTicket(ticket);

  alert(`Ticket booked successfully for ${name} from ${from} to ${to}! Your ticket ID is ${ticketId}`);
  this.reset();
  navigateTo("home-page");
});

document.getElementById("verify-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const ticketNum = document.getElementById("ticket-number").value.trim().toUpperCase();
  const ticketIndex = unverifiedTickets.indexOf(ticketNum);

  if (ticketIndex !== -1) {
    unverifiedTickets.splice(ticketIndex, 1);  // Remove from unverified list after verification
    alert(`Ticket ${ticketNum} verified successfully.`);
  } else {
    alert("Invalid or already verified ticket number.");
  }

  populateConductorTickets();  // Refresh the list of unverified tickets
  this.reset();
});

function confirmBooking() {
  const route = document.getElementById("routeSelect").value;
  const timing = document.querySelector("#timingList li")?.textContent || "Not Selected";

  if (!selectedBus || !route || timing === "Not Selected") {
    alert("Booking info incomplete.");
    return;
  }

  const ticket = {
    id: `T${getStoredTickets().length + 1}`,  // Generate ticket ID
    name: "Guest",
    from: route.split(" - ")[0],
    to: route.split(" - ")[1],
    route,
    timing,
    timestamp: new Date().toLocaleString(),
  };

  saveTicket(ticket);

  alert("✅ Ticket Booked! Check it in the Conductor view.");
  const modalEl = document.getElementById("customerModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
  resetCustomerModal();
}
