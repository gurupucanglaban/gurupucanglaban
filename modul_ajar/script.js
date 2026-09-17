/*=========================================
  DATA MODUL AJAR
=========================================*/

const mataPelajaran = [
    "Pendidikan Agama",
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Matematika",
    "IPAS",
    "Seni Musik",
    "Seni Rupa",
    "PJOK",
    "Bahasa Inggris"
];


/*=========================================
  MEMBUAT FOLDER KELAS
=========================================*/

const folder = document.querySelectorAll(".folder");

folder.forEach((item,index)=>{

    item.addEventListener("click",function(){

        bukaKelas(index+1);

    });

});


/*=========================================
  MEMBUAT HALAMAN KELAS
=========================================*/

function bukaKelas(kelas){

let html=`

<h2>📁 SD Kelas ${kelas}</h2>

<button onclick="kembali()" class="btn download">
← Kembali
</button>

<br><br>

<div class="folder-grid">

<div class="folder semester" onclick="bukaSemester(${kelas},1)">

<div class="folder-icon">📂</div>

<h3>Semester 1</h3>

</div>

<div class="folder semester" onclick="bukaSemester(${kelas},2)">

<div class="folder-icon">📂</div>

<h3>Semester 2</h3>

</div>

</div>

`;

document.querySelector(".container").innerHTML=html;

}


/*=========================================
  MEMBUAT ISI SEMESTER
=========================================*/

function bukaSemester(kelas,semester){

let html=`

<h2>
📂 SD Kelas ${kelas} - Semester ${semester}
</h2>

<button onclick="bukaKelas(${kelas})"
class="btn download">

← Kembali

</button>

<br><br>

`;

mataPelajaran.forEach(function(mapel){

html+=`

<div class="file">

<div class="file-name">

📄 ${mapel}

</div>

<div class="file-action">

<a href="modul/kelas${kelas}/semester${semester}/${mapel}.pdf"

target="_blank"

class="btn view">

👁 Lihat

</a>

<a href="modul/kelas${kelas}/semester${semester}/${mapel}.pdf"

download

class="btn download">

⬇ Download

</a>

</div>

</div>

`;

});

document.querySelector(".container").innerHTML=html;

}


/*=========================================
  KEMBALI KE BERANDA
=========================================*/

function kembali(){

location.reload();

}