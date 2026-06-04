// PATCH: Full Month Header for June
// Replace your existing month/day header logic with this

const monthHeaders = useMemo(() => {
  const months = [];
  const startDate = new Date(`${projectStart}T00:00:00`);

  for (let i = 0; i < 6; i++) {
    const current = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);

    const daysInMonth = new Date(
      current.getFullYear(),
      current.getMonth() + 1,
      0
    ).getDate();

    months.push({
      label: `${SCHEDULE_MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`,
      days: daysInMonth,
      left:
        months.reduce((sum, month) => sum + month.days, 0) * DAY_WIDTH,
      width: daysInMonth * DAY_WIDTH,
      startDay: 1,
    });
  }

  return months;
}, [projectStart]);

const dayHeaders = useMemo(() => {
  const days = [];
  const startDate = new Date(`${projectStart}T00:00:00`);

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const current = new Date(startDate);
    current.setDate(current.getDate() + i);

    days.push({
      day: current.getDate(),
      left: i * DAY_WIDTH,
      width: DAY_WIDTH,
    });
  }

  return days;
}, [projectStart]);

// TODAY LINE FULL HEIGHT

{todayOffset >= 0 && todayOffset <= TOTAL_DAYS && (
  <div
    className="absolute top-0 z-50 border-l-4 border-red-600 animate-pulse"
    style={{
      left: todayOffset * DAY_WIDTH,
      height: chartHeight,
    }}
  >
    <div className="-ml-14 -mt-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg">
      Today {formatThaiDate(todayKey)}
    </div>
  </div>
)}

// COMMENT AFTER TASK END DATE

{task.note && (
  <div
    className="absolute z-10 rounded-xl border border-lime-500 bg-white px-3 py-1 text-xs font-black text-red-600 shadow-sm"
    style={{
      left: Math.min(chartWidth - 220, left + width + 80),
      top: top - 3,
      maxWidth: 220,
    }}
  >
    {task.note}
  </div>
)}
