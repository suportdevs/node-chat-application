// public/js/call.js

const socket = io(); // assumes /socket.io/socket.io.js loaded
const myUserId = window.MY_USER_ID; // from server-rendered EJS

// UI elements
const userListEl = document.getElementById('user-list');
const callPanel = document.getElementById('call-panel');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const hangupBtn = document.getElementById('hangupBtn');

let pc = null;
let localStream = null;
let remoteStream = null;
let currentCallTarget = null;

// STUN/TURN config - add TURN servers for production
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
    // add TURN servers here for production
  ]
};

// announce presence to server
socket.emit("user-connected", myUserId);

// show list of online users (except me)
socket.on("online-users", (list) => {
  renderUserList(list.filter(id => id !== myUserId));
});

socket.on("user-unavailable", ({ to }) => {
  alert("User is unavailable: " + to);
});

// incoming call: contains { from, offer }
socket.on("incoming-call", async ({ from, offer }) => {
  const accept = confirm(`Incoming call from ${from}. Accept?`);
  if (!accept) {
    // simply ignore or send rejection event (not implemented)
    return;
  }
  currentCallTarget = from;
  await startLocalStream();

  pc = createPeerConnection();

  // set remote description with caller's offer
  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  // create answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // send answer back
  socket.emit("make-answer", { to: from, answer: pc.localDescription });

  showCallPanel();
});

// caller receives answer
socket.on("call-accepted", async ({ answer }) => {
  if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
  showCallPanel();
});

// ice candidates from remote
socket.on("ice-candidate", async ({ candidate }) => {
  if (!candidate) return;
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("Error adding received ice candidate", err);
  }
});

// remote ended the call
socket.on("call-ended", () => {
  endCall();
});

/* ---------- helpers ---------- */

function renderUserList(users) {
  userListEl.innerHTML = '';
  if (!users.length) {
    userListEl.innerHTML = '<p>No users online</p>';
    return;
  }
  users.forEach(id => {
    const btn = document.createElement('button');
    btn.textContent = `Call ${id}`;
    btn.addEventListener('click', () => startCall(id));
    const div = document.createElement('div');
    div.appendChild(btn);
    userListEl.appendChild(div);
  });
}

async function startLocalStream() {
  if (localStream) return;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  } catch (err) {
    alert('Could not get camera/microphone: ' + err.message);
    throw err;
  }
}

function createPeerConnection() {
  const connection = new RTCPeerConnection(ICE_CONFIG);

  // create remote stream and attach to remoteVideo
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  // add local tracks to peer connection
  if (localStream) {
    for (const track of localStream.getTracks()) {
      connection.addTrack(track, localStream);
    }
  }

  // when remote track arrives
  connection.ontrack = (event) => {
    // event.streams[0] may contain the stream
    if (event.streams && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    } else {
      // fallback: add tracks to remoteStream
      event.track && remoteStream.addTrack(event.track);
    }
  };

  // ICE candidates discovered locally -> send to remote
  connection.onicecandidate = (event) => {
    if (event.candidate && currentCallTarget) {
      socket.emit("ice-candidate", { to: currentCallTarget, candidate: event.candidate });
    }
  };

  // connection state handling (optional)
  connection.onconnectionstatechange = () => {
    if (connection.connectionState === "disconnected" || connection.connectionState === "failed" || connection.connectionState === "closed") {
      endCall();
    }
  };

  return connection;
}

async function startCall(targetUserId) {
  currentCallTarget = targetUserId;
  await startLocalStream();

  pc = createPeerConnection();

  // create offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // send offer to server which forwards to target
  socket.emit("call-user", { from: myUserId, to: targetUserId, offer: pc.localDescription });

  // waiting for call-accepted event (answer) which will set remote desc
}

function showCallPanel() {
  callPanel.style.display = 'block';
}

hangupBtn.addEventListener('click', () => {
  if (currentCallTarget) {
    socket.emit("end-call", { to: currentCallTarget });
  }
  endCall();
});

function endCall() {
  // close RTCPeerConnection
  if (pc) {
    try { pc.close(); } catch (e) {}
    pc = null;
  }
  // stop local tracks
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
  callPanel.style.display = 'none';
  currentCallTarget = null;
}
