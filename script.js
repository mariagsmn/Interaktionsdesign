const videoFiles = [
	'igexport-DNEZtv5ScZ8.mp4',
	'igexport-DQbxe3xjPOX.mp4',
	'igexport-DTPm-wGEo-Y.mp4',
	'igexport-DW3djFHjQ6i.mp4',
	'igexport-DX_2VjLNGcf.mp4',
	'igexport-Daa8NicoHHh.mp4',
	'igexport-DbGb59HyWmR.mp4',
	'igexport-Dbx1EyUIJT_.mp4',
	'igexport-DclYOJxguAC.mp4',
	'igexport-Dcxtconplgf.mp4',
	'igexport-Dd2ybSzuATA.mp4',
	'igexport-DdUuXmGAcLQ.mp4',
	'igexport-DdcQRXQscv7.mp4',
	'igexport-DeDIDpARKWV.mp4',
	'igexport-DeIF75UoiHo.mp4',
	'igexport-DeJ175_xsgb.mp4',
	'igexport-DeKOJ46MAle.mp4',
	'igexport-DeLnJTKCj-d.mp4',
	'igexport-DeOdInYEVbb.mp4',
	'igexport-DePbRC8vcKL.mp4',
	'igexport-DeUT4y1K7Zx.mp4',
	'igexport-DeW-YfMoElS.mp4',
	'igexport-DeZJrLeul8y.mp4',
	'igexport-Deb09k6N8-2.mp4',
	'igexport-Debi905FILK.mp4',
	'igexport-DebjJj-sIgd.mp4',
	'igexport-DecJWRHtzyT.mp4',
	'igexport-DecJsJ9zlDI.mp4',
	'igexport-DecQebnC6mC.mp4',
	'igexport-DecmUyGIB18.mp4',
	'igexport-DDQNvpUSwze.mp4',
	'igexport-DDYPAwdNqC_.mp4',
	'igexport-DFk6ECkyTtw.mp4',
	'igexport-DGdAUK2N9Rj.mp4',
	'igexport-DIQqHP-io37.mp4',
	'igexport-DcJ2FFPyQVq.mp4',
	'igexport-DeCoYaoDwiH.mp4',
	'igexport-DePBUFlRzzg.mp4',
	'igexport-DePJDyKsErh.mp4',
	'igexport-DeTl-brMH1v.mp4',
	'igexport-DeWpVI7yagP.mp4',
	'igexport-DeajCrtOSwP.mp4',
	'igexport-Debe7wGuD0A.mp4',
	'igexport-DeecWMSsQOy.mp4',
	'igexport-C55oAKJifNn.mp4',
	'igexport-DbIm3BxEwMp.mp4',
	'igexport-DcSGsU8hmmz.mp4',
	'igexport-DcgseqFlbKH.mp4',
	'igexport-DeEiFuCs7_B.mp4',
	'igexport-DeMHzTEPsOl.mp4',
	'igexport-DeZVx5gMLJq.mp4',
	'igexport-DebZLnDDoIO.mp4',
	'igexport-DecaGsCsK_4.mp4',
	'igexport-DecfvksvHiW.mp4',
	'igexport-DeeFkJ6DRU0.mp4',
	'igexport-DeeLt9-uxAI.mp4',
	'igexport-DcFThhRxvZF.mp4',
	'igexport-Dc_hycvtPbV.mp4',
	'igexport-Dcfu_PvgKnw.mp4',
	'igexport-DdJ7JFRxUgd.mp4',
	'igexport-DdRg-ovI_7W.mp4',
	'igexport-DdWtPFAJ-fF.mp4',
	'igexport-DeMCJJIolnr.mp4',
	'igexport-DeVj3kZz0bm.mp4',
	'igexport-Dec6OxVtRTL.mp4',
	'igexport-Dehy4hhuBEq.mp4',
	'igexport-Dekc1jECGt2.mp4',
	'igexport-DekuExxxeb0.mp4',
	'igexport-DelZY5bBtC9.mp4',
	'igexport-Deo1nZtCZUL.mp4',
];
const feed = document.querySelector('#feed');
const soundButton = document.querySelector('.sound-all');
const startScreen = document.querySelector('#start');
const startKnopf = document.querySelector('#startKnopf');
const kameraVideo = document.querySelector('#kamera');
const kameraWahl = document.querySelector('#kameraWahl');
const kameraWahlFeld = kameraWahl.closest('.kamera-wahl');
const KAMERA_SPEICHER = 'kamera-id';
const KAMERA_BLUR_MAX = 18; // px bei tiefe 0
const app = document.querySelector('.app');
const playedVideos = new Set();
const REELS_OHNE_BRECHUNG = 10;
const REELS_BIS_SPIEGEL = 20;
// Brechungstiefe: 0 = normaler Feed, 1 = Feed ist ganz Spiegel.
let tiefe = 0;
let gestartet = false;
let audioCtx = null;

