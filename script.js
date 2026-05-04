const API_KEY = '838e49ba';
let currentPage = 1;
let currentQuery = 'Action'; // Varsayılan açılış araması
let favorites = JSON.parse(localStorage.getItem('myMovies')) || [];

const movieContainer = document.getElementById('movie-container');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search');
const siteTitle = document.getElementById('site-title');

// Başlangıç
window.onload = () => searchMovies(currentQuery);

// Arama Girişi
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentQuery = searchInput.value;
        currentPage = 1;
        searchMovies(currentQuery);
    }
});

// Site başlığına tıklayınca ana sayfaya dön
siteTitle.onclick = () => {
    currentQuery = 'Action';
    currentPage = 1;
    searchMovies(currentQuery);
};

async function searchMovies(query, page = 1) {
    if (page === 1) movieContainer.innerHTML = '<p>Yükleniyor...</p>';
    
    const res = await fetch(`https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${API_KEY}`);
    const data = await res.json();

    if (data.Response === "True") {
        renderMovies(data.Search, page > 1);
        loadMoreBtn.style.display = 'inline-block';
    } else {
        if(page === 1) movieContainer.innerHTML = `<p>Sonuç bulunamadı.</p>`;
        loadMoreBtn.style.display = 'none';
    }
}

function renderMovies(movies, append) {
    if (!append) movieContainer.innerHTML = '';

    movies.forEach(movie => {
        const isFav = favorites.some(fav => fav.imdbID === movie.imdbID);
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        card.innerHTML = `
            <button class="fav-icon ${isFav ? 'active' : ''}" data-id="${movie.imdbID}">❤</button>
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450'}" alt="${movie.Title}">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        `;

        // Film izleme linkine yönlendirme (İstediğin format)
        card.onclick = (e) => {
            if(e.target.classList.contains('fav-icon')) return;
            window.open(`https://playimdb.com/title/${movie.imdbID}`, '_blank');
        };

        // Favorilere ekleme/çıkarma
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
    const index = favorites.findIndex(fav => fav.imdbID === movie.imdbID);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(movie);
    }
    localStorage.setItem('myMovies', JSON.stringify(favorites));
}

function loadMore() {
    currentPage++;
    searchMovies(currentQuery, currentPage);
}

function filterGenre(genre) {
    currentQuery = genre;
    currentPage = 1;
    searchMovies(genre);
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
