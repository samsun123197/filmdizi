const API_KEY = '838e49ba';
const searchInput = document.getElementById('search');
const movieContainer = document.getElementById('movie-container');

// Sayfa ilk açıldığında gösterilecek filmler
window.onload = () => {
    searchMovies('Action'); 
};

// Arama kutusunda Enter'a basıldığında çalışır
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value;
        if (query) {
            searchMovies(query);
        }
    }
});

async function searchMovies(title) {
    movieContainer.innerHTML = '<p>Aranıyor...</p>';
    
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${title}&apikey=${API_KEY}`);
        const data = await res.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            movieContainer.innerHTML = `<p>Sonuç bulunamadı: ${data.Error}</p>`;
        }
    } catch (error) {
        movieContainer.innerHTML = `<p>Bağlantı hatası!</p>`;
    }
}

function displayMovies(movies) {
    movieContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');

        // Afiş kontrolü
        const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=Afiş+Yok";

        // Kartın HTML yapısı
        movieEl.innerHTML = `
            <img src="${poster}" alt="${movie.Title}">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year} • ${movie.Type.toUpperCase()}</p>
            </div>
        `;

        // İŞTE İSTEDİĞİN ÖZEL TIKLAMA MANTIĞI:
        // imdb.com yerine doğrudan playimdb.com linkini oluşturup açar
        movieEl.onclick = () => {
            const playLink = `https://playimdb.com/title/${movie.imdbID}`;
            window.open(playLink, '_blank');
        };
        
        movieContainer.appendChild(movieEl);
    });
}