// Tonbrechung
const NACHHALL_AB = 0.4;
const ketten = new Map(); // Video -> Audio-Nodes, pro Video nur einmal angelegt
let masterGain = null;
let impulsantwort = null;
let aktivesVideo = null;
let nachhallVideo = null;
let soundEnabled = true;
let wheelLocked = false;

const reelTemplate = feed.querySelector('.reel').cloneNode(true);
let previousOrder = null;
try {
	previousOrder = localStorage.getItem('reels-order');
} catch {}
const shuffledFiles = [...videoFiles];

for (let index = shuffledFiles.length - 1; index > 0; index -= 1) {
	const randomIndex = Math.floor(Math.random() * (index + 1));
	[shuffledFiles[index], shuffledFiles[randomIndex]] = [shuffledFiles[randomIndex], shuffledFiles[index]];
}

if (JSON.stringify(shuffledFiles) === previousOrder && shuffledFiles.length > 1) {
	[shuffledFiles[0], shuffledFiles[1]] = [shuffledFiles[1], shuffledFiles[0]];
}

try {
	localStorage.setItem('reels-order', JSON.stringify(shuffledFiles));
} catch {}
feed.replaceChildren(...shuffledFiles.map((file, index) => {
	const reel = reelTemplate.cloneNode(true);
	const video = reel.querySelector('video');
	video.src = `Videos/${file}`;
	video.preload = index === 0 ? 'auto' : 'metadata';
	reel.setAttribute('aria-label', `Reel ${index + 1}`);
	return reel;
}));

const reels = [...feed.querySelectorAll('.reel')];
const videos = reels.map((reel) => reel.querySelector('video'));

function moveReel(direction) {
	if (wheelLocked) return;
	const currentIndex = Math.round(feed.scrollTop / feed.clientHeight);
	const nextIndex = Math.max(0, Math.min(reels.length - 1, currentIndex + direction));
	if (nextIndex === currentIndex) return;
	wheelLocked = true;
	feed.scrollTo({ top: nextIndex * feed.clientHeight, behavior: 'smooth' });
	window.setTimeout(() => { wheelLocked = false; }, 700);
}

feed.addEventListener('wheel', (event) => {
	event.preventDefault();
	if (wheelLocked || Math.abs(event.deltaY) < 8) return;
	moveReel(Math.sign(event.deltaY));
}, { passive: false });

document.addEventListener('keydown', (event) => {
	if (event.altKey || event.ctrlKey || event.metaKey) return;
	if (event.target instanceof HTMLElement && event.target.isContentEditable) return;
	if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;

	if (!gestartet) return;

	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowUp':
			event.preventDefault();
			moveReel(event.key === 'ArrowDown' ? 1 : -1);
			break;
		case 'ArrowRight':
		case 'ArrowLeft': {
			event.preventDefault();
			const currentIndex = Math.round(feed.scrollTop / feed.clientHeight);
			const video = videos[currentIndex];
			if (!video || !Number.isFinite(video.duration)) return;
			const seekDirection = event.key === 'ArrowRight' ? 1 : -1;
			video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seekDirection * 5));
			break;
		}
	}
});

function setSound(enabled) {
	soundEnabled = enabled;
	videos.forEach((video) => { video.muted = !enabled; });
	// Master-Gain blendet auch den Hall-Nachklang mit aus.
	if (masterGain) masterGain.gain.setTargetAtTime(enabled ? 1 : 0, audioCtx.currentTime, 0.03);
	soundButton.setAttribute('aria-label', enabled ? 'Ton ausschalten' : 'Ton einschalten');
	soundButton.querySelector('span').textContent = enabled ? 'Ton ausschalten' : 'Ton einschalten';
}

function updateVideoOpacity() {
	videos.forEach((video) => { video.style.opacity = String(1 - tiefe); });
}

// Kamera: wird sichtbarer und schärfer, während die Reels verblassen.
function updateKamera() {
	kameraVideo.style.opacity = String(tiefe);
	kameraVideo.style.filter = `grayscale(1) blur(${(1 - tiefe) * KAMERA_BLUR_MAX}px)`;
	if (tiefe >= 1) {
		reels.forEach((reel) => { reel.querySelector('.creator').textContent = 'du'; });
	}
}

