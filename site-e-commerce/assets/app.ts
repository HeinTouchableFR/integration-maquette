import "/styles/app.scss";

import { registerSlider } from "/modules/Slider";
import { registerCarousel } from "/modules/Carousel";
import {Products} from "/modules/Products";


registerSlider();
registerCarousel();

const products = new Products();
products.buildCard("categories")
products.buildCard("products")
