window.addEventListener("load", function () {
  var url = '/doorbell';
  var form = document.getElementById('form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var xhr = new XMLHttpRequest();
    var fd  = new FormData(form);
    
    fd.append('redirect', 'false');

    xhr.onload = function() {
      form.reset();
    };

    xhr.open('POST', url);
    xhr.send(fd);
  });
});
