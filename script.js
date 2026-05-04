const API_KEY = '4cf38230c1ed4f19d25340dbb4a22b8b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentMode = 'trending'; 
let currentQuery = '';
let currentGenreId = '';
let favorites = JSON.parse(localStorage.getItem('myMoviesTMDB')) || [];

const movieContainer = document.getElementById('movie-container');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search');
const modal = document.getElementById('movie-modal');

document.addEventListener('DOMContentLoaded', () => {
    getMovies(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentQuery = searchInput.value;
        if (currentQuery) {
            currentMode = 'search';
            currentPage = 1;
            getMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&language=tr-TR`);
        }
    }
});

async function getMovies(url, page = 1) {
    if (page === 1) movieContainer.innerHTML = '<p class="status-msg">Yükleniyor...</p>';
    try {
        const res = await fetch(`${url}&page=${page}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            renderMovies(data.results, page > 1);
            loadMoreBtn.style.display = 'inline-block';
        } else {
            if (page === 1) movieContainer.innerHTML = '<p class="status-msg">Sonuç bulunamadı.</p>';
            loadMoreBtn.style.display = 'none';
        }
    } catch (e) { 
        console.error("Hata:", e);
        movieContainer.innerHTML = '<p class="status-msg">Bağlantı hatası oluştu.</p>';
    }
}

function renderMovies(movies, append) {
    if (!append) movieContainer.innerHTML = '';
    movies.forEach(movie => {
        const isFav = favorites.some(fav => fav.id === movie.id);
        const card = document.createElement('div');
        card.classList.add('movie-card');
        const poster = movie.poster_path ? IMG_URL + movie.poster_path : "https://via.placeholder.com/300x450?text=Afiş+Yok";
        
        card.innerHTML = `
            <button class="fav-icon ${isFav ? 'active' : ''}">❤</button>
            <img src="${poster}" alt="${movie.title}">
            <div class="card-overlay">
                <button class="btn-card btn-izle" onclick="playMovie('${movie.id}')">İzle</button>
                <button class="btn-card btn-detay" onclick="showDetails('${movie.id}')">Detay</button>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
            </div>
        `;
        
        card.querySelector('.fav-icon').onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(movie);
            e.target.classList.toggle('active');
        };
        movieContainer.appendChild(card);
    });
}

async function playMovie(id) {
    try {
        const res = await fetch(`${BASE_URL}/movie/${id}/external_ids?api_key=${API_KEY}`);
        const data = await res.json();
        if (data.imdb_id) {
            window.open(`https://playimdb.com/title/${data.imdb_id}`, '_blank');
        } else {
            alert("IMDb ID'si bulunamadı.");
        }
    } catch (e) { alert("Hata oluştu."); }
}

async function showDetails(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=tr-TR&append_to_response=external_ids`);
    const movie = await res.json();
    
    document.getElementById('modal-details').innerHTML = `
        <div class="modal-grid">
            <img src="${IMG_URL + movie.poster_path}">
            <div>
                <h2 style="margin-bottom:10px;">${movie.title}</h2>
                <p style="color: #f5c518; font-weight: bold; font-size: 1.2rem;">⭐ IMDb: ${movie.vote_average.toFixed(1)}</p>
                <p style="margin: 15px 0; line-height: 1.6; color: #ccc;">${movie.overview || "Özet bulunamadı."}</p>
                <p><strong>Tür:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                <p><strong>Yıl:</strong> ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                <button class="btn-card btn-izle" style="margin-top:15px; width:100%;" onclick="playMovie('${movie.id}')">Hemen İzle</button>
                <a href="https://www.imdb.com/title/${movie.external_ids?.imdb_id}" target="_blank" style="display:inline-block; margin-top:15px; color: #e50914; text-decoration:none; font-size:0.9rem;">IMDb'de Gör →</a>
            </div>
        </div>
    `;
    modal.style.display = "block";
}

function showTurkishMovies() {
    currentMode = 'turkish';
    currentPage = 1;
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=tr&language=tr-TR&sort_by=popularity.desc`;
    getMovies(url, currentPage);
}

function filterGenre(id) {
    currentMode = 'genre'; currentGenreId = id; currentPage = 1;
    getMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}&language=tr-TR`);
}

function loadMore() {
    currentPage++;
    let url = '';
    if (currentMode === 'trending') url = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`;
    else if (currentMode === 'search') url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&language=tr-TR`;
    else if (currentMode === 'genre') url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenreId}&language=tr-TR`;
    else if (currentMode === 'turkish') url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=tr&language=tr-TR&sort_by=popularity.desc`;
    
    getMovies(url, currentPage);
}

function toggleFavorite(movie) {
    const idx = favorites.findIndex(f => f.id === movie.id);
    idx > -1 ? favorites.splice(idx, 1) : favorites.push(movie);
    localStorage.setItem('myMoviesTMDB', JSON.stringify(favorites));
}

function showFavorites() {
    movieContainer.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    if (favorites.length === 0) {
        movieContainer.innerHTML = '<p class="status-msg">Henüz favori eklenmemiş.</p>';
        return;
    }
    renderMovies(favorites, false);
}

function closeModal() { modal.style.display = "none"; }
window.onclick = (e) => { if (e.target == modal) closeModal(); }
document.getElementById('site-title').onclick = () => location.reload();
