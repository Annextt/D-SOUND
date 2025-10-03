const songs = [
  { src: "musics/DAVIDsujao.mp3" },
  { src: "musics/FIVEproje@D4vid.wav"  },
  { src: "musics/david.mp3", },
  { src: "musics/HighLife.mp3"  },
];

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const musicName = document.getElementById("musicName");
const progress = document.getElementById("progress");
const progressContainer = document.querySelector(".progress-container");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

let index = 0;
let isPlaying = false;

// carregar música
function loadSong(i) {
  audio.src = songs[i].src;
  musicName.textContent = songs[i].name;
}
loadSong(index);

// play / pause
function playSong() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = "<i class='bx bx-pause'></i>";
}
function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = "<i class='bx bx-play'></i>";
}

playBtn.addEventListener("click", () => {
  isPlaying ? pauseSong() : playSong();
});

// trocar música
prevBtn.addEventListener("click", () => {
  index = (index - 1 + songs.length) % songs.length;
  loadSong(index);
  playSong();
});

nextBtn.addEventListener("click", () => {
  index = (index + 1) % songs.length;
  loadSong(index);
  playSong();
});

// progresso
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;

    // tempo
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  }
});

function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

// clicar na barra
progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
});

// quando acaba, toca próxima
audio.addEventListener("ended", () => {
  nextBtn.click();
});

const playlistEl = document.getElementById("playlist");

// montar lista de músicas na tela
songs.forEach((song, i) => {
  const li = document.createElement("li");
  li.textContent = song.name;
  li.style.cursor = "pointer";
  li.addEventListener("click", () => {
    index = i;
    loadSong(i);
    playSong();
  });
  playlistEl.appendChild(li);
});

// ====== SPA simples: abrir/fechar views e gerenciar playlists ======
const optPlaylists = document.getElementById('opt-playlists');
const viewPlaylists = document.getElementById('view-playlists');
const btnBack = document.getElementById('btn-back');
const btnCreatePlaylist = document.getElementById('btn-create-playlist');
const playlistListEl = document.getElementById('playlist-list');

// seções da home que queremos esconder ao abrir uma view
const homeSections = [
  document.querySelector('.historic'),
  document.querySelector('.options')
];

// chave do localStorage
const LS_KEY = 'app_playlists_v1';

