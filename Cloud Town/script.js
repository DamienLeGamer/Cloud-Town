const playButton = document.getElementById("playButton");
const playButtonText = document.getElementById("playButtonText");
const playMessage = document.getElementById("playMessage");
const serverList = document.getElementById("serverList");
const serverItems = document.querySelectorAll(".server-item");

let isServerListOpen = false;

const socialButtons = document.querySelectorAll(".social-button");
const developerCodeButton = document.getElementById("developerCodeButton");

socialButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const provider = button.getAttribute("data-provider");
		const loginMessage = document.getElementById("loginMessage");
		const authUrl = button.getAttribute("data-url");

		if (provider === "discord") {
			loginMessage.textContent = "Redirecting to Discord authorization...";
		} else if (provider === "google") {
			loginMessage.textContent = "Redirecting to Google authorization...";
		}

		if (authUrl) {
			window.location.href = authUrl;
		} else {
			window.location.href = "index.html";
		}
	});
});

if (developerCodeButton) {
	developerCodeButton.addEventListener("click", () => {
		const loginMessage = document.getElementById("loginMessage");
		const codeInput = document.getElementById("developerCodeInput");
		const enteredCode = codeInput.value.trim();

		if (enteredCode === "5060883") {
			loginMessage.textContent = "Access granted. Redirecting...";
			setTimeout(() => {
				window.location.href = "index.html";
			}, 600);
		} else {
			loginMessage.textContent = "Invalid developer code.";
		}
	});
}

playButton.addEventListener("click", () => {
	isServerListOpen = !isServerListOpen;
	serverList.hidden = !isServerListOpen;
	playMessage.textContent = isServerListOpen
		? "Choose a server to join!"
		: "";
});

serverItems.forEach((item) => {
	item.addEventListener("click", () => {
		const selectedServer = item.getAttribute("data-server-name");
		playButtonText.textContent = selectedServer;
		playMessage.textContent = `Joined ${selectedServer}`;
		serverList.hidden = true;
		isServerListOpen = false;
	});
});