import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor(productId) {
    this.productId = productId;
  }

  async getCategories() {
    const categoriesUrl = new URL('api/rest/categories', BACKEND_URL);
    categoriesUrl.searchParams.set('_sort', 'weight');
    categoriesUrl.searchParams.set('_refs', 'subcategory');
    this.categories = await fetchJson(categoriesUrl);
  }

  async loadData() {
    if (this.productId) {
      const productUrl = new URL('api/rest/products', BACKEND_URL);
      productUrl.searchParams.set('id', this.productId);
      const products = await fetchJson(productUrl);
      this.formData = products[0];
    } else {
      this.formData = this.defaultFormData;
    }
  }

  setFormData () {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      element.value = this.formData[item] || this.defaultFormData[item];
    });

    if (this.formData['images']) {
      const imageElements = this.formData['images'].map(({url, source}) => this.getUploadedImageTemplate({url, source}));
      this.subElements.imageListContainer.firstElementChild.innerHTML = imageElements.join('');
    }
  }

  async render() {
    await Promise.all([this.getCategories(), this.loadData()]);

    const element = document.createElement('div');
    element.innerHTML = this.template();
    this.element = element.firstElementChild;

    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(elt => this.subElements[elt.dataset.element] = elt);

    this.subElements.productForm.elements.subcategory.append(...this.getSubCategories());
    this.setFormData();
    this.addEventListeners();

    return this.element;
  }

  addEventListeners() {
    this.subElements.productForm.elements.uploadImage.addEventListener('click', this.uploadImage.bind(this));
    this.subElements.productForm.elements.save.addEventListener('click', (event) => {
      event.preventDefault();
      this.save();
    });
  }

  async uploadImage() {

    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";

    imageInput.onchange = async () => {

      let result;

      const [file] = imageInput.files;

      const formData = new FormData();
      formData.append('image', file);
      try {
        result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        });
      } catch (err) {
        throw err;
      } finally {
        imageInput.remove();
      }

      this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend',
        this.getUploadedImageTemplate({
          url: result.data.link,
          source: file.name
        }));
    };
    imageInput.hidden = true;
    document.body.appendChild(imageInput);
    imageInput.click();
  }

  template() {
    return `<div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
            <ul class="sortable-list">
              <!-- Image template here -->
            </ul>
          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory" id="subcategory">
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>`;
  }

  getSubCategories() {
    const options = [];
    this.categories.forEach(({title: categoryTitle, subcategories}) => {
      subcategories.forEach(({id, title}) => {
        const option = new Option(categoryTitle + ' > ' + title, id);
        options.push(option);
      });
    });
    return options;
  }

  getUploadedImageTemplate({url, source}) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${url}">
      <input type="hidden" name="source" value="${source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${url}">
        <span>${source}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>`;
  }

  async save() {
    const {title, description, subcategory, price, quantity, discount, status} = this.subElements.productForm.elements;
    const formData = {
      id: this.productId,
      title: title.value,
      description: description.value,
      subcategory: subcategory.value,
      price: parseInt(price.value, 10),
      quantity: parseInt(quantity.value, 10),
      discount: parseInt(discount.value, 10),
      status: parseInt(status.value, 10),
      images: []
    };
    formData.images = [...this.subElements.imageListContainer.firstElementChild.querySelectorAll('.products-edit__imagelist-item')]
      .map(elt => {
        const url = elt.querySelector('input[name="url"]').value;
        const source = elt.querySelector('input[name="source"]').value;
        return {url, source};
      });

    const newProductId = await fetchJson("https://course-js.javascript.ru/api/rest/products", {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
    const customEvent = this.productId ?
      new CustomEvent("product-updated", {detail: newProductId}) : new CustomEvent("product-saved");
    this.element.dispatchEvent(customEvent)
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}