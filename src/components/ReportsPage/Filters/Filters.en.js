const en = {
  syncError: "Synchronization with Google spreadsheet failed, error: {{error}}",
  syncRetryButton: "Retry",
  filters: {
    project: {
      title: "Project: {{selectedQty}}",
      anySelected: "Any",
      emptyValue: "<Not specified>"
    },
    tags: {
      title: "Tags: {{selectedQty}}",
      anySelected: "Any"
    },
    startTimeString: {
      title: "Started At: {{filterValues}}",
      anySelected: "Any",
      formLabels: {
        from: "From (\u2265, ISO 8601 format)",
        to: "To (\u2264, ISO 8601 format)"
      }
    },
    endTimeString: {
      title: "Finished At: {{filterValues}}",
      anySelected: "Any",
      formLabels: {
        from: "From (\u2265, ISO 8601 format)",
        to: "To (\u2264, ISO 8601 format)"
      }
    }
  }
};

export default en;
