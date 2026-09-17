// Back To Top

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

if(window.scrollY > 400){

topBtn.style.display = "block";

}else{

topBtn.style.display = "none";

}

});

topBtn.onclick = () => {

window.scrollTo({

top:0,

behavior:"smooth"

});

};

// Smooth Scroll

document.querySelectorAll('.sidebar a').forEach(link=>{

link.addEventListener("click",function(e){

e.preventDefault();

document.querySelector(this.getAttribute("href")).scrollIntoView({

behavior:"smooth"

});

});

});

// Share Link

document.querySelectorAll(".share button")[3].onclick=function(){

navigator.clipboard.writeText(window.location.href);

alert("Link berhasil disalin");

}