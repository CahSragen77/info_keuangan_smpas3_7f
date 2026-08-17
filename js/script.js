 // ================================================================
        //  DATA & STATE
        // ================================================================
        let siswaData = [];
        let kasKeluarTotal = 0;
        let pengeluaranData = [];
        let editIndex = null;
        let isAdmin = false;
        let qrScannerInstance = null;
        let scannerActive = false;
        let historiData = [];
        let logData = [];
        const LOG_KEY = 'logPerubahan';
        const GAS_URL_KEY = 'gas_webapp_url';
        const PENGELUARAN_KEY = 'pengeluaranData';

        // ================================================================
        //  LOG
        // ================================================================
        function loadLog() {
            const stored = localStorage.getItem(LOG_KEY);
            if (stored) { try { logData = JSON.parse(stored); } catch (e) { logData = []; } } else { logData = []; }
        }

        function saveLog() { localStorage.setItem(LOG_KEY, JSON.stringify(logData)); }

        function catatLog(aksi, detail, admin = 'Admin') {
            const now = new Date();
            const timestamp = now.toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            logData.push({
                waktu: now.toISOString(),
                timestamp: timestamp,
                admin: admin,
                aksi: aksi,
                detail: detail
            });
            if (logData.length > 100) logData = logData.slice(-100);
            saveLog();
            updateNotifikasi();
            renderLog();
        }

        function updateNotifikasi() {
            const banner = document.getElementById('notifikasiUpdate');
            if (!banner) return;
            if (logData.length === 0) {
                banner.innerHTML = '<i class="fas fa-info-circle"></i> Belum ada perubahan data.';
                return;
            }
            const last = logData[logData.length - 1];
            banner.innerHTML =
                `<i class="fas fa-sync-alt"></i> Data terakhir diperbarui: <strong>${last.timestamp}</strong> (${last.aksi}: ${last.detail})`;
        }

        function renderLog() {
            const tbody = document.getElementById('logBody');
            if (!tbody) return;
            tbody.innerHTML = '';
            const logs = [...logData].reverse();
            logs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="white-space:nowrap;">${log.timestamp}</td>
                    <td>${log.admin}</td>
                    <td><span class="badge-soft">${log.aksi}</span></td>
                    <td>${log.detail}</td>
                `;
                tbody.appendChild(tr);
            });
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Belum ada log</td></tr>';
            }
        }

        // ================================================================
        //  PENGELUARAN DATA
        // ================================================================
        function loadPengeluaran() {
            const stored = localStorage.getItem(PENGELUARAN_KEY);
            if (stored) { try { pengeluaranData = JSON.parse(stored); } catch (e) { pengeluaranData = []; } } else { pengeluaranData = []; }
        }

        function savePengeluaran() { localStorage.setItem(PENGELUARAN_KEY, JSON.stringify(pengeluaranData)); }

        // ================================================================
        //  DATA DEFAULT (41 siswa)
        // ================================================================
        const DEFAULT_DATA = [
            { nis: "2627.07011", nama: "Adzkiya Livia Marsha", gender: "P", nominal: 50000, tanggal: "2026-11-08",
                ket: "5 bln", status: "Sudah Bayar" },
            { nis: "2627.07012", nama: "Afif Ahlan Firdaus", gender: "L", nominal: 10000, tanggal: "2026-12-08",
                ket: "1 bln", status: "Sudah Bayar" },
            { nis: "2627.07017", nama: "Ainun Shofie Salsabila", gender: "P", nominal: 30000, tanggal: "2026-08-12",
                ket: "3 bln", status: "Sudah Bayar" },
            { nis: "2627.07022", nama: "Akhfan Damantri", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07028", nama: "Aldi Gunawan", gender: "L", nominal: 30000, tanggal: "2026-08-13", ket: "3 bln",
                status: "Sudah Bayar" },
            { nis: "2627.07038", nama: "Alma Syakira Rosdiana", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07046", nama: "Ana Putri Rahayu", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07047", nama: "Anatasya Shakila Nur Zahira", gender: "P", nominal: 50000, tanggal: "2026-08-11",
                ket: "5 bln", status: "Sudah Bayar" },
            { nis: "2627.07053", nama: "Anisa Suargana", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07076", nama: "Aura Aprilia Putri Dian", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07081", nama: "Azzam Nur Habibi", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07101", nama: "Devina Putri Maulana", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07102", nama: "Devita Jelli Yanti", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07111", nama: "Ezra Naufal Attalah", gender: "L", nominal: 30000, tanggal: "2026-08-13",
                ket: "3 bln", status: "Sudah Bayar" },
            { nis: "2627.07114", nama: "Fahri Naufal", gender: "L", nominal: 20000, tanggal: "2026-08-14", ket: "2 bln",
                status: "Sudah Bayar" },
            { nis: "2627.07133", nama: "Irsyad Hakiki Alfarizki", gender: "L", nominal: 20000, tanggal: "2026-08-14",
                ket: "2 bln", status: "Sudah Bayar" },
            { nis: "2627.07138", nama: "Jovita Novi Nugraha", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07141", nama: "Kafka Dwi Putra Komarudin", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07156", nama: "Kirana Jahira Putri", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07165", nama: "Marisa Gracelyn", gender: "P", nominal: 50000, tanggal: "2026-08-11",
                ket: "5 bln", status: "Sudah Bayar" },
            { nis: "2627.07183", nama: "Muhammad Elfiansyah Sputra", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07191", nama: "Muhammad Adzikri Rachmadi", gender: "L", nominal: 10000, tanggal: "2026-08-14",
                ket: "1 bln", status: "Sudah Bayar" },
            { nis: "2627.07205", nama: "Muhammad Rajes Cahyana", gender: "L", nominal: 20000, tanggal: "2026-08-15",
                ket: "2 bln", status: "Sudah Bayar" },
            { nis: "2627.07208", nama: "Muhammad Rivky Putra Sobandi", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07211", nama: "Mutyara Septini Putri", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07221", nama: "Nasya Talitha Azalia Gunawan", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07223", nama: "Naura Hazna Alia", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07231", nama: "Nayla Azzahra", gender: "P", nominal: 30000, tanggal: "2026-08-14", ket: "3 bln",
                status: "Sudah Bayar" },
            { nis: "2627.07238", nama: "Nizam Muhammad Javier", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07253", nama: "Raka Rasyad Fadil", gender: "L", nominal: 50000, tanggal: "2026-08-14",
                ket: "5 bln", status: "Sudah Bayar" },
            { nis: "2627.07256", nama: "Ranishya Putia Maharani", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07271", nama: "Restu Triazmi", gender: "L", nominal: 0, tanggal: "", ket: "",
            status: "Belum Bayar" },
            { nis: "2627.07278", nama: "Rhama Aldzikri Mulyadi", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07280", nama: "Ridwan Alfaruq", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07294", nama: "Selly Zahira Putri", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07300", nama: "Silva Guniyanti S", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07303", nama: "Sofia Putri Kurnia Ramadhan", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07304", nama: "Sopian", gender: "L", nominal: 0, tanggal: "", ket: "", status: "Belum Bayar" },
            { nis: "2627.07316", nama: "Wendi Nugraha", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07323", nama: "Zia Zerlina Putrie Sugianto", gender: "P", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" },
            { nis: "2627.07325", nama: "Zilzian Noer Setiawan", gender: "L", nominal: 0, tanggal: "", ket: "",
                status: "Belum Bayar" }
        ];

        // ================================================================
        //  LOAD / SAVE SISWA
        // ================================================================
        function loadData() {
            const stored = localStorage.getItem('siswaData');
            const storedKas = localStorage.getItem('kasKeluarTotal');
            if (stored) {
                try { siswaData = JSON.parse(stored); } catch (e) { siswaData = JSON.parse(JSON.stringify(DEFAULT_DATA)); }
            } else {
                siswaData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                normalizeData();
            }
            if (storedKas) kasKeluarTotal = parseFloat(storedKas) || 0;
            else kasKeluarTotal = 0;
            saveData();
            saveKas();
        }

        function normalizeData() {
            siswaData.forEach(s => {
                if (s.nominal > 0 && !s.ket) s.ket = Math.floor(s.nominal / 10000) + ' bln';
                if (s.nominal > 0 && !s.status) s.status = 'Sudah Bayar';
                if (s.nominal === 0 && !s.status) s.status = 'Belum Bayar';
                if (!s.tanggal && s.nominal > 0) s.tanggal = new Date().toISOString().slice(0, 10);
                if (!s.gender) s.gender = 'L';
                if (!s.nis) s.nis = 'N/A';
                if (!s.nama) s.nama = 'Tidak Diketahui';
            });
        }

        function saveData() { localStorage.setItem('siswaData', JSON.stringify(siswaData)); }

        function saveKas() { localStorage.setItem('kasKeluarTotal', String(kasKeluarTotal)); }

        // ================================================================
        //  RENDER TABLE
        // ================================================================
        function renderTable() {
            const search = document.getElementById('searchInput').value.toLowerCase().trim();
            const statusFilter = document.getElementById('statusFilter').value;
            let filtered = siswaData.filter((s) => {
                const matchNama = s.nama.toLowerCase().includes(search);
                const matchNis = s.nis.toLowerCase().includes(search);
                const matchStatus = statusFilter === 'all' || s.status === statusFilter;
                return (matchNama || matchNis) && matchStatus;
            });

            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            filtered.forEach((s, idx) => {
                const tr = document.createElement('tr');
                const qrUrl =
                    `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(s.nis)}`;
                const showActions = isAdmin;
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td><strong>${s.nis}</strong></td>
                    <td>${s.nama}</td>
                    <td>${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>Rp${formatNumber(s.nominal)}</td>
                    <td>${s.tanggal || '-'}</td>
                    <td>${s.ket || '-'}</td>
                    <td><span class="status-badge ${s.status === 'Sudah Bayar' ? 'status-sudah' : 'status-belum'}">${s.status}</span></td>
                    <td class="qr-code"><img src="${qrUrl}" alt="QR" loading="lazy" /></td>
                    <td>
                        ${showActions ? `
                        <div class="action-btns">
                            <button class="edit-btn" onclick="editSiswa(${idx})" title="Edit"><i class="fas fa-pen"></i></button>
                            <button class="delete-btn" onclick="hapusSiswa(${idx})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>` : `<span class="text-xs text-muted"><i class="fas fa-lock"></i> read-only</span>`}
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const footer = document.getElementById('tableFooter');
            const totalNominal = siswaData.reduce((sum, s) => sum + (s.nominal || 0), 0);
            const totalSiswa = siswaData.length;
            footer.innerHTML = `
                <tr class="total-row">
                    <td colspan="4" style="text-align:right;">TOTAL</td>
                    <td>Rp${formatNumber(totalNominal)}</td>
                    <td colspan="2"></td>
                    <td>Total Siswa: ${totalSiswa}</td>
                    <td colspan="2"></td>
                </tr>
            `;

            const sudah = siswaData.filter(s => s.status === 'Sudah Bayar').length;
            const belum = siswaData.filter(s => s.status === 'Belum Bayar').length;
            const totalMasuk = siswaData.reduce((sum, s) => sum + (s.nominal || 0), 0);
            const saldo = totalMasuk - kasKeluarTotal;
            const persenSudah = totalSiswa > 0 ? Math.round((sudah / totalSiswa) * 100) : 0;
            const persenBelum = totalSiswa > 0 ? Math.round((belum / totalSiswa) * 100) : 0;

            document.getElementById('totalSiswa').textContent = totalSiswa;
            document.getElementById('sudahBayar').textContent = sudah;
            document.getElementById('belumBayar').textContent = belum;
            document.getElementById('sudahBayarPersen').textContent = persenSudah + '%';
            document.getElementById('belumBayarPersen').textContent = persenBelum + '%';
            document.getElementById('totalMasuk').textContent = 'Rp' + formatNumber(totalMasuk);
            document.getElementById('totalKeluar').textContent = 'Rp' + formatNumber(kasKeluarTotal);
            document.getElementById('saldo').textContent = 'Rp' + formatNumber(saldo);
            document.getElementById('saldoSub').textContent =
                `Kas masuk Rp${formatNumber(totalMasuk)} - keluar Rp${formatNumber(kasKeluarTotal)}`;

            updateCharts();
            renderLog();
        }

        function formatNumber(n) { return Number(n).toLocaleString('id-ID'); }

        // ================================================================
        //  CHARTS
        // ================================================================
        let statusChartInstance = null,
            genderChartInstance = null;

        function updateCharts() {
            const statusCount = { 'Sudah Bayar': 0, 'Belum Bayar': 0 };
            const genderCount = { 'L': 0, 'P': 0 };
            siswaData.forEach(s => {
                if (s.status === 'Sudah Bayar') statusCount['Sudah Bayar']++;
                else statusCount['Belum Bayar']++;
                if (s.gender === 'L') genderCount['L']++;
                else if (s.gender === 'P') genderCount['P']++;
            });

            const ctx1 = document.getElementById('statusChart').getContext('2d');
            const ctx2 = document.getElementById('genderChart').getContext('2d');

            if (statusChartInstance) statusChartInstance.destroy();
            statusChartInstance = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: ['Sudah Bayar', 'Belum Bayar'],
                    datasets: [{ data: [statusCount['Sudah Bayar'], statusCount['Belum Bayar']], backgroundColor: [
                            '#10b981', '#ef4444'
                        ], borderWidth: 0, hoverOffset: 8 }]
                },
                options: {
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11,
                                family: 'Inter' }, padding: 12 } } },
                    maintainAspectRatio: true,
                    responsive: true,
                    cutout: '68%'
                }
            });

            if (genderChartInstance) genderChartInstance.destroy();
            genderChartInstance = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['Laki-laki', 'Perempuan'],
                    datasets: [{ data: [genderCount['L'], genderCount['P']], backgroundColor: ['#2a5298',
                            '#e84393'], borderWidth: 0, hoverOffset: 8 }]
                },
                options: {
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11,
                                family: 'Inter' }, padding: 12 } } },
                    maintainAspectRatio: true,
                    responsive: true
                }
            });
        }

        // ================================================================
        //  CRUD
        // ================================================================
        function editSiswa(index) {
            if (!isAdmin) { toast('Login dulu untuk mengedit', 'warning'); return; }
            const s = siswaData[index];
            editIndex = index;
            document.getElementById('editNis').value = s.nis;
            document.getElementById('editNama').value = s.nama;
            document.getElementById('editGender').value = s.gender;
            document.getElementById('editNominal').value = s.nominal || 0;
            document.getElementById('editTanggal').value = s.tanggal || '';
            document.getElementById('editStatus').value = s.status || 'Belum Bayar';
            document.getElementById('adminPanel').classList.add('visible');
            document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth' });
        }

        function simpanEdit() {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            if (editIndex === null) { toast('Pilih siswa terlebih dahulu', 'warning'); return; }
            const nis = document.getElementById('editNis').value.trim();
            const nama = document.getElementById('editNama').value.trim();
            const gender = document.getElementById('editGender').value;
            let nominal = parseFloat(document.getElementById('editNominal').value) || 0;
            const tanggal = document.getElementById('editTanggal').value;
            const status = document.getElementById('editStatus').value;
            if (!nis || !nama) { toast('NIS dan Nama wajib diisi', 'error'); return; }
            const ket = nominal > 0 ? Math.floor(nominal / 10000) + ' bln' : '';

            const oldData = siswaData[editIndex];
            const perubahan = [];
            if (oldData.nama !== nama) perubahan.push('nama: ' + oldData.nama + ' → ' + nama);
            if (oldData.nominal !== nominal) perubahan.push('nominal: ' + oldData.nominal + ' → ' + nominal);
            if (oldData.status !== status) perubahan.push('status: ' + oldData.status + ' → ' + status);
            if (oldData.gender !== gender) perubahan.push('gender: ' + oldData.gender + ' → ' + gender);
            if (oldData.tanggal !== tanggal) perubahan.push('tanggal: ' + oldData.tanggal + ' → ' + tanggal);
            if (perubahan.length === 0) perubahan.push('tidak ada perubahan');

            siswaData[editIndex] = { nis, nama, gender, nominal, tanggal, ket, status };
            saveData();
            renderTable();
            catatLog('Edit Siswa', `NIS ${nis} (${nama}) - ${perubahan.join('; ')}`);
            toast('Data berhasil diperbarui', 'success');
            editIndex = null;
        }

        function hapusSiswa(index) {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            if (!confirm('Yakin hapus data ini?')) return;
            const s = siswaData[index];
            siswaData.splice(index, 1);
            saveData();
            renderTable();
            catatLog('Hapus Siswa', `NIS ${s.nis} (${s.nama}) - nominal Rp${s.nominal}`);
            toast('Data dihapus', 'success');
        }

        function hapusTerpilih() {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            if (editIndex !== null) {
                const s = siswaData[editIndex];
                siswaData.splice(editIndex, 1);
                editIndex = null;
                saveData();
                renderTable();
                catatLog('Hapus Siswa', `NIS ${s.nis} (${s.nama}) - nominal Rp${s.nominal}`);
                toast('Data dihapus', 'success');
                document.getElementById('adminPanel').classList.remove('visible');
            } else {
                toast('Pilih data yang akan dihapus (klik edit dulu)', 'warning');
            }
        }

        function resetData() {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            if (!confirm('⚠️ Reset semua data ke default? Semua perubahan akan hilang!')) return;
            siswaData = JSON.parse(JSON.stringify(DEFAULT_DATA));
            normalizeData();
            kasKeluarTotal = 0;
            saveData();
            saveKas();
            renderTable();
            catatLog('Reset Data', 'Semua data dikembalikan ke default');
            toast('Data direset ke default', 'success');
            document.getElementById('adminPanel').classList.remove('visible');
        }

        // ================================================================
        //  TAMBAH SETORAN
        // ================================================================
        function tambahSetoran() {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            const nis = document.getElementById('editNis').value.trim();
            if (!nis) { toast('Masukkan NIS di form edit', 'warning'); return; }
            const idx = siswaData.findIndex(s => s.nis === nis);
            if (idx === -1) { toast('NIS tidak ditemukan', 'error'); return; }
            const nominalTambahan = 10000;
            const now = new Date();
            const tanggalStr = now.toISOString().slice(0, 10);
            siswaData[idx].nominal = (siswaData[idx].nominal || 0) + nominalTambahan;
            siswaData[idx].tanggal = tanggalStr;
            siswaData[idx].ket = Math.floor(siswaData[idx].nominal / 10000) + ' bln';
            siswaData[idx].status = 'Sudah Bayar';
            saveData();
            renderTable();
            catatLog('Tambah Setoran', `NIS ${nis} (${siswaData[idx].nama}) +Rp10.000 (total Rp${siswaData[idx].nominal})`);
            toast(`Setoran Rp10.000 untuk ${siswaData[idx].nama} berhasil`, 'success');
        }

        // ================================================================
        //  KAS KELUAR
        // ================================================================
        function tambahKasKeluar() {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            const input = document.getElementById('kasKeluarInput');
            const val = parseFloat(input.value);
            if (!val || val <= 0) { toast('Masukkan nominal pengeluaran yang valid', 'warning'); return; }
            const deskripsi = prompt('Deskripsi pengeluaran (opsional):', 'Pengeluaran kas') || 'Pengeluaran kas';
            const now = new Date();
            const tanggalStr = now.toISOString().slice(0, 10);
            pengeluaranData.push({
                tanggal: tanggalStr,
                deskripsi: deskripsi,
                nominal: val
            });
            savePengeluaran();
            kasKeluarTotal += val;
            saveKas();
            renderTable();
            catatLog('Kas Keluar', `Rp${formatNumber(val)} - ${deskripsi}`);
            toast(`Pengeluaran Rp${formatNumber(val)} dicatat`, 'success');
            input.value = '';
        }

        // ================================================================
        //  EXPORT MAIN (Excel, PDF, Google Sheet)
        // ================================================================
        function exportExcel() {
            const data = siswaData.map((s, idx) => ({
                'No': idx + 1,
                'NIS': s.nis,
                'Nama Siswa': s.nama,
                'L/P': s.gender,
                'Nominal Masuk': s.nominal || 0,
                'Ket': s.ket || '',
                'Tanggal': s.tanggal || ''
            }));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
            XLSX.writeFile(wb, `Laporan_Keuangan_${new Date().toISOString().slice(0,10)}.xlsx`);
            toast('Excel berhasil diunduh', 'success');
        }

        function exportPDF() {
            const totalSiswa = siswaData.length;
            const totalMasuk = siswaData.reduce((sum, s) => sum + (s.nominal || 0), 0);
            const saldo = totalMasuk - kasKeluarTotal;
            const now = new Date();
            const tanggalCetak = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });

            let rows = '';
            siswaData.forEach((s, idx) => {
                const no = idx + 1;
                const nis = s.nis || '-';
                const nama = s.nama || '-';
                const gender = s.gender || '-';
                const nominal = s.nominal || 0;
                const ket = s.ket || '-';
                const tgl = s.tanggal || '-';
                rows += `<tr>
                    <td style="text-align:center;">${no}</td>
                    <td style="text-align:center;">${nis}</td>
                    <td class="left">${nama}</td>
                    <td style="text-align:center;">${gender}</td>
                    <td style="text-align:right;padding-right:6px;">Rp ${formatNumber(nominal)}</td>
                    <td style="text-align:center;">${ket}</td>
                    <td style="text-align:center;">${tgl}</td>
                </tr>`;
            });

            const pdfHtml = `
            <div class="pdf-report">
                <div class="pdf-header">
                    <h1>SMP Pasundan 3</h1>
                    <h2>Laporan Administrasi Keuangan &amp; Iuran Siswa</h2>
                    <div class="date">Tanggal Cetak: ${tanggalCetak}</div>
                </div>
                <div class="pdf-summary">
                    <span>Total Siswa: ${totalSiswa}</span> |
                    <span>Total Masuk: Rp ${formatNumber(totalMasuk)}</span> |
                    <span>Kas Keluar: Rp ${formatNumber(kasKeluarTotal)}</span> |
                    <span>Saldo Bersih: Rp ${formatNumber(saldo)}</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:6%;">No</th>
                            <th style="width:14%;">NIS</th>
                            <th style="width:28%;">Nama Siswa</th>
                            <th style="width:6%;">L/P</th>
                            <th style="width:18%;">Nominal Masuk</th>
                            <th style="width:14%;">Ket</th>
                            <th style="width:14%;">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
                <div class="footer-note">
                    Laporan ini dihasilkan secara otomatis oleh sistem.
                </div>
            </div>
            `;

            const container = document.getElementById('pdf-export-container');
            container.style.display = 'block';
            container.innerHTML = pdfHtml;

            html2pdf()
                .set({
                    margin: 0.4,
                    filename: `Laporan_Keuangan_Pasundan3_${now.toISOString().slice(0,10)}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                })
                .from(container)
                .save()
                .then(() => {
                    container.style.display = 'none';
                    toast('PDF berhasil diunduh', 'success');
                })
                .catch(err => {
                    container.style.display = 'none';
                    toast('Gagal generate PDF: ' + err.message, 'error');
                });
        }

        function exportGS() {
            const url = `https://docs.google.com/spreadsheets/d/1SIMULASI_${Date.now()}`;
            navigator.clipboard.writeText(url).then(() => {
                toast('Link Google Sheet (simulasi) disalin ke clipboard', 'success');
            }).catch(() => {
                toast('Link: ' + url, 'info');
            });
        }

        // ================================================================
        //  LAPORAN PERIODE
        // ================================================================
        function toggleCustomRange() {
            const val = document.getElementById('periodeSelect').value;
            const custom = document.getElementById('customRange');
            if (val === 'custom') {
                custom.classList.add('show');
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                document.getElementById('tglAwal').value = firstDay.toISOString().slice(0, 10);
                document.getElementById('tglAkhir').value = lastDay.toISOString().slice(0, 10);
            } else {
                custom.classList.remove('show');
            }
            renderLaporan();
        }

        function renderLaporan() {
            const periode = document.getElementById('periodeSelect').value;
            const container = document.getElementById('laporanContainer');
            const exportBtns = document.getElementById('laporanExportBtns');
            let tglAwal, tglAkhir;
            const now = new Date();

            if (periode === 'minggu') {
                const hari = now.getDay();
                const selisih = hari === 0 ? 6 : hari - 1;
                const senin = new Date(now);
                senin.setDate(now.getDate() - selisih);
                tglAwal = senin.toISOString().slice(0, 10);
                const minggu = new Date(senin);
                minggu.setDate(senin.getDate() + 6);
                tglAkhir = minggu.toISOString().slice(0, 10);
            } else if (periode === 'bulan') {
                tglAwal = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                tglAkhir = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
            } else {
                tglAwal = document.getElementById('tglAwal').value;
                tglAkhir = document.getElementById('tglAkhir').value;
                if (!tglAwal || !tglAkhir) {
                    container.innerHTML = '<p class="text-muted">Silakan pilih tanggal awal dan akhir.</p>';
                    exportBtns.classList.remove('show');
                    return;
                }
            }

            // Filter transaksi
            const masuk = siswaData.filter(s => s.tanggal && s.tanggal >= tglAwal && s.tanggal <= tglAkhir);
            const keluar = pengeluaranData.filter(p => p.tanggal >= tglAwal && p.tanggal <= tglAkhir);

            const totalMasuk = masuk.reduce((sum, s) => sum + (s.nominal || 0), 0);
            const totalKeluar = keluar.reduce((sum, p) => sum + (p.nominal || 0), 0);

            const semuaMasuk = siswaData.filter(s => s.tanggal && s.tanggal < tglAwal);
            const semuaKeluar = pengeluaranData.filter(p => p.tanggal < tglAwal);
            const saldoAwal = semuaMasuk.reduce((sum, s) => sum + (s.nominal || 0), 0) -
                semuaKeluar.reduce((sum, p) => sum + (p.nominal || 0), 0);
            const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

            container.innerHTML = `
                <div style="background:#f8fafc; border-radius:10px; padding:16px; overflow-x:auto;">
                    <table style="width:100%; min-width:400px; font-size:0.9rem;">
                        <thead>
                            <tr><th style="background:#e5e9f0; padding:8px; text-align:left;">Keterangan</th>
                                <th style="background:#e5e9f0; padding:8px; text-align:right;">Nominal</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Saldo Awal (sebelum ${tglAwal})</td><td style="text-align:right;">Rp ${formatNumber(saldoAwal)}</td></tr>
                            <tr><td>Total Kas Masuk (${masuk.length} transaksi)</td><td style="text-align:right;">Rp ${formatNumber(totalMasuk)}</td></tr>
                            <tr><td>Total Kas Keluar (${keluar.length} transaksi)</td><td style="text-align:right;">Rp ${formatNumber(totalKeluar)}</td></tr>
                            <tr style="border-top:2px solid #0f1a2f; font-weight:700;">
                                <td>Saldo Akhir per ${tglAkhir}</td>
                                <td style="text-align:right;">Rp ${formatNumber(saldoAkhir)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top:8px; font-size:0.75rem; color:var(--text-muted);">
                        <i class="fas fa-calendar-alt"></i> Periode: ${tglAwal} s/d ${tglAkhir}
                    </div>
                </div>
            `;
            exportBtns.classList.add('show');
        }

        // ================================================================
        //  EXPORT LAPORAN PERIODE
        // ================================================================
        function exportLaporanExcel() {
            const tglAwal = document.getElementById('tglAwal').value;
            const tglAkhir = document.getElementById('tglAkhir').value;
            if (!tglAwal || !tglAkhir) {
                toast('Pilih periode terlebih dahulu', 'warning');
                return;
            }

            const masuk = siswaData.filter(s => s.tanggal && s.tanggal >= tglAwal && s.tanggal <= tglAkhir);
            const keluar = pengeluaranData.filter(p => p.tanggal >= tglAwal && p.tanggal <= tglAkhir);
            const semuaMasuk = siswaData.filter(s => s.tanggal && s.tanggal < tglAwal);
            const semuaKeluar = pengeluaranData.filter(p => p.tanggal < tglAwal);

            const totalMasuk = masuk.reduce((sum, s) => sum + (s.nominal || 0), 0);
            const totalKeluar = keluar.reduce((sum, p) => sum + (p.nominal || 0), 0);
            const saldoAwal = semuaMasuk.reduce((sum, s) => sum + (s.nominal || 0), 0) -
                semuaKeluar.reduce((sum, p) => sum + (p.nominal || 0), 0);
            const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

            const wb = XLSX.utils.book_new();

            const summaryData = [
                ['LAPORAN KAS PERIODE'],
                ['Periode', tglAwal, 's/d', tglAkhir],
                [],
                ['Keterangan', 'Nominal'],
                ['Saldo Awal', saldoAwal],
                ['Total Kas Masuk', totalMasuk],
                ['Total Kas Keluar', totalKeluar],
                ['Saldo Akhir', saldoAkhir]
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

            if (masuk.length > 0) {
                const detailMasuk = masuk.map(s => ({
                    'NIS': s.nis,
                    'Nama': s.nama,
                    'Nominal': s.nominal,
                    'Tanggal': s.tanggal,
                    'Keterangan': s.ket || '-'
                }));
                const ws2 = XLSX.utils.json_to_sheet(detailMasuk);
                XLSX.utils.book_append_sheet(wb, ws2, 'Detail Masuk');
            } else {
                const ws2 = XLSX.utils.aoa_to_sheet([['Tidak ada transaksi masuk pada periode ini']]);
                XLSX.utils.book_append_sheet(wb, ws2, 'Detail Masuk');
            }

            if (keluar.length > 0) {
                const detailKeluar = keluar.map(p => ({
                    'Tanggal': p.tanggal,
                    'Deskripsi': p.deskripsi,
                    'Nominal': p.nominal
                }));
                const ws3 = XLSX.utils.json_to_sheet(detailKeluar);
                XLSX.utils.book_append_sheet(wb, ws3, 'Detail Keluar');
            } else {
                const ws3 = XLSX.utils.aoa_to_sheet([['Tidak ada transaksi keluar pada periode ini']]);
                XLSX.utils.book_append_sheet(wb, ws3, 'Detail Keluar');
            }

            const fileName = `Laporan_Periode_${tglAwal}_sampai_${tglAkhir}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast('Laporan Excel berhasil diunduh', 'success');
        }

        function exportLaporanPDF() {
            const tglAwal = document.getElementById('tglAwal').value;
            const tglAkhir = document.getElementById('tglAkhir').value;
            if (!tglAwal || !tglAkhir) {
                toast('Pilih periode terlebih dahulu', 'warning');
                return;
            }

            const masuk = siswaData.filter(s => s.tanggal && s.tanggal >= tglAwal && s.tanggal <= tglAkhir);
            const keluar = pengeluaranData.filter(p => p.tanggal >= tglAwal && p.tanggal <= tglAkhir);
            const semuaMasuk = siswaData.filter(s => s.tanggal && s.tanggal < tglAwal);
            const semuaKeluar = pengeluaranData.filter(p => p.tanggal < tglAwal);

            const totalMasuk = masuk.reduce((sum, s) => sum + (s.nominal || 0), 0);
            const totalKeluar = keluar.reduce((sum, p) => sum + (p.nominal || 0), 0);
            const saldoAwal = semuaMasuk.reduce((sum, s) => sum + (s.nominal || 0), 0) -
                semuaKeluar.reduce((sum, p) => sum + (p.nominal || 0), 0);
            const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

            const now = new Date();
            const tanggalCetak = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            let detailMasukRows = '';
            masuk.forEach(s => {
                detailMasukRows += `<tr>
                    <td>${s.nis}</td>
                    <td>${s.nama}</td>
                    <td style="text-align:right;">Rp ${formatNumber(s.nominal)}</td>
                    <td>${s.tanggal}</td>
                </tr>`;
            });
            if (!detailMasukRows) detailMasukRows = '<tr><td colspan="4" style="text-align:center;">Tidak ada transaksi masuk</td></tr>';

            let detailKeluarRows = '';
            keluar.forEach(p => {
                detailKeluarRows += `<tr>
                    <td>${p.deskripsi}</td>
                    <td style="text-align:right;">Rp ${formatNumber(p.nominal)}</td>
                    <td>${p.tanggal}</td>
                </tr>`;
            });
            if (!detailKeluarRows) detailKeluarRows = '<tr><td colspan="3" style="text-align:center;">Tidak ada transaksi keluar</td></tr>';

            const pdfHtml = `
            <div class="pdf-report">
                <div class="pdf-header">
                    <h1>SMP Pasundan 3</h1>
                    <h2>Laporan Kas Periode</h2>
                    <div class="date">Periode: ${tglAwal} s/d ${tglAkhir} | Cetak: ${tanggalCetak}</div>
                </div>
                
                <div style="margin-bottom:16px;">
                    <table style="width:50%; margin:0 auto; border:1px solid #888;">
                        <tr><td style="font-weight:700;">Saldo Awal</td><td style="text-align:right;">Rp ${formatNumber(saldoAwal)}</td></tr>
                        <tr><td style="font-weight:700;">Total Kas Masuk</td><td style="text-align:right;">Rp ${formatNumber(totalMasuk)}</td></tr>
                        <tr><td style="font-weight:700;">Total Kas Keluar</td><td style="text-align:right;">Rp ${formatNumber(totalKeluar)}</td></tr>
                        <tr style="border-top:2px solid #000; font-weight:700;"><td>Saldo Akhir</td><td style="text-align:right;">Rp ${formatNumber(saldoAkhir)}</td></tr>
                    </table>
                </div>

                <h3 style="text-align:center; margin-top:20px;">Detail Kas Masuk</h3>
                <table>
                    <thead><tr><th>NIS</th><th>Nama</th><th>Nominal</th><th>Tanggal</th></tr></thead>
                    <tbody>${detailMasukRows}</tbody>
                </table>

                <h3 style="text-align:center; margin-top:20px;">Detail Kas Keluar</h3>
                <table>
                    <thead><tr><th>Deskripsi</th><th>Nominal</th><th>Tanggal</th></tr></thead>
                    <tbody>${detailKeluarRows}</tbody>
                </table>

                <div class="footer-note">
                    Laporan ini dihasilkan secara otomatis oleh sistem.
                </div>
            </div>
            `;

            const container = document.getElementById('pdf-export-container');
            container.style.display = 'block';
            container.innerHTML = pdfHtml;

            html2pdf()
                .set({
                    margin: 0.4,
                    filename: `Laporan_Kas_Periode_${tglAwal}_sampai_${tglAkhir}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                })
                .from(container)
                .save()
                .then(() => {
                    container.style.display = 'none';
                    toast('Laporan PDF berhasil diunduh', 'success');
                })
                .catch(err => {
                    container.style.display = 'none';
                    toast('Gagal generate PDF: ' + err.message, 'error');
                });
        }

        // ================================================================
        //  GAS SYNC
        // ================================================================
        const GAS_URL =
            'https://script.google.com/macros/s/AKfycbylkBNay187mpBRdh714BP2wXwoI6zAbbDV-Qie8ruxOWxys9vrhLEOgS3uEI7mjsGA/exec';
        const GAS_TOKEN = 'SMP_TABUNGAN_2026';

        function setGasUrl() {
            const url = document.getElementById('gasUrlInput').value.trim();
            if (!url) { toast('Masukkan URL GAS', 'warning'); return; }
            localStorage.setItem(GAS_URL_KEY, url);
            document.getElementById('gasStatus').textContent = '✅ URL tersimpan: ' + url;
            toast('URL GAS berhasil disimpan', 'success');
        }

        async function syncData() {
            const btn = document.querySelector('.btn-sync');
            const gasUrl = localStorage.getItem(GAS_URL_KEY) || GAS_URL;
            if (btn) btn.classList.add('loading');
            toast('🔄 Sinkronisasi data...', 'info');

            try {
                const url = new URL(gasUrl);
                url.searchParams.set('action', 'read');
                url.searchParams.set('token', GAS_TOKEN);

                const response = await fetch(url.toString());
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const result = await response.json();
                if (!result.success) throw new Error(result.error || 'Gagal sync');

                const remoteSiswa = result.data.siswa || [];
                const remoteKeluar = result.data.keluar || [];

                // OVERWRITE siswa
                const newData = remoteSiswa.map(rs => {
                    const tglFormatted = rs.tglTerakhir ? rs.tglTerakhir.split('T')[0] : '';
                    return {
                        nis: rs.nis || '',
                        nama: rs.nama || '',
                        gender: rs.gender || '',
                        nominal: Number(rs.nominal) || 0,
                        tanggal: tglFormatted,
                        ket: rs.ket || (Number(rs.nominal) > 0 ? Math.floor(Number(rs.nominal) / 10000) +
                            ' bln' : ''),
                        status: rs.status || (Number(rs.nominal) > 0 ? 'Sudah Bayar' : 'Belum Bayar')
                    };
                });
                siswaData = newData;

                // Simpan pengeluaran dari GAS
                remoteKeluar.forEach(rk => {
                    const tgl = rk.waktu ? new Date(rk.waktu).toISOString().slice(0, 10) : new Date().toISOString()
                        .slice(0, 10);
                    pengeluaranData.push({
                        tanggal: tgl,
                        deskripsi: rk.keperluan || 'Pengeluaran',
                        nominal: Number(rk.nominal) || 0
                    });
                });
                savePengeluaran();

                let totalKeluar = 0;
                remoteKeluar.forEach(rk => { totalKeluar += Number(rk.nominal) || 0; });
                if (remoteKeluar.length > 0) {
                    kasKeluarTotal = totalKeluar;
                    saveKas();
                }

                saveData();
                renderTable();
                catatLog('Sync GAS', `${remoteSiswa.length} siswa (overwrite), ${remoteKeluar.length} pengeluaran`);
                toast(`✅ Sync berhasil! ${remoteSiswa.length} siswa diupdate.`, 'success');

            } catch (error) {
                console.error('❌ Sync error:', error);
                toast('❌ Gagal sync: ' + error.message, 'error');
            } finally {
                if (btn) btn.classList.remove('loading');
            }
        }

        function autoSync() {
            setInterval(() => {
                if (isAdmin) {
                    console.log('🔄 Auto-sync running...');
                    syncData();
                }
            }, 1800000);
        }

        // ================================================================
        //  UPLOAD EXCEL
        // ================================================================
        document.getElementById('fileInput').addEventListener('change', function(e) {
            if (!isAdmin) { toast('Login dulu untuk import', 'warning'); return; }
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const data = new Uint8Array(ev.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet);
                    if (!json || json.length === 0) { toast('File kosong atau format salah', 'error'); return; }
                    const newData = json.map(row => {
                        const nis = String(row['NIS'] || row['nis'] || row['No'] || '').trim();
                        const nama = String(row['Nama'] || row['nama'] || row['Nama Siswa'] || '').trim();
                        const gender = String(row['Gender'] || row['gender'] || row['L/P'] || 'L').trim()
                            .toUpperCase();
                        const nominal = parseFloat(row['Nominal'] || row['nominal'] || row['Nominal Masuk'] ||
                            0) || 0;
                        const tanggal = String(row['Tanggal'] || row['tanggal'] || '').trim();
                        const ket = String(row['Ket'] || row['ket'] || row['Ket (Bulan)'] || '').trim();
                        const status = String(row['Status'] || row['status'] || (nominal > 0 ? 'Sudah Bayar' :
                            'Belum Bayar')).trim();
                        return { nis, nama, gender, nominal, tanggal, ket, status };
                    }).filter(s => s.nis && s.nama);
                    if (newData.length === 0) { toast('Tidak ada data valid', 'error'); return; }
                    siswaData = newData;
                    normalizeData();
                    saveData();
                    renderTable();
                    catatLog('Import Excel', `${newData.length} data diimport`);
                    toast(`Berhasil import ${newData.length} data dari Excel`, 'success');
                    document.getElementById('uploadStatus').textContent = `✅ ${newData.length} data diimport`;
                } catch (err) {
                    toast('Gagal membaca file: ' + err.message, 'error');
                }
            };
            reader.readAsArrayBuffer(file);
            this.value = '';
        });

        // ================================================================
        //  QR SCANNER
        // ================================================================
        document.getElementById('scanQrBtn').addEventListener('click', function() {
            if (!isAdmin) { toast('Login dulu', 'warning'); return; }
            const container = document.getElementById('scannerContainer');
            if (container.style.display === 'block') {
                stopScanner();
                return;
            }
            container.style.display = 'block';
            startScanner();
        });

        function startScanner() {
            if (qrScannerInstance) {
                qrScannerInstance.clear();
                qrScannerInstance = null;
            }
            const readerEl = document.getElementById('qr-reader');
            readerEl.innerHTML = '';
            try {
                qrScannerInstance = new Html5Qrcode("qr-reader");
                const config = { fps: 15, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 };
                qrScannerInstance.start({ facingMode: "environment" },
                    config,
                    onScanSuccess,
                    onScanError
                );
                scannerActive = true;
                document.getElementById('scanResult').textContent = '📷 Menunggu scan QR...';
            } catch (err) {
                toast('Gagal inisialisasi kamera: ' + err.message, 'error');
                document.getElementById('scannerContainer').style.display = 'none';
            }
        }

        function onScanSuccess(decodedText, decodedResult) {
            const nis = decodedText.trim();
            document.getElementById('scanResult').textContent = `✅ Scan berhasil: NIS ${nis}`;
            document.getElementById('editNis').value = nis;
            const found = siswaData.find(s => s.nis === nis);
            if (found) {
                document.getElementById('editNama').value = found.nama;
                document.getElementById('editGender').value = found.gender;
                document.getElementById('editNominal').value = found.nominal || 0;
                document.getElementById('editTanggal').value = found.tanggal || '';
                document.getElementById('editStatus').value = found.status || 'Belum Bayar';
                toast('Data siswa ditemukan: ' + found.nama, 'success');
            } else {
                toast('NIS tidak ditemukan di database', 'warning');
            }
            stopScanner();
        }

        function onScanError(err) {}

        function stopScanner() {
            scannerActive = false;
            if (qrScannerInstance) {
                try {
                    qrScannerInstance.stop().then(() => {
                        qrScannerInstance.clear();
                        qrScannerInstance = null;
                    }).catch(() => {});
                } catch (e) {}
            }
            document.getElementById('scannerContainer').style.display = 'none';
            document.getElementById('scanResult').textContent = 'Arahkan QR ke kamera';
            const readerEl = document.getElementById('qr-reader');
            readerEl.innerHTML = '';
        }

        // ================================================================
        //  LOGIN / LOGOUT
        // ================================================================
        function checkLogin() {
            const stored = localStorage.getItem('isAdmin');
            if (stored === 'true') {
                isAdmin = true;
                document.getElementById('loginOverlay').classList.remove('show');
                document.getElementById('loginToggleBtn').classList.add('hidden');
                document.getElementById('logoutBtn').classList.remove('hidden');
                document.getElementById('adminPanel').classList.add('visible');
            } else {
                isAdmin = false;
                document.getElementById('loginOverlay').classList.remove('show');
                document.getElementById('loginToggleBtn').classList.remove('hidden');
                document.getElementById('logoutBtn').classList.add('hidden');
                document.getElementById('adminPanel').classList.remove('visible');
                stopScanner();
            }
            renderTable();
        }

        document.getElementById('loginBtn').addEventListener('click', function() {
            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value.trim();
            if (user === 'admin' && pass === 'admin123') {
                localStorage.setItem('isAdmin', 'true');
                isAdmin = true;
                document.getElementById('loginOverlay').classList.remove('show');
                document.getElementById('loginToggleBtn').classList.add('hidden');
                document.getElementById('logoutBtn').classList.remove('hidden');
                document.getElementById('adminPanel').classList.add('visible');
                document.getElementById('loginError').textContent = '';
                toast('Login berhasil', 'success');
                renderTable();
                setTimeout(autoSync, 5000);
            } else {
                document.getElementById('loginError').textContent = '❌ Username atau password salah';
            }
        });

        document.getElementById('loginToggleBtn').addEventListener('click', function() {
            document.getElementById('loginOverlay').classList.add('show');
        });

        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('isAdmin');
            isAdmin = false;
            document.getElementById('loginOverlay').classList.remove('show');
            document.getElementById('loginToggleBtn').classList.remove('hidden');
            document.getElementById('logoutBtn').classList.add('hidden');
            document.getElementById('adminPanel').classList.remove('visible');
            stopScanner();
            toast('Logout berhasil', 'info');
            renderTable();
        });

        document.getElementById('loginPass').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') document.getElementById('loginBtn').click();
        });
        document.getElementById('loginUser').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') document.getElementById('loginBtn').click();
        });

        // ================================================================
        //  TOAST
        // ================================================================
        function toast(msg, type = 'success') {
            const el = document.getElementById('toast');
            const msgEl = document.getElementById('toastMsg');
            const icon = el.querySelector('i');
            const icons = {
                success: 'fa-check-circle',
                warning: 'fa-exclamation-triangle',
                error: 'fa-times-circle',
                info: 'fa-info-circle'
            };
            icon.className = 'fas ' + (icons[type] || icons.success);
            msgEl.textContent = msg;
            el.classList.add('show');
            clearTimeout(el._timeout);
            el._timeout = setTimeout(() => el.classList.remove('show'), 3500);
        }

        // ================================================================
        //  HEADER DATE
        // ================================================================
        document.getElementById('headerDate').textContent = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // ================================================================
        //  INIT
        // ================================================================
        loadData();
        loadLog();
        loadPengeluaran();
        renderTable();
        checkLogin();

        // Load saved GAS URL
        const savedUrl = localStorage.getItem(GAS_URL_KEY);
        if (savedUrl) {
            document.getElementById('gasUrlInput').value = savedUrl;
            document.getElementById('gasStatus').textContent = '✅ URL tersimpan: ' + savedUrl;
        }

        console.log('✅ Dashboard Keuangan Sekolah siap!');
        console.log('🔐 Default login: admin / admin123');
        console.log('📊 Data tersimpan di local storage (overwrite saat sync)');
        console.log('📱 Scan QR untuk input NIS di panel admin');
        console.log('📄 PDF format laporan resmi SMP Pasundan 3');
        console.log('🔄 Auto-sync GAS setiap 30 menit (jika admin login)');
        console.log('🛒 Iklan Shopee & TikTok siap di footer');
