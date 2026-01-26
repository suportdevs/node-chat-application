// public/js/call.js

const socket = io(); // assumes /socket.io/socket.io.js loaded
const myUserId = window.MY_USER_ID; // from server-rendered EJS

// UI elements
const userListEl = document.getElementById("user-list");
const onlineCountEl = document.getElementById("onlineCount");
const callStage = document.getElementById("callStage");
const emptyState = document.getElementById("emptyState");
const callStatus = document.getElementById("callStatus");
const callPeerName = document.getElementById("callPeerName");
const callMeta = document.getElementById("callMeta");
const callTimer = document.getElementById("callTimer");
const videoArea = document.getElementById("videoArea");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const localFallback = document.getElementById("localFallback");
const remoteFallback = document.getElementById("remoteFallback");
const remoteAvatar = document.getElementById("remoteAvatar");
const meAvatar = document.getElementById("meAvatar");
const localFallbackAvatar = document.getElementById("localFallbackAvatar");
const remoteFallbackAvatar = document.getElementById("remoteFallbackAvatar");
const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");
const endBtn = document.getElementById("endBtn");
const incomingOverlay = document.getElementById("incomingOverlay");
const incomingTitle = document.getElementById("incomingTitle");
const incomingSubtitle = document.getElementById("incomingSubtitle");
const incomingAvatar = document.getElementById("incomingAvatar");
const acceptBtn = document.getElementById("acceptBtn");
const declineBtn = document.getElementById("declineBtn");
const outgoingOverlay = document.getElementById("outgoingOverlay");
const outgoingSubtitle = document.getElementById("outgoingSubtitle");
const outgoingAvatar = document.getElementById("outgoingAvatar");
const cancelBtn = document.getElementById("cancelBtn");
const toastEl = document.getElementById("callToast");

let pc = null;
let localStream = null;
let remoteStream = null;
let currentCallTarget = null;
let callType = "video";
let isCaller = false;
let isMuted = false;
let isCameraOff = false;
let timerInterval = null;
let callStartedAt = null;
let pendingIncoming = null;

// STUN/TURN config - add TURN servers for production
const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

meAvatar.textContent = getInitials(myUserId);
localFallbackAvatar.textContent = getInitials(myUserId);

// announce presence to server
socket.emit("user-connected", myUserId);

// show list of online users (except me)
socket.on("online-users", (list) => {
  const filtered = list.filter((id) => id !== myUserId);
  onlineCountEl.textContent = String(filtered.length);
  renderUserList(filtered);
});

socket.on("user-unavailable", ({ to }) => {
  showToast(`User unavailable: ${to}`);
  endCall(true);
});

// incoming call: contains { from, offer, callType }
socket.on("incoming-call", ({ from, offer, callType: incomingType }) => {
  if (currentCallTarget) {
    socket.emit("call-busy", { to: from, from: myUserId });
    return;
  }
  pendingIncoming = { from, offer, callType: incomingType || "video" };
  showIncomingOverlay(pendingIncoming);
});

// caller receives answer
socket.on("call-accepted", async ({ answer }) => {
  if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
  setCallStatus("Connecting...");
  hideOutgoingOverlay();
  showCallStage(true);
});

// ice candidates from remote
socket.on("ice-candidate", async ({ candidate }) => {
  if (!candidate || !pc) return;
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("Error adding received ice candidate", err);
  }
});

// remote ended the call
socket.on("call-ended", ({ from }) => {
  if (from) showToast(`Call ended by ${from}`);
  endCall(true);
});

socket.on("call-rejected", ({ from }) => {
  showToast(`${from || "User"} declined your call`);
  endCall(true);
});

socket.on("call-busy", ({ from }) => {
  showToast(`${from || "User"} is busy`);
  endCall(true);
});

/* ---------- UI actions ---------- */

muteBtn.addEventListener("click", () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks().forEach((track) => (track.enabled = !isMuted));
  muteBtn.classList.toggle("is-off", isMuted);
  muteBtn.querySelector(".label").textContent = isMuted ? "Unmute" : "Mute";
});

