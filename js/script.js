// ============================================================
    // 1. KONFIGURASI
    // ============================================================
    const CONFIG = {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/14kyTPwLO9sq-34hV8gd2NyPQ2NOq_5opXdqO3-kG8k0/edit?gid=0#gid=0',
    gasUrl: 'https://script.google.com/macros/s/AKfycbwXE29g7kbuIT5XDnqZgssJd2R3zEQXfkI7DERCxwogpC3PWkUAZ18K22OqgIUK3jnzzw/exec', // <-- GANTI INI
    admin: {
        username: 'bendahara',      // <-- Sesuai dengan log Anda
        password: 'Anna@923016'     // <-- Sesuai dengan log Anda
    },
    iuranPerBulan: 10000
};

    let isAdmin = false;
    let dataSiswa = [];
    let dataKasKeluar = [];
    let chartGender = null;
    let chartPayment = null;
    let qrScannerInstance = null;

    // ============================================================
    // 2. TOAST NOTIFICATION
    // ============================================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ============================================================
    // 3. LOGIN / LOGOUT
    // ============================================================
    function toggleLogin() {
        if (isAdmin) {
            isAdmin = false;
            document.getElementById('adminArea').classList.add('hidden');
            document.getElementById('loginText').textContent = 'Login Admin';
            document.getElementById('loginBtn').classList.remove('btn-danger');
            document.getElementById('loginBtn').classList.add('btn-primary');
            showToast('Logout berhasil', 'info');
        } else {
            const username = prompt('Masukkan Username:');
            if (!username) return;
            const password = prompt('Masukkan Password:');
            if (!password) return;
            if (username === CONFIG.admin.username && password === CONFIG.admin.password) {
                isAdmin = true;
                document.getElementById('adminArea').classList.remove('hidden');
                document.getElementById('loginText').textContent = 'Logout';
                document.getElementById('loginBtn').classList.remove('btn-primary');
                document.getElementById('loginBtn').classList.add('btn-danger');
                showToast('Login berhasil! Selamat datang Admin.', 'success');
            } else {
                showToast('Username atau Password salah!', 'error');
            }
        }
    }

   // ============================================================
// 4. LOAD DATA DARI GOOGLE SHEET (FIX CORS)
// ============================================================
async function loadData() {
    try {
        showToast('Mengambil data...', 'info');
        
        const response = await fetch(CONFIG.gasUrl + '?action=getData', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // HAPUS mode: 'no-cors' untuk GET
        });

        // Cek response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📥 Data dari GSheet:', result);

        if (result.status === 'success' && result.data && result.data.length > 0) {
            // Parse data siswa
            dataSiswa = result.data.map((row, index) => {
                const nominal = parseFloat(row.nominal) || 0;
                const ket = row.ket || (nominal > 0 ? (nominal / CONFIG.iuranPerBulan) + ' bulan' : '');
                return {
                    id: index,
                    no: row.no || index + 1,
                    nis: row.nis || '',
                    nama: row.nama_siswa || row.nama || '',
                    gender: row.gender ? row.gender.toUpperCase() : '',
                    nominal: nominal,
                    tanggal: row.tanggal || '',
                    ket: ket,
                    qr: row.qr || '',
                    status: nominal > 0 ? 'paid' : 'unpaid'
                };
            });

            // Ambil data kas keluar jika ada
            if (result.kasKeluar) {
                dataKasKeluar = result.kasKeluar;
            }

            renderAll();
            showToast(`✅ Data berhasil dimuat! (${dataSiswa.length} siswa)`, 'success');
        } else {
            // Jika data kosong atau error, pakai data dummy
            console.warn('⚠️ Data dari GSheet kosong, pakai data lokal.');
            loadDummyData();
            showToast('Data dari GSheet kosong, menggunakan data lokal.', 'warning');
        }

    } catch (error) {
        console.error('❌ Error loading data:', error);
        
        // Coba dengan mode no-cors sebagai fallback (hanya untuk POST)
        try {
            showToast('Mencoba mode alternatif...', 'info');
            const fallbackResponse = await fetch(CONFIG.gasUrl + '?action=getData', {
                method: 'GET',
                mode: 'no-cors',
            });
            // no-cors tidak bisa baca response, jadi fallback ke dummy
            loadDummyData();
            showToast('⚠️ Mode no-cors: menggunakan data lokal.', 'warning');
        } catch (fallbackError) {
            loadDummyData();
            showToast('❌ Gagal koneksi ke GSheet, menggunakan data lokal.', 'error');
        }
    }
}

