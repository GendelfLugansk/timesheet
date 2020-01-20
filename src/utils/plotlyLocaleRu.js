export default function(Plotly) {
  Plotly.register({
    moduleType: "locale",
    name: "ru",
    dictionary: {
      Autoscale: "Автомасштабирование",
      "Box Select": "Прямоугольное выделение",
      "Compare data on hover": "Сравнить данные при наведении",
      "Double-click to zoom back out":
        "Двойной клик чтобы восстановить масштаб",
      "Download plot as a png": "Сохранить как png", // components/modebar/buttons.js:52
      "Edit in Chart Studio": "Редактировать в Chart Studio", // components/modebar/buttons.js:76
      "IE only supports svg.  Changing format to svg.":
        "IE поддерживает только svg. Меняем формат на svg.", // components/modebar/buttons.js:60
      "Lasso Select": "Лассо", // components/modebar/buttons.js:112
      "Orbital rotation": "Орбитальное вращение", // components/modebar/buttons.js:279
      Pan: "Режим прокрутки", // components/modebar/buttons.js:94
      "Produced with Plotly": "Сделано с Plotly", // components/modebar/modebar.js:256
      Reset: "Сброс", // components/modebar/buttons.js:431
      "Reset axes": "Изначальный масштаб", // components/modebar/buttons.js:148
      "Show closest data on hover": "Показать ближайшее значение при наведении", // components/modebar/buttons.js:157
      "Snapshot succeeded": "Изображение получено", // components/modebar/buttons.js:66
      "Sorry, there was a problem downloading your snapshot!":
        "Возникла ошибка при сохранении изображения", // components/modebar/buttons.js:69
      "Taking snapshot - this may take a few seconds":
        "Сохраняем изображение - это может занять пару секунд", // components/modebar/buttons.js:57
      "Toggle Spike Lines": "Включить/выключить направляющие", // components/modebar/buttons.js:547
      "Toggle show closest data on hover":
        "Показать ближайшее значение при наведении", // components/modebar/buttons.js:352
      Zoom: "Режим масштабирования", // components/modebar/buttons.js:85
      "Zoom in": "Увеличить", // components/modebar/buttons.js:121
      "Zoom out": "Уменьшить" // components/modebar/buttons.js:130
    },
    format: {
      days: [
        "воскресенье",
        "понедельник",
        "вторник",
        "среда",
        "четверг",
        "пятница",
        "суббота"
      ],
      shortDays: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
      months: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь"
      ],
      shortMonths: [
        "Янв",
        "Фев",
        "Мар",
        "Апр",
        "Май",
        "Июн",
        "Июл",
        "Авг",
        "Сен",
        "Окт",
        "Ноя",
        "Дек"
      ],
      date: "%d.%m.%Y"
    }
  });
}
