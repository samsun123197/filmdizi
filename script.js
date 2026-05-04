const API_KEY = '4cf38230c1ed4f19d25340dbb4a22b8b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let favorites = JSON.parse(localStorage.getItem('myMoviesTMDB')) || [];
const movieContainer = document.getElementById('movie-container');
const modal = document.getElementById('movie-modal');

document.addEventListener('DOMContentLoaded', () => getMovies(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`));

async function getMovies(url, page = 1) {
    const res = await fetch(`${url}&page=${page}`);
    const data = await res.json();
    renderMovies(data.results, page > 1);
}

function renderMovies(movies, append) {
    if (!append) movieContainer.innerHTML = '';
    movies.forEach(movie => {
        const isFav = favorites.some(fav => fav.id === movie.id);
        const poster = movie.poster_path ? IMG_URL + movie.poster_path : "https://via.placeholder.com/300x450";
        
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <button class="fav-icon ${isFav ? 'active' : ''}">❤</button>
            <img src="${poster}">
            <div class="card-overlay">
                <button class="btn-card btn-izle" onclick="playMovie('${movie.id}')">İzle</button>
                <button class="btn-card btn-detay" onclick="showDetails('${movie.id}')">Detay</button>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
            </div>
        `;
        
        card.querySelector('.fav-icon').onclick = () => toggleFavorite(movie);
        movieContainer.appendChild(card);
    });
}

async function showDetails(id) {
    // TMDB'den detaylı bilgi ve IMDb ID'sini alıyoruz
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=tr-TR&append_to_response=external_ids`);
    const movie = await res.json();
    
    const detailsDiv = document.getElementById('modal-details');
    detailsDiv.innerHTML = `
        <div class="modal-grid">
            <img src="${IMG_URL + movie.poster_path}">
            <div>
                <h2>${movie.title}</h2>
                <p style="color: #f5c518; margin: 10px 0;">⭐ IMDb: ${movie.vote_average.toFixed(1)}</p>
                <p>${movie.overview || "Özet bulunamadı."}</p>
                <p style="margin-top: 15px;"><b>Yayın Tarihi:</b> ${movie.release_date}</p>
                <p><b>Türler:</b> ${movie.genres.map(g => g.name).join(', ')}</p>
                <a href="https://www.imdb.com/title/${movie.external_ids.imdb_id}" target="_blank" style="color: #3498db; display: block; margin-top: 10px;">IMDb Sayfasına Git</a>
            </div>
        </div>
    `;
    modal.style.display = "block";
}

function playMovie(id) {
    alert("Oynatma özelliği (kendi player'ın veya linkin) buraya eklenebilir. ID: " + id);
}

function closeModal() { modal.style.display = "none"; }
window.onclick = (e) => { if (e.target == modal) closeModal(); }

// Diğer fonksiyonlar (search, filterGenre, toggleFavorite) öncekiyle aynı kalabilir.
