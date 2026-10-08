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

// Fungsi 01: Muat dari server (GET)
async function fetchTugas() {
    // Tampilkan state loading (skeleton teks)
    listTugas.innerHTML = '<li style="text-align:center; padding:15px;">Memuat data...</li>';

    try {
        // Melakukan request GET ke /api/tugas
        const response = await fetch('/api/tugas');
        
        if (!response.ok) {
            throw new Error(`Gagal memuat data (Status: ${response.status})`);
        }

        // Ambil data JSON dari server dan masukkan ke state
        const data = await response.json();
        daftarTugas = data;
        
        // Panggil fungsi render untuk menampilkan data (termasuk penanganan jika array kosong)
        render();

    } catch (error) {
        // Tampilkan state error dan tombol coba lagi
        listTugas.innerHTML = `
            <li style="text-align:center; color:red; padding:15px; border:1px solid red; list-style:none;">
                Terjadi kesalahan: ${error.message}<br>
                <button type="button" onclick="fetchTugas()" style="margin-top:10px; padding:5px 10px;">Coba Lagi</button>
            </li>
        `;
    }
}

// Panggil fetchTugas() pertama kali saat script dimuat, bukan render()
fetchTugas();

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

    // Urutkan data berdasarkan deadline terdekat
    dataTerfilter.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (dataTerfilter.length === 0) {
        listTugas.innerHTML = '<li>Belum ada tugas yang ditambahkan.</li>';
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
        
        // Ganti 'span' menjadi 'div' agar otomatis pindah ke bawah judul
        const divDetail = document.createElement('div');
        // Tanda strip (-) dihilangkan agar lebih rapi saat berada di baris baru
        divDetail.textContent = `${tugas.matkul} | Deadline: ${tugas.deadline}`;
        divDetail.style.fontSize = '0.9em'; // Opsional: bikin teks detail sedikit lebih kecil

        divInfo.appendChild(strongJudul);
        divInfo.appendChild(divDetail);

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

// Tangkap tombol submit untuk fitur disable
const btnSubmit = formTugas.querySelector('button[type="submit"]');

// Fungsi 02: Tambah (POST)
formTugas.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    const judulVal = judulTugas.value.trim();
    const matkulVal = inputMatkul.value;
    const deadlineVal = inputDeadline.value;

    // Validasi lokal
    let pesanError = '';
    if (judulVal.length < 3) pesanError = 'Judul tugas minimal harus 3 karakter!';
    else if (!matkulVal) pesanError = 'Silakan pilih mata kuliah terlebih dahulu!';
    else if (!deadlineVal) pesanError = 'Deadline wajib diisi!';

    if (pesanError !== '') {
        errorHandler.textContent = pesanError;
        return;
    }

    errorHandler.textContent = ''; // Bersihkan error jika validasi lokal lolos

    const tugasBaru = {
        judul: judulVal,
        matkul: matkulVal,
        deadline: deadlineVal,
        selesai: false
    };

    // 1. Nonaktifkan tombol selama mengirim
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Mengirim...';

    try {
        // 2. Request POST ke /api/tugas dengan header & body JSON
        const response = await fetch('/api/tugas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tugasBaru)
        });

        // 3. Tangani jika server mengembalikan error (misal 400 Bad Request)
        if (!response.ok) {
            // Ambil pesan error dari response body (jika server mengirimkannya)
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Gagal menambah tugas. Error server: ${response.status}`);
        }

        // Jika berhasil: bersihkan form dan muat ulang data dari server
        formTugas.reset();
        await fetchTugas(); // Ambil list tugas terbaru

    } catch (error) {
        // Tampilkan pesan error dari server ke halaman
        errorHandler.textContent = error.message;
        errorHandler.style.color = 'red';
    } finally {
        // 4. Kembalikan kondisi tombol terlepas dari sukses atau gagal
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Tambah';
    }
});

// Fungsi opsional untuk mengubah status selesai (centang/batal)
function toggleSelesai(id) {
    daftarTugas = daftarTugas.map(tugas => {
        if (tugas.id === id) {
            return { ...tugas, selesai: !tugas.selesai };
        }
        return tugas;
    });

    simpanData();
    render();
}

// Fungsi opsional untuk menghapus tugas dari state
function hapusTugas(id) {
    daftarTugas = daftarTugas.filter(tugas => tugas.id !== id);
    simpanData();
    render();
}

// Panggil render sekali di awal saat script dimuat
render();