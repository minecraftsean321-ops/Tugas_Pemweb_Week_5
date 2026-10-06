// Buat array of object untuk daftar tugasnya
let daftarTugas = [];

const formTugas = document.getElementById('formTugas');
const judulTugas = document.getElementById('judul');
const inputMatkul = document.getElementById('matkul');
const inputDeadline = document.getElementById('deadline');
const errorHandler = document.getElementById('pesanError');
const containerTugas = document.getElementById('listTugas');

// 02. Tampilan dibangun oleh satu fungsi render()
function render() {
    // Kosongkan container terlebih dahulu sebelum dirender ulang
    containerTugas.innerHTML = '';

    if (daftarTugas.length === 0) {
        containerTugas.innerHTML = '<li>Belum ada tugas yang ditambahkan.</li>';
        return;
    }

    // Loop state array of objects dan buat elemen HTML-nya
    daftarTugas.forEach(tugas => {
        // UBAH 'div' menjadi 'li' agar terbaca oleh CSS .list li
        const itemTugas = document.createElement('li'); 
        
        // Berikan class dinamis jika tugas sudah selesai
        itemTugas.className = tugas.selesai ? 'selesai' : '';

        // Tambahkan efek coret kalau selesai (bisa dihapus jika sudah diatur di CSS .selesai)
        if (tugas.selesai) {
            itemTugas.style.textDecoration = 'line-through';
            itemTugas.style.color = 'gray';
        }

        itemTugas.innerHTML = `
            <div>
                <strong>${tugas.judul}</strong><br>
                <span>${tugas.matkul} | Deadline: ${tugas.deadline}</span>
            </div>
            <div style="margin-top: 5px;">
                <button type="button" onclick="toggleSelesai(${tugas.id})">
                    ${tugas.selesai ? 'Batal' : 'Selesai'}
                </button>
                <button type="button" onclick="hapusTugas(${tugas.id})">Hapus</button>
            </div>
        `;

        // Pastikan ini di-append ke variabel penampung <ul> kamu (listTugas)
        listTugas.appendChild(itemTugas); 
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