// utilidades de storage
function getPlaylists() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function savePlaylists(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// mostrar/ocultar views
function showHome() {
  // esconde todas as views
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  // mostra seções da home
  homeSections.forEach(s => s && s.classList.remove('hidden'));
}
function showView(el) {
  homeSections.forEach(s => s && s.classList.add('hidden'));
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  el.classList.remove('hidden');
}

// render da lista de playlists
function renderPlaylistsList() {
  const lists = getPlaylists();
  playlistListEl.innerHTML = '';

  if (lists.length === 0) {
    playlistListEl.innerHTML = `
      <li>
        <span class="name">You don't have any playlist yet.</span>
        <span class="count">Create one!</span>
      </li>`;
    return;
  }

  lists.forEach((pl, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="name">${pl.name}</span>
      <span class="count">${(pl.tracks?.length || 0)} tracks</span>
    `;
    li.addEventListener('click', () => openPlaylistDetail(i));
    playlistListEl.appendChild(li);
  });
}

// criar playlist (prompt simples)
function createPlaylistFlow() {
  const name = prompt('Nome da playlist:');
  if (!name) return;

  const lists = getPlaylists();
  lists.push({ id: crypto.randomUUID?.() || String(Date.now()), name, tracks: [] });
  savePlaylists(lists);
  renderPlaylistsList();
}

// 🔥 FUNÇÃO CORRIGIDA - Esta é a parte principal que estava com problema!
function openPlaylistDetail(index) {
  const lists = getPlaylists();
  const pl = lists[index];
  if (!pl) return;

  // Limpa a lista
  playlistListEl.innerHTML = '';

  // Header da playlist
  const headerLi = document.createElement('li');
  headerLi.style.cursor = 'default';
  headerLi.innerHTML = `
    <div>
      <div class="name">🎧 ${pl.name}</div>
      <div class="count">${(pl.tracks?.length || 0)} tracks</div>
    </div>
    <button id="btn-add-track" class="btn-primary">+ Add Track</button>
  `;
  playlistListEl.appendChild(headerLi);

  // ✨ PARTE CORRIGIDA - Renderizar tracks com eventos
  if (pl.tracks && pl.tracks.length) {
    pl.tracks.forEach((track, trackIndex) => {
      const li = document.createElement('li');
      li.className = 'track-item';
      li.innerHTML = `
        <span class="track-name">🎵 ${track.name}</span>
        <i class="bx bx-play track-play-btn"></i>
      `;
      
      // 🎯 EVENTO DE CLIQUE - isso que estava faltando!
      li.addEventListener('click', () => {
        console.log(`Tocando: ${track.name}`); // debug
        openPlayer(trackIndex, pl.tracks);
      });
      
      playlistListEl.appendChild(li);
    });
  } else {
    const emptyLi = document.createElement('li');
    emptyLi.innerHTML = '<em>No tracks yet. Add one above! 👆</em>';
    playlistListEl.appendChild(emptyLi);
  }

  // Botão de adicionar track
  const addBtn = document.getElementById('btn-add-track');
  addBtn.addEventListener('click', () => {
    const src = prompt('Caminho do arquivo (ex: musics/song.mp3):');
    if (!src) return;
    const name = prompt('Nome da música:') || 'Untitled';
    
    pl.tracks = pl.tracks || [];
    pl.tracks.push({ src, name });
    lists[index] = pl;
    savePlaylists(lists);
    
    // Re-render para mostrar a nova música
    openPlaylistDetail(index);
  });
}

// clique no item "Playlists" do menu
optPlaylists.addEventListener('click', () => {
  showView(viewPlaylists);
  const lists = getPlaylists();
  if (lists.length === 0) {
    // se não tem nenhuma, já oferece criar
    createPlaylistFlow();
  }
  // sempre renderiza a lista (se criou, já aparece)
  renderPlaylistsList();
});

// botões da view
btnBack.addEventListener('click', showHome);
btnCreatePlaylist.addEventListener('click', createPlaylistFlow);

// ====== PLAYER MODAL - Funcionalidades do Modal ======
const playlistAudio = document.getElementById("playlistAudio");
const playerModal = document.getElementById("playerModal");
const playerTitle = document.getElementById("playerTitle");
const closePlayer = document.getElementById("closePlayer");
const playlistPlay = document.getElementById("playlistPlay");
const playlistPrev = document.getElementById("playlistPrev");
const playlistNext = document.getElementById("playlistNext");

let currentPlaylist = [];
let currentIndex = 0;
let isPlayingPlaylist = false;

// ✨ Função para abrir player e tocar música
function openPlayer(index, songs) {
  currentPlaylist = songs;
  currentIndex = index;
  loadPlaylistSong(currentIndex);
  playerModal.style.display = "flex";
  
  // 🎯 Debug para ver se está funcionando
  console.log('Abrindo player para:', songs[index]);
  
  // Auto-play quando abrir
  setTimeout(() => {
    playPlaylistSong();
  }, 100);
  
  // Adicionar tratamento de erro
  playlistAudio.addEventListener('error', () => {
    alert('Erro: Arquivo de música não encontrado! Verifique o caminho do arquivo.');
    console.error('Erro ao carregar:', songs[index].src);
  });
}

// Carregar música no modal
function loadPlaylistSong(i) {
  if (!currentPlaylist[i]) return;
  playlistAudio.src = currentPlaylist[i].src;
  playerTitle.textContent = currentPlaylist[i].name;
  console.log('Carregando música:', currentPlaylist[i]);
}

// Play / Pause
function playPlaylistSong() {
  playlistAudio.play();
  isPlayingPlaylist = true;
  playlistPlay.innerHTML = "<i class='bx bx-pause'></i>";
}

function pausePlaylistSong() {
  playlistAudio.pause();
  isPlayingPlaylist = false;
  playlistPlay.innerHTML = "<i class='bx bx-play'></i>";
}

playlistPlay.addEventListener("click", () => {
  isPlayingPlaylist ? pausePlaylistSong() : playPlaylistSong();
});

playlistPrev.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  loadPlaylistSong(currentIndex);
  playPlaylistSong();
});

playlistNext.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % currentPlaylist.length;
  loadPlaylistSong(currentIndex);
  playPlaylistSong();
});

// Fechar modal
closePlayer.addEventListener("click", () => {
  pausePlaylistSong();
  playerModal.style.display = "none";
});

// Fechar modal clicando fora
playerModal.addEventListener("click", (e) => {
  if (e.target === playerModal) {
    pausePlaylistSong();
    playerModal.style.display = "none";
  }
});

// Auto-next quando música terminar
playlistAudio.addEventListener("ended", () => {
  playlistNext.click();
});

class ThemeManager {
      constructor() {
        this.currentTheme = localStorage.getItem('selected-theme') || 'gothic';
        this.init();
      }

      init() {
        this.loadTheme(this.currentTheme);
        this.setupEventListeners();
      }

      setupEventListeners() {
        // Botão para abrir skins
        document.getElementById('opt-skins').addEventListener('click', () => {
          this.showSkinsView();
        });

        // Botão voltar da view skins
        document.getElementById('btn-back-skins').addEventListener('click', () => {
          this.hideSkinsView();
        });

        // Botões de seleção de tema
        document.querySelectorAll('.btn-select-skin').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-theme');
            this.changeTheme(theme);
          });
        });

        // Existing playlist functionality
        document.getElementById('opt-playlists').addEventListener('click', () => {
          this.showPlaylistsView();
        });

        document.getElementById('btn-back').addEventListener('click', () => {
          this.hidePlaylistsView();
        });
      }

      showSkinsView() {
        document.querySelector('.historic').classList.add('hidden');
        document.querySelector('.options').classList.add('hidden');
        document.getElementById('view-playlists').classList.add('hidden');
        document.getElementById('view-skins').classList.remove('hidden');
      }

      hideSkinsView() {
        document.getElementById('view-skins').classList.add('hidden');
        document.querySelector('.historic').classList.remove('hidden');
        document.querySelector('.options').classList.remove('hidden');
      }

      showPlaylistsView() {
        document.querySelector('.historic').classList.add('hidden');
        document.querySelector('.options').classList.add('hidden');
        document.getElementById('view-skins').classList.add('hidden');
        document.getElementById('view-playlists').classList.remove('hidden');
      }

      hidePlaylistsView() {
        document.getElementById('view-playlists').classList.add('hidden');
        document.querySelector('.historic').classList.remove('hidden');
        document.querySelector('.options').classList.remove('hidden');
      }

      changeTheme(theme) {
        if (theme === this.currentTheme) return;

        this.currentTheme = theme;
        localStorage.setItem('selected-theme', theme);
        this.loadTheme(theme);
        this.showNotification();
        
        // Voltar para a tela principal após seleção
        setTimeout(() => {
          this.hideSkinsView();
        }, 1500);
      }

      loadTheme(theme) {
        const themeLink = document.getElementById('theme-style');
        
        if (theme === 'cyberpunk') {
          // Aqui você carregaria o CSS cyberpunk
          themeLink.href = 'cyberpunk-style.css';
        } else {
          // Tema gótico (padrão)
          themeLink.href = 'gothic-style.css';
        }

        // Atualizar indicadores visuais
        this.updateThemeIndicators(theme);
      }

      updateThemeIndicators(theme) {
        // Remover indicadores anteriores
        document.querySelectorAll('.skin-card').forEach(card => {
          card.classList.remove('selected');
        });

        // Adicionar indicador ao tema atual
        const selectedCard = document.querySelector(`[data-theme="${theme}"]`);
        if (selectedCard) {
          selectedCard.classList.add('selected');
        }
      }

      showNotification() {
        const notification = document.getElementById('theme-notification');
        notification.classList.remove('hidden');
        
        setTimeout(() => {
          notification.classList.add('hidden');
        }, 3000);
      }
    }

    // Inicializar o sistema quando a página carregar
    document.addEventListener('DOMContentLoaded', () => {
      new ThemeManager();
    });

