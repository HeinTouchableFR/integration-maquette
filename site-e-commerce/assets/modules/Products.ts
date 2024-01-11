export class Products {

  constructor() {
  }


  buildCard(className: string) {
    const items = document.querySelectorAll(`.${className}__items > *`)

    items.forEach((item) => {
      const baseClass = item.classList;

      const href = item.getAttribute('data-url');
      const container = this.createElement('a', `${item.classList}`)
      container.setAttribute('href', href);

      const src = item.getAttribute('data-image');
      const image = this.createElement('img', `${item.classList}-img`)
      image.setAttribute('src', src);
      container.appendChild(image)


      const infos = this.createElement('div', `${item.classList}-infos`)

      const infosContainer = this.createElement('div', null)

      const label = item.getAttribute('data-label');
      const title = this.createElement('h2', `${item.classList}-infos-title`)
      title.innerText = label;
      infosContainer.appendChild(title)

      const subLabel = item.getAttribute('data-sub-label');
      const subTitle = this.createElement('h4', `${item.classList}-infos-sub-title`)
      subTitle.innerText = subLabel;
      infosContainer.appendChild(subTitle)

      infos.appendChild(infosContainer)

      const price = item.getAttribute('data-price');
      if(price) {
        const pricing = this.createElement('span', `${item.classList}-infos-price`)
        pricing.innerText = `$${price}`;
        infos.appendChild(pricing)
      } else {
        const arrow = this.createElement('span', `${item.classList}-infos-arrow`)
        infos.appendChild(arrow)
      }

      container.appendChild(infos)

      item.replaceWith(container)
    })
  }

  createElement(element: string, className: string|null) {
    const root = document.createElement(element)
    if (className) {
      root.classList.add(className)
    }

    return root
  }
}
