'use strict';

/* Логика главной страницы (index.html): счётчик предложений в слайдере акций.
   Клики по кнопкам перехватываются в фазе перехвата, поэтому прокруткой управляет этот модуль,
   а сам переход анимирует Bootstrap-карусель (её разметка уже размечена через data-bs-slide).
   Номер текущего предложения берём из события slid.bs.carousel, поэтому счётчик и анимация не расходятся. */

(function () {
  'use strict';

  const slider = document.getElementById('promotions-slider');
  const indicator = document.getElementById('slider-page-indicator');
  const prevButton = document.getElementById('slider-prev-btn');
  const nextButton = document.getElementById('slider-next-btn');

  if (!slider || !window.bootstrap || !window.bootstrap.Carousel) {
    return;
  }

  const slides = slider.querySelectorAll('.carousel-item');
  if (slides.length === 0) {
    return;
  }

  const carousel = window.bootstrap.Carousel.getOrCreateInstance(slider);

  /* Обновляет счётчик: «Предложение N из M». */
  function updateIndicator(index) {
    if (indicator) {
      indicator.textContent = 'Предложение ' + (index + 1) + ' из ' + slides.length;
    }
  }

  /* Индекс слайда, помеченного классом active в разметке. */
  function activeIndex() {
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].classList.contains('active')) {
        return i;
      }
    }
    return 0;
  }

  function handlePrev(event) {
    event.preventDefault();
    event.stopPropagation();
    carousel.prev();
  }

  function handleNext(event) {
    event.preventDefault();
    event.stopPropagation();
    carousel.next();
  }

  if (prevButton) {
    prevButton.addEventListener('click', handlePrev, true);
  }
  if (nextButton) {
    nextButton.addEventListener('click', handleNext, true);
  }

  /* Пока карусель проигрывает переход, повторные вызовы Bootstrap гасит сам. */
  slider.addEventListener('slid.bs.carousel', function (event) {
    updateIndicator(event.to);
  });

  updateIndicator(activeIndex());
})();
