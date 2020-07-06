var color = 'sec'
function toggleColor() {
  basak = document.getElementById('basak')
  if (color == 'sec') {
    basak.style.color = 'var(--primary-color)'
    color = 'pri'
  }
  else {
    basak.style.color = 'var(--secondary-color)'
    color = 'sec'
  }
}