cameraBtn.addEventListener("click", () => {
  if (callType !== "video") {
    showToast("Video is not enabled for this call");
    return;
  }
  if (!localStream) return;
  isCameraOff = !isCameraOff;
  localStream.getVideoTracks().forEach((track) => (track.enabled = !isCameraOff));
  localFallback.classList.toggle("hidden", !isCameraOff);
  cameraBtn.classList.toggle("is-off", isCameraOff);
  cameraBtn.querySelector(".label").textContent = isCameraOff ? "Camera off" : "Camera";
});

endBtn.addEventListener("click", () => {
  if (currentCallTarget) {
    socket.emit("end-call", { to: currentCallTarget, from: myUserId });
  }
  endCall(true);
});

acceptBtn.addEventListener("click", async () => {
  if (!pendingIncoming) return;
  const { from, offer, callType: incomingType } = pendingIncoming;
  pendingIncoming = null;
  hideIncomingOverlay();
  isCaller = false;
  callType = incomingType || "video";
  currentCallTarget = from;
  setCallPeer(from);
  setCallMode(callType);
  try {
    await startLocalStream(callType);
    pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("make-answer", { to: from, answer: pc.localDescription });
    setCallStatus("Connecting...");
    showCallStage(true);
  } catch (err) {
    showToast("Failed to start call");
    endCall(true);
  }
});

declineBtn.addEventListener("click", () => {
  if (!pendingIncoming) return;
  socket.emit("reject-call", { to: pendingIncoming.from, from: myUserId });
  pendingIncoming = null;
  hideIncomingOverlay();
});

cancelBtn.addEventListener("click", () => {
  if (currentCallTarget) {
    socket.emit("end-call", { to: currentCallTarget, from: myUserId });
  }
  hideOutgoingOverlay();
  endCall(true);
});

window.addEventListener("beforeunload", () => {
  if (currentCallTarget) {
    socket.emit("end-call", { to: currentCallTarget, from: myUserId });
  }
});

/* ---------- helpers ---------- */

function renderUserList(users) {
  userListEl.innerHTML = "";
  if (!users.length) {
    userListEl.innerHTML = "<div class=\"user-card\"><div class=\"avatar\">--</div><div class=\"user-meta\"><div class=\"user-id\">No users online</div><div class=\"user-actions\"></div></div></div>";
    return;
  }

  users.forEach((id) => {
    const card = document.createElement("div");
    card.className = "user-card";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = getInitials(id);

    const meta = document.createElement("div");
    meta.className = "user-meta";

    const name = document.createElement("div");
    name.className = "user-id";
    name.textContent = id;

    const actions = document.createElement("div");
    actions.className = "user-actions";

    const voiceBtn = document.createElement("button");
    voiceBtn.className = "action-btn";
    voiceBtn.textContent = "Voice call";
    voiceBtn.addEventListener("click", () => startCall(id, "audio"));

    const videoBtn = document.createElement("button");
    videoBtn.className = "action-btn";
    videoBtn.textContent = "Video call";
    videoBtn.addEventListener("click", () => startCall(id, "video"));

    actions.appendChild(voiceBtn);
    actions.appendChild(videoBtn);
    meta.appendChild(name);
    meta.appendChild(actions);
    card.appendChild(avatar);
    card.appendChild(meta);
    userListEl.appendChild(card);
  });
}

async function startLocalStream(type) {
  if (localStream) return;
  const constraints = {
    audio: true,
    video: type === "video",
  };
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
    localFallback.classList.toggle("hidden", type === "video");
    isMuted = false;
    isCameraOff = type !== "video";
    muteBtn.classList.remove("is-off");
    cameraBtn.classList.toggle("is-off", type !== "video");
    cameraBtn.querySelector(".label").textContent = type === "video" ? "Camera" : "Camera off";
  } catch (err) {
    alert("Could not get camera/microphone: " + err.message);
    throw err;
  }
}

