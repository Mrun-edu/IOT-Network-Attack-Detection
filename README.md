# IoT-23 Saldırı Tespiti — Çalıştırma Rehberi

Bu paket, "IoT Ağ Trafiğinde Yapay Zekâ Tabanlı Saldırı Tespiti" final projesi
için eksiksiz bir çözüm içerir.

## Paket İçeriği
- `iot_attack_detection.py`  → Ana pipeline (pcap→flow→ML→metrik+grafik)
- `build_report.js`          → Raporu (.docx) üreten betik
- `IoT_Saldiri_Tespiti_Rapor.pdf`  → Teslime hazır rapor (PDF)
- `IoT_Saldiri_Tespiti_Rapor.docx` → Düzenlenebilir rapor (Word)
- `outputs/`                 → Üretilen grafikler + metrics.txt

---

## ADIM 1 — Gerekli kütüphaneler
```bash
pip install scikit-learn pandas numpy matplotlib seaborn nfstream
```
> nfstream Linux'ta libpcap ister: `sudo apt-get install libpcap-dev`
> Windows'ta Npcap kurulu olmalı. Sorun çıkarsa Mod B (Zeek) yeterlidir.

## ADIM 2 — Veriyi indir (Mirai senaryosu, ~120 MB)
Tarayıcıdan şu klasöre gir ve `.pcap` + `conn.log.labeled` dosyalarını indir:
https://mcfp.felk.cvut.cz/publicDatasets/IoT-23-Dataset/IndividualScenarios/CTU-IoT-Malware-Capture-34-1/

(Çok büyük gelirse: yalnızca conn.log.labeled indir ve Mod B kullan.)

## ADIM 3 — Çalıştır

**Mod A — pcap'ten flow çıkar (ödevin zorunlu şartı):**
```bash
python iot_attack_detection.py --pcap capture.pcap --zeek conn.log.labeled
```

**Mod B — hazır Zeek flow log'u (pcap indiremezsen):**
```bash
python iot_attack_detection.py --zeek conn.log.labeled
```

**Demo — veri olmadan örnek çıktı (rapordaki grafikler bununla üretildi):**
```bash
python iot_attack_detection.py --demo
```

## ADIM 4 — Raporu güncelle
Pipeline gerçek veriyle çalışınca `outputs/` içindeki grafikler ve
`metrics.txt` yenilenir. Sonra raporu yeniden üret:
```bash
node build_report.js
```
Word'de `IoT_Saldiri_Tespiti_Rapor.docx` dosyasını aç → İçindekiler
tablosuna sağ tıkla → "Alanı güncelleştir" → PDF olarak kaydet.

---

## ÖNEMLİ NOT — Teslimden önce
Şu an rapordaki sayılar **DEMO** verisinden gelmektedir (~%98). Teslim
etmeden önce **mutlaka gerçek IoT-23 verisiyle** (Mod A veya B) çalıştırıp
`build_report.js` ile raporu yenile. Aksi hâlde grafikler gerçek veriyi
yansıtmaz. metrics.txt içindeki gerçek değerleri rapordaki Tablo'ya da
elle güncelleyebilirsin (build_report.js içinde 7. bölüm tablosu).
