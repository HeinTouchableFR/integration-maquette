export function registerSlider() {
  const sliders = document.querySelectorAll('.slider')

  sliders.forEach(slider => {
    const autoplay = slider.getAttribute('autoplay')
    const duration = parseInt(slider.getAttribute('duration') ?? '0', 10) * 1000
    let slideInterval = null
    let current: Element | null = null
    let currentIndex = -1;

    const slides = slider.querySelectorAll(".slider__slides-item")

    function initDots() {
      const container = document.createElement("div");
      container.classList.add("slider__dots");
      container.classList.add("flex-group");
      container.setAttribute("data-flex-column-gap", 'reset')
      slides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.classList.add("slider__dots-item");
        dot.id = `dots-index-${i}`;
        dot.addEventListener("click", () => {
          goToIndexSlide(i);
        });
        container.appendChild(dot);
      });
      slider.appendChild(container);
    }

    function initArrows() {
      const prev = document.createElement("button")
      prev.classList.add("slider__buttons-prev")
      prev.addEventListener('click', prevSlide)

      const next = document.createElement("button")
      next.classList.add("slider__buttons-next")
      next.addEventListener('click', nextSlide)

      const container = document.createElement("div")
      container.classList.add("slider__buttons")
      container.appendChild(prev);
      container.appendChild(next);

      slider.appendChild(container)
    }

    function initSlider() {
      const firstSlide = slides[0]
      const firstDot = slider.querySelector<HTMLElement>('.slider__dots-item')
      if (!firstSlide) {
        return
      }

      firstSlide.classList.add('active')
      firstDot.classList.add('active')

      slides.forEach((elem, i) => {
        elem.setAttribute('index', String(i));
      })

      current = firstSlide
      currentIndex = 0
    }

    initDots();
    initSlider();
    initArrows();

    function updateDot() {
      slider.querySelectorAll(`.slider__dots-item.active`)[0].classList.remove('active')
      slider.querySelector(`#dots-index-${currentIndex}`).classList.add('active')
    }

    function nextSlide() {
      if (!current) {
        return
      }
      current.classList.remove('active')
      if (current.nextElementSibling) {
        current = current.nextElementSibling
        current.classList.add('active')
      } else {
        current = slides[0]
        if (!current) {
          return
        }
        current.classList.add('active')
      }
      currentIndex = parseInt(current?.getAttribute('index'));
      updateDot()
    }

    function prevSlide() {
      if (!current) {
        return
      }
      current.classList.remove('active')
      if (current.previousElementSibling) {
        current = current.previousElementSibling
        current.classList.add('active')
      } else {
        current = [...slides].pop()
        if (!current) {
          return
        }
        current.classList.add('active')
      }
      currentIndex = parseInt(current?.getAttribute('index'));
      updateDot()
    }

    function goToIndexSlide(index: number) {
      if (currentIndex === index) {
        return
      }

      const sliding =
        currentIndex > index ? () => nextSlide() : () => prevSlide();

      while (currentIndex !== index) {
        sliding();
      }

    }

    if (autoplay) {
      setInterval(nextSlide, duration)
    }
  })
}
