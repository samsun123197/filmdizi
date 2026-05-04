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
const siteTitle = document.getElementById('site-title');

// Başlangıç: Trend olanları getir
document.addEventListener('DOMContentLoaded', () => {
    getMovies(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`);
});

// Arama Girişi
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
    if (page === 1) movieContainer.innerHTML = '<p>Yükleniyor...</p>';
    
    try {
        const finalUrl = `${url}&page=${page}`;
        const res = await fetch(finalUrl);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            renderMovies(data.results, page > 1);
            loadMoreBtn.style.display = 'inline-block';
        } else {
            if (page === 1) movieContainer.innerHTML = '<p>Sonuç bulunamadı.</p>';
            loadMoreBtn.style.display = 'none';
        }
    } catch (error) {
        movieContainer.innerHTML = '<p>Veri çekilirken bir hata oluştu.</p>';
    }
}

function renderMovies(movies, append) {
    if (!append) movieContainer.innerHTML = '';

    movies.forEach(movie => {
        const { title, poster_path, release_date, id } = movie;
        const isFav = favorites.some(fav => fav.id === id);
        
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        const poster = poster_path ? IMG_URL + poster_path : "https://via.placeholder.com/300x450?text=Afiş+Yok";
        const year = release_date ? release_date.split('-')[0] : 'Bilinmiyor';

        card.innerHTML = `
            <button class="fav-icon ${isFav ? 'active' : ''}" data-id="${id}">❤</button>
            <img src="${poster}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <p>${year}</p>
            </div>
        `;

        // Yönlendirme (window.open) kaldırıldı. 
        // Kart artık sadece üzerine gelince büyüyen bir görsel öğe.
        card.style.cursor = 'default'; 

        const favBtn = card.querySelector('.fav-icon');
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(movie);
            favBtn.classList.toggle('active');
        };

        movieContainer.appendChild(card);
    });
}

function toggleFavorite(movie) {
    const index = favorites.findIndex(fav => fav.id === movie.id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(movie);
    }
    localStorage.setItem('myMoviesTMDB', JSON.stringify(favorites));
}

function loadMore() {
    currentPage++;
    let url = '';
    if (currentMode === 'trending') url = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`;
    else if (currentMode === 'search') url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&language=tr-TR`;
    else if (currentMode === 'genre') url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenreId}&language=tr-TR`;
    
    getMovies(url, currentPage);
}

function filterGenre(genreId) {
    currentGenreId = genreId;
    currentMode = 'genre';
    currentPage = 1;
    getMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=tr-TR`);
}

function showFavorites() {
    movieContainer.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    if (favorites.length === 0) {
        movieContainer.innerHTML = '<p>Henüz favori eklenmemiş.</p>';
        return;
    }
    renderMovies(favorites, false);
}

siteTitle.onclick = () => location.reload();