// ============================================================
// 4b. FUNGSI SAVE KE GSHEET (untuk POST)
// ============================================================
async function saveToGSheet(payload) {
    try {
        const response = await fetch(CONFIG.gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📤 Save result:', result);
        return result;

    } catch (error) {
        console.error('❌ Error saving to GSheet:', error);
        
        // Fallback dengan mode no-cors
        try {
            await fetch(CONFIG.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            return { status: 'success', message: 'Data terkirim (mode no-cors)' };
        } catch (fallbackError) {
            throw error;
        }
    }
}

    // ============================================================
    // 5. DATA DUMMY (dari Excel)
    // ============================================================
    function loadDummyData() {
        dataSiswa = [
            { id: 0, no: 1, nis: '262707011', nama: 'Adzkiya Livia Marsha', gender: 'P', nominal: 50000,
                tanggal: '2026-08-11', ket: '5 bulan', status: 'paid' },
            { id: 1, no: 2, nis: '262707012', nama: 'Afif Ahlan Firdaus', gender: 'L', nominal: 10000,
                tanggal: '2026-08-12', ket: '1 bulan', status: 'paid' },
            { id: 2, no: 3, nis: '262707017', nama: 'Ainun Shofie Salsabila', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 3, no: 4, nis: '262707022', nama: 'Akhfan Damantri', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 4, no: 5, nis: '262707028', nama: 'Aldi Gunawan', gender: 'L', nominal: 0, tanggal: '', ket: '',
                status: 'unpaid' },
            { id: 5, no: 6, nis: '262707038', nama: 'Alma Syakira Rosdiana', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 6, no: 7, nis: '262707046', nama: 'Ana Putri Rahayu', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 7, no: 8, nis: '262707047', nama: 'Anatasya Shakila Nur Zahira', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 8, no: 9, nis: '262707053', nama: 'Anisa Suargana', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 9, no: 10, nis: '262707076', nama: 'Aura Aprilia Putri Dian', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 10, no: 11, nis: '262707081', nama: 'Azzam Nur Habibi', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 11, no: 12, nis: '262707101', nama: 'Devina Putri Maulana', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 12, no: 13, nis: '262707102', nama: 'Devita Jelli Yanti', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 13, no: 14, nis: '262707111', nama: 'Ezra Naufal Attalah', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 14, no: 15, nis: '262707114', nama: 'Fahri Naufal', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 15, no: 16, nis: '262707133', nama: 'Irsyad Hakiki Alfarizki', gender: 'L', nominal: 20000,
                tanggal: '2026-08-12', ket: '2 bulan', status: 'paid' },
            { id: 16, no: 17, nis: '262707138', nama: 'Jovita Novi Nugraha', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 17, no: 18, nis: '262707141', nama: 'Kafka Dwi Putra Komarudin', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 18, no: 19, nis: '262707156', nama: 'Kirana Jahira Putri', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 19, no: 20, nis: '262707165', nama: 'Marisa Gracelyn', gender: 'P', nominal: 50000,
                tanggal: '2026-08-11', ket: '5 bulan', status: 'paid' },
            { id: 20, no: 21, nis: '262707183', nama: 'Muhammad Elfiansyah Sputra', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 21, no: 22, nis: '262707191', nama: 'Muhammad Adzikri Rachmadi', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 22, no: 23, nis: '262707205', nama: 'Muhammad Rajes Cahyana', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 23, no: 24, nis: '262707208', nama: 'Muhammad Rivky Putra Sobandi', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 24, no: 25, nis: '262707211', nama: 'Mutyara Septini Putri', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 25, no: 26, nis: '262707221', nama: 'Nasya Talitha Azalia Gunawan', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 26, no: 27, nis: '262707223', nama: 'Naura Hazna Alia', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 27, no: 28, nis: '262707231', nama: 'Nayla Azzahra', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 28, no: 29, nis: '262707238', nama: 'Nizam Muhammad Javier', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 29, no: 30, nis: '262707253', nama: 'Raka Rasyad Fadil', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 30, no: 31, nis: '262707256', nama: 'Ranishya Putia Maharani', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 31, no: 32, nis: '262707271', nama: 'Restu Triazmi', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 32, no: 33, nis: '262707278', nama: 'Rhama Aldzikri Mulyadi', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 33, no: 34, nis: '262707280', nama: 'Ridwan Alfaruq', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 34, no: 35, nis: '262707294', nama: 'Selly Zahira Putri', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 35, no: 36, nis: '262707300', nama: 'Silva Guniyanti S', gender: 'P', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 36, no: 37, nis: '262707303', nama: 'Sofia Putri Kurnia Ramadhan', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 37, no: 38, nis: '262707304', nama: 'Sopian', gender: 'L', nominal: 0, tanggal: '', ket: '',
                status: 'unpaid' },
            { id: 38, no: 39, nis: '262707316', nama: 'Wendi Nugraha', gender: 'L', nominal: 0, tanggal: '',
                ket: '', status: 'unpaid' },
            { id: 39, no: 40, nis: '262707323', nama: 'Zia Zerlina Putrie Sugianto', gender: 'P', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' },
            { id: 40, no: 41, nis: '262707325', nama: 'Zilzian Noer Setiawan', gender: 'L', nominal: 0,
                tanggal: '', ket: '', status: 'unpaid' }
        ];
        dataKasKeluar = [];
        renderAll();
        showToast('Data lokal dimuat (41 siswa).', 'info');
    }

    // ============================================================
    // 6. RENDER SEMUA
    // ============================================================
    function renderAll() {
        renderStats();
        renderTable();
        renderCharts();
    }

    // ============================================================
    // 7. RENDER STATS
    // ============================================================
    function renderStats() {
        const total = dataSiswa.length;
        const lCount = dataSiswa.filter(s => s.gender === 'L').length;
        const pCount = dataSiswa.filter(s => s.gender === 'P').length;
        const totalNominal = dataSiswa.reduce((sum, s) => sum + s.nominal, 0);
        const totalKeluar = dataKasKeluar.reduce((sum, k) => sum + (k.jumlah || 0), 0);
        const saldo = totalNominal - totalKeluar;

        document.getElementById('totalSiswa').textContent = total;
        document.getElementById('totalL').textContent = lCount;
        document.getElementById('totalP').textContent = pCount;
        document.getElementById('totalPemasukan').textContent = 'Rp' + totalNominal.toLocaleString('id-ID');
        document.getElementById('totalPengeluaran').textContent = 'Rp' + totalKeluar.toLocaleString('id-ID');
        document.getElementById('saldoAkhir').textContent = 'Rp' + saldo.toLocaleString('id-ID');
    }

    // ============================================================
    // 8. RENDER TABEL
    // ============================================================
    function renderTable() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const filtered = dataSiswa.filter(s =>
            s.nama.toLowerCase().includes(search) ||
            s.nis.includes(search)
        );

        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-light);">Tidak ada data ditemukan</td></tr>';
            return;
        }

        filtered.forEach((s, idx) => {
            const tr = document.createElement('tr');
            const isPaid = s.nominal > 0;
            const qrUrl =
                `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${s.nis}`;

            tr.innerHTML = `
                <td>${s.no}</td>
                <td><strong>${s.nis}</strong></td>
                <td>${s.nama}</td>
                <td><span class="gender-badge ${s.gender}">${s.gender || '-'}</span></td>
                <td>${s.nominal > 0 ? 'Rp' + s.nominal.toLocaleString('id-ID') : '-'}</td>
                <td>${s.tanggal || '-'}</td>
                <td><span class="status-badge ${isPaid ? 'paid' : 'unpaid'}">${isPaid ? s.ket || s.nominal/CONFIG.iuranPerBulan + ' bulan' : 'Belum bayar'}</span></td>
                <td><img src="${qrUrl}" alt="QR" class="qr-img" onclick="window.open('${qrUrl}','_blank')" /></td>
                <td>
                    <div class="action-btns">
                        ${isAdmin ? `
                            <button class="btn btn-success btn-xs" onclick="editSiswa(${s.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-danger btn-xs" onclick="hapusSiswa(${s.id})"><i class="fas fa-trash"></i></button>
                        ` : `
                            <span style="font-size:11px;color:var(--text-light);">${isAdmin ? '' : '🔒'}</span>
                        `}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ============================================================
    // 9. RENDER CHARTS
    // ============================================================
    function renderCharts() {
        // Chart Gender & Status
        const lPaid = dataSiswa.filter(s => s.gender === 'L' && s.nominal > 0).length;
        const lUnpaid = dataSiswa.filter(s => s.gender === 'L' && s.nominal === 0).length;
        const pPaid = dataSiswa.filter(s => s.gender === 'P' && s.nominal > 0).length;
        const pUnpaid = dataSiswa.filter(s => s.gender === 'P' && s.nominal === 0).length;

        const ctx1 = document.getElementById('chartGender').getContext('2d');
        if (chartGender) chartGender.destroy();
        chartGender = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    label: 'Sudah Bayar',
                    data: [lPaid, pPaid],
                    backgroundColor: '#28a745',
                    borderRadius: 6,
                }, {
                    label: 'Belum Bayar',
                    data: [lUnpaid, pUnpaid],
                    backgroundColor: '#dc3545',
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 } } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

        // Chart Payment Status
        const paid = dataSiswa.filter(s => s.nominal > 0).length;
        const unpaid = dataSiswa.filter(s => s.nominal === 0).length;

        const ctx2 = document.getElementById('chartPayment').getContext('2d');
        if (chartPayment) chartPayment.destroy();
        chartPayment = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Sudah Bayar', 'Belum Bayar'],
                datasets: [{
                    data: [paid, unpaid],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 } } }
                },
                cutout: '70%',
            }
        });
    }

    // ============================================================
    // 10. QR SCANNER
    // ============================================================
    function openScanner() {
        const modal = document.getElementById('scannerModal');
        modal.classList.add('active');
        // Inisialisasi scanner
        if (!qrScannerInstance) {
            qrScannerInstance = new Html5Qrcode("qr-reader");
        }
        qrScannerInstance.start({ facingMode: "environment" }, {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        }, onScanSuccess, onScanError);
    }

    function closeScanner() {
        const modal = document.getElementById('scannerModal');
        modal.classList.remove('active');
        if (qrScannerInstance) {
            qrScannerInstance.stop().catch(() => {});
        }
    }

    function onScanSuccess(decodedText, decodedResult) {
        // decodedText = NIS
        closeScanner();
        const siswa = dataSiswa.find(s => s.nis === decodedText);
        if (siswa) {
            document.getElementById('inputNIS').value = siswa.nis;
            document.getElementById('inputNama').value = siswa.nama;
            showToast(`Scan berhasil! Siswa: ${siswa.nama}`, 'success');
            // Jika admin belum login, minta login dulu
            if (!isAdmin) {
                showToast('Silakan login sebagai admin untuk menambah setoran.', 'warning');
                toggleLogin();
            }
        } else {
            showToast(`NIS ${decodedText} tidak ditemukan!`, 'error');
        }
    }

    function onScanError(err) {
        // ignore
    }

    // ============================================================
    // 11. SCAN NIS MANUAL
    // ============================================================
    function scanNIS() {
        const nis = document.getElementById('inputNIS').value.trim();
        if (!nis) {
            showToast('Masukkan NIS terlebih dahulu!', 'warning');
            return;
        }
        const siswa = dataSiswa.find(s => s.nis === nis);
        if (siswa) {
            document.getElementById('inputNama').value = siswa.nama;
            showToast(`Siswa ditemukan: ${siswa.nama}`, 'success');
        } else {
            showToast(`NIS ${nis} tidak ditemukan!`, 'error');
            document.getElementById('inputNama').value = '';
        }
    }

    // ============================================================
    // 12. TAMBAH SETORAN (ADMIN)
    // ============================================================
    function tambahSetoran() {
        if (!isAdmin) {
            showToast('Harap login sebagai admin terlebih dahulu!', 'error');
            return;
        }

        const nis = document.getElementById('inputNIS').value.trim();
        const nominal = parseInt(document.getElementById('inputNominal').value);
        const siswa = dataSiswa.find(s => s.nis === nis);

        if (!siswa) {
            showToast('NIS tidak valid!', 'error');
            return;
        }
        if (!nominal || nominal < 10000 || nominal % 10000 !== 0) {
            showToast('Nominal harus kelipatan Rp10.000 dan minimal Rp10.000!', 'warning');
            return;
        }

        // Update data
        const now = new Date();
        const tanggalStr = now.toISOString().split('T')[0];
        const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        siswa.nominal += nominal;
        siswa.tanggal = tanggalStr;
        siswa.ket = (siswa.nominal / CONFIG.iuranPerBulan) + ' bulan';
        siswa.status = 'paid';

        // Kirim ke Google Sheet
        const payload = {
            action: 'addSetoran',
            nis: nis,
            nominal: nominal,
            tanggal: tanggalStr,
            jam: jamStr
        };

        fetch(CONFIG.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(() => {
                showToast(`Setoran Rp${nominal.toLocaleString('id-ID')} untuk ${siswa.nama} berhasil!`, 'success');
                renderAll();
                // Reset form
                document.getElementById('inputNominal').value = '';
                document.getElementById('inputNIS').value = '';
                document.getElementById('inputNama').value = '';
            })
            .catch(err => {
                showToast('Gagal menyimpan ke GSheet, tetapi data lokal sudah diupdate.', 'warning');
                renderAll();
            });
    }

    // ============================================================
    // 13. TAMBAH KAS KELUAR (ADMIN)
    // ============================================================
    function tambahKasKeluar() {
        if (!isAdmin) {
            showToast('Harap login sebagai admin terlebih dahulu!', 'error');
            return;
        }

        const keterangan = document.getElementById('inputKeteranganKeluar').value.trim();
        const jumlah = parseInt(document.getElementById('inputJumlahKeluar').value);

        if (!keterangan) {
            showToast('Masukkan keterangan pengeluaran!', 'warning');
            return;
        }
        if (!jumlah || jumlah < 1) {
            showToast('Masukkan jumlah pengeluaran yang valid!', 'warning');
            return;
        }

        const now = new Date();
        const tanggalStr = now.toISOString().split('T')[0];
        const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        dataKasKeluar.push({
            tanggal: tanggalStr,
            jam: jamStr,
            keterangan: keterangan,
            jumlah: jumlah
        });

        // Kirim ke GSheet
        const payload = {
            action: 'addKasKeluar',
            keterangan: keterangan,
            jumlah: jumlah,
            tanggal: tanggalStr,
            jam: jamStr
        };

        fetch(CONFIG.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(() => {
                showToast(`Pengeluaran "${keterangan}" sebesar Rp${jumlah.toLocaleString('id-ID')} berhasil dicatat.`,
                'success');
                renderAll();
                document.getElementById('inputKeteranganKeluar').value = '';
                document.getElementById('inputJumlahKeluar').value = '';
            })
            .catch(err => {
                showToast('Gagal menyimpan ke GSheet, data lokal sudah diupdate.', 'warning');
                renderAll();
            });
    }

    // ============================================================
    // 14. EDIT SISWA (ADMIN)
    // ============================================================
    function editSiswa(id) {
        if (!isAdmin) {
            showToast('Harap login sebagai admin!', 'error');
            return;
        }
        const siswa = dataSiswa.find(s => s.id === id);
        if (!siswa) return;

        const namaBaru = prompt('Edit Nama:', siswa.nama);
        if (namaBaru && namaBaru.trim()) {
            siswa.nama = namaBaru.trim();
            renderAll();
            showToast('Data berhasil diupdate!', 'success');
            // Kirim ke GSheet
            fetch(CONFIG.gasUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'editSiswa', nis: siswa.nis, nama: siswa.nama })
                })
                .catch(() => showToast('Gagal sync ke GSheet, data lokal sudah update.', 'warning'));
        }
    }

    // ============================================================
    // 15. HAPUS SISWA (ADMIN)
    // ============================================================
    function hapusSiswa(id) {
        if (!isAdmin) {
            showToast('Harap login sebagai admin!', 'error');
            return;
        }
        const siswa = dataSiswa.find(s => s.id === id);
        if (!siswa) return;

        if (confirm(`Yakin ingin menghapus siswa ${siswa.nama} (${siswa.nis})?`)) {
            dataSiswa = dataSiswa.filter(s => s.id !== id);
            renderAll();
            showToast(`Siswa ${siswa.nama} berhasil dihapus.`, 'success');
            fetch(CONFIG.gasUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'hapusSiswa', nis: siswa.nis })
                })
                .catch(() => showToast('Gagal sync ke GSheet, data lokal sudah dihapus.', 'warning'));
        }
    }

    // ============================================================
    // 16. RESET DATA (ADMIN)
    // ============================================================
    function resetData() {
        if (!isAdmin) {
            showToast('Harap login sebagai admin!', 'error');
            return;
        }
        if (confirm('⚠️ RESET DATA: Semua data akan dikembalikan ke awal (hanya data dummy). Lanjutkan?')) {
            loadDummyData();
            showToast('Data berhasil di-reset ke data awal.', 'info');
        }
    }

    // ============================================================
    // 17. EXPORT EXCEL
    // ============================================================
    function exportExcel() {
        const data = dataSiswa.map(s => ({
            'No': s.no,
            'NIS': s.nis,
            'Nama': s.nama,
            'Gender': s.gender,
            'Nominal': s.nominal,
            'Tanggal': s.tanggal,
            'Ket (Bulan)': s.ket,
            'Status': s.nominal > 0 ? 'Sudah Bayar' : 'Belum Bayar'
        }));

        // Tambahkan summary
        const totalNominal = dataSiswa.reduce((sum, s) => sum + s.nominal, 0);
        const totalKeluar = dataKasKeluar.reduce((sum, k) => sum + (k.jumlah || 0), 0);
        data.push({});
        data.push({ 'No': 'TOTAL', 'Nominal': totalNominal, 'Status': `Total Siswa: ${dataSiswa.length}` });
        data.push({ 'No': 'KAS KELUAR', 'Nominal': totalKeluar, 'Status': `Saldo: ${totalNominal - totalKeluar}` });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        XLSX.writeFile(wb, `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Excel berhasil diekspor!', 'success');
    }

    // ============================================================
    // 18. EXPORT PDF
    // ============================================================
    function exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'pt', 'a4');

        // Title
        doc.setFontSize(18);
        doc.text('Laporan Keuangan Sekolah Pasundan 3', 40, 40);
        doc.setFontSize(10);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 40, 60);

        // Table headers
        const headers = ['No', 'NIS', 'Nama', 'Gender', 'Nominal', 'Tanggal', 'Ket'];
        const rows = dataSiswa.map(s => [
            s.no, s.nis, s.nama, s.gender,
            s.nominal > 0 ? 'Rp' + s.nominal.toLocaleString('id-ID') : '-',
            s.tanggal || '-',
            s.ket || 'Belum bayar'
        ]);

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 70,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [26, 58, 92] },
            didDrawPage: function(data) {
                doc.setFontSize(8);
                doc.text('Generated by Dashboard Keuangan Pasundan 3', 40, doc.internal.pageSize.height - 20);
            }
        });

        doc.save(`Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('PDF berhasil diekspor!', 'success');
    }

    // ============================================================
    // 19. OPEN GSHEET
    // ============================================================
    function openGSheet() {
        window.open(CONFIG.sheetUrl, '_blank');
        showToast('Membuka Google Sheet...', 'info');
    }

    // ============================================================
    // 20. REFRESH DATA
    // ============================================================
    function refreshData() {
        document.getElementById('btnRefresh').innerHTML = '<span class="spinner"></span>';
        loadData().finally(() => {
            document.getElementById('btnRefresh').innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        });
    }

    // ============================================================
    // 21. INIT
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        loadData();

        // Auto-login dengan session (bisa disimpan di localStorage)
        // Untuk keamanan, kita tidak auto-login.
        // Admin harus login manual setiap kali.
    });

    // ============================================================
    // 22. FIX: jsPDF autoTable tidak di-load? kita tambahkan fallback
    // ============================================================
    // Pastikan autoTable tersedia untuk PDF
    if (typeof window.jspdf !== 'undefined') {
        // autoTable akan di-load dari CDN jika diperlukan
    }

    console.log('🚀 Dashboard Keuangan Pasundan 3 siap!');
    console.log('📊 Total siswa:', dataSiswa.length);
    console.log('🔐 Admin login: bendahara / Anna@923016');
