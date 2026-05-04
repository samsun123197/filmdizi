const API_KEY = '838e49ba';
const searchInput = document.getElementById('search');
const movieContainer = document.getElementById('movie-container');

// Sayfa ilk açıldığında gösterilecek filmler
window.onload = () => {
    searchMovies('Action'); 
};

// Arama motorunu aktifleştir
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value;
        if (query) {
            searchMovies(query);
        }
    }
});

async function searchMovies(title) {
    movieContainer.innerHTML = '<p>Yükleniyor...</p>';
    
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${title}&apikey=${API_KEY}`);
        const data = await res.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieContainer.innerHTML = `<p>Sonuç bulunamadı: ${data.Error}</p>`;
        }
    } catch (error) {
        movieContainer.innerHTML = `<p>Bir hata oluştu. Lütfen tekrar deneyin.</p>`;
    }
}

function displayMovies(movies) {
    movieContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');

        // Afiş kontrolü
        const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=Film+Afisi+Yok";

        movieEl.innerHTML = `
            <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank" style="text-decoration: none; color: inherit;">
                <img src="${poster}" alt="${movie.Title}">
                <div class="movie-info">
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year} • ${movie.Type.toUpperCase()}</p>
                </div>
            </a>
        `;
        movieContainer.appendChild(movieEl);
    });
}