function createPeerConnection() {
  const connection = new RTCPeerConnection(ICE_CONFIG);

  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  if (localStream) {
    for (const track of localStream.getTracks()) {
      connection.addTrack(track, localStream);
    }
  }

  connection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    } else if (event.track) {
      remoteStream.addTrack(event.track);
    }
    if (callType !== "audio") {
      remoteFallback.classList.add("hidden");
    }
  };

  connection.onicecandidate = (event) => {
    if (event.candidate && currentCallTarget) {
      socket.emit("ice-candidate", { to: currentCallTarget, candidate: event.candidate });
    }
  };

  connection.onconnectionstatechange = () => {
    if (connection.connectionState === "connected") {
      setCallStatus("Connected");
      startTimer();
    }
    if (
      connection.connectionState === "disconnected" ||
      connection.connectionState === "failed" ||
      connection.connectionState === "closed"
    ) {
      endCall(true);
    }
  };

  return connection;
}

async function startCall(targetUserId, type) {
  if (currentCallTarget) {
    showToast("Already in a call");
    return;
  }
  currentCallTarget = targetUserId;
  callType = type;
  isCaller = true;
  setCallPeer(targetUserId);
  setCallMode(type);
  showOutgoingOverlay(targetUserId, type);
  try {
    await startLocalStream(type);
    pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("call-user", {
      from: myUserId,
      to: targetUserId,
      offer: pc.localDescription,
      callType: type,
    });
    setCallStatus("Calling...");
    showCallStage(true);
  } catch (err) {
    showToast("Failed to start call");
    endCall(true);
  }
}

function showCallStage(visible) {
  callStage.classList.toggle("hidden", !visible);
  emptyState.classList.toggle("hidden", visible);
}

function setCallStatus(text) {
  callStatus.textContent = text;
  callMeta.textContent = text;
}

function setCallPeer(peerId) {
  const initials = getInitials(peerId);
  callPeerName.textContent = peerId;
  remoteAvatar.textContent = initials;
  remoteFallbackAvatar.textContent = initials;
}

function setCallMode(type) {
  callStage.dataset.callType = type;
  videoArea.classList.toggle("audio-only", type === "audio");
  remoteFallback.classList.remove("hidden");
  localFallback.classList.toggle("hidden", type === "video");
}

function showIncomingOverlay({ from, callType: incomingType }) {
  incomingTitle.textContent = incomingType === "audio" ? "Incoming voice call" : "Incoming video call";
  incomingSubtitle.textContent = `From ${from}`;
  incomingAvatar.textContent = getInitials(from);
  incomingOverlay.classList.remove("hidden");
}

function hideIncomingOverlay() {
  incomingOverlay.classList.add("hidden");
}

function showOutgoingOverlay(to, type) {
  outgoingSubtitle.textContent = type === "audio" ? `Voice calling ${to}` : `Video calling ${to}`;
  outgoingAvatar.textContent = getInitials(to);
  outgoingOverlay.classList.remove("hidden");
}

function hideOutgoingOverlay() {
  outgoingOverlay.classList.add("hidden");
}

function startTimer() {
  if (timerInterval) return;
  callStartedAt = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - callStartedAt) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    callTimer.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  callTimer.textContent = "00:00";
  callStartedAt = null;
}

function endCall(resetUI) {
  if (pc) {
    try {
      pc.close();
    } catch (e) {}
    pc = null;
  }
  if (localStream) {
    for (const t of localStream.getTracks()) t.stop();
    localStream = null;
    localVideo.srcObject = null;
  }
  if (remoteStream) {
    for (const t of remoteStream.getTracks()) t.stop();
    remoteStream = null;
    remoteVideo.srcObject = null;
  }
  stopTimer();
  hideOutgoingOverlay();
  hideIncomingOverlay();
  localFallback.classList.add("hidden");
  remoteFallback.classList.add("hidden");
  currentCallTarget = null;
  isCaller = false;
  isMuted = false;
  isCameraOff = false;
  if (resetUI) {
    showCallStage(false);
    setCallStatus("Ready");
  }
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2400);
}

function getInitials(value) {
  if (!value) return "NA";
  const cleaned = String(value).replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "NA";
  return cleaned.slice(0, 2).toUpperCase();
}
