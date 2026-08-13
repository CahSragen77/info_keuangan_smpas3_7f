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

    const payload = {
        action: 'addKasKeluar',
        keterangan: keterangan,
        jumlah: jumlah,
        tanggal: tanggalStr,
        jam: jamStr
    };

    saveToGSheet(payload)
        .then(result => {
            if (result.status === 'success') {
                showToast(`✅ Pengeluaran "${keterangan}" sebesar Rp${jumlah.toLocaleString('id-ID')} berhasil dicatat.`, 'success');
            } else {
                showToast(`⚠️ ${result.message || 'Data tersimpan lokal.'}`, 'warning');
            }
            renderAll();
            document.getElementById('inputKeteranganKeluar').value = '';
            document.getElementById('inputJumlahKeluar').value = '';
        })
        .catch(err => {
            showToast('⚠️ Gagal sync ke GSheet, data lokal sudah diupdate.', 'warning');
            renderAll();
        });
}
