const API_KEY = '838e49ba';
const searchInput = document.getElementById('search');
const movieContainer = document.getElementById('movie-container');

// Sayfa ilk açıldığında popüler içerikleri getir
window.onload = () => {
    searchMovies('Action'); 
};

// Enter tuşuna basınca arama yap
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value;
        if (query) searchMovies(query);
    }
});

async function searchMovies(title) {
    movieContainer.innerHTML = '<p>İçerikler aranıyor...</p>';
    
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${title}&apikey=${API_KEY}`);
        const data = await res.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieContainer.innerHTML = `<p>Sonuç bulunamadı: ${data.Error}</p>`;
        }
    } catch (error) {
        movieContainer.innerHTML = `<p>Bir bağlantı hatası oluştu.</p>`;
    }
}

function displayMovies(movies) {
    movieContainer.innerHTML = '';

    movies.forEach(movie => {
        // IMDb linkini "play" formatına dönüştürüyoruz
        // Örnek: tt0318155 -> https://www.playimdb.com/title/tt0318155
        const playUrl = `https://www.playimdb.com/title/${movie.imdbID}`;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');
        
        const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=Afiş+Yok";

        movieEl.innerHTML = `
            <img src="${poster}" alt="${movie.Title}">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year} • ${movie.Type.toUpperCase()}</p>
            </div>
        `;

        // Sadece karta tıklandığında play linkine yönlendirir
        movieEl.onclick = () => {
            window.open(playUrl, '_blank');
        };
        
        movieContainer.appendChild(movieEl);
    });
}
