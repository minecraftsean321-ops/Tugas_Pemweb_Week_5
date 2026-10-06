// Buat array of object untuk daftar tugasnya
let daftarTugas = [];
// Variabel untuk melacak filter yang sedang dipilih
let filterAktif = 'semua';

const formTugas = document.getElementById('formTugas');
const judulTugas = document.getElementById('judul');
const inputMatkul = document.getElementById('matkul');
const inputDeadline = document.getElementById('deadline');
const errorHandler = document.getElementById('pesanError');
const listTugas = document.getElementById('listTugas');

//Buat variabel untuk tombol filter
const btnSemua = document.getElementById('btnSemua');
const btnAktif = document.getElementById('btnAktif');
const btnSelesai = document.getElementById('btnSelesai');
const counterTugas = document.getElementById('counterTugas');

//fungsi untuk menyimpan ke localStorage
function simpanData() {
    localStorage.setItem('dataTugas', JSON.stringify(daftarTugas));
}

// Fungsi untuk mengatur filter dan class 'on' pada tombol[cite: 5]
function setFilter(jenisFilter) {
    filterAktif = jenisFilter;

    // Hapus class 'on' dari semua tombol[cite: 5]
    btnSemua.classList.remove('on');
    btnAktif.classList.remove('on');
    btnSelesai.classList.remove('on');

    // Tambahkan class 'on' ke tombol yang sedang diklik[cite: 5]
    if (jenisFilter === 'semua') btnSemua.classList.add('on');
    if (jenisFilter === 'aktif') btnAktif.classList.add('on');
    if (jenisFilter === 'selesai') btnSelesai.classList.add('on');

    render();
}

// 02. Tampilan dibangun oleh satu fungsi render()
function render() {
    // Kosongkan container terlebih dahulu sebelum dirender ulang
    listTugas.innerHTML = '';

    // 1. Hitung tugas yang status selesai = false
    const jumlahAktif = daftarTugas.filter(tugas => tugas.selesai === false).length;
    counterTugas.textContent = `${jumlahAktif} tugas aktif`; 

    // 2. Saring data berdasarkan filterAktif
    let dataTerfilter = daftarTugas.filter(tugas => {
        if (filterAktif === 'aktif') return tugas.selesai === false;
        if (filterAktif === 'selesai') return tugas.selesai === true;
        return true; // Kalau 'semua', kembalikan semua data
    });

    if (dataTerfilter.length === 0) {
        containerTugas.innerHTML = '<li>Belum ada tugas yang ditambahkan.</li>';
        return;
    }

    dataTerfilter.forEach(tugas => {
        const li = document.createElement('li');
        if (tugas.selesai) li.className = 'selesai';

        // Bikin bungkus kiri (info)
        const divInfo = document.createElement('div');
        
        // Bikin tag strong untuk judul, gunakan textContent agar AMAN
        const strongJudul = document.createElement('strong');
        strongJudul.textContent = tugas.judul; 
        
        const spanDetail = document.createElement('span');
        spanDetail.textContent = ` - ${tugas.matkul} (Deadline: ${tugas.deadline})`;
        
        divInfo.appendChild(strongJudul);
        divInfo.appendChild(spanDetail);

        // Bikin bungkus kanan (tombol)
        const divAksi = document.createElement('div');
        divAksi.innerHTML = `
            <button onclick="toggleSelesai(${tugas.id})">${tugas.selesai ? 'Batal' : 'Selesai'}</button>
            <button onclick="hapusTugas(${tugas.id})" style="color:red;">Hapus</button>
        `;

        li.appendChild(divInfo);
        li.appendChild(divAksi);
        listTugas.appendChild(li);
    });
}

// 01. Listener di submit + preventDefault() + validasi
formTugas.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah form melakukan reload halaman
    
    const judulVal = judulTugas.value.trim();
    const matkulVal = inputMatkul.value;
    const deadlineVal = inputDeadline.value;

    // Validasi: Judul minimal 3 karakter & deadline wajib diisi
    let pesanError = '';
    if (judulVal.length < 3) {
        pesanError = 'Judul tugas minimal harus 3 karakter!';
    } else if (!matkulVal) {
        pesanError = 'Silakan pilih mata kuliah terlebih dahulu!';
    } else if (!deadlineVal) {
        pesanError = 'Deadline wajib diisi!';
    }

    // Jika ada error, tampilkan di elemen error halaman dan hentikan proses
    if (pesanError !== '') {
        errorHandler.textContent = pesanError;
        return;
    }

    // Jika lolos validasi, bersihkan pesan error
    errorHandler.textContent = '';

    // Buat objek tugas baru sesuai struktur state
    const tugasBaru = {
        id: Date.now(), // ID unik menggunakan timestamp
        judul: judulVal,
        matkul: matkulVal,
        deadline: deadlineVal,
        selesai: false
    };

    // Masukkan ke dalam state array of objects
    daftarTugas.push(tugasBaru);

    // Reset form input agar kosong kembali
    formTugas.reset();

    // Panggil fungsi render() untuk memperbarui tampilan
    render();
});

// Fungsi opsional untuk mengubah status selesai (centang/batal)
function toggleSelesai(id) {
    daftarTugas = daftarTugas.map(tugas => {
        if (tugas.id === id) {
            return { ...tugas, selesai: !tugas.selesai };
        }
        return tugas;
    });
    render();
}

// Fungsi opsional untuk menghapus tugas dari state
function hapusTugas(id) {
    daftarTugas = daftarTugas.filter(tugas => tugas.id !== id);
    render();
}

// Panggil render sekali di awal saat script dimuat
render();