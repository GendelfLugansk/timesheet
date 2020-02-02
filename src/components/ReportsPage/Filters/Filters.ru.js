const ru = {
  filters: {
    project: {
      title: "Проект: {{selectedQty}}",
      anySelected: "Любой",
      emptyValue: "<Не указан>"
    },
    tags: {
      title: "Теги: {{selectedQty}}",
      anySelected: "Любые"
    },
    startTimeString: {
      title: "Дата и время начала: {{filterValues}}",
      anySelected: "Любое",
      formLabels: {
        from: "С (\u2265, в формате ISO 8601)",
        to: "По (\u2264, в формате ISO 8601)"
      }
    },
    endTimeString: {
      title: "Дата и время окончания: {{filterValues}}",
      anySelected: "Любое",
      formLabels: {
        from: "С (\u2265, в формате ISO 8601)",
        to: "По (\u2264, в формате ISO 8601)"
      }
    }
  }
};

export default ru;
