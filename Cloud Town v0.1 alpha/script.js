const playButton = document.getElementById("playButton");
const playButtonText = document.getElementById("playButtonText");
const playMessage = document.getElementById("playMessage");
const serverList = document.getElementById("serverList");
const serverToggleButton = document.getElementById("serverToggleButton");
const serverItems = document.querySelectorAll(".server-item");
const skinButton = document.querySelector(".skin-button");
const skinMenu = document.querySelector(".skin-menu");
const skinOptions = document.querySelectorAll(".skin-option");
const characterName = document.getElementById("characterName");
const characterImage = document.getElementById("characterImage");
const newSkinButton = document.getElementById("newSkinButton");
const skinNameInput = document.getElementById("skinNameInput");
const accountMenu = document.querySelector(".account-menu");
const accountTrigger = document.querySelector(".account-trigger");
const accountDropdown = document.querySelector(".account-dropdown");
const accountStatusToggle = document.querySelector(".account-status-toggle");
const accountStatusValue = document.querySelector(".status-value");
const accountSignOut = document.querySelector(".account-signout");

function createSkinOption(name, image) {
	const button = document.createElement("button");
	button.className = "skin-option";
	button.type = "button";
	button.setAttribute("data-skin-name", name);
	button.setAttribute("data-skin-image", image);
	button.innerHTML = `
		<span class="skin-thumb"><img src="${image}" alt="${name} skin"></span>
		<span>${name}</span>
	`;
	button.addEventListener("click", () => {
		applySkin(name, image);
	});
	return button;
}

function refreshSkinOptions() {
	const currentOptions = Array.from(skinMenu.querySelectorAll(".skin-option"));
	currentOptions.forEach((option) => {
		option.classList.remove("active");
	});
	const activeName = characterName ? characterName.textContent.trim() : "Blue Skies";
	const activeOption = currentOptions.find((option) => option.getAttribute("data-skin-name") === activeName);
	if (activeOption) {
		activeOption.classList.add("active");
	}
}

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

if (playButton) {
	playButton.addEventListener("click", () => {
		// Play is temporarily disabled until the game is ready.
	});
}

if (serverToggleButton && serverList && playMessage) {
	serverToggleButton.addEventListener("click", () => {
		const isHidden = serverList.hidden;
		serverList.hidden = !isHidden;
		playMessage.textContent = isHidden ? "Choose a server" : "";
	});
}

if (serverItems.length && playButtonText && playMessage) {
	serverItems.forEach((item) => {
		item.addEventListener("click", () => {
			const selectedServer = item.getAttribute("data-server-name");
			playButtonText.textContent = selectedServer;
			playMessage.textContent = `Joined ${selectedServer}`;
			if (serverList) {
				serverList.hidden = true;
			}
		});
	});
}

if (skinButton && skinMenu) {
	skinButton.addEventListener("click", () => {
		skinMenu.classList.toggle("open");
	});

	document.addEventListener("click", (event) => {
		if (!skinMenu.contains(event.target) && !skinButton.contains(event.target)) {
			skinMenu.classList.remove("open");
		}
	});
}

function applySkin(name, image) {
	const options = Array.from(skinMenu.querySelectorAll(".skin-option"));
	options.forEach((item) => item.classList.remove("active"));
	const matchingOption = options.find((item) => item.getAttribute("data-skin-name") === name);
	if (matchingOption) {
		matchingOption.classList.add("active");
	}
	if (characterName) {
		characterName.textContent = name;
	}
	if (characterImage) {
		characterImage.src = image;
		characterImage.alt = `${name} skin`;
	}
	if (skinMenu) {
		skinMenu.classList.remove("open");
	}
}

if (skinNameInput) {
	skinNameInput.addEventListener("input", () => {
		const typedName = skinNameInput.value.trim() || "Blue Skies";
		applySkin(typedName, "pony.png");
	});
}

if (accountMenu && accountTrigger && accountDropdown) {
	accountTrigger.addEventListener("click", (event) => {
		event.stopPropagation();
		accountDropdown.classList.toggle("open");
	});

	document.addEventListener("click", (event) => {
		if (!accountMenu.contains(event.target)) {
			accountDropdown.classList.remove("open");
		}
	});
}

if (accountStatusToggle && accountStatusValue) {
	accountStatusToggle.addEventListener("click", () => {
		const state = accountStatusToggle.getAttribute("data-state");
		const nextState = state === "online" ? "offline" : "online";
		accountStatusToggle.setAttribute("data-state", nextState);
		accountStatusValue.textContent = nextState === "online" ? "En ligne" : "Hors ligne";
	});
}

if (accountSignOut) {
	accountSignOut.addEventListener("click", () => {
		window.location.href = "login.html";
	});
}

skinOptions.forEach((option) => {
	option.addEventListener("click", () => {
		const name = option.getAttribute("data-skin-name");
		const image = option.getAttribute("data-skin-image");
		applySkin(name, image);
	});
});

if (newSkinButton) {
	newSkinButton.addEventListener("click", () => {
		const newName = "Blue Skies";
		const newImage = "pony.png";
		const newOption = createSkinOption(newName, newImage);
		skinMenu.appendChild(newOption);
		applySkin(newName, newImage);
	});
}