function setTiefe(wert) {
	tiefe = Math.min(1, Math.max(0, wert));
	updateVideoOpacity();
	updateKamera();
	ketten.forEach((_, video) => stelleKetteEin(video));
}

function zaehleGesehen(video) {
	if (playedVideos.has(video)) return;
	playedVideos.add(video);
	setTiefe((playedVideos.size - REELS_OHNE_BRECHUNG) / (REELS_BIS_SPIEGEL - REELS_OHNE_BRECHUNG));
}

setSound(soundEnabled);
setTiefe(0);

// Hall: Impulsantwort aus exponentiell abklingendem Rauschen, einmal erzeugt und von allen Ketten genutzt.
function erzeugeImpulsantwort(ctx, dauer = 3.5, abklingen = 3) {
	const laenge = Math.floor(ctx.sampleRate * dauer);
	const buffer = ctx.createBuffer(2, laenge, ctx.sampleRate);
	for (let kanal = 0; kanal < 2; kanal += 1) {
		const daten = buffer.getChannelData(kanal);
		for (let i = 0; i < laenge; i += 1) {
			daten[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / laenge, abklingen);
		}
	}
	return buffer;
}

// Kette pro Video: Quelle → Lowpass → Panner → Delay → Dry/Wet (Convolver) → Kanal-Gain → Master.
// createMediaElementSource darf pro Video nur einmal aufgerufen werden, deshalb die Map.
function holeKette(video) {
	if (!audioCtx) return null;
	let kette = ketten.get(video);
	if (kette) return kette;

	const quelle = audioCtx.createMediaElementSource(video);
	const filter = audioCtx.createBiquadFilter();
	filter.type = 'lowpass';
	filter.Q.value = -3.01; // Lowpass-Q ist in dB: -3 dB = Butterworth, flach ohne Resonanzbuckel
	const panner = audioCtx.createPanner();
	panner.panningModel = 'equalpower';
	panner.distanceModel = 'inverse';
	panner.refDistance = 1;
	const delay = audioCtx.createDelay(2);
	const dry = audioCtx.createGain();
	const hall = audioCtx.createConvolver();
	hall.buffer = impulsantwort;
	const wet = audioCtx.createGain();
	const kanal = audioCtx.createGain();

	quelle.connect(filter).connect(panner).connect(delay);
	delay.connect(dry).connect(kanal);
	delay.connect(hall).connect(wet).connect(kanal);
	kanal.connect(masterGain);

	kette = { filter, panner, delay, dry, wet, kanal };
	ketten.set(video, kette);
	stelleKetteEin(video, true);
	return kette;
}

// Überträgt tiefe auf die Kette. sofort = Werte springen (nur wenn kein Ton läuft), sonst weich gleiten.
function stelleKetteEin(video, sofort = false) {
	const kette = ketten.get(video);
	if (!kette) return;
	const jetzt = audioCtx.currentTime;
	const setze = (param, wert, zeitkonstante) => {
		if (sofort) {
			param.cancelScheduledValues(jetzt);
			param.setValueAtTime(wert, jetzt);
		} else {
			param.setTargetAtTime(wert, jetzt, zeitkonstante);
		}
	};
	const nachhall = video === nachhallVideo;
	const hallAnteil = 0.8 * tiefe;
	// Kreisbahn mit Radius 1 um die Hörerin: vorne (0°) → hinten-seitlich (135°). Abstand bleibt 1, also keine Pegeländerung.
	const winkel = tiefe * 135 * Math.PI / 180;
	const x = Math.sin(winkel);
	const z = -Math.cos(winkel);

	// Bei tiefe 0 equalpower: Stereo läuft unverändert durch. HRTF erst, wenn es nach hinten geht.
	// Gewechselt wird nur, wenn kein Ton durch die Kette läuft, sonst könnte es knacken.
	const modell = tiefe > 0 ? 'HRTF' : 'equalpower';
	if ((sofort || video.paused) && kette.panner.panningModel !== modell) kette.panner.panningModel = modell;

	setze(kette.filter.frequency, 18000 * Math.pow(300 / 18000, tiefe), 0.4);
	if (kette.panner.positionX) {
		setze(kette.panner.positionX, x, 0.6);
		setze(kette.panner.positionY, 0, 0.6);
		setze(kette.panner.positionZ, z, 0.6);
	} else {
		kette.panner.setPosition(x, 0, z);
	}
	setze(kette.delay.delayTime, 1.5 * tiefe, 1);
	setze(kette.dry.gain, nachhall ? 0.08 : 1 - hallAnteil, 0.4);
	setze(kette.wet.gain, nachhall ? 1 : hallAnteil, 0.4);
	setze(kette.kanal.gain, nachhall ? 0.35 : 1, 0.4);
}

