let loggedInUserId = document
  .querySelector('meta[name="userId"]')
  .getAttribute("content");

let onlineUsers = [];

// Initialize socket connection
let socket = io("http://localhost:5000");

socket.emit("user-connected", loggedInUserId);

// Listen for the socket event
socket.on("online-users", (onlineUserIds) => {
  console.log("Online Users:", onlineUserIds);
  onlineUsers = onlineUserIds;

  // Update each status span on the page
  document.querySelectorAll(".user-status-badge").forEach((el) => {
    let classes = Array.from(el.classList);
    let userIdClass = classes.find((cls) =>
      cls.startsWith("user-status-badge")
    );
    console.log("userIdClass", userIdClass);
    if (userIdClass) {
      let userId = userIdClass.replace("user-status-badge", "");

      if (onlineUserIds.includes(userId)) {
        el.innerText = "🟢 Online";
        el.classList.remove("text-dark-color");
        el.classList.add("text-green-500");
      } else {
        el.innerText = "Offline";
        el.classList.remove("text-green-500");
        el.classList.add("text-dark-color");
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("onlineUsers ", onlineUsers);
  // widget start
  const widget_area = document.querySelector("#widget-area");
  const widget_wrapper = document.querySelector(".widget-wrapper");
  const widget_toggle = document.querySelector(".widget-toggle");

  // user off canvas menu toggle
  widget_toggle.addEventListener("click", function () {
    if (widget_wrapper.classList.contains("invisible")) {
      widget_wrapper.classList.remove("invisible");
      widget_wrapper.classList.add("w-96");
      widget_toggle.classList.add("rotate-180");
    } else {
      widget_wrapper.classList.remove("w-96");
      widget_wrapper.classList.add("invisible");
      widget_toggle.classList.remove("rotate-180");
    }
  });
  widget_area.addEventListener("click", (event) => {
    if (event.target.classList.contains("widget-wrapper")) {
      widget_wrapper.classList.remove("w-96");
      widget_wrapper.classList.add("invisible");
      widget_toggle.classList.remove("rotate-180");
    }
  });
  // widget end

  const chat_content_wrapper = document.querySelector(".chat-content-wrapper");
  const chat_content_infos = document.querySelectorAll(".chat-content-info");
  chat_content_wrapper.addEventListener("mouseover", function () {
    chat_content_wrapper.classList.add("chat-content-wrapper-small-device");
  });
  chat_content_wrapper.addEventListener("mouseout", function () {
    chat_content_wrapper.classList.remove("chat-content-wrapper-small-device");
  });
  chat_content_infos.forEach((element, index) => {
    element.addEventListener("click", function () {
      chat_content_wrapper.classList.remove(
        "chat-content-wrapper-small-device"
      );
    });
  });
  const header_dots = document.getElementById("header-dots");
  const header_dots_dropdown = document.getElementById("header-dots-dropdown");
  header_dots.addEventListener("click", function () {
    if (header_dots_dropdown.classList.contains("active")) {
      header_dots_dropdown.classList.remove("active");
    } else {
      header_dots_dropdown.classList.add("active");
    }
  });

  const message_dots = document.getElementById("message-dots");
  const message_dots_dropdown = document.getElementById(
    "message-dots-dropdown"
  );
  if (message_dots) {
    message_dots.addEventListener("click", function () {
      if (message_dots_dropdown.classList.contains("active")) {
        message_dots_dropdown.classList.remove("active");
      } else {
        message_dots_dropdown.classList.add("active");
      }
    });
  }

  const message_search_icon = document.getElementById("message-search-icon");
  const message_search_input = document.getElementById("message-search-input");
  if (message_search_icon) {
    message_search_icon.addEventListener("click", function () {
      if (message_search_input.classList.contains("block")) {
        message_search_input.classList.remove("block");
        message_search_input.style.display = "none";
      } else {
        message_search_input.classList.add("block");
        message_search_input.style.display = "block";
        message_search_input.value = "";
      }
    });
  }

  document.addEventListener("click", (event) => {
    // inactive header dots dropdown
    if (
      event.target.id != "header_dots_dropdown" &&
      event.target.id != "header-dots"
    ) {
      header_dots_dropdown.classList.remove("active");
    }
    // inactive message dots dropdown
    if (
      event.target.id != "message-dots" &&
      event.target.id != "message-dots-dropdown"
    ) {
      if (message_dots_dropdown) {
        message_dots_dropdown.classList.remove("active");
      }
    }
    if (
      event.target.id != "message-search-input" &&
      event.target.id != "message-search-icon"
    ) {
      if (message_search_input) {
        message_search_input.classList.remove("block");
        message_search_input.style.display = "none";
      }
    }
  });

  // On document load, apply the saved theme
  const savedTheme = localStorage.getItem("selectedTheme") || "default";
  const main_content_wrapper = document.querySelector(".main-content-wrapper ");
  if (savedTheme != "default") {
    main_content_wrapper.classList.remove("backgrop-glass");
  } else {
    main_content_wrapper.classList.add("backgrop-glass");
    //     main_content_wrapper.style.backgroundColor = 'transparent';
  }
  setTheme(savedTheme);

  set_user_status({
    userId: "65ff1429bd350affe1e4c485",
    lastSeen: "2024-11-13T18:04:29.567+00:00",
    onlineStatus: "Online",
  });
  set_user_status({
    userId: "65ff1429bd350affe1e4c485",
    lastSeen: "2024-11-13T18:04:29.567+00:00",
    onlineStatus: "Online",
  });
});

// set theme to browser local storage
function setTheme(themeName) {
  document.documentElement.className = themeName + "-theme";
  const main_content_wrapper = document.querySelector(".main-content-wrapper ");
  if (themeName != "default") {
    main_content_wrapper.classList.remove("backgrop-glass");
  } else {
    main_content_wrapper.classList.add("backgrop-glass");
    // main_content_wrapper.style.backgroundColor = 'transparent';
  }
  localStorage.setItem("selectedTheme", themeName);
}

// On document load, apply the saved theme
// document.addEventListener("DOMContentLoaded", () => {

// });

// user logout
function logout() {
  fetch("/logout", {
    method: "DELETE",
  });
  toastr.success("Logout successfull.");
  setTimeout(() => {
    window.location.replace("/");
  }, 1000);
}
// end user logout

function load_image_file(event, target) {
  var reader = new FileReader();
  reader.onload = function () {
    var output = document.getElementById(target);

    // Check if the output element is an <img> tag
    if (output.tagName.toLowerCase() !== "img") {
      // If not an img tag, create a new img element
      var img = document.createElement("img");
      img.src = reader.result; // Set the image source
      img.alt = "Uploaded Image"; // Add alt text (optional)
      img.className = "w-52 h-52 rounded-full"; // Add any necessary classes

      // Append the img element to the output element
      output.innerHTML = ""; // Clear any existing content
      output.appendChild(img);
    } else {
      output.src = reader.result;
    }
  };

  reader.readAsDataURL(event.target.files[0]); // Convert the file to a data URL
}

// Update user statuses from onlineUsers
function updateOnlineStatuses(users) {
  users.forEach((user) => {
    onlineUsers = user;
  });
}
console.log("from updateOnlineStatuses ", onlineUsers);
function set_user_status(data) {
  console.log(data);
  const user_online_status_text = document.querySelectorAll(
    ".user-online-status-text" + data.userId
  );
  const user_status_badges = document.querySelectorAll(
    ".user-status-badge" + data.userId
  );
  console.log(user_online_status_text);
  if (user_online_status_text) {
    user_online_status_text.forEach((item, index) => {
      item.textContent = data.onlineStatus;
    });
  }
  if (user_status_badges) {
    user_status_badges.forEach((item, index) => {
      item.textContent = data.onlineStatus;
    });
  }
}
