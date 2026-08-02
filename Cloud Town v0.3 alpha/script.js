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
const testerMenuButton = document.getElementById("testerMenuButton");
const authStorageKey = "cloudTownAuthSession";
const profileStorageKey = "cloudTownPlayerProfile";
const loginPageName = "login.html";
const homePageName = "index.html";
let backgroundAudio = null;
let clickAudioContext = null;
let clickAudioBuffer = null;
const musicStateKey = "cloudTownMusicState";
const musicPlaylist = [
	"music/Ponytown OST 02 Scherzo.mp3",
	"music/Ponytown OST 03 FiveFour.mp3",
	"music/Ponytown OST 05 Hypnosis.mp3",
	"music/Ponytown OST 09 Bossa in three.mp3"
];
const defaultMusicVolume = 0.18;

function createBackgroundVideo() {
	if (document.querySelector('.background-video')) {
		return;
	}

	const video = document.createElement('video');
	video.className = 'background-video';
	video.src = 'video/2026-08-02 15-57-07.mp4';
	video.autoplay = true;
	video.loop = true;
	video.muted = true;
	video.playsInline = true;
	video.preload = 'auto';
	video.setAttribute('aria-hidden', 'true');
	document.body.prepend(video);
	video.addEventListener('canplay', () => {
		video.play().catch(() => {});
	});
}

function shuffleArray(array) {
	const result = array.slice();
	for (let i = result.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

function loadMusicState() {
	try {
		const stored = localStorage.getItem(musicStateKey);
		if (!stored) {
			return null;
		}
		const parsed = JSON.parse(stored);
		if (!parsed || !Array.isArray(parsed.order) || parsed.order.length !== musicPlaylist.length) {
			return null;
		}
		return parsed;
	} catch (error) {
		return null;
	}
}

function saveMusicState(state) {
	try {
		localStorage.setItem(musicStateKey, JSON.stringify(state));
	} catch (error) {
		console.warn("Unable to save music state:", error);
	}
}

function getInitialMusicState() {
	const savedState = loadMusicState();
	if (savedState) {
		return savedState;
	}
	return {
		trackIndex: 0,
		currentTime: 0,
		order: shuffleArray(musicPlaylist.map((_, index) => index))
	};
}

function createClickAudioBuffer(context) {
	const duration = 0.05;
	const sampleRate = context.sampleRate;
	const frameCount = Math.floor(sampleRate * duration);
	const buffer = context.createBuffer(1, frameCount, sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < frameCount; i += 1) {
		const t = i / sampleRate;
		const envelope = Math.exp(-35 * t);
		data[i] = Math.sin(2 * Math.PI * 1050 * t) * envelope * 0.18;
	}
	return buffer;
}

function getClickAudioContext() {
	if (!clickAudioContext) {
		clickAudioContext = new (window.AudioContext || window.webkitAudioContext)();
		clickAudioBuffer = createClickAudioBuffer(clickAudioContext);
	}
	return clickAudioContext;
}

function isInteractiveElement(target) {
	let element = target;
	while (element && element !== document.documentElement) {
		if (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement || element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLLabelElement) {
			return true;
		}
		element = element.parentElement;
	}
	return false;
}

function playClickSound() {
	const context = getClickAudioContext();
	if (context.state === "suspended") {
		context.resume().catch(() => {});
	}
	const source = context.createBufferSource();
	source.buffer = clickAudioBuffer;
	source.connect(context.destination);
	source.start();
}

document.addEventListener("click", (event) => {
	if (isInteractiveElement(event.target)) {
		playClickSound();
	}
});

function getCurrentPageName() {
	const pathname = window.location.pathname.split("/").pop() || "";
	return pathname.toLowerCase();
}

function isAuthenticated() {
	try {
		const storedValue = localStorage.getItem(authStorageKey);
		if (!storedValue) {
			return false;
		}
		const parsedValue = JSON.parse(storedValue);
		return parsedValue.loggedIn === true;
	} catch (error) {
		return false;
	}
}

function saveAuthentication(provider = "saved-account") {
	localStorage.setItem(authStorageKey, JSON.stringify({
		loggedIn: true,
		provider,
		savedAt: new Date().toISOString()
	}));
}

function clearAuthentication() {
	localStorage.removeItem(authStorageKey);
}

function enforceAuthentication() {
	const currentPageName = getCurrentPageName();
	const isLoginPage = currentPageName === loginPageName;

	if (!isLoginPage && !isAuthenticated()) {
		window.location.replace(loginPageName);
		return;
	}

	if (isLoginPage && isAuthenticated()) {
		window.location.replace(homePageName);
	}
}

function startBackgroundMusic() {
	if (backgroundAudio) {
		return;
	}

	const musicState = getInitialMusicState();
	const currentTrack = musicPlaylist[musicState.order[musicState.trackIndex]];

	backgroundAudio = document.createElement("audio");
	backgroundAudio.src = currentTrack;
	backgroundAudio.volume = defaultMusicVolume;
	backgroundAudio.preload = "auto";
	backgroundAudio.autoplay = true;
	backgroundAudio.muted = false;
	backgroundAudio.playsInline = true;
	backgroundAudio.style.display = "none";
	document.body.appendChild(backgroundAudio);

	backgroundAudio.currentTime = Math.min(musicState.currentTime, backgroundAudio.duration || musicState.currentTime);

	backgroundAudio.addEventListener("loadedmetadata", () => {
		if (musicState.currentTime > 0 && musicState.currentTime < backgroundAudio.duration) {
			backgroundAudio.currentTime = musicState.currentTime;
		}
	});

	backgroundAudio.addEventListener("ended", () => {
		const nextIndex = (musicState.trackIndex + 1) % musicPlaylist.length;
		musicState.trackIndex = nextIndex;
		musicState.currentTime = 0;
		saveMusicState(musicState);
		backgroundAudio.src = musicPlaylist[musicState.order[nextIndex]];
		backgroundAudio.play().catch((error) => {
			console.warn("Playback error on next track:", error);
		});
	});

	backgroundAudio.addEventListener("timeupdate", () => {
		if (!backgroundAudio.paused) {
			musicState.currentTime = backgroundAudio.currentTime;
			saveMusicState(musicState);
		}
	});

	const playPromise = backgroundAudio.play();
	if (playPromise !== undefined) {
		playPromise.catch((error) => {
			console.warn("Background music playback blocked:", error);
		});
	}
}

window.addEventListener("load", () => {
	createBackgroundVideo();
	startBackgroundMusic();
});

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
		let authUrl = button.getAttribute("data-url");

		if (!authUrl) {
			if (provider === "discord") {
				authUrl = "https://cloud-town.example.com/auth/discord/link";
			} else if (provider === "google") {
				authUrl = "https://cloud-town.example.com/auth/google/link";
			}
		}

		saveAuthentication(provider);

		if (provider === "discord") {
			loginMessage.textContent = "Discord account linking...";
		} else if (provider === "google") {
			loginMessage.textContent = "Google account linking...";
		}

		if (authUrl && !authUrl.includes("YOUR_")) {
			window.location.assign(authUrl);
		} else {
			setTimeout(() => {
				window.location.assign(homePageName);
			}, 400);
		}
	});
});