// Erst ausblenden, dann pausieren, damit nichts knackt.
function leisePausieren(video) {
	const kette = ketten.get(video);
	if (!kette || video.paused) {
		video.pause();
		return;
	}
	kette.kanal.gain.setTargetAtTime(0, audioCtx.currentTime, 0.04);
	window.setTimeout(() => {
		if (video !== aktivesVideo && video !== nachhallVideo) video.pause();
	}, 200);
}

function playReel(reel) {
	const video = reel.querySelector('video');
	zaehleGesehen(video);
	holeKette(video);

	if (aktivesVideo && aktivesVideo !== video) {
		const vorheriges = aktivesVideo;
		if (tiefe >= NACHHALL_AB) {
			// Vorheriges Reel läuft leise als Hall weiter, ein älterer Nachhall wird abgelöst.
			if (nachhallVideo && nachhallVideo !== vorheriges && nachhallVideo !== video) {
				const alterNachhall = nachhallVideo;
				nachhallVideo = vorheriges;
				leisePausieren(alterNachhall);
			} else {
				nachhallVideo = vorheriges;
			}
			stelleKetteEin(vorheriges);
		}
	}
	if (nachhallVideo === video) nachhallVideo = null;
	aktivesVideo = video;

	videos.forEach((other) => {
		if (other !== video && other !== nachhallVideo) leisePausieren(other);
	});
	stelleKetteEin(video, video.paused);
	video.muted = !soundEnabled;
	video.play().then(() => reel.classList.remove('paused')).catch((error) => {
		reel.classList.add('paused');
		console.error('Reel konnte nicht abgespielt werden.', error);
	});
}

const observer = new IntersectionObserver((entries) => {
	if (!gestartet) return;
	entries.forEach((entry) => {
		const video = entry.target.querySelector('video');
		if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
			playReel(entry.target);
		} else {
			// Ab NACHHALL_AB läuft das verlassene Reel weiter, playReel macht es zum Nachhall.
			if (video === nachhallVideo || (video === aktivesVideo && tiefe >= NACHHALL_AB)) return;
			leisePausieren(video);
		}
	});
}, { threshold: [0, 0.65, 1] });

reels.forEach((reel) => observer.observe(reel));

function leseGespeicherteKamera() {
	try {
		return localStorage.getItem(KAMERA_SPEICHER);
	} catch {
		return null;
	}
}

async function holeKameras() {
	const geraete = await navigator.mediaDevices.enumerateDevices();
	return geraete.filter((geraet) => geraet.kind === 'videoinput');
}

// Füllt die Auswahl auf dem Startbildschirm. Ohne Kamera oder Freigabe bleibt sie einfach verborgen.
let kameraWahlWirdGefuellt = false;
async function fuelleKameraWahl() {
	if (gestartet || kameraWahlWirdGefuellt || !navigator.mediaDevices?.enumerateDevices) return;
	kameraWahlWirdGefuellt = true;
	try {
		let kameras = await holeKameras();
		// Namen und IDs gibt der Browser erst nach einer Freigabe heraus: einmal kurz anfragen.
		if (kameras.length && kameras.some((kamera) => !kamera.label || !kamera.deviceId)) {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
			stream.getTracks().forEach((track) => track.stop());
			kameras = await holeKameras();
		}
		if (!kameras.length) {
			kameraWahlFeld.hidden = true;
			return;
		}
		const gespeichert = leseGespeicherteKamera();
		kameraWahl.replaceChildren(...kameras.map((kamera, index) => new Option(kamera.label || `Kamera ${index + 1}`, kamera.deviceId)));
		if (kameras.some((kamera) => kamera.deviceId === gespeichert)) kameraWahl.value = gespeichert;
		kameraWahlFeld.hidden = false;
	} catch {
		kameraWahlFeld.hidden = true;
	} finally {
		kameraWahlWirdGefuellt = false;
	}
}

kameraWahl.addEventListener('change', () => {
	try {
		localStorage.setItem(KAMERA_SPEICHER, kameraWahl.value);
	} catch {}
});

