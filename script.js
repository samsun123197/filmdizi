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
    if (page === 1) movieContainer.innerHTML = '';
    try {
        const res = await fetch(`${url}&page=${page}`);
        const data = await res.json();
        if (data.results) renderMovies(data.results, page > 1);
    } catch (e) { console.error("Hata:", e); }
}

function renderMovies(movies, append) {
    movies.forEach(movie => {
        const isFav = favorites.some(fav => fav.id === movie.id);
        const card = document.createElement('div');
        card.classList.add('movie-card');
        const poster = movie.poster_path ? IMG_URL + movie.poster_path : "https://via.placeholder.com/300x450";
        
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

async function showDetails(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=tr-TR&append_to_response=external_ids`);
    const movie = await res.json();
    
    document.getElementById('modal-details').innerHTML = `
        <div class="modal-grid">
            <img src="${IMG_URL + movie.poster_path}">
            <div>
                <h2 style="margin-bottom:10px;">${movie.title}</h2>
                <p style="color: #f5c518; font-weight: bold; font-size: 1.2rem;">⭐ ${movie.vote_average.toFixed(1)}</p>
                <p style="margin: 15px 0; line-height: 1.6; color: #ccc;">${movie.overview || "Özet bulunamadı."}</p>
                <p><strong>Tür:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                <p><strong>Yıl:</strong> ${movie.release_date.split('-')[0]}</p>
                <a href="https://www.imdb.com/title/${movie.external_ids?.imdb_id}" target="_blank" style="display:inline-block; margin-top:20px; color: #e50914; text-decoration:none;">IMDb'de Gör →</a>
            </div>
        </div>
    `;
    modal.style.display = "block";
}

function playMovie(id) {
    // Eskisi gibi playimdb linkini istersen buraya ekleyebilirsin:
    // window.open(`https://playimdb.com/title/${id}`, '_blank');
    alert("Oynatıcı yakında eklenecek. ID: " + id);
}

function closeModal() { modal.style.display = "none"; }
window.onclick = (e) => { if (e.target == modal) closeModal(); }

function filterGenre(id) {
    currentMode = 'genre'; currentGenreId = id; currentPage = 1;
    getMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}&language=tr-TR`);
}

function loadMore() {
    currentPage++;
    let url = currentMode === 'trending' ? `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR` :
              currentMode === 'search' ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&language=tr-TR` :
              `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenreId}&language=tr-TR`;
    getMovies(url, currentPage);
}

function toggleFavorite(movie) {
    const idx = favorites.findIndex(f => f.id === movie.id);
    idx > -1 ? favorites.splice(idx, 1) : favorites.push(movie);
    localStorage.setItem('myMoviesTMDB', JSON.stringify(favorites));
}