if (developerCodeButton) {
	developerCodeButton.addEventListener("click", () => {
		const loginMessage = document.getElementById("loginMessage");
		const codeInput = document.getElementById("developerCodeInput");
		const enteredCode = codeInput.value.trim();

		if (enteredCode === "5060883") {
		saveAuthentication("developer");
		loginMessage.textContent = "Access granted. Redirecting...";
		setTimeout(() => {
			window.location.href = homePageName;
		}, 600);
	} else {
			loginMessage.textContent = "Invalid developer code.";
		}
	});
}

if (testerMenuButton) {
	testerMenuButton.addEventListener("click", () => {
		saveAuthentication("tester");
		const loginMessage = document.getElementById("loginMessage");
		if (loginMessage) {
			loginMessage.textContent = "Logged in as tester. Redirecting...";
		}
		setTimeout(() => {
			window.location.href = homePageName;
		}, 200);
	});
}

if (playButton) {
	playButton.addEventListener("click", () => {
		if (playMessage) {
			playMessage.textContent = "Game launch is ready. Play will start here soon.";
		}
	});
}

if (serverToggleButton && serverList && playMessage) {
	serverToggleButton.addEventListener("click", () => {
		const isHidden = serverList.hidden;
		if (isHidden) {
			serverList.hidden = false;
			requestAnimationFrame(() => {
				serverList.classList.add("open");
			});
		} else {
			serverList.classList.remove("open");
			serverList.addEventListener("transitionend", function hideOnTransition(event) {
				if (event.propertyName === "max-height") {
					serverList.hidden = true;
					serverList.removeEventListener("transitionend", hideOnTransition);
				}
			});
		}
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
		const currentImage = characterImage ? characterImage.src : "nature/skin/pony.png";
		applySkin(typedName, currentImage);
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
		accountStatusValue.textContent = nextState === "online" ? "Online" : "Offline";
	});
}

