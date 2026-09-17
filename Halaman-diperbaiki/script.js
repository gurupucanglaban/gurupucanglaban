// =========================
// Efek muncul tombol
// =========================

window.addEventListener("load",()=>{

    const btn=document.querySelector(".btn-home");

    btn.style.opacity="0";
    btn.style.transform="translateY(-20px)";

    setTimeout(()=>{

        btn.style.transition=".6s";
        btn.style.opacity="1";
        btn.style.transform="translateY(0)";

    },200);

});