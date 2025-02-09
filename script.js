
const homeLink = document.getElementById('home-link');
const libraryLink = document.getElementById('library-link');
const homePage = document.getElementById('home');
const libraryPage = document.getElementById('library');
const searchBar = document.getElementById('search-bar');
const genreFilter = document.getElementById('genre-filter');
const bookList = document.getElementById('book-list');
const libraryList = document.getElementById('library-list');
const darkModeToggle = document.getElementById('dark-mode');


const LIBRARY_KEY = 'userLibrary';


async function fetchBooks(query) {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  const data = await response.json();
  return data.items || [];
}


function displayBooks(books) {
  bookList.innerHTML = '';
  books.forEach(book => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card col-md-3';
    bookCard.innerHTML = `
      <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="${book.volumeInfo.title}">
      <h3>${book.volumeInfo.title}</h3>
      <p>${book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
      <button onclick="addToLibrary('${book.id}')">Add to Library</button>
    `;
    bookList.appendChild(bookCard);
  });
}


function addToLibrary(bookId) {
  const library = getLibrary();
  if (!library.includes(bookId)) {
    library.push(bookId);
    saveLibrary(library);
    alert('Book added to library!');
  } else {
    alert('Book already in library!');
  }
}


function getLibrary() {
  return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || [];
}


function saveLibrary(library) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}


function getProgress(bookId) {
    const progressData = JSON.parse(localStorage.getItem('readingProgress')) || {};
    return progressData[bookId] || 0; 
  }
  
 
  function saveProgress(bookId, value) {
    const progressData = JSON.parse(localStorage.getItem('readingProgress')) || {};
    progressData[bookId] = value;
    localStorage.setItem('readingProgress', JSON.stringify(progressData));
  }
  
  
  function displayLibrary() {
    const library = getLibrary();
    libraryList.innerHTML = '';
    library.forEach(bookId => {
      fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
        .then(response => response.json())
        .then(book => {
          const bookCard = document.createElement('div');
          bookCard.className = 'book-card col-md-3';
  
          
          const savedProgress = getProgress(book.id);
  
          bookCard.innerHTML = `
            <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="${book.volumeInfo.title}">
            <h3>${book.volumeInfo.title}</h3>
            <p>${book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
            <div class="progress-container">
              <input type="range" class="progress-slider" data-book-id="${book.id}" min="0" max="100" value="${savedProgress}">
              <span class="progress-value">${savedProgress}%</span>
            </div>
            <button class="remove-btn" onclick="removeFromLibrary('${book.id}')">Remove from Library</button>
          `;
          
          libraryList.appendChild(bookCard);
  
          
          const slider = bookCard.querySelector('.progress-slider');
          const progressValue = bookCard.querySelector('.progress-value');
  
          slider.addEventListener('input', (event) => {
            const newValue = event.target.value;
            progressValue.textContent = `${newValue}%`;
            saveProgress(book.id, newValue);
          });
        });
    });
  }
  


function removeFromLibrary(bookId) {
  const library = getLibrary().filter(id => id !== bookId);
  saveLibrary(library);
  displayLibrary();
}


darkModeToggle.addEventListener('change', function() {
  document.body.classList.toggle('dark-mode');
});


homeLink.addEventListener('click', () => {
  homePage.style.display = 'block';
  libraryPage.style.display = 'none';
});

libraryLink.addEventListener('click', () => {
  homePage.style.display = 'none';
  libraryPage.style.display = 'block';
  displayLibrary();
});


searchBar.addEventListener('input', async () => {
  const query = searchBar.value.trim();
  if (query) {
    const books = await fetchBooks(query);
    displayBooks(books);
  } else {
    bookList.innerHTML = ''; 
  }
});


fetchBooks('fiction').then(displayBooks);
