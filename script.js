/* CABEÇALHO - esconder ao rolar */
let ultimoScroll = 0;
const cabecalho = document.querySelector('.cabecalho');

if (cabecalho) {
    window.addEventListener('scroll', () => {
        let scrollAtual = window.scrollY;
        if (scrollAtual > ultimoScroll) {
            cabecalho.classList.add('esconder');
        } else {
            cabecalho.classList.remove('esconder');
        }
        ultimoScroll = scrollAtual;
    });
}


/* MÚSICA */
const music      = document.getElementById("bg-music");
const progress   = document.getElementById("music-progress");
const musicTime  = document.getElementById("music-time");
const playButton = document.getElementById("play-music");

if (music) {

    const playlist = [
        "music/music01.mp3",
        "music/music02.mp3"
    ];

    let currentMusic = 0;

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(Math.floor(s) % 60).padStart(2,'0')}`;

    /* salva índice e tempo antes de sair */
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("musicIndex", currentMusic);
        localStorage.setItem("musicTime",  music.currentTime);
    });

    /* carrega e toca uma faixa */
    function loadMusic(index, autoplay = true) {
        currentMusic = index;
        music.src = playlist[index];
        localStorage.setItem("musicIndex", currentMusic);
        if (autoplay) {
            music.play().then(() => {
                if (playButton) playButton.textContent = "⏸";
                sessionStorage.setItem("musicPaused", "false");
            }).catch(() => {});
        }
    }

    /* controles */
    document.getElementById("next-music")?.addEventListener("click", () => {
        loadMusic((currentMusic + 1) % playlist.length);
    });

    document.getElementById("prev-music")?.addEventListener("click", () => {
        loadMusic((currentMusic - 1 + playlist.length) % playlist.length);
    });

    music.addEventListener("ended", () => {
        if (currentMusic === 0) {
            music.currentTime = 0;
            music.play();
        } else {
            loadMusic((currentMusic + 1) % playlist.length);
        }
    });

    /* barra de progresso e tempo */
    music.addEventListener("timeupdate", () => {
        if (progress) {
            progress.max   = music.duration || 0;
            progress.value = music.currentTime;
        }
        if (musicTime) {
            musicTime.textContent = `${fmt(music.currentTime || 0)} / ${fmt(music.duration || 0)}`;
        }
    });

    if (progress) {
        progress.addEventListener("input", () => {
            music.currentTime = progress.value;
        });
    }

    /* botão play/pause */
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (music.paused) {
                music.play();
                playButton.textContent = "⏸";
                sessionStorage.setItem("musicPaused", "false");
            } else {
                music.pause();
                playButton.textContent = "▶";
                sessionStorage.setItem("musicPaused", "true");
            }
        });
    }

    /* sincroniza ícone ao voltar pra aba do navegador */
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && playButton) {
            playButton.textContent = music.paused ? "▶" : "⏸";
        }
    });

    /* restaura estado ao carregar a página */
    window.addEventListener("load", () => {
        music.volume = 0.25;

        const naMemories  = document.body.classList.contains("memories");
        const indiceCerto = naMemories ? 1 : 0;

        const savedIndex = Number(localStorage.getItem("musicIndex")) || 0;
        const savedTime  = Number(localStorage.getItem("musicTime"))  || 0;

        const wasPaused    = sessionStorage.getItem("musicPaused") === "true";
        const tempoInicial = (savedIndex === indiceCerto) ? savedTime : 0;

        currentMusic = indiceCerto;
        music.src = playlist[indiceCerto];

        music.addEventListener("loadedmetadata", () => {
            if (tempoInicial > 0) music.currentTime = tempoInicial;
        }, { once: true });

        /* pausado manualmente nesta aba: respeita */
        if (wasPaused) {
            if (playButton) playButton.textContent = "▶";
            return;
        }

        /* tenta tocar sozinho */
        music.play().then(() => {
            if (playButton) playButton.textContent = "⏸";
            localStorage.setItem("musicIndex", indiceCerto);
            sessionStorage.setItem("musicPaused", "false");
        }).catch(() => {
            /* bloqueado pelo navegador: toca no primeiro clique */
            const tocarNaPrimeiraInteracao = () => {
                if (sessionStorage.getItem("musicPaused") === "true") return;
                music.play().then(() => {
                    if (playButton) playButton.textContent = "⏸";
                    sessionStorage.setItem("musicPaused", "false");
                }).catch(() => {});
            };
            document.addEventListener("click",      tocarNaPrimeiraInteracao, { once: true });
            document.addEventListener("keydown",    tocarNaPrimeiraInteracao, { once: true });
            document.addEventListener("touchstart", tocarNaPrimeiraInteracao, { once: true });
        });
    });
}