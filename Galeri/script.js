const data = [

{
img:"img/upacara.jpeg",
judul:"Upacara Bendera SDN 4 DEMUK"
},

{
img:"img/nambordewan.jpeg",
judul:"Nambor SDN 4 Demuk"
},

{
img:"img/terireogkendang.jpeg",
judul:"Pelatihan reog Kendang"
},
{
img:"img/EkstraKurikulerPramuka.jpeg",
judul:"Pelatihan Pramuka"
},
{
img:"img/MBGSDNegeriSumberbendo3.jpeg",
judul:"MBG SDNegeri 3 Sumberbendo"
}
];

const gallery=document.getElementById("gallery");

data.forEach(item=>{

gallery.innerHTML+=`

<div class="card">

<img src="${item.img}" alt="">

<div class="caption">

${item.judul}

</div>

</div>

`;

});

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll(".card").forEach(card=>{

observer.observe(card);

});

const lightbox=document.getElementById("lightbox");

const preview=document.getElementById("preview");

document.querySelectorAll(".card img").forEach(img=>{

img.onclick=()=>{

lightbox.style.display="flex";

preview.src=img.src;

}

});

document.querySelector(".close").onclick=()=>{

lightbox.style.display="none";

}

lightbox.onclick=(e)=>{

if(e.target===lightbox){

lightbox.style.display="none";

}

}
