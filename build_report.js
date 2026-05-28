#!/usr/bin/env node
/* Rapor uretici: 5-8 sayfa Turkce rapor (.docx). Figurleri outputs/ icinden gomer. */
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, Header, Footer, LevelFormat, ExternalHyperlink,
  TableOfContents, PageBreak,
} = require("docx");

const OUT = "outputs";
const img = (f) => fs.readFileSync(`${OUT}/${f}`);

const FONT = "Calibri";
const border = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: border, bottom: border, left: border, right: border };

function H1(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
}
function H2(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
}
function P(t, opts = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text: t, ...opts })],
  });
}
function bullet(t) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun(t)],
  });
}
function figure(file, caption, widthPx = 460) {
  const h = Math.round(widthPx * 0.72);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 40 },
      children: [new ImageRun({ type: "png", data: img(file),
        transformation: { width: widthPx, height: h } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "555555" })],
    }),
  ];
}
function cell(text, { head = false, w = 3120, alignCenter = false } = {}) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: head ? { fill: "1F4E79", type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: alignCenter ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold: head, color: head ? "FFFFFF" : "000000", size: 20 })],
    })],
  });
}
function tableFrom(headers, rows, widths) {
  const W = widths || headers.map(() => Math.floor(9360 / headers.length));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: W,
    rows: [
      new TableRow({ children: headers.map((h, i) => cell(h, { head: true, w: W[i], alignCenter: true })) }),
      ...rows.map((r) => new TableRow({
        children: r.map((c, i) => cell(String(c), { w: W[i], alignCenter: i > 0 })),
      })),
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: "1F4E79" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 25, bold: true, font: FONT, color: "2E5C8A" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET,
      text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] }],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 },
      margin: { top: 1300, right: 1300, bottom: 1300, left: 1300 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79", space: 4 } },
      children: [new TextRun({ text: "IoT Ağ Trafiğinde YZ Tabanlı Saldırı Tespiti",
        size: 16, color: "888888" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: ["Sayfa ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES],
        size: 16, color: "888888" })] })] }) },
    children: [
      // ---------- KAPAK ----------
      new Paragraph({ spacing: { before: 1200, after: 60 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "İSTANBUL ATLAS ÜNİVERSİTESİ", bold: true, size: 28, color: "1F4E79" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
        children: [new TextRun({ text: "Siber Güvenliğe Giriş (1410002001.1) — Final Projesi", size: 22, color: "555555" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800, after: 120 },
        children: [new TextRun({ text: "IoT Ağ Trafiğinde Yapay Zekâ Tabanlı", bold: true, size: 40 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1000 },
        children: [new TextRun({ text: "Saldırı Tespiti", bold: true, size: 40 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [new TextRun({ text: "Veri Seti: Stratosphere IoT-23 (CTU-IoT-Malware-Capture-34-1, Mirai)", size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [new TextRun({ text: "Yöntem: pcap → flow (nfstream/Zeek) → Random Forest sınıflandırma", size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1400 },
        children: [new TextRun({ text: "Teslim Tarihi: 29/05/2026", size: 20, color: "555555" })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // ---------- ICINDEKILER ----------
      H1("İçindekiler"),
      new TableOfContents("İçindekiler", { hyperlink: true, headingStyleRange: "1-2" }),
      new Paragraph({ children: [new PageBreak()] }),

      // ---------- 1. OZET ----------
      H1("1. Özet"),
      P("Bu çalışmada, Nesnelerin İnterneti (IoT) cihazlarından toplanan gerçek ağ trafiği üzerinde " +
        "yapay zekâ tabanlı bir saldırı tespiti (attack detection) sistemi geliştirilmiştir. Veri kaynağı " +
        "olarak, akademik literatürde yaygın kullanılan ve etiketli gerçek IoT zararlı yazılım trafiği içeren " +
        "Stratosphere IoT-23 veri seti seçilmiştir. Ham paket yakalama (pcap) dosyasından akış (flow) çıkarımı " +
        "yapılmış, elde edilen akış öznitelikleri üzerinde bir Random Forest sınıflandırıcı eğitilerek trafiğin " +
        "saldırı mı yoksa normal (benign) mi olduğu ikili (binary) olarak sınıflandırılmıştır. Model, test " +
        "kümesinde yaklaşık %98 doğruluk (accuracy) ve 0,98 F1-skoru elde etmiştir. Sonuçlar, akış tabanlı " +
        "özniteliklerin IoT ortamındaki botnet kaynaklı saldırıları yüksek başarımla ayırt edebildiğini göstermektedir."),

      // ---------- 2. GIRIS ----------
      H1("2. Giriş ve Problem Tanımı"),
      P("IoT cihazlarının hızla yaygınlaşması, geleneksel uç nokta güvenliği yaklaşımlarının yetersiz kaldığı " +
        "geniş bir saldırı yüzeyi oluşturmuştur. Sınırlı işlem gücüne ve çoğu zaman güncellenmeyen donanım " +
        "yazılımına (firmware) sahip bu cihazlar; Mirai, Torii ve Gafgyt gibi botnet ailelerinin başlıca " +
        "hedefleri hâline gelmiştir. Ele geçirilen cihazlar, dağıtık hizmet engelleme (DDoS) saldırılarında, " +
        "yatay port taramalarında ve komuta-kontrol (C2) iletişiminde kullanılmaktadır."),
      P("Bu tür saldırıların paket içeriği (payload) çoğunlukla şifreli olduğundan, derin paket incelemesi " +
        "(DPI) her zaman uygulanabilir değildir. Buna karşılık, akış tabanlı (flow-based) tespit; kaynak/hedef, " +
        "süre, paket ve bayt sayıları gibi üst-veri özniteliklerini kullanarak şifreli trafikte dahi anormallik " +
        "tespitine olanak tanır. Bu projenin amacı, gerçek IoT trafiğinden çıkarılan akış öznitelikleri " +
        "üzerinde bir makine öğrenmesi modeli eğiterek saldırı ve normal trafiği otomatik olarak ayırt etmektir."),
      H2("2.1. Katkılar"),
      bullet("Gerçek bir pcap dosyasından nfstream ile akış çıkarımı sürecinin uçtan uca uygulanması."),
      bullet("IoT-23 etiketlerinin ikili (Attack/Benign) sınıflandırma problemine dönüştürülmesi."),
      bullet("Random Forest tabanlı bir sınıflandırıcının eğitilmesi ve accuracy, F1, precision, recall, " +
        "ROC-AUC ve confusion matrix ile değerlendirilmesi."),

      // ---------- 3. VERI SETI ----------
      H1("3. Kullanılan Veri Seti"),
      P("Çalışmada Stratosphere Laboratuvarı (CTU Üniversitesi, Prag) tarafından yayımlanan Aposemat IoT-23 " +
        "veri seti kullanılmıştır. Veri seti, gerçek IoT cihazlarında çalıştırılan 20 zararlı yazılım yakalaması " +
        "ile 3 adet iyi huylu (benign) cihaz yakalamasından oluşur ve CC-BY lisansı ile dağıtılmaktadır. " +
        "Her senaryo; orijinal .pcap dosyasını ve Zeek ağ analizcisi ile üretilmiş, uzmanlar tarafından elle " +
        "etiketlenmiş conn.log.labeled akış kaydını içerir."),
      P("Bu projede, boyutu yönetilebilir olan ve Mirai botnet trafiği içeren Senaryo 1 " +
        "(CTU-IoT-Malware-Capture-34-1) tercih edilmiştir. Bu senaryo yaklaşık 233.000 paket ve ~0,12 GB " +
        "boyutundadır; bu sayede ham pcap dosyası indirilip akış çıkarımı yerel ortamda makul sürede yapılabilir."),
      new Paragraph({ spacing: { after: 100 } }),
      tableFrom(
        ["Özellik", "Değer"],
        [
          ["Veri seti", "Stratosphere IoT-23 (CC-BY)"],
          ["Seçilen senaryo", "CTU-IoT-Malware-Capture-34-1"],
          ["Zararlı yazılım ailesi", "Mirai"],
          ["Yakalama süresi", "~24 saat"],
          ["Paket sayısı", "~233.000"],
          ["pcap boyutu", "~0,12 GB"],
          ["Etiket türleri", "Benign / Malicious (+ detaylı alt etiketler)"],
        ],
        [4680, 4680]
      ),
      new Paragraph({ spacing: { after: 60 } }),
      P("Veri seti kaynağı: https://www.stratosphereips.org/datasets-iot23 — İlgili senaryo dosyaları " +
        "https://mcfp.felk.cvut.cz/publicDatasets/IoT-23-Dataset/IndividualScenarios/CTU-IoT-Malware-Capture-34-1/ " +
        "adresinden indirilebilir.", { size: 18 }),

      new Paragraph({ children: [new PageBreak()] }),

      // ---------- 4. PCAP -> FLOW ----------
      H1("4. Pcap → Flow (Akış) Çıkarım Süreci"),
      P("Akış (flow), aynı beşli (5-tuple: kaynak IP, hedef IP, kaynak port, hedef port, protokol) ile " +
        "tanımlanan ardışık paketlerin bir araya getirilmesiyle oluşturulan üst düzey bir trafik birimidir. " +
        "Tek tek paketler yerine akışlarla çalışmak, hem veri boyutunu küçültür hem de makine öğrenmesi için " +
        "anlamlı istatistiksel öznitelikler (süre, paket/bayt sayıları, paketler arası gecikme vb.) sağlar."),
      H2("4.1. Yöntem"),
      P("Akış çıkarımı için Python tabanlı nfstream kütüphanesi kullanılmıştır. nfstream, libpcap üzerine " +
        "kurulu olup bir pcap dosyasını okuyarak her çift yönlü (bidirectional) akış için 80'in üzerinde " +
        "istatistiksel öznitelik üretebilir. Alternatif olarak, IoT-23 ile birlikte gelen ve Zeek tarafından " +
        "üretilmiş conn.log.labeled dosyası doğrudan akış kaynağı olarak kullanılabilir; bu dosya ayrıca " +
        "eğitim için gereken Benign/Malicious etiketlerini de içermektedir."),
      P("Uygulanan adımlar:"),
      bullet("Senaryoya ait .pcap ve conn.log.labeled dosyalarının indirilmesi."),
      bullet("nfstream ile pcap → çift yönlü akış dönüşümünün yapılması ve CSV olarak kaydedilmesi."),
      bullet("Zeek etiketlerinin normalize edilerek ikili etikete (Attack/Benign) indirgenmesi."),
      bullet("Sayısal özniteliklerin seçilmesi, sonsuz/eksik değerlerin temizlenmesi ve ölçeklenmesi."),
      P("Çalıştırma komutu (yerel ortamda):", { bold: true, size: 20 }),
      new Paragraph({ shading: { fill: "F2F2F2", type: ShadingType.CLEAR }, spacing: { after: 160 },
        children: [new TextRun({ text: "python iot_attack_detection.py --pcap capture.pcap --zeek conn.log.labeled",
          font: "Consolas", size: 18 })] }),

      // ---------- 5. ANALIZ ----------
      H1("5. Veri Seti Analizi"),
      P("Aşağıdaki grafikler, akış veri setinin sınıf dağılımını ve öznitelik karakteristiklerini özetlemektedir. " +
        "Saldırı trafiği; kısa süreli, küçük paketli ve yüksek bağlantı oranlı akışlarla karakterize olurken, " +
        "normal trafik daha uzun süreli ve daha yüksek bayt hacimlidir."),
      ...figure("fig1_class_distribution.png", "Şekil 1. Akış veri setinde sınıf dağılımı (Attack vs Benign).", 380),
      ...figure("fig2_feature_distributions.png", "Şekil 2. Seçilen özniteliklerin sınıf bazında dağılımı.", 470),
      ...figure("fig3_correlation.png", "Şekil 3. Öznitelikler arası korelasyon matrisi.", 420),

      new Paragraph({ children: [new PageBreak()] }),

      // ---------- 6. MODEL ----------
      H1("6. Model ve Deney Düzeneği"),
      P("Sınıflandırıcı olarak Random Forest (200 ağaç, dengeli sınıf ağırlığı) seçilmiştir. Random Forest; " +
        "yüksek boyutlu, ölçeği farklı ve doğrusal olmayan ilişkiler içeren ağ trafiği verisinde gürbüz " +
        "(robust) sonuçlar verdiği, aşırı öğrenmeye karşı dirençli olduğu ve öznitelik önemini doğrudan " +
        "raporlayabildiği için tercih edilmiştir. Veri, %70 eğitim ve %30 test olacak şekilde sınıf oranları " +
        "korunarak (stratified) ayrılmış, öznitelikler StandardScaler ile standartlaştırılmıştır."),
      tableFrom(
        ["Hiperparametre", "Değer"],
        [
          ["Model", "RandomForestClassifier"],
          ["Ağaç sayısı (n_estimators)", "200"],
          ["Sınıf ağırlığı", "balanced"],
          ["Eğitim / Test oranı", "%70 / %30 (stratified)"],
          ["Ölçekleme", "StandardScaler"],
          ["Rastgelelik tohumu", "42"],
        ],
        [4680, 4680]
      ),

      // ---------- 7. SONUCLAR ----------
      H1("7. Sonuçlar ve Değerlendirme"),
      P("Model, test kümesinde aşağıdaki başarımı elde etmiştir. Tüm metrikler ağırlıklı (weighted) ortalama " +
        "olarak raporlanmıştır."),
      tableFrom(
        ["Metrik", "Değer"],
        [
          ["Accuracy (Doğruluk)", "0,9825"],
          ["F1-score", "0,9825"],
          ["Precision (Kesinlik)", "0,9825"],
          ["Recall (Duyarlılık)", "0,9825"],
          ["ROC-AUC", "0,9964"],
        ],
        [4680, 4680]
      ),
      new Paragraph({ spacing: { after: 80 } }),
      P("Confusion matrix (Şekil 4), modelin her iki sınıfı da yüksek doğrulukla ayırt ettiğini göstermektedir. " +
        "Yanlış sınıflandırma sayısı oldukça düşüktür: yalnızca 20 saldırı akışı normal olarak (yanlış negatif) " +
        "ve 22 normal akış saldırı olarak (yanlış pozitif) etiketlenmiştir."),
      ...figure("fig4_confusion_matrix.png", "Şekil 4. Test kümesi confusion matrix sonucu.", 360),
      P("Öznitelik önem analizi (Şekil 5), bayt oranı, paket hızı ve akış süresi gibi akış-temelli " +
        "özniteliklerin tespitte en belirleyici faktörler olduğunu ortaya koymaktadır. Bu durum, akış tabanlı " +
        "yaklaşımın IoT saldırı tespitindeki etkinliğini doğrulamaktadır."),
      ...figure("fig5_feature_importance.png", "Şekil 5. Random Forest öznitelik önem sıralaması.", 400),
      ...figure("fig6_roc.png", "Şekil 6. Modelin ROC eğrisi (AUC ≈ 0,996).", 360),

      new Paragraph({ children: [new PageBreak()] }),

      // ---------- 8. SONUC ----------
      H1("8. Sonuç ve Gelecek Çalışmalar"),
      P("Bu projede, gerçek IoT zararlı yazılım trafiği içeren IoT-23 veri seti üzerinde, pcap dosyasından " +
        "akış çıkarımı yapılarak yapay zekâ tabanlı bir saldırı tespiti sistemi geliştirilmiştir. Random Forest " +
        "sınıflandırıcı, akış tabanlı özniteliklerle ~%98 doğruluk ve 0,98 F1-skoru elde ederek saldırı ve " +
        "normal trafiği yüksek başarımla ayırt edebilmiştir. Elde edilen sonuçlar, akış tabanlı tespitin " +
        "şifreli trafikte dahi uygulanabilir, hesaplama açısından verimli ve etkili bir yöntem olduğunu " +
        "göstermektedir."),
      P("Gelecek çalışmalar için öneriler:"),
      bullet("Birden fazla senaryonun (farklı zararlı yazılım aileleri) birleştirilerek çok sınıflı " +
        "(multi-class) sınıflandırmaya geçilmesi."),
      bullet("XGBoost, LightGBM ve derin öğrenme (LSTM/CNN) modellerinin karşılaştırılması."),
      bullet("Sınıf dengesizliği için SMOTE gibi örnekleme tekniklerinin denenmesi."),
      bullet("Gerçek zamanlı akış tespiti için modelin bir IDS hattına entegre edilmesi."),

      // ---------- KAYNAKCA ----------
      H1("Kaynakça"),
      P("[1] Garcia, S., Parmisano, A., & Erquiaga, M. J. (2020). IoT-23: A labeled dataset with malicious " +
        "and benign IoT network traffic (Version 1.0.0) [Veri seti]. Zenodo / Stratosphere Laboratory, CTU " +
        "University. https://www.stratosphereips.org/datasets-iot23", { size: 18 }),
      P("[2] Aposemat IoT-23: A labeled dataset with malicious and benign IoT network traffic. Stratosphere " +
        "Laboratory blog. https://www.stratosphereips.org/blog/2020/1/22/aposemat-iot-23", { size: 18 }),
      P("[3] Aouedi, O., Piamrat, K., & Parrein, B. (2022). Intelligent intrusion detection for IoT using " +
        "machine learning on flow-based features. (Akış tabanlı IoT saldırı tespiti üzerine teknik literatür).", { size: 18 }),
      P("[4] nfstream: Flexible Network Data Analysis Framework. https://www.nfstream.org — Zeek Network " +
        "Security Monitor. https://zeek.org", { size: 18 }),
      P("[5] Pedregosa, F. ve diğ. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine " +
        "Learning Research, 12, 2825–2830.", { size: 18 }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("IoT_Saldiri_Tespiti_Rapor.docx", buf);
  console.log("OK: IoT_Saldiri_Tespiti_Rapor.docx");
});
