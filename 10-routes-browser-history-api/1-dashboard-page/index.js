import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  subElements = {};

  constructor() {
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    let dateRange = {
      from: oneMonthAgo,
      to: new Date(),
    };

    this.rangePickerComponent = new RangePicker(dateRange);
    this.subElements.rangePicker = this.rangePickerComponent.element;
    this.element.querySelector('.content__top-panel').append(this.subElements.rangePicker);
    this.subElements.rangePicker.addEventListener("date-select", (event) => this.onDateRangeChange(event));

    this.ordersChartComponent = new ColumnChart({
      label: "Заказы",
      link: "/sales",
      url: "/api/dashboard/orders",
      range: dateRange
    });
    this.subElements.ordersChart = this.ordersChartComponent.element;
    this.subElements.ordersChart.classList.add('dashboard__chart_orders');

    this.salesChartComponent = new ColumnChart({
      label: "Продажи",
      url: "/api/dashboard/sales",
      range: dateRange,
    });
    this.subElements.salesChart = this.salesChartComponent.element;
    this.subElements.salesChart.classList.add('dashboard__chart_sales');

    this.customersChartComponent = new ColumnChart({
      label: "Клиенты",
      url: "/api/dashboard/customers",
      range: dateRange,
    });
    this.subElements.customersChart = this.customersChartComponent.element;
    this.subElements.customersChart.classList.add('dashboard__chart_customers');

    const chartsSection = this.element.querySelector('.dashboard__charts');
    chartsSection.append(this.subElements.ordersChart);
    chartsSection.append(this.subElements.salesChart);
    chartsSection.append(this.subElements.customersChart);

    const headers = [
      {
        id: 'images',
        title: 'Фото',
        sortable: false,
        template: (data = []) => {
          return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
          </div>
        `;
        }
      },
      {
        id: 'title',
        title: 'Название',
        sortable: true,
        sortType: 'string'
      },
      {
        id: 'subcategory',
        title: 'Категория',
        sortable: false,
        template: (data = []) => {
          return `<div class="sortable-table__cell">${data.title}</div>`;
        }
      },
      {
        id: 'quantity',
        title: 'Количество',
        sortable: true,
        sortType: 'number'
      },
      {
        id: 'price',
        title: 'Цена',
        sortable: true,
        sortType: 'number'
      },
    ];

    this.sortableTableComponent = new SortableTable(headers,
      {
        url: `/api/dashboard/bestsellers?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`,
        sorted: {
          id: 'title',
          order: 'asc'
        }
      });
    this.subElements.sortableTable = this.sortableTableComponent.element;
    this.element.append(this.subElements.sortableTable);

    return this.element;
  }

  getTemplate() {
    return `<div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
      </div>
      <div class="dashboard__charts"></div>
      <h3 class="block-title">Лидеры продаж</h3>
    </div>`;
  }

  onDateRangeChange(event) {
    let {from, to} = event.detail;
    this.ordersChartComponent.loadData(from, to);
    this.salesChartComponent.loadData(from, to);
    this.customersChartComponent.loadData(from, to);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.rangePickerComponent.destroy();
    this.ordersChartComponent.destroy();
    this.salesChartComponent.destroy();
    this.customersChartComponent.destroy();
    this.sortableTableComponent.destroy();
    this.remove();
  }

}