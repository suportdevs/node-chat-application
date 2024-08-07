document.addEventListener("DOMContentLoaded", function () {
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
  const conversation_dots = document.getElementById("conversation-dots");
  const conversation_dots_dropdown = document.getElementById(
    "conversation-dots-dropdown"
  );
  conversation_dots.addEventListener("click", function () {
    if (conversation_dots_dropdown.classList.contains("active")) {
      conversation_dots_dropdown.classList.remove("active");
    } else {
      conversation_dots_dropdown.classList.add("active");
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
    // inactive conversation dots dropdown
    if (
      event.target.id != "conversation_dots_dropdown" &&
      event.target.id != "conversation-dots"
    ) {
      conversation_dots_dropdown.classList.remove("active");
    }
    // inactive message dots dropdown
    if (
      event.target.id != "message-dots" &&
      event.target.id != "message-dots-dropdown"
    ) {
      message_dots_dropdown.classList.remove("active");
    }
    if (
      event.target.id != "message-search-input" &&
      event.target.id != "message-search-icon"
    ) {
      message_search_input.classList.remove("block");
      message_search_input.style.display = "none";
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
