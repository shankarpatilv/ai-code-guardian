// XSS vulnerability samples
function displayUserContent(userInput) {
  document.getElementById('content').innerHTML = userInput;
}

function writeToPage(data) {
  document.write("<h1>" + data + "</h1>");
}

// Template literal XSS
function renderTemplate(name) {
  return `<div>Hello ${name}</div>`;
}

// jQuery XSS
function updateElement(content) {
  $('#target').html(content);
}

// eval usage
function executeCode(code) {
  eval(code);
}