// Startet die gewählte Kamera; fällt auf die Standardkamera zurück, sonst läuft alles ohne Kamera weiter.
async function starteKamera() {
	if (!navigator.mediaDevices?.getUserMedia) return;
	const id = kameraWahl.value || leseGespeicherteKamera();
	const versuche = id ? [{ deviceId: { exact: id } }, true] : [true];
	for (const videoVorgabe of versuche) {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: videoVorgabe, audio: false });
			kameraVideo.srcObject = stream;
			kameraVideo.play().catch(() => {});
			return;
		} catch (error) {
			if (error.name === 'NotAllowedError' || error.name === 'SecurityError') break;
		}
	}
	console.info('Keine Kamera verfügbar – der Feed läuft ohne Spiegel weiter.');
}

fuelleKameraWahl();
navigator.mediaDevices?.addEventListener?.('devicechange', fuelleKameraWahl);

startKnopf.addEventListener('click', () => {
	if (gestartet) return;
	gestartet = true;
	const AudioContextKlasse = window.AudioContext || window.webkitAudioContext;
	audioCtx = new AudioContextKlasse();
	audioCtx.resume();
	masterGain = audioCtx.createGain();
	masterGain.gain.value = soundEnabled ? 1 : 0;
	masterGain.connect(audioCtx.destination);
	impulsantwort = erzeugeImpulsantwort(audioCtx);
	starteKamera();
	app.inert = false;
	startScreen.classList.add('verlassen');
	window.setTimeout(() => startScreen.remove(), 700);
	playReel(reels[0]);
});

soundButton.addEventListener('click', () => setSound(!soundEnabled));

reels.forEach((reel) => {
	const video = reel.querySelector('video');
	const progress = reel.querySelector('.progress span');
	video.addEventListener('click', () => {
		if (video.paused) video.play().then(() => reel.classList.remove('paused')).catch((error) => {
			reel.classList.add('paused');
			console.error('Reel konnte nicht abgespielt werden.', error);
		});
		else { video.pause(); reel.classList.add('paused'); }
	});
	video.addEventListener('play', () => {
		zaehleGesehen(video);
		reel.classList.remove('paused');
	});
	video.addEventListener('pause', () => {
		if (reel.getBoundingClientRect().height > 0 && video.currentTime > 0) reel.classList.add('paused');
	});
	video.addEventListener('timeupdate', () => {
		if (video.duration) progress.style.width = `${video.currentTime / video.duration * 100}%`;
	});
	reel.querySelector('.like').addEventListener('click', (event) => {
		const button = event.currentTarget;
		button.classList.toggle('liked');
		const liked = button.classList.contains('liked');
		button.setAttribute('aria-pressed', liked);
		if (liked) {
			const reelBounds = reel.getBoundingClientRect();
			const buttonBounds = button.getBoundingClientRect();
			const hearts = document.createDocumentFragment();
			for (let row = 0; row < 4; row += 1) {
				for (let column = 0; column < 3; column += 1) {
					const heart = document.createElement('span');
					heart.className = 'floating-heart';
					heart.setAttribute('aria-hidden', 'true');
					heart.textContent = '♥';
					const horizontalScatter = (Math.random() - 0.5) * 38;
					const verticalScatter = (Math.random() - 0.5) * 16;
					heart.style.left = `${buttonBounds.left - reelBounds.left + buttonBounds.width / 2 + horizontalScatter}px`;
					heart.style.top = `${buttonBounds.top - reelBounds.top + buttonBounds.height / 2 - row * 13 + verticalScatter}px`;
					heart.style.setProperty('--heart-drift', `${2 + Math.random() * 4}px`);
					heart.style.animationDelay = `${row * 90 + column * 35 + Math.random() * 100}ms`;
					heart.addEventListener('animationend', () => heart.remove(), { once: true });
					hearts.append(heart);
				}
			}
			reel.append(hearts);
		}
	});
	reel.querySelector('.follow').addEventListener('click', (event) => {
		const button = event.currentTarget;
		const following = button.textContent === 'Gefolgt';
		button.textContent = following ? 'Folgen' : 'Gefolgt';
		button.setAttribute('aria-pressed', String(!following));
	});
	reel.querySelector('.share').addEventListener('click', async () => {
		try {
			if (navigator.share) await navigator.share({ title: 'Reel', url: location.href });
			else await navigator.clipboard.writeText(location.href);
		} catch (error) {
			if (error.name !== 'AbortError') console.error('Reel konnte nicht geteilt werden.', error);
		}
	});
});