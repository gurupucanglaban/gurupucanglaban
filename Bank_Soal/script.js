/*=========================================
  DATA MATA PELAJARAN
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
  CONTOH DATA FILE
  (Silakan tambah sendiri nanti)
=========================================*/

const dataFile = {

    "Pendidikan Agama":[
        "Bab 1",
        "Bab 2",
        "Bab 3",
        "Sumatif"
    ],

    "Pendidikan Pancasila":[
        "Bab 1",
        "Bab 2",
        "Bab 3"
    ],

    "Bahasa Indonesia":[
        "Bab 1",
        "Bab 2",
        "Bab 3",
        "Bab 4",
        "Sumatif"
    ],

    "Matematika":[
        "Bilangan",
        "Pecahan",
        "Bangun Datar",
        "Bangun Ruang",
        "Sumatif"
    ],

    "IPAS":[
        "Bab 1",
        "Bab 2",
        "Bab 3"
    ],

    "Seni Musik":[
        "Bab 1",
        "Bab 2"
    ],

    "Seni Rupa":[
        "Bab 1",
        "Bab 2"
    ],

    "PJOK":[
        "Bab 1",
        "Bab 2"
    ],

    "Bahasa Inggris":[
        "Unit 1",
        "Unit 2",
        "Unit 3"
    ]

};


/*=========================================
  MEMBUAT FOLDER KELAS
=========================================*/

document.querySelectorAll(".folder").forEach((item,index)=>{

    item.addEventListener("click",()=>{

        bukaKelas(index+1);

    });

});


/*=========================================
  HALAMAN KELAS
=========================================*/

function bukaKelas(kelas){

let html=`

<h2>📁 Bank Soal SD Kelas ${kelas}</h2>

<button onclick="kembali()" class="btn download">
← Kembali
</button>

<br><br>

<div class="folder-grid">

<div class="folder"
onclick="bukaSemester(${kelas},1)">

<div class="folder-icon">📂</div>

<h3>Semester 1</h3>

<p>Bank Soal, PTS dan PAS</p>

</div>

<div class="folder"
onclick="bukaSemester(${kelas},2)">

<div class="folder-icon">📂</div>

<h3>Semester 2</h3>

<p>Bank Soal, PTS dan PAS</p>

</div>

</div>

`;

document.querySelector(".container").innerHTML=html;

}


/*=========================================
  HALAMAN SEMESTER
=========================================*/

function bukaSemester(kelas,semester){

let html=`

<h2>

📂 SD Kelas ${kelas}<br>

Semester ${semester}

</h2>

<button
onclick="bukaKelas(${kelas})"
class="btn download">

← Kembali

</button>

<br><br>

<div class="folder-grid">

<div class="folder"

onclick="bukaKategori(${kelas},${semester},'bank_soal','Bank Soal')">

<div class="folder-icon">📚</div>

<h3>Bank Soal</h3>

</div>

<div class="folder"

onclick="bukaKategori(${kelas},${semester},'pts','Penilaian Tengah Semester ${semester}')">

<div class="folder-icon">📝</div>

<h3>PTS Semester ${semester}</h3>

</div>

`;

if(semester==1){

html+=`

<div class="folder"

onclick="bukaKategori(${kelas},1,'pas','Penilaian Akhir Semester')">

<div class="folder-icon">📄</div>

<h3>Penilaian Akhir Semester</h3>

</div>

`;

}else{

html+=`

<div class="folder"

onclick="bukaKategori(${kelas},2,'PAS','Penilaian Akhir Semester')">

<div class="folder-icon">📄</div>

<h3>Penilaian Akhir Semester</h3>

</div>

`;

}

html+=`

</div>

`;

document.querySelector(".container").innerHTML=html;

}


/*=========================================
  DAFTAR MATA PELAJARAN
=========================================*/

function bukaKategori(kelas,semester,folder,namaFolder){

let html=`

<h2>

📂 ${namaFolder}

</h2>

<button
onclick="bukaSemester(${kelas},${semester})"
class="btn download">

← Kembali

</button>

<br><br>

<div class="folder-grid">

`;

mataPelajaran.forEach(function(mapel){

html+=`

<div class="folder"

onclick="bukaMapel(${kelas},${semester},'${folder}','${mapel}')">

<div class="folder-icon">📘</div>

<h3>${mapel}</h3>

<p>Buka Folder</p>

</div>

`;

});

html+=`

</div>

`;

document.querySelector(".container").innerHTML=html;

}


/*=========================================
  DAFTAR FILE MATA PELAJARAN
=========================================*/

function bukaMapel(kelas,semester,folder,mapel){

let html=`

<h2>

📘 ${mapel}

</h2>

<button
onclick="bukaKategori(${kelas},${semester},'${folder}','${folder.replace('_',' ').toUpperCase()}')"
class="btn download">

← Kembali

</button>

<br><br>

`;

const daftar=dataFile[mapel] || [];

daftar.forEach(function(file){

const namaFile=file+".pdf";

html+=`

<div class="file">

<div class="file-name">

📄 ${file}

</div>

<div class="file-action">

<a

href="bank_soal/kelas${kelas}/semester${semester}/${folder}/${mapel}/${namaFile}"

target="_blank"

class="btn view">

👁 Lihat

</a>

<a

href="bank_soal/kelas${kelas}/semester${semester}/${folder}/${mapel}/${namaFile}"

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