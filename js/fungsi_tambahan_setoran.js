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

    const now = new Date();
    const tanggalStr = now.toISOString().split('T')[0];
    const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Update data lokal
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

    saveToGSheet(payload)
        .then(result => {
            if (result.status === 'success') {
                showToast(`✅ Setoran Rp${nominal.toLocaleString('id-ID')} untuk ${siswa.nama} berhasil!`, 'success');
            } else {
                showToast(`⚠️ ${result.message || 'Data tersimpan lokal, sync tertunda.'}`, 'warning');
            }
            renderAll();
            document.getElementById('inputNominal').value = '';
            document.getElementById('inputNIS').value = '';
            document.getElementById('inputNama').value = '';
        })
        .catch(err => {
            showToast('⚠️ Gagal sync ke GSheet, tetapi data lokal sudah diupdate.', 'warning');
            renderAll();
        });
}
