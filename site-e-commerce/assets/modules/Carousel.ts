import {TouchPlugin} from "/modules/TouchPlugin";


class Carousel {
  private element: HTMLElement;
  private container: HTMLDivElement;
  private loop: boolean;
  private items: any;
  private currentItem: number;
  private offset: number;
  private options: { slidesToScroll: number; slidesVisible: number };
  private isMobile: boolean;
  private isTablet: boolean;
  private moveCallbacks: any[];

  /**
   *
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element

    this.container = document.createElement('div');
    this.container.classList.add('carousel__container')
    this.element.setAttribute('tabindex', '0');

    this.options = {
      slidesToScroll: parseInt(this.element.getAttribute('slideToScroll'), 10) || 3,
      slidesVisible: parseInt(this.element.getAttribute('slidesVisible'), 10) || 3
    }

    this.isMobile = false;
    this.isTablet = false;

    this.loop = this.element.getAttribute('loop') === 'true'

    this.items = [].slice.call(this.element.children)

    this.currentItem = 0

    this.offset = 0

    this.moveCallbacks = []


    this.initCarousel()

    //this.initArrows()
    this.initDots()
    this.moveCallbacks.forEach(cb => cb(this.currentItem))

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()
  }

  initCarousel() {
    this.offset = this.options.slidesVisible + this.options.slidesToScroll - 1
    if (this.loop) {
      this.items = [
        ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
        ...this.items,
        ...this.items.slice(0, this.offset).map(item => item.cloneNode(true)),
      ]
      this.gotoItem(this.offset, false)

      this.container.addEventListener('transitionend', this.resetLoop.bind(this))
    }

    new TouchPlugin(this)

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

    this.element.parentElement.appendChild(container)
  }

  initDots() {
    this.element.querySelector('.carousel__pagination')?.remove()
    const pagination = document.createElement("div")
    pagination.classList.add("carousel__pagination")
    this.element.appendChild(pagination)
    const buttons = []

    for(let i = 0; i < (this.items.length - 2 * this.offset); i += this.slidesToScroll) {
      const button= document.createElement("div")
      button.classList.add("carousel__pagination-button")

      button.addEventListener('click' , () => {
        this.gotoItem(i + this.offset)
      })

      pagination.appendChild(button)
      buttons.push(button)
    }
    this.onMove(index => {
      const count = this.items.length - 2 * this.offset
      const activeButton = buttons[Math.floor(((index - this.offset) % count) / this.slidesToScroll)]
      if(activeButton) {
        buttons.forEach(button => button.classList.remove('active'))
        activeButton.classList.add('active')
      }
    })
  }

  onMove(cb) {
    this.moveCallbacks.push(cb)
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
    } else if (index >= this.items.length || (this.items[this.currentItem + this.options.slidesVisible] === undefined && index > this.currentItem)) {
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

    this.moveCallbacks.forEach(cb => cb(this.currentItem))
  }

  slideToPrev() {
    this.gotoItem(this.currentItem - this.slidesToScroll)
  }

  slideToNext() {
    this.gotoItem(this.currentItem + this.slidesToScroll)
  }

  resetLoop() {
    const fix = (this.items.length - 2 * this.offset) % 2 === 0  ? 2 : 1;
    if (this.currentItem <= this.options.slidesToScroll + fix) {
      this.gotoItem(this.currentItem + (this.items.length - 2 * this.offset), false)
    } else if (this.currentItem >= this.items.length - this.offset) {
      this.gotoItem(this.currentItem - (this.items.length - 2 * this.offset), false)
    }
  }

  onResize() {
    let mobile = window.innerWidth / 16 < getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-mobile').replace('em', '');
    let tablet = window.innerWidth / 16 < getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-tablet').replace('em', '');

    if (tablet !== this.isTablet && !this.isMobile) {
      this.isTablet = tablet
      this.isMobile = false
      this.setStyle()
    } else if (mobile !== this.isMobile) {
      this.isMobile = mobile
      this.isTablet = false
      this.setStyle()
    }
    this.initDots()
    this.moveCallbacks.forEach(cb => cb(this.currentItem))
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

  get slidesToScroll() {
    if (this.isMobile) {
      return 1
    } else if (this.isTablet) {
      return this.options.slidesToScroll === 1 ? 1 : 2
    } else {
      return this.options.slidesToScroll
    }
  }

  get slidesVisible() {
    if (this.isMobile) {
      return 1
    } else if (this.isTablet) {
      return 2
    } else {
      return this.options.slidesVisible
    }
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
