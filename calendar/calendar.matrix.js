function getMatrix(y = new Date().getFullYear(), m = new Date().getMonth()) {
  const [rows, cols] = [[...Array(6).keys()], [...Array(7).keys()]];
  const matrix = [];
  const date = new Date(y, m);
  const numDays = new Date(y, m + 1, 0).getDate();
  let dayNum;
  rows.forEach(row => {
    const week = [];
    cols.forEach(col => {
      if (row == 0) {
        dayNum = col - date.getDay() + 1;
        week.push(col < date.getDay() ? -new Date(y, m, -(date.getDay() - 1 - col)).getDate() : dayNum);
      } else {
        dayNum = matrix[matrix.length - 1][6] + col + 1;
        week.push(dayNum <= numDays ? dayNum : -(dayNum - numDays));
      }
    });
    if (!row || week[0] > 1) matrix.push(week);
  });
  return matrix;
}
function matrix(year = new Date().getFullYear(), month = new Date().getMonth(), weekStartsOn = 0) {
  // startOfWeek
  const startDate = new Date(year, month, 1);
  const day = startDate.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  startDate.setDate(startDate.getDate() - diff);
  startDate.setHours(0, 0, 0, 0);
  const [rows, cols] = [6, 7];
  const length = rows * cols;
  return (
    Array.from({ length })
      // create a list of dates
      .map((_, index) => {
        const d = new Date(startDate);
        return new Date(d.setDate(d.getDate() + index)).getDate();
      })
      // fold the array into a matrix
      .reduce((matrix, current, index, days) => !(index % cols !== 0) ? [...matrix, days.slice(index, index + cols)] : matrix, [])
  );
}
