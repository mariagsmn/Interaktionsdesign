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
];
const feed = document.querySelector('#feed');
const soundButton = document.querySelector('.sound-all');
const playedVideos = new Set();
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
	soundButton.setAttribute('aria-label', enabled ? 'Ton ausschalten' : 'Ton einschalten');
	soundButton.querySelector('span').textContent = enabled ? 'Ton ausschalten' : 'Ton einschalten';
}

function updateVideoOpacity() {
	const fadeProgress = Math.min(1, Math.max(0, (playedVideos.size - 10) / 10));
	videos.forEach((video) => { video.style.opacity = String(1 - fadeProgress); });
}

setSound(soundEnabled);

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		const video = entry.target.querySelector('video');
		if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
			videos.forEach((other) => { if (other !== video) other.pause(); });
			video.muted = !soundEnabled;
			video.play().then(() => entry.target.classList.remove('paused')).catch((error) => {
				entry.target.classList.add('paused');
				console.error('Reel konnte nicht abgespielt werden.', error);
			});
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
		if (video.paused) video.play().then(() => reel.classList.remove('paused')).catch((error) => {
			reel.classList.add('paused');
			console.error('Reel konnte nicht abgespielt werden.', error);
		});
		else { video.pause(); reel.classList.add('paused'); }
	});
	video.addEventListener('play', () => {
		if (!playedVideos.has(video)) {
			playedVideos.add(video);
			updateVideoOpacity();
		}
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