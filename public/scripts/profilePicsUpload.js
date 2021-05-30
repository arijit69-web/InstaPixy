var loadFile = function(event) {
    var output = document.getElementById('profilePics');
    output.src = URL.createObjectURL(event.target.files[0]);
    
  };
