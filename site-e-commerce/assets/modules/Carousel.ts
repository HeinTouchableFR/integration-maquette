import {TouchPlugin} from "/modules/TouchPlugin";


class Carousel {
  private element: HTMLElement;
  private container: HTMLDivElement;
  private slideToScroll: number;
  private slidesVisible: number;
  private loop: boolean;
  private items: any;
  private currentItem: number;
  private offset: number;

  /**
   *
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element

    this.container = document.createElement('div');
    this.container.classList.add('carousel__container')
    this.element.setAttribute('tabindex', '0');

    this.slideToScroll = parseInt(this.element.getAttribute('slideToScroll'), 10) || 3
    this.slidesVisible = parseInt(this.element.getAttribute('slidesVisible'), 10) || 3
    this.loop = this.element.getAttribute('loop') === 'true'

    this.items = [].slice.call(this.element.children)

    this.currentItem = 0

    this.offset = 0


    this.initCarousel()
    this.initArrows()
  }

  initCarousel() {
    this.offset = this.slidesVisible + this.slideToScroll
    if (this.loop) {
      this.items = [
        ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
        ...this.items,
        ...this.items.slice(0, this.offset).map(item => item.cloneNode(true)),
      ]
      this.gotoItem(this.offset, false)

      if (this.loop) {
        this.container.addEventListener('transitionend', this.resetLoop.bind(this))
      }
    }

    this.items.forEach((elem) => {
      this.container.appendChild(elem)
    })

    this.element.appendChild(this.container)
    this.setStyle()

    this.element.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        this.slideToNext()
      } else if (e.key === 'ArrowLeft') {
        this.slideToPrev()
      }
    })

    new TouchPlugin(this)
  }

  initArrows() {
    const prev = document.createElement("button")
    prev.classList.add("carousel__buttons-prev")
    prev.addEventListener('click', this.slideToPrev.bind(this))

    const next = document.createElement("button")
    next.classList.add("carousel__buttons-next")
    next.addEventListener('click', this.slideToNext.bind(this))

    const container = document.createElement("div")
    container.classList.add("carousel__buttons")
    container.appendChild(prev);
    container.appendChild(next);

    this.element.appendChild(container)
  }

  setStyle() {
    let ratio = this.items.length / this.slidesVisible
    this.container.style.width = `${ratio * 100}%`
    this.items.forEach((item) => item.style.width = `${(100 / this.slidesVisible) / ratio}%`)
  }
  gotoItem(index: number, animation = true) {
    if (index < 0) {
      if (this.loop) {
        index = this.items.length - this.slidesVisible
      } else {
        return
      }
    } else if (index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && index > this.currentItem)) {
      if (this.loop) {
        index = 0
      } else {
        return
      }
    }

    let translateX = (-100 / this.items.length) * index
    if (!animation) {
      this.disableTransition();
    }
    this.translate(translateX)
    this.container.offsetHeight // force repaint
    if (!animation) {
      this.enableTransition();
    }
    this.currentItem = index
  }

  slideToPrev() {
    this.gotoItem(this.currentItem - this.slideToScroll)
  }

  slideToNext() {
    this.gotoItem(this.currentItem + this.slideToScroll)
  }

  resetLoop() {
    if (this.currentItem <= this.slideToScroll) {
      this.gotoItem(this.currentItem + (this.items.length - 2 * this.offset), false)
    } else if (this.currentItem >= this.items.length - this.offset) {
      this.gotoItem(this.currentItem - (this.items.length - 2 * this.offset), false)
    }
  }

  disableTransition() {
    this.container.style.transition = 'none';
  }

  enableTransition() {
    this.container.style.transition = '';
  }

  translate(percent) {
    this.container.style.transform = `translate3d(${percent}%, 0, 0)`
  }

  get containerWidth() {
    return this.container.offsetWidth
  }

  get carouselWidth() {
    return this.element.offsetWidth
  }
}

export function registerCarousel() {
  const carousels = document.querySelectorAll(".carousel")

  carousels.forEach(elem => {
    new Carousel(elem)
  })
}
