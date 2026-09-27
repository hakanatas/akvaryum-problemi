/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 7. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Kaç cm² cam, kaç litre su?', en: 'How much glass, how much water?',
      note: 'Üstü açık cam bir akvaryum: 60, 30 ve 40 santimetre. Kaç santimetrekare cam gerekir? Üstten 5 santimetre boş kalırsa kaç litre su alır?' },
    { scene: 2, start: 10.8, end: 17.8, tr: 'Bileşenler: cam ve su', en: 'The components: glass and water',
      note: 'Önce bileşenleri belirleyelim. Cam: taban ve dört yan yüz, üstü açık. Su: taban aynı, yükseklik 40 eksi 5, 35 santimetre.' },
    { scene: 2, start: 18.0, end: 27.8, tr: 'Açınım ve tahmin', en: 'A net and an estimate',
      note: 'Camı bir açınımla gösterelim: 5 dikdörtgen. Suyu tahmin edelim: 1800 çarpı 35 yaklaşık 2000 çarpı 30, yani 60 bin santimetreküp, yaklaşık 60 litre.' },
    { scene: 3, start: 28.8, end: 37.2, tr: 'Taban + dört yan yüz', en: 'The bottom and four walls',
      note: 'Taban 60 çarpı 30, 1800. Ön ve arka yüzler 2 çarpı 60 çarpı 40, 4800. Yan yüzler 2 çarpı 30 çarpı 40, 2400. Toplam 9000 santimetrekare.' },
    { scene: 3, start: 37.4, end: 45.8, tr: 'Kontrol: 9000 cm²', en: 'Check: 9000 cm²',
      note: 'Başka yolla kontrol edelim: kapalı kutunun yüzey alanı 10 800, kapak 1800. 10 800 eksi 1800, yine 9000.' },
    { scene: 4, start: 46.8, end: 55.8, tr: 'Su hacmi = taban × su yüksekliği', en: 'Water = base × water height',
      note: 'Bütün kutunun hacmi 72 bin, ama su tam dolu değil; bu strateji yanlış. Su yüksekliği 35: 1800 çarpı 35, 63 bin santimetreküp, 63 litre. Tahminimizle uyumlu.' },
    { scene: 4, start: 56.0, end: 63.8, tr: 'Başka yol: 72 L − 9 L', en: 'Another way: 72 L − 9 L',
      note: 'Başka yol: boş kısım 1800 çarpı 5, 9 litre. 72 eksi 9, yine 63 litre.' },
    { scene: 5, start: 64.8, end: 73.8, tr: 'Yeni akvaryum', en: 'A new aquarium',
      note: 'Aynı stratejileri yeni bir akvaryumda deneyelim: 50, 40, 30 santimetre. Cam 2000 artı 3000 artı 2400, 7400 santimetrekare.' },
    { scene: 5, start: 74.0, end: 79.8, tr: 'Stratejiler genelleşiyor', en: 'The strategies generalise',
      note: 'Su 25 santimetre: 2000 çarpı 25, 50 litre. Stratejilerimiz her akvaryumda işliyor.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Belirle, göster, tahmin et', en: 'Identify, represent, estimate',
      note: 'Aklında kalsın: bileşenleri belirle, çizimle göster, tahmin et, çöz ve kontrol et.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Başka yolla da dene!', en: 'Try another way too!',
      note: 'Çözümü başka bir yolla da dene!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
