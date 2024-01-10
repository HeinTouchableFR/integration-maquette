export class TouchPlugin {
  private item: any;
  private origin: { x: any; y: any } | null;
  private lastTranslate: { x: any; y: any } | null;
  private width: number;


  /**
   *
   * @param {Carousel} item
   */
  constructor(item) {
    this.item = item
    this.item.container.addEventListener('dragstart', e => e.preventDefault())
    item.container.addEventListener('mousedown', this.startDrag.bind(this))
    item.container.addEventListener('touchstart', this.startDrag.bind(this))
    window.addEventListener('mousemove', this.drag.bind(this))
    window.addEventListener('touchmove', this.drag.bind(this))
    window.addEventListener('touchend', this.endDrag.bind(this))
    window.addEventListener('mouseup', this.endDrag.bind(this))
    window.addEventListener('touchcancel', this.endDrag.bind(this))
  }

  /**
   *
   * @param {MouseEvent | TouchEvent} e
   */
  startDrag(e) {
    if(e.touches) {
      if (e.touches.length > 1) {
        return;
      } else {
        e = e.touches[0]
      }

    }

    this.origin = {x: e.screenX, y: e.screenY}
    this.width = this.item.containerWidth
    this.item.disableTransition()
  }

  /**
   *
   * @param {MouseEvent | TouchEvent} e
   */
  drag(e) {
    if(this.origin) {
      let point = e.touches ? e.touches[0] : e
      let translate = {x: point.screenX - this.origin.x, y: point.screenY - this.origin.y}
      if(e.touches && Math.abs(translate.x) > Math.abs(translate.y)) {
        e.preventDefault()
        e.stopPropagation()
      }
      let baseTranslate = this.item.currentItem * -100 / this.item.items.length
      this.lastTranslate = translate
      this.item.translate(baseTranslate + 100 * translate.x / this.width)
    }
  }

  /**
   *
   * @param {MouseEvent | TouchEvent} e
   */
  endDrag(e) {
    if(this.origin && this.lastTranslate) {
      this.item.enableTransition()

      if(Math.abs(this.lastTranslate.x / this.item.carouselWidth) > 0.1) {
        if(this.lastTranslate.x < 0) {
          this.item.slideToNext()
        } else {
          this.item.slideToPrev()
        }
      } else {
        this.item.gotoItem(this.item.currentItem)
      }
    }
    this.origin = null
  }
}
