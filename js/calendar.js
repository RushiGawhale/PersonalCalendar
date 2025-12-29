let selectedDate = null;
let editingEvent = null;

function populateTimeDropdowns() {
  const from = document.getElementById("eventFrom");
  const to = document.getElementById("eventTo");

  from.innerHTML = "";
  to.innerHTML = "";

  for (let h = 0; h < 24; h++) {
    for (let m of ["00", "30"]) {
      const value = `${String(h).padStart(2, "0")}:${m}`;

      const option1 = new Option(value, value);
      const option2 = new Option(value, value);

      from.add(option1);
      to.add(option2);
    }
  }

  from.value = "10:00";
  to.value = "11:00";
}

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const modal = document.getElementById("eventModal");

  const titleInput = document.getElementById("eventTitle");
  const fromInput = document.getElementById("eventFrom");
  const toSelect = document.getElementById("eventTo");

  populateTimeDropdowns();
  // Build time dropdown
  for (let h = 0; h < 24; h++) {
    for (let m of ["00", "30"]) {
      let t = `${String(h).padStart(2, "0")}:${m}`;
      let opt = document.createElement("option");
      opt.value = t;
      opt.text = t;
      toSelect.appendChild(opt);
    }
  }

  let savedEvents = JSON.parse(
    localStorage.getItem("myCalendarEvents") || "[]"
  );

  const colors = ["#1e40af", "#7c2d12", "#166534", "#7e22ce", "#9f1239"];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "",
    },

    events: savedEvents,

    datesSet(info) {
      const month = info.start.getMonth() + 1;
      calendarEl.className = calendarEl.className.replace(/fc-month-\d+/g, "");
      calendarEl.classList.add("fc-month-" + month);
    },

    dateClick(info) {
      selectedDate = info.dateStr;
      titleInput.value = "";
      fromInput.value = "10:00";
      document.getElementById("eventModal").style.display = "flex";
      document.getElementById("deleteBtn").style.display = "none";
    },

    eventClick(info) {
      editingEvent = info.event;

      document.getElementById("eventTitle").value = info.event.title;

      const start = info.event.start;
      const end = info.event.end;

      document.getElementById("eventFrom").value = start
        .toTimeString()
        .slice(0, 5);

      document.getElementById("eventTo").value = end
        ? end.toTimeString().slice(0, 5)
        : "00:30";

      selectedDate = start.toISOString().split("T")[0];

      document.getElementById("eventModal").style.display = "flex";
      document.getElementById("deleteBtn").style.display = "inline-block";
    },
  });

  calendar.render();

  window.saveEvent = function () {
    const title = document.getElementById("eventTitle").value;
    const from = document.getElementById("eventFrom").value;
    const to = document.getElementById("eventTo").value;

    if (!title || !from || !to) return;

    if (editingEvent) {
      // EDIT existing event
      editingEvent.setProp("title", title);
      editingEvent.setStart(`${selectedDate}T${from}`);
      editingEvent.setEnd(`${selectedDate}T${to}`);
      editingEvent = null;
    } else {
      // ADD new event
      const newEvent = {
        title,
        start: `${selectedDate}T${from}`,
        end: `${selectedDate}T${to}`,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      calendar.addEvent(newEvent);
      savedEvents.push(newEvent);
    }

    localStorage.setItem("myCalendarEvents", JSON.stringify(savedEvents));
    closeModal();
  };

  window.deleteEvent = function () {
    if (!editingEvent) return;

    if (confirm("Delete this Event?")) {
      editingEvent.remove();
      editingEvent = null;

      localStorage.setItem(
        "myCalenderEvents",
        JSON.stringify(
          calendar.getEvents().map((e) => ({
            title: e.title,
            start: e.start,
            end: e.end,
            color: e.backgroundColor,
          }))
        )
      );
    }
    closeModal();
  };

  window.closeModal = function () {
    editingEvent = null;
    document.getElementById("eventModal").style.display = "none";
  };
});
