'use strict';

// DOM Elements
const reviewsContainer = document.querySelector('.reviews');
const starsContainer = document.querySelector('.stars');
const totalReviewsEl = document.querySelector('.all-reviews-count');
const averageRatingEl = document.querySelector('.stars-average');
const addReviewForm = document.querySelector('.form');
const btnAddReview = document.querySelector('.write-review-btn');
const btnCloseForm = document.querySelector('.close-form-btn');
const statsContainer = document.querySelector('.stats');

const dropdowns = document.querySelectorAll('.dropdown');

// Sort Dropdown
const btnDropdownSort = document.querySelector('.dropdown-btn-sort');
const dropdownMenuSort = document.querySelector('.dropdown-menu-sort');

// Filter Dropdown
const btnDropdownFilter = document.querySelector('.dropdown-btn-filter');
const dropdownMenuFilter = document.querySelector('.dropdown-menu-filter');

// State
let reviews = [];

const getCountryFlag = async function () {
  try {
    const API_KEY = 'ef34570736de4b63b4a9f55525e2453a';
    const res = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`
    );
    const data = await res.json();
    const { country_flag: countryFlag } = data;
    return countryFlag;
  } catch (err) {
    console.error(err);
  }
};

getCountryFlag();

// Display star icons based on nbStars
const getStars = (nbStars) => {
  const fullStar = `<ion-icon name="star" class="icon star full-star"></ion-icon>`;
  const halfStar = `<ion-icon name="star-half-outline" class="icon star half-star"></ion-icon>`;
  const emptyStar = `<ion-icon name="star-outline" class="icon star empty-star"></ion-icon>`;

  const fullStars = Math.trunc(nbStars);

  const fullStarsMarkup = Array.from(
    { length: fullStars },
    (_) => fullStar
  ).join('');

  const halfStarMarkup = !Number.isInteger(nbStars) ? halfStar : '';

  const emptyStarsMarkup = Array.from(
    { length: 5 - Math.ceil(nbStars) },
    (_) => emptyStar
  ).join('');

  return `${fullStarsMarkup}${halfStarMarkup}${emptyStarsMarkup}`;
};

const renderReviews = async function (reviews) {
  const countryFlag = await getCountryFlag();
  const markup = reviews
    .map(
      ({ imgUrl, fullName, stars, review, verified }) => `
      <div class="review" data-id="">
      ${
        imgUrl
          ? `<img
      src=${imgUrl}
      alt=""
      class="user-img"
    />`
          : ''
      }
      <div class="created-at">
        <div class="cur-date">${compareDates(new Date())}</div>
        <div>from</div>
        <img src=${countryFlag} alt="" class="country-flag" />
      </div>
      <div class="user">
        <div class="full-name">${fullName || 'New Customer'}</div>
        ${
          verified
            ? '<ion-icon name="checkmark-circle" class="icon-verified"></ion-icon>'
            : ''
        }
      </div>
      <div class="stars">${getStars(stars)}</div>
      <div class="review-text">
        ${review}
      </div>
    </div>
  `
    )
    .join('');

  reviewsContainer.innerHTML = '';
  reviewsContainer.insertAdjacentHTML('beforeend', markup);
};

// Calc & Display average rating
const calcDisplayAverageRating = function (reviews) {
  const averageRating =
    reviews.reduce((sum, entry) => (sum += entry.stars), 0) / reviews.length;
  averageRatingEl.innerHTML = getStars(averageRating);
};

// Calc & Display total reviews
const calcDisplayTotalReviews = function (reviews) {
  const totalReviews = reviews.length;
  totalReviewsEl.textContent = totalReviews;
};

const updateUI = (reviews) => {
  renderReviews(reviews);
  calcDisplayAverageRating(reviews);
  calcDisplayTotalReviews(reviews);
};

const loadLocalStorage = function () {
  const localStorageData = JSON.parse(localStorage.getItem('reviews'));
  if (!localStorageData) return;

  reviews = localStorageData;
};

const milliSecondsToDays = (mills) => mills / (1000 * 60 * 60 * 24);

const compareDates = (date, curDate = new Date()) => {
  const result = curDate.getTime() - date.getTime();
  const daysPassed = Math.abs(Math.floor(milliSecondsToDays(result)));

  // Today
  if (daysPassed === 0) return 'Today';

  // Yesterday
  if (daysPassed === 1) return 'Yesterday';

  // {2-7} days ago
  if (daysPassed > 1 && daysPassed <= 7)
    return `${Math.round(daysPassed)} Days Ago`;

  // FORMATTED DATE
  return new Intl.DateTimeFormat(navigator.location, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const updateLocalStorage = (key, newData) =>
  localStorage.setItem(key, JSON.stringify(newData));

const clearLocalStorage = function () {
  localStorage.clear();
};

// Sort by Most Recent
const sortByMostRecent = function (data) {
  const sortedData = data.toSorted((a, b) => a.createdAt - b.createdAt);
  // Render sorted data
  renderReviews(sortedData);
};

// Sort by Top Rating
const sortByTopRating = function (data) {
  const sortedData = data.toSorted((a, b) => b.stars - a.stars);
  renderReviews(sortedData);
};

const filterByUp = function (data, stars) {
  const filteredArr = data.filter((review) => review.stars >= stars);
  renderReviews(filteredArr);
};

const filterByLowerThan = function (data, stars) {
  const filteredArr = data.filter((review) => review.stars <= stars);
  renderReviews(filteredArr);
};

// Dropdown Menu
const toggleDropdown = (btn, dropdownMenu) => {
  btn.addEventListener('click', () => dropdownMenu.classList.toggle('closed'));
};

const render = (parentEl, markup) => {
  parentEl.innerHTML = '';
  parentEl.insertAdjacentHTML('afterbegin', markup);
};

// load local storage
loadLocalStorage();

// Init State
updateUI(reviews);

// Reviews Stat
const calcPercentage = (data, nbStars) => {
  const percentage =
    data.length === 0
      ? 0
      : data.filter((entry) => entry.stars === nbStars).length / data.length;
  return percentage.toFixed(1);
};

// Percentages State
const percentages = new Map([
  [5, calcPercentage(reviews, 5)],
  [4, calcPercentage(reviews, 4)],
  [3, calcPercentage(reviews, 3)],
  [2, calcPercentage(reviews, 2)],
  [1, calcPercentage(reviews, 1)],
]);

const generateReviewStatMarkup = function (nbStars) {
  return `
    <div class="stat">
      <div class="stars-val">${nbStars}</div>
      <div class="stars">${getStars(nbStars)}</div>
      <div class="rating-percentage percentage-${nbStars}">${new Intl.NumberFormat(
    navigator.location,
    {
      style: 'percent',
    }
  ).format(percentages.get(nbStars))}</div>
    </div>
  `;
};

// Generate Reviews Stats Markup
const ratings = [5, 4, 3, 2, 1];
const reviewsStatsMarkup = ratings
  .map((rating) => generateReviewStatMarkup(rating))
  .join('');
statsContainer.innerHTML = '';
statsContainer.insertAdjacentHTML('afterbegin', reviewsStatsMarkup);

const showForm = (e) => {
  addReviewForm.classList.toggle('hidden');
  addReviewForm.classList.toggle('grid');
  reviewsContainer.classList.toggle('hidden');
  dropdowns.forEach((dropdown) => dropdown.classList.toggle('hidden'));
  statsContainer.classList.add('hidden');
};
// Show form to add a review
btnAddReview.addEventListener('click', showForm);

const closeForm = (e) => {
  addReviewForm.classList.remove('grid');
  addReviewForm.classList.add('hidden');
  reviewsContainer.classList.remove('hidden');
  dropdowns.forEach((dropdown) => dropdown.classList.remove('hidden'));
  statsContainer.classList.remove('hidden');
};
// Hide form and show reviews
btnCloseForm.addEventListener('click', closeForm);

const addReview = (e) => {
  const hideForm = () => {
    e.target.classList.remove('grid');
    e.target.classList.add('hidden');
    reviewsContainer.classList.remove('hidden');
    dropdowns.forEach((dropdown) => dropdown.classList.remove('hidden'));
    statsContainer.classList.remove('hidden');
  };

  e.preventDefault();

  // Get Form data
  const formDataArr = [...new FormData(e.target)];

  const {
    img_url: imgUrl,
    full_name: fullName,
    nb_stars: nbStars,
    review_text: review,
  } = Object.fromEntries(formDataArr);

  // Check if data is valid
  // If it is not valid, return
  if (!nbStars || !review) return console.error('Invalid Data!');

  // Clearn Input fields
  e.target.querySelectorAll('input').forEach((input) => (input.value = ''));
  e.target.querySelector('textarea').value = '';

  // Hide Form & Show reviews
  hideForm();

  // If valid, add that object to our state and update UI
  const newReview = {
    imgUrl: imgUrl.trim(),
    fullName: fullName.trim(),
    stars: +nbStars,
    review: review.trim(),
    createdAt: Date.now(),
    verified: true,
  };
  reviews.push(newReview);

  // Add data to local storage
  localStorage.setItem('reviews', JSON.stringify(reviews));

  // Update UI
  updateUI(reviews);

  // Update Reviews Stats

  const updateStat = (nbStars) => {
    percentages.set(nbStars, calcPercentage(reviews, nbStars));
    document.querySelector(
      `.percentage-${nbStars}`
    ).textContent = `${new Intl.NumberFormat(navigator.location, {
      style: 'percent',
    }).format(percentages.get(nbStars))}`;
  };
  [5, 4, 3, 2, 1].forEach((val) => {
    updateStat(val);
  });
};
// Get form data and add new data to our state
addReviewForm.addEventListener('submit', addReview);

const sort = (e) => {
  e.target.classList.contains('btn-top-default') && renderReviews(reviews);
  e.target.classList.contains('btn-top-rating') && sortByTopRating(reviews);
  e.target.classList.contains('btn-most-recent') && console.log('Most Recent');
};

const filter = (e) => {
  e.target.classList.contains('btn-filter-by-5') && filterByUp(reviews, 5);
  e.target.classList.contains('btn-filter-by-4-half-up') &&
    filterByUp(reviews, 4.5);
  e.target.classList.contains('btn-filter-by-4-up') && filterByUp(reviews, 4);
  e.target.classList.contains('btn-filter-by-lower-than-4') &&
    filterByLowerThan(reviews, 4);
};

toggleDropdown(btnDropdownSort, dropdownMenuSort);
toggleDropdown(btnDropdownFilter, dropdownMenuFilter);

// Sort by (Top rating & Most recent)
dropdownMenuSort.addEventListener('click', sort);
dropdownMenuFilter.addEventListener('click', filter);

// clearLocalStorage();
