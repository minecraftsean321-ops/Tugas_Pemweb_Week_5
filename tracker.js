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

// Tambahkan variabel baru untuk fitur pencarian
const inputSearch = document.getElementById('inputSearch');
let keywordPencarian = '';
let debounceTimer;

// Event Listener untuk Bonus: Pencarian dengan Debounce
if (inputSearch) {
    inputSearch.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            keywordPencarian = e.target.value.toLowerCase();
            render(); // Render ulang setelah user berhenti mengetik 300ms
        }, 300);
    });
}

// Poin 05: Muat data dari server paralel menggunakan Promise.all
async function fetchTugas() {
    listTugas.innerHTML = '<li style="text-align:center; padding:15px;">Memuat data...</li>';

    try {
        // Menembak 2 API sekaligus (Pastikan endpoint matkul disesuaikan)
        const [dataTugas, dataMatkul] = await Promise.all([
            api('/api/tugas'),
            api('/api/matkul') 
        ]);

        daftarTugas = dataTugas;

        // Render otomatis daftar mata kuliah ke dropdown <select>[cite: 13]
        if (dataMatkul && Array.isArray(dataMatkul)) {
            inputMatkul.innerHTML = '<option value="" disabled selected>Pilih Mata Kuliah...</option>';
            dataMatkul.forEach(mk => {
                // Asumsi properti nama dari API matkul adalah 'nama' atau 'matkul'
                const namaMk = mk.nama || mk.matkul; 
                inputMatkul.innerHTML += `<option value="${namaMk}">${namaMk}</option>`;
            });
        }
        
        render();

    } catch (error) {
        listTugas.innerHTML = `
            <li style="text-align:center; color:red; padding:15px; list-style:none;">
                Terjadi kesalahan: ${error.message}<br>
                <button type="button" onclick="fetchTugas()">Coba Lagi</button>
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

    // Di dalam fungsi render()
    let dataTerfilter = daftarTugas.filter(tugas => {
        const matchFilter = (filterAktif === 'semua') || 
                            (filterAktif === 'aktif' && !tugas.selesai) || 
                            (filterAktif === 'selesai' && tugas.selesai);
                            
        // Pencocokan kata kunci pencarian
        const matchSearch = tugas.judul.toLowerCase().includes(keywordPencarian);
        
        return matchFilter && matchSearch;
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

        // Bikin bungkus kanan (tombol) tanpa atribut onclick inline[cite: 12]
        const divAksi = document.createElement('div');
        divAksi.innerHTML = `
            <button data-id="${tugas.id}" data-action="toggle">${tugas.selesai ? 'Batal' : 'Selesai'}</button>
            <button data-id="${tugas.id}" data-action="delete" style="color:red;">Hapus</button>
        `;

        li.appendChild(divInfo);
        li.appendChild(divAksi);
        listTugas.appendChild(li);
    });
}

// 03. Tangkap event klik pada listTugas (Event Delegation)[cite: 12]
listTugas.addEventListener('click', async function(e) {
    // Cek apakah yang diklik adalah tombol
    if (e.target.tagName === 'BUTTON') {
        const id = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');

        // Nonaktifkan tombol sementara agar tidak diklik dua kali saat loading
        e.target.disabled = true; 

        if (action === 'toggle') {
            await toggleSelesai(id);
        } else if (action === 'delete') {
            await hapusTugas(id);
        }
    }
});

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
        // Panggil helper api() langsung, lebih ringkas!
        await api('/api/tugas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tugasBaru)
        });
        
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

// Bonus: Optimistic Update pada Toggle Selesai[cite: 13]
async function toggleSelesai(id) {
    const index = daftarTugas.findIndex(t => t.id == id);
    if (index === -1) return;

    // 1. Simpan status lama sebagai backup
    const statusLama = daftarTugas[index].selesai;

    // 2. Ubah state UI langsung dan render (tanpa nunggu server)[cite: 13]
    daftarTugas[index].selesai = !statusLama;
    render(); 

    try {
        // 3. Tembak server di belakang layar
        await api(`/api/tugas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selesai: !statusLama })
        });
    } catch (error) {
        // 4. Batal/Revert jika gagal[cite: 13]
        console.warn("Gagal update ke server, membatalkan UI.");
        daftarTugas[index].selesai = statusLama;
        render(); // Render ulang state awal
        alert(`Gagal mengubah tugas: ${error.message}`);
    }
}

// Bonus: Optimistic Update pada Hapus Tugas[cite: 13]
async function hapusTugas(id) {
    const index = daftarTugas.findIndex(t => t.id == id);
    if (index === -1) return;

    // 1. Backup data tugas yang dihapus
    const tugasDihapus = daftarTugas[index];

    // 2. Hapus langsung dari UI[cite: 13]
    daftarTugas.splice(index, 1);
    render();

    try {
        // 3. Eksekusi server
        await api(`/api/tugas/${id}`, { method: 'DELETE' });
    } catch (error) {
        // 4. Batal/Revert jika gagal[cite: 13]
        console.warn("Gagal menghapus di server, mengembalikan tugas.");
        daftarTugas.splice(index, 0, tugasDihapus); // Sisipkan kembali tugas
        render();
        alert(`Gagal menghapus tugas: ${error.message}`);
    }
}

// Helper api() yang tahan banting (Poin 06)
async function api(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            let errorMessage = `Error Server: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {}
            throw new Error(errorMessage);
        }
        if (res.status === 204) return null;
        return res.json();
    } catch (error) {
        // Menangkap error jaringan agar tidak bocor jadi error merah di Console
        throw new Error(error.message === 'Failed to fetch' ? 'Koneksi terputus (Offline)' : error.message);
    }
}
