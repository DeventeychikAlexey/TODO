export class Todo {
  constructor(selector) {
    this.$el = document.querySelector(`${selector}`);
    this.selector = selector;

    this.#setupStorage();
    this.#renderAll();

    this.#setup();
    this.#renderList(this.list);
  }

  #renderAll() {
    this.$el.classList.add("todo");
    this.$el.innerHTML = `
    <div class="todo__head">
            <input type="text" data-type="title" value="${this.$title}" />
            <button class="btn btn-danger" data-type="destroy">✖</button>
          </div>
          <div class="todo__body todo-body">
            <div class="todo-body__sorting">
              <button class="btn btn-secondary" data-sort data-type="checked">Выполненные</button>
              <button class="btn btn-secondary" data-sort data-type="notChecked">Не выполненные</button>
              <button class="btn btn-info" data-sort data-type="all">Все</button>
            </div>
            <div class="todo-body__input input-group" >
              <input data-type="input"
                type="text"
                class="form-control"
                placeholder="Новый элемент"
              />
              <button class="btn btn-success" data-type="add">
                <i data-type="add-i" class="fas fa-plus"></i>
              </button>
            </div>
            <ul class="list-group list-group-flush todo-body__list" data-list> </ul>
            <div class="todo-body__buttons">
              <button class="btn btn-success"  data-type="save">Сохранить изменения</button>
              <button class="btn btn-danger" data-type="clear">Очистить список</button>
            </div>
          </div>`;
  }

  #renderList(list) {
    let count = 1;
    this.$list.innerHTML =
      list
        .map((el) => {
          el.id = count;
          return `
  <li class="list-group-item todo-body__item ${
    el.checked ? "checked" : ""
  }" data-type="item" data-id="${count}"">
  
  <label for="check${count}"
    ><span>${count}. </span>${el.title}</label
  >
  <button id="check${count++}" class="btn btn-success" data-type="check">
    <i class="fas fa-check" data-type="check-i"></i>
  </button>
  <button class="btn btn-danger" data-type="remove">
    <i class="fas fa-trash-alt" data-type="remove-i"></i>
  </button>
</li>`;
        })
        .join("") || "<p class='empty'>Список пуст</p>";
  }

  #setupStorage() {
    this.list = window.localStorage.getItem(`${this.selector}-list`)
      ? JSON.parse(window.localStorage.getItem(`${this.selector}-list`))
      : [];
    this.$title = window.localStorage.getItem(`${this.selector}-title`)
      ? JSON.parse(window.localStorage.getItem(`${this.selector}-title`))
      : "Todo List";
  }

  #setup() {
    this.$list = this.$el.querySelector(`[data-list]`);
    this.$input = this.$el.querySelector(`[data-type="input"]`);
    this.$add = this.$el.querySelector('[data-type="add"]');
    this.$title = this.$el.querySelector('[data-type="title"]');
    this.$sortButtons = this.$el.querySelectorAll("[data-sort]");

    this.clickHandlers = this.clickHandlers.bind(this);
    this.$el.addEventListener("click", this.clickHandlers);

    this.keyHandlers = this.keyHandlers.bind(this);
    this.$el.addEventListener("keypress", this.keyHandlers);
  }

  add(text) {
    if (text) {
      this.list.push({
        title: text,
        checked: false,
      });
      this.$input.value = "";
    }
  }

  toggleChecked(id) {
    for (let i = 0; i < this.list.length; ++i) {
      if (this.list[i].id === id) {
        this.list[i].checked = !this.list[i].checked;
        break;
      }
    }
  }

  clickHandlers(event) {
    const { type } = event.target.dataset;

    function toggleActiveBtn() {
      this.$sortButtons.forEach((el) => {
        el.classList.remove("btn-info");
        el.classList.add("btn-secondary");
      });
      event.target.classList.add("btn-info");
      event.target.classList.remove("btn-secondary");
    }

    toggleActiveBtn = toggleActiveBtn.bind(this);

    if (type === "add" || type === "add-i") {
      this.add(this.$input.value);
      this.#renderList(this.list);
    } else if (type === "remove" || type === "remove-i") {
      const item = event.target.closest(".list-group-item");
      this.removeItem(+item.dataset.id);
      this.#renderList(this.list);
    } else if (type === "clear") {
      this.clearAll();
      this.#renderList(this.list);
    } else if (type === "checked") {
      toggleActiveBtn();
      const newList = this.list.filter((el) => el.checked === true);
      this.#renderList(newList);
    } else if (type === "notChecked") {
      toggleActiveBtn();
      const newList = this.list.filter((el) => el.checked === false);
      this.#renderList(newList);
    } else if (type === "all") {
      toggleActiveBtn();
      this.#renderList(this.list);
    } else if (type === "check" || type === "check-i") {
      const item = event.target.closest(".list-group-item");
      this.toggleChecked(+item.dataset.id);
      this.#renderList(this.list);
    } else if (type === "save") {
      this.saveAll();
    } else if (type === "destroy") {
      this.destroy();
    }
  }

  keyHandlers(event) {
    const { type } = event.target.dataset;

    if (type === "input") {
      if (event.key === "Enter") {
        this.add(this.$input.value);
        this.#renderList(this.list);
      }
    }
  }

  clearAll() {
    this.list = [];
  }

  removeItem(id) {
    this.list = this.list.filter((el) => el.id != id);
  }

  saveAll() {
    window.localStorage.setItem(
      `${this.selector}-list`,
      JSON.stringify(this.list)
    );

    window.localStorage.setItem(
      `${this.selector}-title`,
      JSON.stringify(this.$title.value)
    );
  }

  destroy() {
    this.$el.removeEventListener("click", this.clickHandlers);
    this.$el.removeEventListener("keypress", this.keyHandlers);
    this.$el.parentNode.removeChild(this.$el);
    window.localStorage.removeItem(`${this.selector}-list`);
    window.localStorage.removeItem(`${this.selector}-title`);
  }
}
