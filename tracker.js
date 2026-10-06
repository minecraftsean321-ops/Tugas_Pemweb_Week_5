// Buat array of object untuk daftar tugasnya
let daftarTugas = [];

const formTugas = document.getElementById('container');
const judulTugas = document.getElementById('judul');
const inputMatkul = document.getElementById('matkul');
const inputDeadline = document.getElementById('deadline');
const errorHandler = document.getElementsByClassName('pesan-error');
const containerTugas = document.getElementsByClassName('container-tugas');

// 02. Tampilan dibangun oleh satu fungsi render()
function render() {
    // Kosongkan container terlebih dahulu sebelum dirender ulang
    containerTugas.innerHTML = '';

    if (daftarTugas.length === 0) {
        containerTugas.innerHTML = '<p>Belum ada tugas yang ditambahkan.</p>';
        return;
    }

    // Loop state array of objects dan buat elemen HTML-nya
    daftarTugas.forEach(tugas => {
        const itemTugas = document.createElement('div');
        // Contoh class dinamis jika ingin memberi style coret saat selesai
        itemTugas.className = `task-item ${tugas.selesai ? 'selesai' : ''}`;

        itemTugas.innerHTML = `
            <div>
                <strong>${tugas.judul}</strong><br>
                <span>Matkul: ${tugas.matkul} | Deadline: ${tugas.deadline}</span>
            </div>
            <div>
                <button type="button" onclick="toggleSelesai(${tugas.id})">
                    ${tugas.selesai ? 'Batal' : 'Selesai'}
                </button>
                <button type="button" onclick="hapusTugas(${tugas.id})">Hapus</button>
            </div>
        `;

        containerTugas.appendChild(itemTugas);
    });
}

// 01. Listener di submit + preventDefault() + validasi
formTugas.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah form melakukan reload halaman
    
    const judulVal = inputJudul.value.trim();
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
        errorContainer.textContent = pesanError;
        return;
    }

    // Jika lolos validasi, bersihkan pesan error
    errorContainer.textContent = '';

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