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
];
const feed = document.querySelector('#feed');
const soundButton = document.querySelector('.sound-all');
let soundEnabled = false;
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

feed.addEventListener('wheel', (event) => {
	event.preventDefault();
	if (wheelLocked || Math.abs(event.deltaY) < 8) return;
	const currentIndex = Math.round(feed.scrollTop / feed.clientHeight);
	const nextIndex = Math.max(0, Math.min(reels.length - 1, currentIndex + Math.sign(event.deltaY)));
	if (nextIndex === currentIndex) return;
	wheelLocked = true;
	feed.scrollTo({ top: nextIndex * feed.clientHeight, behavior: 'smooth' });
	window.setTimeout(() => { wheelLocked = false; }, 700);
}, { passive: false });

function setSound(enabled) {
	soundEnabled = enabled;
	videos.forEach((video) => { video.muted = !enabled; });
	soundButton.setAttribute('aria-label', enabled ? 'Ton ausschalten' : 'Ton einschalten');
	soundButton.querySelector('span').textContent = enabled ? 'Ton ausschalten' : 'Ton einschalten';
}

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		const video = entry.target.querySelector('video');
		if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
			videos.forEach((other) => { if (other !== video) other.pause(); });
			video.muted = !soundEnabled;
			video.play().catch(() => {});
			entry.target.classList.remove('paused');
		} else {
			video.pause();
		}
	});
}, { threshold: [0, 0.65, 1] });

reels.forEach((reel) => observer.observe(reel));

soundButton.addEventListener('click', () => setSound(!soundEnabled));

reels.forEach((reel) => {
	const video = reel.querySelector('video');
	const progress = reel.querySelector('.progress span');
	video.addEventListener('click', () => {
		if (video.paused) video.play().then(() => reel.classList.remove('paused')).catch(() => {});
		else { video.pause(); reel.classList.add('paused'); }
	});
	video.addEventListener('play', () => reel.classList.remove('paused'));
	video.addEventListener('pause', () => {
		if (reel.getBoundingClientRect().height > 0 && video.currentTime > 0) reel.classList.add('paused');
	});
	video.addEventListener('timeupdate', () => {
		if (video.duration) progress.style.width = `${video.currentTime / video.duration * 100}%`;
	});
	reel.querySelector('.like').addEventListener('click', (event) => {
		const button = event.currentTarget;
		button.classList.toggle('liked');
		button.setAttribute('aria-pressed', button.classList.contains('liked'));
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