const books = [];
const STORAGE_KEY = "BOOKSHELF_APP";
const SAVED_EVENT = "saved-books";

let isEditMode = false;
let editBookId = null;

document.addEventListener("DOMContentLoaded", function () {
  const bookForm = document.getElementById("bookForm");
  const searchBook = document.getElementById("searchBook");
  const checkbox = document.getElementById("bookFormIsComplete");

  if (bookForm) {
    bookForm.addEventListener("submit", function (event) {
      event.preventDefault();
      addBook();
    });
  }
  if (searchBook) {
    searchBook.addEventListener("submit", function (event) {
      event.preventDefault();

      const searchTitle = document
        .getElementById("searchBookTitle")
        .value.toLowerCase();

      const filteredBooks = books.filter(function (book) {
        return book.title.toLowerCase().includes(searchTitle);
      });

      renderBooks(filteredBooks);
    });
  }

  checkbox.addEventListener("change", function () {
    const submitButton = document.getElementById("bookFormSubmit");
    if (isEditMode) {
      submitButton.innerText = "Simpan Perubahan";
    } else {
      if (checkbox.checked) {
        submitButton.innerText = "Masukkan Buku ke rak Selesai dibaca";
      } else {
        submitButton.innerText = "Masukkan Buku ke rak Belum selesai dibaca";
      }
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
    renderBooks();
  }
});

function addBook() {
  const judul = document.getElementById("bookFormTitle").value;
  const penulis = document.getElementById("bookFormAuthor").value;
  const tahun = Number(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  if (isEditMode) {
    const bookIndex = books.findIndex((book) => book.id === editBookId);
    books[bookIndex].title = judul;
    books[bookIndex].author = penulis;
    books[bookIndex].year = tahun;
    books[bookIndex].isComplete = isComplete;

    isEditMode = false;
    editBookId = null;
    document.getElementById("bookFormSubmit").innerText =
      "Masukkan Buku ke rak Belum selesai dibaca";
  } else {
    const bookObject = {
      id: +new Date(),
      title: judul,
      author: penulis,
      year: tahun,
      isComplete: isComplete,
    };
    books.push(bookObject);
  }

  saveData();
  renderBooks();
  bookForm.reset();
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser Anda tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData(actionType = "save") {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);

    const saveEvent = new CustomEvent(SAVED_EVENT, {
      detail: { action: actionType },
    });
    document.dispatchEvent(saveEvent);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
}

function renderBooks(bookList = books) {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const book of bookList) {
    const bookElement = makeBookElement(book);
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
}

function makeBookElement(bookObject) {
  const container = document.createElement("div");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.innerText = `Penulis: ${bookObject.author}`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement("div");

  const isCompleteButton = document.createElement("button");
  isCompleteButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  isCompleteButton.innerText = bookObject.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";

  isCompleteButton.addEventListener("click", function () {
    toggleBookStatus(bookObject.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus Buku";

  deleteButton.addEventListener("click", function () {
    deleteBook(bookObject.id);
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit Buku";

  editButton.addEventListener("click", function () {
    itemEditButton(bookObject.id);
  });

  buttonContainer.append(isCompleteButton, deleteButton, editButton);
  container.append(title, author, year, buttonContainer);

  return container;
}

function toggleBookStatus(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = !bookTarget.isComplete;
  saveData();
  renderBooks();
}

function deleteBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex === -1) return;
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    books.splice(bookIndex, 1);
    saveData();
    renderBooks();
  }
}

function itemEditButton(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);
  if (bookTarget == null) return;
  document.getElementById("bookFormTitle").value = bookTarget.title;
  document.getElementById("bookFormAuthor").value = bookTarget.author;
  document.getElementById("bookFormYear").value = bookTarget.year;
  document.getElementById("bookFormIsComplete").checked = bookTarget.isComplete;

  isEditMode = true;
  editBookId = bookId;

  document.getElementById("bookFormSubmit").innerText = "Simpan Perubahan";
}