if (accountSignOut) {
	accountSignOut.addEventListener("click", () => {
		clearAuthentication();
		window.location.href = loginPageName;
	});
}

const displayNameInput = document.getElementById("displayNameInput");
const dobDayInput = document.getElementById("dobDayInput");
const dobMonthInput = document.getElementById("dobMonthInput");
const dobYearInput = document.getElementById("dobYearInput");
const accountIdDisplay = document.getElementById("accountIdDisplay");
const accountCreationDateDisplay = document.getElementById("accountCreationDateDisplay");
const saveProfileButton = document.getElementById("saveProfileButton");
const profileMessage = document.getElementById("profileMessage");

function generateAccountId() {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let id = "";
	for (let i = 0; i < 10; i += 1) {
		id += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return id;
}

function loadProfile() {
	if (!displayNameInput && !dobDayInput && !dobMonthInput && !dobYearInput && !accountCreationDateDisplay) {
		return;
	}

	const storedProfile = localStorage.getItem(profileStorageKey);
	let profile = null;
	if (!storedProfile) {
		profile = {
			id: generateAccountId(),
			createdAt: new Date().toISOString(),
			displayName: "",
			dobDay: "",
			dobMonth: "",
			dobYear: ""
		};
		localStorage.setItem(profileStorageKey, JSON.stringify(profile));
	} else {
		try {
			profile = JSON.parse(storedProfile);
			if (!profile.createdAt) {
				profile.createdAt = new Date().toISOString();
				localStorage.setItem(profileStorageKey, JSON.stringify(profile));
			}
		} catch (error) {
			console.warn("Failed to parse stored profile:", error);
			profile = {
				id: generateAccountId(),
				createdAt: new Date().toISOString(),
				displayName: "",
				dobDay: "",
				dobMonth: "",
				dobYear: ""
			};
			localStorage.setItem(profileStorageKey, JSON.stringify(profile));
		}
	}

	if (!profile) {
		return;
	}

	if (accountIdDisplay && profile.id) {
		accountIdDisplay.textContent = profile.id;
	}
	if (accountCreationDateDisplay && profile.createdAt) {
		const createdDate = new Date(profile.createdAt);
		const options = { year: "numeric", month: "long", day: "numeric" };
		accountCreationDateDisplay.textContent = createdDate.toLocaleDateString("en-US", options);
	}
	if (displayNameInput && profile.displayName) {
		displayNameInput.value = profile.displayName;
	}
	if (dobDayInput && profile.dobDay) {
		dobDayInput.value = profile.dobDay;
	}
	if (dobMonthInput && profile.dobMonth) {
		dobMonthInput.value = profile.dobMonth;
	}
	if (dobYearInput && profile.dobYear) {
		dobYearInput.value = profile.dobYear;
	}
}

function saveProfile() {
	if (!displayNameInput || !dobDayInput || !dobMonthInput || !dobYearInput) {
		return;
	}

		const existingProfile = localStorage.getItem(profileStorageKey);
	let profile = {
		id: generateAccountId(),
		displayName: displayNameInput.value.trim(),
		dobDay: dobDayInput.value.trim(),
		dobMonth: dobMonthInput.value.trim(),
		dobYear: dobYearInput.value.trim(),
	};
	if (existingProfile) {
		try {
			const parsed = JSON.parse(existingProfile);
			if (parsed.id) {
				profile.id = parsed.id;
			}
		} catch (error) {
			console.warn("Failed to parse existing profile:", error);
		}
	}

	localStorage.setItem(profileStorageKey, JSON.stringify(profile));
	if (profileMessage) {
		profileMessage.textContent = "Profile saved to your account.";
	}
}

if (saveProfileButton) {
	saveProfileButton.addEventListener("click", saveProfile);
}

loadProfile();

function initializePageFade() {
	const page = document.querySelector('.page');
	if (!page) {
		return;
	}

	const elements = Array.from(page.children);
	elements.forEach((element, index) => {
		element.classList.add('fade-item');
		element.style.animationDelay = `${index * 0.08}s`;
	});

	requestAnimationFrame(() => {
		elements.forEach((element) => {
			element.classList.add('animate');
		});
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initializePageFade();
		enforceAuthentication();
	});
} else {
	initializePageFade();
	enforceAuthentication();
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
		const newName = skinNameInput ? skinNameInput.value.trim() || "Blue Skies" : "Blue Skies";
		const newImage = characterImage ? characterImage.src : "nature/skin/pony.png";
		const newOption = createSkinOption(newName, newImage);
		skinMenu.appendChild(newOption);
		applySkin(newName, newImage);
	});
}