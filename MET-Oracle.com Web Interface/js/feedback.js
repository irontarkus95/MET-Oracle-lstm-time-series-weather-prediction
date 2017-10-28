// CODE BELOW IS FROM W3SCHOOLS

var form =  document.getElementById("form");

function openNav() { // Sets the width of the sidenav to 400px so that the css transition can occur
    document.getElementById("mySidenav").style.width = "400px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
   	form.classList.add("opened"); // Adds fading transition
}

function closeNav() { // Hides the sidenav
    document.getElementById("mySidenav").style.width = "0";
    document.body.style.backgroundColor = "white";
    form.classList.remove("opened"); // Removes fading transition
}